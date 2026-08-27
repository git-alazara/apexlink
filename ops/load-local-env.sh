#!/usr/bin/env bash
set -euo pipefail

ENV_FILE="${ENV_FILE:-.env.local}"

if [ ! -f "${ENV_FILE}" ]; then
  if [ -f ".env.local.example" ]; then
    cp .env.local.example "${ENV_FILE}"
    echo "Created ${ENV_FILE} from .env.local.example. Add real Stripe test keys before testing checkout."
  else
    echo "Missing ${ENV_FILE}. Create it with: cp .env.local.example ${ENV_FILE}"
    exit 1
  fi
fi

set -a
# shellcheck disable=SC1090
source "${ENV_FILE}"
set +a
