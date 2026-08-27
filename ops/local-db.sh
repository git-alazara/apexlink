#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
cd "${PROJECT_ROOT}"

# shellcheck source=./load-local-env.sh
source "${SCRIPT_DIR}/load-local-env.sh"

docker compose --env-file "${ENV_FILE}" up -d postgres

for attempt in {1..30}; do
  if docker compose --env-file "${ENV_FILE}" exec -T postgres pg_isready -U postgres -d apexlink >/dev/null 2>&1; then
    echo "Local Postgres is ready on localhost:${POSTGRES_PORT:-5432}"
    exit 0
  fi

  echo "Waiting for local Postgres (${attempt}/30)..."
  sleep 1
done

echo "Local Postgres did not become ready in time."
docker compose --env-file "${ENV_FILE}" logs postgres
exit 1
