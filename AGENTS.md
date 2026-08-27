<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Agent Rules for Apex Link

These rules apply to all coding agents and contributors in this repository.

## Product Scope

- Apex Link is a paid scarce-link app for `buyapexlink.com`.
- The public flow is homepage, `/buy`, `/history`, Stripe Checkout, and Stripe webhook confirmation.
- There is no admin panel in v1. Successful Stripe payment immediately updates the public link.
- Pricing starts from `INITIAL_PRICE_CENTS` and increases by `PRICE_INCREMENT_CENTS`, currently `$1`, after each confirmed purchase.

## Environment Variables

- Never hardcode credentials, webhook secrets, database passwords, or deployment-specific URLs.
- Required runtime configuration must be represented in `.env.example` and Kubernetes secrets/config maps.
- Required secrets are `DATABASE_URL`, `POSTGRES_PASSWORD`, `STRIPE_SECRET_KEY`, and `STRIPE_WEBHOOK_SECRET`.
- Public browser-safe config must use `NEXT_PUBLIC_` and should be limited to the site domain and site URL.

## Architecture Boundaries

- Keep database access in server-only code under `src/lib` or route handlers/server actions.
- Client components must not import Prisma, Stripe secret clients, or server-only modules.
- Stripe webhooks are the source of truth for ownership changes; do not update ownership from the checkout redirect alone.
- Payment completion must be idempotent by `stripeSessionId`.

## Database

- Prisma schema lives in `prisma/schema.prisma`.
- Committed migrations live in `prisma/migrations/` and are deployed with `npm run prisma:deploy`.
- Preserve ownership history as immutable records. Update `CurrentLink` only as the current read model.
- Store prices in cents as integers.

## Deployability

- Every deployable service must have a health endpoint, Docker support, and Kubernetes manifests.
- The app listens on port `3000` and exposes `/api/health`.
- Postgres runs inside the `apex-link` namespace unless the deployment docs are intentionally changed.
- Cloudflare Tunnel should route `buyapexlink.com` and `www.buyapexlink.com` to `apex-link-service.apex-link.svc.cluster.local:3000`.
- Use a domain-specific Cloudflare origin cert, for example `~/.cloudflared/cert-buyapexlink.com.pem`.

## Code Quality

- Prefer clear, descriptive names over abbreviations.
- Search for existing helpers before adding new ones.
- Keep components and server functions focused on one responsibility.
- Use Zod or typed parsing at external input boundaries.
- Avoid unnecessary comments; code should be self-expressive.
- Use 2 spaces for indentation in generated code and YAML.

## Quality Gate

- A change is only complete when `npm run quality` succeeds, unless a missing external tool or service makes part of it impossible.
- Required checks are Prisma generation, Prisma validation, ESLint with zero warnings, TypeScript typecheck, and Next.js production build.
- If Kubernetes manifests change and `kubectl` is available, also run `kubectl apply --dry-run=client -f k8s/manifests`.
