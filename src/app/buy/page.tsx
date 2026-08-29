import Link from "next/link";
import { startCheckout } from "./actions";
import { PriceInput } from "./price-input";
import { getCurrentLink, getSiteStats, recordPageView } from "@/lib/apex-link";
import { formatDuration, formatMoney, SITE_DOMAIN } from "@/lib/config";

export const dynamic = "force-dynamic";

export default async function BuyPage({ searchParams }: PageProps<"/buy">) {
  await recordPageView("/buy");
  const [currentLink, stats] = await Promise.all([getCurrentLink(), getSiteStats()]);
  const minimumPriceCents = stats.currentPriceCents;
  const minimumPriceDollars = (minimumPriceCents / 100).toFixed(2);
  const params = await searchParams;
  const error = typeof params.error === "string" ? params.error : null;
  const canceled = params.canceled === "1";

  return (
    <main className="min-h-screen bg-[var(--paper)] text-[var(--ink)]">
      <section className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-5 py-6 sm:px-8">
        <nav className="flex items-center justify-between text-sm font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
          <Link href="/" className="hover:text-[var(--ink)]">
            Most Valuable Link
          </Link>
          <Link href="/history" className="hover:text-[var(--ink)]">
            History
          </Link>
        </nav>

        <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center py-14">
          <p className="mb-5 text-sm font-bold uppercase tracking-[0.2em] text-[var(--accent)]">
            Take the link
          </p>
          <h1 className="max-w-2xl text-4xl font-black leading-tight tracking-normal sm:text-5xl">
            Buy the most visible link on {SITE_DOMAIN}.
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-[var(--muted)]">
            Your website becomes the homepage link until somebody pays more. No auction, no refund when replaced, just one public spot and a permanent owner number.
          </p>

          <div className="mt-10 border-y border-[var(--line)] py-8">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.18em] text-[var(--muted)]">
                  Current price
                </p>
                <p className="mt-2 text-5xl font-black leading-none">{formatMoney(stats.currentPriceCents)}</p>
              </div>
              <p className="text-sm font-semibold text-[var(--muted)]">
                You become Owner #{currentLink.ownerNumber + 1}. Set your own price as long as it is at least the current price of {formatMoney(minimumPriceCents)}.
              </p>
            </div>
            {stats.peakPriceCents > stats.floorPriceCents ? (
              <p className="mt-5 text-sm leading-6 text-[var(--muted)]">
                Current decay window: peak {formatMoney(stats.peakPriceCents)}, floor {formatMoney(stats.floorPriceCents)}, slow early drop, faster late drop, full floor in {formatDuration(new Date(), stats.decayEndsAt)}.
              </p>
            ) : (
              <p className="mt-5 text-sm leading-6 text-[var(--muted)]">
                Current price is at the {formatMoney(stats.floorPriceCents)} floor. Set your own price to start a new decay window.
              </p>
            )}
          </div>

          <form action={startCheckout} className="mt-8 grid gap-4">
            <label className="grid gap-2 text-sm font-bold uppercase tracking-[0.14em] text-[var(--muted)]">
              Your price USD
              <PriceInput minimumPriceDollars={minimumPriceDollars} />
            </label>
            <label className="grid gap-2 text-sm font-bold uppercase tracking-[0.14em] text-[var(--muted)]">
              Website URL
              <input
                name="url"
                type="url"
                required
                placeholder="https://example.com"
                className="h-14 rounded-none border border-[var(--line)] bg-white px-4 text-base font-semibold normal-case tracking-normal text-[var(--ink)] outline-none transition focus:border-[var(--ink)]"
              />
            </label>
            <label className="grid gap-2 text-sm font-bold uppercase tracking-[0.14em] text-[var(--muted)]">
              Email optional
              <input
                name="email"
                type="email"
                placeholder="owner@example.com"
                className="h-14 rounded-none border border-[var(--line)] bg-white px-4 text-base font-semibold normal-case tracking-normal text-[var(--ink)] outline-none transition focus:border-[var(--ink)]"
              />
            </label>
            <button className="mt-2 h-14 bg-[var(--ink)] px-6 text-base font-black uppercase tracking-[0.12em] text-white transition hover:bg-[var(--accent)]">
              Continue to payment
            </button>
          </form>

          {error ? <p className="mt-4 text-sm font-semibold text-[var(--danger)]">{error}</p> : null}
          {canceled ? <p className="mt-4 text-sm font-semibold text-[var(--muted)]">Checkout canceled. The link is still available.</p> : null}

          <p className="mt-8 text-sm leading-6 text-[var(--muted)]">
            You are buying one hyperlink and nothing else. Promo codes can be applied in Stripe Checkout. Links to illegal content, malware, phishing, pornography, hate or extremist material, and obvious scams may be removed and refunded. Card payments are handled by Stripe.
          </p>

          <dl className="mt-8 grid grid-cols-2 gap-px overflow-hidden border border-[var(--line)] bg-[var(--line)] sm:grid-cols-4">
            <div className="bg-[var(--paper)] p-4">
              <dt className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--muted)]">Views</dt>
              <dd className="mt-2 text-xl font-black">{stats.totalViews.toLocaleString()}</dd>
            </div>
            <div className="bg-[var(--paper)] p-4">
              <dt className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--muted)]">Clicks</dt>
              <dd className="mt-2 text-xl font-black">{stats.totalClicks.toLocaleString()}</dd>
            </div>
            <div className="bg-[var(--paper)] p-4">
              <dt className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--muted)]">Owners</dt>
              <dd className="mt-2 text-xl font-black">{stats.completedPurchases.toLocaleString()}</dd>
            </div>
            <div className="bg-[var(--paper)] p-4">
              <dt className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--muted)]">Price</dt>
              <dd className="mt-2 text-xl font-black">{formatMoney(stats.currentPriceCents)}</dd>
            </div>
          </dl>
        </div>
      </section>
    </main>
  );
}
