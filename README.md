# Most Valuable Link

Most Valuable Link is a self-hosted scarce homepage-link purchase flow for `mostvaluable.link`.

## Stack

- Next.js 16 App Router with TypeScript and Tailwind CSS
- Stripe Checkout for card payments
- Stripe webhooks for confirmed ownership changes
- Postgres in Kubernetes
- Prisma ORM and migrations
- Docker plus Kubernetes manifests
- Cloudflare Tunnel routing to the in-cluster service

## Local Testing

The fastest local loop uses Docker only for Postgres and runs Next.js directly on localhost.

```bash
npm install
npm run local:dev
```

The first run creates `.env.local` from `.env.local.example`, starts Postgres at `localhost:5432`, applies Prisma migrations, and starts the app at:

```text
http://localhost:3000
```

Useful local commands:

```bash
npm run local:db       # start only local Postgres
npm run local:dev      # start Postgres, migrate, then run next dev
npm run local:logs     # follow local Postgres logs
npm run local:reset-db # wipe and recreate the local database from migrations
npm run local:stop     # stop local Postgres
npm run prisma:studio  # inspect local data in Prisma Studio
npm run quality        # Prisma, lint, typecheck, and production build
```

You can test the homepage, buy form validation, history page, and health check without Stripe keys:

```text
http://localhost:3000
http://localhost:3000/buy
http://localhost:3000/history
http://localhost:3000/api/health
```

To test the full Stripe Checkout flow locally, put Stripe test keys into `.env.local`, then run this in a second terminal:

```bash
npm run stripe:listen
```

Copy the `whsec_...` value printed by Stripe CLI into `STRIPE_WEBHOOK_SECRET` in `.env.local`, restart `npm run local:dev`, and buy through `/buy` using a Stripe test card.

```text
4242 4242 4242 4242
Any future expiry
Any CVC
```

The local webhook target is:

```text
http://localhost:3000/api/stripe/webhook
```

## Basic Setup

```bash
cp .env.example .env
npm install
npm run prisma:generate
npm run dev
```

For local checkout testing, point Stripe webhooks at:

```text
/api/stripe/webhook
```

The required Stripe event is:

```text
checkout.session.completed
```

## Environment

Set real values in `.env` or the Kubernetes secret created by `ops/apply-secrets.sh`:

```text
DATABASE_URL=postgresql://postgres:<password>@postgres:5432/apexlink
POSTGRES_PASSWORD=<strong password>
STRIPE_SECRET_KEY=<stripe secret key>
STRIPE_WEBHOOK_SECRET=<stripe webhook secret>
NEXT_PUBLIC_SITE_DOMAIN=mostvaluable.link
NEXT_PUBLIC_SITE_URL=https://mostvaluable.link
INITIAL_PRICE_CENTS=100
PRICE_INCREMENT_CENTS=1
```

## Kubernetes Deployment

Use the complete deploy script for production:

```bash
./ops/complete-deploy.sh \
	--domain mostvaluable.link \
	--origincert ~/.cloudflared/cert-mostvaluable.link.pem \
	--alias-domain buyapexlink.com \
	--alias-origincert ~/.cloudflared/cert-buyapexlink.com.pem
```

That command builds the Docker image, imports it into k3s when available, applies Kubernetes secrets from `.env`, configures Cloudflare Tunnel, applies manifests, waits for rollouts, and verifies `/api/health` inside the cluster.

If Cloudflare reports that an A, AAAA, or CNAME record already exists, delete the existing DNS records for `mostvaluable.link`, `www.mostvaluable.link`, `buyapexlink.com`, or `www.buyapexlink.com` in Cloudflare DNS, then rerun the deploy script. The desired records are proxied CNAME records pointing at `<tunnel-id>.cfargotunnel.com`.

For debugging individual deployment steps, the lower-level scripts are still available:

```bash
./ops/build-local.sh
./ops/apply-secrets.sh .env
./ops/cloudflare-setup.sh mostvaluable.link --origincert ~/.cloudflared/cert-mostvaluable.link.pem --alias-domain buyapexlink.com --alias-origincert ~/.cloudflared/cert-buyapexlink.com.pem
./ops/deploy.sh
```

The app deployment runs `npm run prisma:deploy` as an init container before starting Next.js.

## Purchase Flow

1. Buyer enters a URL and optional email on `/buy`.
2. The app creates a Stripe Checkout session at the current price.
3. Stripe sends `checkout.session.completed` to `/api/stripe/webhook`.
4. The webhook records ownership, updates the homepage link immediately, and uses the buyer-selected price as the new peak price.
5. `/history` keeps the permanent owner list.
