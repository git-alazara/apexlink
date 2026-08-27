#!/usr/bin/env bash
set -euo pipefail

export DATABASE_URL="${DATABASE_URL:-postgresql://postgres:postgres@localhost:5432/apexlink}"

npm run prisma:generate
npx prisma validate
npm run lint
npm run typecheck
npm run build
