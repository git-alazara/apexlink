import Link from "next/link";
import { SiteHeader } from "@/app/site-header";

export default function SuccessPage() {
  return (
    <main className="flex min-h-screen items-center bg-[var(--paper)] py-6 text-[var(--ink)]">
      <section className="mx-auto w-full max-w-6xl px-5 sm:px-8">
        <SiteHeader />
        <div className="mt-20">
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-[var(--accent)]">Payment received</p>
        <h1 className="mt-5 text-4xl font-black leading-tight tracking-normal sm:text-5xl">You own the Most Valuable Link.</h1>
        <p className="mt-6 text-lg leading-8 text-[var(--muted)]">
          Your payment is being confirmed through the webhook. Your link should appear on the homepage as soon as the event is processed.
        </p>
        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <Link href="/" className="inline-flex h-12 items-center justify-center bg-[var(--ink)] px-5 text-sm font-black uppercase tracking-[0.12em] text-white hover:bg-[var(--accent)]">
            View link
          </Link>
          <Link href="/history" className="inline-flex h-12 items-center justify-center border border-[var(--line)] px-5 text-sm font-black uppercase tracking-[0.12em] hover:border-[var(--ink)]">
            View history
          </Link>
        </div>
        </div>
      </section>
    </main>
  );
}
