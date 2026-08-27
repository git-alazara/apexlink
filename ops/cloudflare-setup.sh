#!/usr/bin/env bash
set -euo pipefail

if [ -z "${1:-}" ]; then
  echo "Usage: ./ops/cloudflare-setup.sh buyapexlink.com [--origincert /path/to/cert.pem]"
  exit 1
fi

DOMAIN="$1"
ORIGIN_CERT="${CF_ORIGIN_CERT:-}"
shift || true

while [ "$#" -gt 0 ]; do
  case "$1" in
    --origincert)
      ORIGIN_CERT="$2"
      shift 2
      ;;
    *)
      echo "Unknown option: $1"
      exit 1
      ;;
  esac
done

if ! command -v cloudflared >/dev/null 2>&1; then
  echo "cloudflared not found. Install it before running this script."
  exit 1
fi

TUNNEL_DIR="$HOME/.cloudflared"
mkdir -p "${TUNNEL_DIR}"

if [ -z "${ORIGIN_CERT}" ]; then
  ORIGIN_CERT="${TUNNEL_DIR}/cert-${DOMAIN}.pem"
fi

if [ ! -f "${ORIGIN_CERT}" ]; then
  if [ -f "${TUNNEL_DIR}/cert.pem" ] && [ "${ORIGIN_CERT}" != "${TUNNEL_DIR}/cert.pem" ]; then
    echo "Found ${TUNNEL_DIR}/cert.pem, but ${DOMAIN} should use ${ORIGIN_CERT}."
    echo "Move the default cert aside, run cloudflared tunnel login, then move the new cert to ${ORIGIN_CERT}."
    exit 1
  fi

  cloudflared tunnel login
  if [ "${ORIGIN_CERT}" != "${TUNNEL_DIR}/cert.pem" ] && [ -f "${TUNNEL_DIR}/cert.pem" ]; then
    mv "${TUNNEL_DIR}/cert.pem" "${ORIGIN_CERT}"
  fi
fi

HOST_NAME="$(hostname 2>/dev/null || uname -n || echo node)"
TUNNEL_NAME="apex-link-${HOST_NAME}"
TUNNEL_ID="$(cloudflared --origincert "${ORIGIN_CERT}" tunnel list | awk -v name="${TUNNEL_NAME}" '$2==name {print $1}')"

if [ -z "${TUNNEL_ID}" ]; then
  cloudflared --origincert "${ORIGIN_CERT}" tunnel create "${TUNNEL_NAME}"
  TUNNEL_ID="$(cloudflared --origincert "${ORIGIN_CERT}" tunnel list | awk -v name="${TUNNEL_NAME}" '$2==name {print $1}')"
fi

if [ -z "${TUNNEL_ID}" ]; then
  echo "Failed to determine tunnel ID."
  exit 1
fi

route_dns_record() {
  local host="$1"
  local output
  if ! output="$(cloudflared --origincert "${ORIGIN_CERT}" tunnel route dns "${TUNNEL_ID}" "${host}" 2>&1)"; then
    echo "${output}" >&2
    return 1
  fi

  if [[ "${output}" =~ ${host//./\\.}\.[A-Za-z0-9-] ]]; then
    echo "Zone mismatch while routing ${host}. Use a cert for ${DOMAIN}." >&2
    echo "${output}" >&2
    return 1
  fi

  echo "${output}"
}

route_dns_record "${DOMAIN}"
route_dns_record "www.${DOMAIN}"

CREDS_FILE="${TUNNEL_DIR}/${TUNNEL_ID}.json"
if [ ! -f "${CREDS_FILE}" ]; then
  echo "Credentials file not found: ${CREDS_FILE}"
  exit 1
fi

kubectl create namespace apex-link --dry-run=client -o yaml | kubectl apply -f -

kubectl create secret generic cloudflare-tunnel-creds \
  --from-file=credentials.json="${CREDS_FILE}" \
  --from-literal=tunnel-id="${TUNNEL_ID}" \
  --namespace=apex-link \
  --dry-run=client -o yaml | kubectl apply -f -

cat <<EOF | kubectl apply -f -
apiVersion: v1
kind: ConfigMap
metadata:
  name: cloudflare-tunnel-config
  namespace: apex-link
data:
  config.yaml: |
    tunnel: ${TUNNEL_ID}
    credentials-file: /etc/cloudflared/creds/credentials.json

    ingress:
      - hostname: ${DOMAIN}
        service: http://apex-link-service.apex-link.svc.cluster.local:3000
      - hostname: www.${DOMAIN}
        service: http://apex-link-service.apex-link.svc.cluster.local:3000
      - service: http_status:404
EOF

echo "Cloudflare tunnel ${TUNNEL_NAME} configured for ${DOMAIN}."
