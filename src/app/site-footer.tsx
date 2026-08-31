import Link from "next/link";
import { SITE_DOMAIN } from "@/lib/config";

export function SiteFooter() {
  return (
    <footer className="border-t border-[var(--line)] bg-[var(--paper)] text-[var(--muted)]">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-5 py-8 text-xs font-bold uppercase tracking-[0.14em] sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <p>{SITE_DOMAIN}</p>
        <nav className="flex flex-wrap gap-x-5 gap-y-3">
          <Link href="/how-it-works" className="hover:text-[var(--ink)]">How it works</Link>
          <Link href="/privacy" className="hover:text-[var(--ink)]">Privacy</Link>
        </nav>
      </div>
    </footer>
  );
}