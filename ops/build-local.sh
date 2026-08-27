#!/usr/bin/env bash
set -euo pipefail

IMAGE="${IMAGE:-apex-link:latest}"

docker build -t "${IMAGE}" .

echo "Built ${IMAGE}"
