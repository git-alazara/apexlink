import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/app/site-header";
import { getOwnerDetails, recordPageView } from "@/lib/apex-link";
import { formatDuration, formatMoney } from "@/lib/config";

export const metadata: Metadata = {
  title: "Owner | Most Valuable Link",
  description: "Ownership details for a Most Valuable Link owner.",
};

const dateTimeFormatter = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "long",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
  timeZone: "UTC",
  timeZoneName: "short",
});

export default async function OwnerPage({ params }: PageProps<"/owner/[ownerNumber]">) {
  const ownerNumber = Number((await params).ownerNumber);

  if (!Number.isSafeInteger(ownerNumber) || ownerNumber < 1) {
    notFound();
  }

  const owner = await getOwnerDetails(ownerNumber);

  if (!owner) {
    notFound();
  }

  await recordPageView(`/owner/${ownerNumber}`);

  return (
    <main className="min-h-screen bg-[var(--paper)] py-6 text-[var(--ink)]">
      <div className="mx-auto w-full max-w-6xl px-5 sm:px-8">
        <SiteHeader />
        <article className="py-14 sm:py-20">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-[var(--accent)]">
            {owner.endedAt ? "Former owner" : "Current owner"}
          </p>
          <h1 className="mt-5 text-5xl font-black leading-none tracking-normal sm:text-7xl">Owner #{owner.ownerNumber}</h1>
          <a
            href={`/go?owner=${owner.ownerNumber}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-8 block max-w-4xl break-all text-2xl font-black text-[var(--accent)] underline decoration-[var(--accent-soft)] decoration-4 underline-offset-8 hover:text-[var(--ink)] sm:text-4xl"
          >
            {owner.url}
          </a>

          <dl className="mt-12 grid gap-px overflow-hidden border border-[var(--line)] bg-[var(--line)] sm:grid-cols-2 lg:grid-cols-3">
            <div className="bg-[var(--paper)] p-5">
              <dt className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--muted)]">Paid</dt>
              <dd className="mt-2 text-2xl font-black">{formatMoney(owner.priceCents)}</dd>
            </div>
            <div className="bg-[var(--paper)] p-5">
              <dt className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--muted)]">Homepage views</dt>
              <dd className="mt-2 text-2xl font-black">{owner.views.toLocaleString()}</dd>
            </div>
            <div className="bg-[var(--paper)] p-5">
              <dt className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--muted)]">Clicks</dt>
              <dd className="mt-2 text-2xl font-black">{owner.clicks.toLocaleString()}</dd>
            </div>
            <div className="bg-[var(--paper)] p-5">
              <dt className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--muted)]">Started</dt>
              <dd className="mt-2 text-lg font-black">{dateTimeFormatter.format(owner.createdAt)}</dd>
            </div>
            <div className="bg-[var(--paper)] p-5">
              <dt className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--muted)]">Ended</dt>
              <dd className="mt-2 text-lg font-black">{owner.endedAt ? dateTimeFormatter.format(owner.endedAt) : "Still live"}</dd>
            </div>
            <div className="bg-[var(--paper)] p-5">
              <dt className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--muted)]">Duration</dt>
              <dd className="mt-2 text-lg font-black">{formatDuration(owner.createdAt, owner.endedAt ?? new Date())}</dd>
            </div>
          </dl>

          <div className="mt-10 flex flex-wrap gap-5 text-sm font-bold uppercase tracking-[0.14em]">
            <Link href="/history" className="text-[var(--accent)] hover:text-[var(--ink)]">Ownership history</Link>
            <Link href="/buy" className="text-[var(--accent)] hover:text-[var(--ink)]">Take the link</Link>
          </div>
        </article>
      </div>
    </main>
  );
}