#!/usr/bin/env bash
set -euo pipefail

NAMESPACE="apex-link"
ENV_FILE="${1:-.env}"

if [ ! -f "${ENV_FILE}" ]; then
  echo "Missing ${ENV_FILE}. Copy .env.example to .env and fill in real values."
  exit 1
fi

set -a
# shellcheck disable=SC1090
source "${ENV_FILE}"
set +a

: "${POSTGRES_PASSWORD:?POSTGRES_PASSWORD is required}"
: "${DATABASE_URL:?DATABASE_URL is required}"
: "${STRIPE_SECRET_KEY:?STRIPE_SECRET_KEY is required}"
: "${STRIPE_WEBHOOK_SECRET:?STRIPE_WEBHOOK_SECRET is required}"

kubectl create namespace "${NAMESPACE}" --dry-run=client -o yaml | kubectl apply -f -

kubectl create secret generic apex-link-secrets \
  --namespace "${NAMESPACE}" \
  --from-literal=POSTGRES_PASSWORD="${POSTGRES_PASSWORD}" \
  --from-literal=DATABASE_URL="${DATABASE_URL}" \
  --from-literal=STRIPE_SECRET_KEY="${STRIPE_SECRET_KEY}" \
  --from-literal=STRIPE_WEBHOOK_SECRET="${STRIPE_WEBHOOK_SECRET}" \
  --dry-run=client -o yaml | kubectl apply -f -

echo "Applied apex-link-secrets in ${NAMESPACE}"
