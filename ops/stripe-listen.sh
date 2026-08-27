#!/usr/bin/env bash
set -euo pipefail

if ! command -v stripe >/dev/null 2>&1; then
  echo "Stripe CLI is not installed. Install it from https://docs.stripe.com/stripe-cli and run stripe login."
  exit 1
fi

stripe listen --forward-to localhost:3000/api/stripe/webhook
