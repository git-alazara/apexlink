#!/usr/bin/env bash
set -euo pipefail

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
cd "${PROJECT_ROOT}"

DOMAIN="${APEX_LINK_DOMAIN:-buyapexlink.com}"
ENV_FILE="${ENV_FILE:-.env}"
IMAGE="${IMAGE:-apex-link:latest}"
ORIGIN_CERT="${CF_ORIGIN_CERT:-}"
SKIP_TUNNEL="false"
SKIP_BUILD="false"
SKIP_IMAGE_IMPORT="false"
RESET_DB="false"

usage() {
  cat <<EOF
Usage: ./ops/complete-deploy.sh [options]

Options:
  --domain <domain>        Public domain (default: buyapexlink.com)
  --env-file <path>        Env file with production secrets (default: .env)
  --image <image>          Docker image tag to build/deploy (default: apex-link:latest)
  --origincert <path>      Domain-specific Cloudflare origin cert
  --skip-tunnel            Skip Cloudflare tunnel setup/update
  --skip-build             Skip Docker build
  --skip-image-import      Skip importing Docker image into k3s/containerd
  --reset-db               Destructive: delete Postgres StatefulSet PVC before deploy
  --help                   Show this help
EOF
}

while [ "$#" -gt 0 ]; do
  case "$1" in
    --domain)
      DOMAIN="$2"
      shift 2
      ;;
    --env-file)
      ENV_FILE="$2"
      shift 2
      ;;
    --image)
      IMAGE="$2"
      shift 2
      ;;
    --origincert)
      ORIGIN_CERT="$2"
      shift 2
      ;;
    --skip-tunnel)
      SKIP_TUNNEL="true"
      shift
      ;;
    --skip-build)
      SKIP_BUILD="true"
      shift
      ;;
    --skip-image-import)
      SKIP_IMAGE_IMPORT="true"
      shift
      ;;
    --reset-db|--drop-db)
      RESET_DB="true"
      shift
      ;;
    --help|-h)
      usage
      exit 0
      ;;
    *)
      echo -e "${RED}Unknown option: $1${NC}"
      usage
      exit 1
      ;;
  esac
done

require_command() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo -e "${RED}Missing required command: $1${NC}"
    exit 1
  fi
}

require_env() {
  if [ -z "${!1:-}" ]; then
    echo -e "${RED}Missing required env var in ${ENV_FILE}: $1${NC}"
    exit 1
  fi
}

step() {
  echo ""
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo -e "${BLUE}$1${NC}"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
}

wait_for_rollout() {
  local resource="$1"
  local timeout="${2:-300s}"

  if kubectl -n apex-link rollout status "${resource}" --timeout="${timeout}"; then
    return 0
  fi

  echo -e "${YELLOW}Rollout failed or timed out for ${resource}. Collecting diagnostics...${NC}"
  kubectl -n apex-link get pods -o wide || true
  kubectl -n apex-link describe "${resource}" || true
  kubectl -n apex-link logs deployment/apex-link-app --tail=200 || true
  kubectl -n apex-link logs deployment/cloudflare-tunnel --tail=200 || true
  return 1
}

import_image_for_k3s() {
  if ! command -v k3s >/dev/null 2>&1; then
    echo -e "${YELLOW}k3s command not found; assuming your cluster can pull or see ${IMAGE}.${NC}"
    return 0
  fi

  echo "Importing ${IMAGE} into k3s containerd..."
  docker save "${IMAGE}" | sudo k3s ctr images import -
}

if [ ! -f "${ENV_FILE}" ]; then
  echo -e "${RED}Missing ${ENV_FILE}. Copy .env.example to ${ENV_FILE} and fill in production values.${NC}"
  exit 1
fi

set -a
# shellcheck disable=SC1090
source "${ENV_FILE}"
set +a

require_command docker
require_command kubectl
require_env POSTGRES_PASSWORD
require_env DATABASE_URL
require_env STRIPE_SECRET_KEY
require_env STRIPE_WEBHOOK_SECRET

if [ "${SKIP_TUNNEL}" != "true" ]; then
  require_command cloudflared
fi

if [ -z "${ORIGIN_CERT}" ]; then
  ORIGIN_CERT="${HOME}/.cloudflared/cert-${DOMAIN}.pem"
fi

cat <<EOF
Apex Link production deploy

Domain:      ${DOMAIN}
Env file:    ${ENV_FILE}
Image:       ${IMAGE}
Namespace:   apex-link
Cloudflare:  ${SKIP_TUNNEL}
Reset DB:    ${RESET_DB}
EOF

if [ "${SKIP_TUNNEL}" != "true" ]; then
  echo "Tunnel cert: ${ORIGIN_CERT}"
fi

step "Step 1/7: Build Docker Image"
if [ "${SKIP_BUILD}" = "true" ]; then
  echo "Skipping Docker build."
else
  IMAGE="${IMAGE}" "${SCRIPT_DIR}/build-local.sh"
fi

step "Step 2/7: Import Image Into Local Cluster Runtime"
if [ "${SKIP_IMAGE_IMPORT}" = "true" ]; then
  echo "Skipping image import."
else
  import_image_for_k3s
fi

step "Step 3/7: Apply Kubernetes Secrets"
"${SCRIPT_DIR}/apply-secrets.sh" "${ENV_FILE}"

step "Step 4/7: Configure Cloudflare Tunnel"
if [ "${SKIP_TUNNEL}" = "true" ]; then
  echo "Skipping Cloudflare tunnel setup."
else
  "${SCRIPT_DIR}/cloudflare-setup.sh" "${DOMAIN}" --origincert "${ORIGIN_CERT}"
fi

step "Step 5/7: Deploy Kubernetes Manifests"
kubectl apply -f k8s/manifests/namespace.yaml
kubectl apply -f k8s/manifests/config.yaml
kubectl apply -f k8s/manifests/postgres.yaml

if [ "${RESET_DB}" = "true" ]; then
  echo -e "${RED}Deleting Postgres PVC data because --reset-db was passed.${NC}"
  kubectl -n apex-link scale statefulset/postgres --replicas=0 || true
  kubectl -n apex-link delete pvc -l app=postgres || true
  kubectl -n apex-link scale statefulset/postgres --replicas=1 || true
fi

kubectl apply -f k8s/manifests/app.yaml
if [ "${SKIP_TUNNEL}" != "true" ]; then
  kubectl apply -f k8s/manifests/cloudflare-tunnel.yaml
fi

kubectl -n apex-link rollout restart deployment/apex-link-app
if [ "${SKIP_TUNNEL}" != "true" ]; then
  kubectl -n apex-link rollout restart deployment/cloudflare-tunnel
fi

step "Step 6/7: Wait For Rollouts"
wait_for_rollout statefulset/postgres 300s
wait_for_rollout deployment/apex-link-app 300s
if [ "${SKIP_TUNNEL}" != "true" ]; then
  wait_for_rollout deployment/cloudflare-tunnel 180s
fi

step "Step 7/7: Verify Health"
kubectl -n apex-link run apex-link-health-check \
  --rm -i --restart=Never \
  --image=curlimages/curl:latest \
  --command -- curl -fsS http://apex-link-service.apex-link.svc.cluster.local:3000/api/health

echo ""
echo -e "${GREEN}Deployment complete.${NC}"
echo "Public URL: https://${DOMAIN}"
echo "Webhook URL: https://${DOMAIN}/api/stripe/webhook"
echo ""
echo "Useful commands:"
echo "  kubectl -n apex-link get pods"
echo "  kubectl -n apex-link logs -f deployment/apex-link-app"
echo "  kubectl -n apex-link logs -f deployment/cloudflare-tunnel"
