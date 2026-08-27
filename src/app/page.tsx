import Link from "next/link";
import Image from "next/image";
import { getCurrentLink } from "@/lib/apex-link";
import { formatMoney, SITE_DOMAIN } from "@/lib/config";

export const dynamic = "force-dynamic";

export default async function Home() {
  const currentLink = await getCurrentLink();

  return (
    <main className="min-h-screen overflow-hidden bg-[var(--paper)] text-[var(--ink)]">
      <section className="relative mx-auto flex min-h-screen w-full max-w-6xl flex-col px-5 py-6 sm:px-8">
        <div className="absolute inset-x-0 top-24 -z-0 h-72 bg-[radial-gradient(circle_at_30%_20%,rgba(23,118,78,0.18),transparent_34%),radial-gradient(circle_at_78%_34%,rgba(210,71,38,0.14),transparent_32%)]" />

        <nav className="relative z-10 flex items-center justify-between text-sm font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
          <Link href="/" className="flex items-center gap-3 text-[var(--ink)]">
            <Image
              src="/apex-link-logo.jpeg"
              alt="Apex Link"
              width={36}
              height={20}
              priority
              className="h-8 w-14 object-cover object-center"
            />
            Apex Link
          </Link>
          <div className="flex gap-5">
            <Link href="/history" className="hover:text-[var(--ink)]">
              History
            </Link>
            <Link href="/buy" className="hover:text-[var(--ink)]">
              Buy
            </Link>
          </div>
        </nav>

        <div className="relative z-10 grid flex-1 items-center gap-12 py-16 lg:grid-cols-[1fr_360px]">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-[var(--accent)]">
              One link. One owner. One dollar more each time.
            </p>
            <h1 className="mt-6 max-w-3xl text-5xl font-black leading-[0.95] tracking-normal sm:text-6xl lg:text-7xl">
              The Apex Link is currently owned by #{currentLink.ownerNumber}.
            </h1>
            <a
              href={currentLink.url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-8 block max-w-3xl break-all text-2xl font-black text-[var(--accent)] underline decoration-[var(--accent-soft)] decoration-4 underline-offset-8 hover:text-[var(--ink)] sm:text-4xl"
            >
              {currentLink.url}
            </a>
          </div>

          <aside className="border border-[var(--line)] bg-white p-6 shadow-[12px_12px_0_var(--shadow)]">
            <Image
              src="/apex-link-logo.jpeg"
              alt="Apex Link logo"
              width={960}
              height={540}
              priority
              className="mb-6 aspect-[16/9] w-full border border-[var(--line)] object-cover"
            />
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-[var(--muted)]">Next owner price</p>
            <p className="mt-4 text-6xl font-black leading-none">{formatMoney(currentLink.priceCents)}</p>
            <p className="mt-5 text-base leading-7 text-[var(--muted)]">
              Pay once. Your URL replaces the homepage link immediately after payment confirmation.
            </p>
            <Link href="/buy" className="mt-8 inline-flex h-12 w-full items-center justify-center bg-[var(--ink)] px-5 text-sm font-black uppercase tracking-[0.12em] text-white hover:bg-[var(--accent)]">
              Take the link
            </Link>
            <p className="mt-5 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">{SITE_DOMAIN}</p>
          </aside>
        </div>
      </section>
    </main>
  );
}
