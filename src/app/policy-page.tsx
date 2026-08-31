import type { ReactNode } from "react";
import { SiteHeader } from "@/app/site-header";

export function PolicyPage({ eyebrow, title, intro, children }: {
  eyebrow: string;
  title: string;
  intro: string;
  children: ReactNode;
}) {
  return (
    <main className="min-h-screen bg-[var(--paper)] py-6 text-[var(--ink)]">
      <div className="mx-auto w-full max-w-6xl px-5 sm:px-8">
        <SiteHeader />
        <article className="max-w-3xl py-14 sm:py-20">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-[var(--accent)]">{eyebrow}</p>
          <h1 className="mt-5 text-4xl font-black leading-tight tracking-normal sm:text-5xl">{title}</h1>
          <p className="mt-6 text-lg leading-8 text-[var(--muted)]">{intro}</p>
          <div className="policy-content mt-12">{children}</div>
        </article>
      </div>
    </main>
  );
}