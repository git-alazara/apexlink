#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
cd "${PROJECT_ROOT}"

# shellcheck source=./load-local-env.sh
source "${SCRIPT_DIR}/load-local-env.sh"

docker compose --env-file "${ENV_FILE}" down
