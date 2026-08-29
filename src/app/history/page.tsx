import Link from "next/link";
import { getOwnershipHistory, getSiteStats, recordPageView } from "@/lib/apex-link";
import { formatDuration, formatMoney } from "@/lib/config";

export const dynamic = "force-dynamic";

export default async function HistoryPage() {
  await recordPageView("/history");
  const [history, stats] = await Promise.all([getOwnershipHistory(), getSiteStats()]);

  return (
    <main className="min-h-screen bg-[var(--paper)] px-5 py-6 text-[var(--ink)] sm:px-8">
      <div className="mx-auto max-w-6xl">
        <nav className="flex items-center justify-between text-sm font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
          <Link href="/" className="hover:text-[var(--ink)]">
            Most Valuable Link
          </Link>
          <Link href="/buy" className="hover:text-[var(--ink)]">
            Buy
          </Link>
        </nav>

        <div>
          <header className="py-12">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-[var(--accent)]">Ownership history</p>
          <h1 className="mt-5 max-w-2xl text-4xl font-black leading-tight tracking-normal sm:text-5xl">Every owner keeps a place.</h1>
          </header>

          <dl className="mb-10 grid grid-cols-2 gap-px overflow-hidden border border-[var(--line)] bg-[var(--line)] sm:grid-cols-4">
          <div className="bg-[var(--paper)] p-4">
            <dt className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--muted)]">Total views</dt>
            <dd className="mt-2 text-xl font-black">{stats.totalViews.toLocaleString()}</dd>
          </div>
          <div className="bg-[var(--paper)] p-4">
            <dt className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--muted)]">Total clicks</dt>
            <dd className="mt-2 text-xl font-black">{stats.totalClicks.toLocaleString()}</dd>
          </div>
          <div className="bg-[var(--paper)] p-4">
            <dt className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--muted)]">Owners</dt>
            <dd className="mt-2 text-xl font-black">{stats.completedPurchases.toLocaleString()}</dd>
          </div>
          <div className="bg-[var(--paper)] p-4">
            <dt className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--muted)]">Current owner</dt>
            <dd className="mt-2 text-xl font-black">#{stats.ownerNumber}</dd>
          </div>
          </dl>

          <section className="border-t border-[var(--line)]">
          {history.length === 0 ? (
            <p className="py-10 text-lg text-[var(--muted)]">No owners yet. The first spot is still open.</p>
          ) : (
            history.map((owner) => (
              <article key={owner.id} className="grid gap-4 border-b border-[var(--line)] py-6 sm:grid-cols-[100px_1fr_120px_100px_100px] sm:items-center">
                <div className="text-3xl font-black">#{owner.ownerNumber}</div>
                <a href={`/go?owner=${owner.ownerNumber}`} className="break-all text-xl font-bold hover:text-[var(--accent)]" target="_blank" rel="noopener noreferrer">
                  {owner.url}
                </a>
                <div className="text-sm font-black uppercase tracking-[0.14em] text-[var(--muted)] sm:text-right">
                  {owner.endedAt ? formatDuration(owner.createdAt, owner.endedAt) : `${formatDuration(owner.createdAt)} live`}
                </div>
                <div className="text-sm font-black uppercase tracking-[0.14em] text-[var(--muted)] sm:text-right">
                  {owner.clicks.toLocaleString()} clicks
                </div>
                <div className="font-black sm:text-right">{formatMoney(owner.priceCents)}</div>
              </article>
            ))
          )}
          </section>
        </div>
      </div>
    </main>
  );
}
