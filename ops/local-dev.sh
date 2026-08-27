#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
cd "${PROJECT_ROOT}"

"${SCRIPT_DIR}/local-db.sh"

# shellcheck source=./load-local-env.sh
source "${SCRIPT_DIR}/load-local-env.sh"

npm run prisma:generate
npx prisma migrate dev
npm run dev
