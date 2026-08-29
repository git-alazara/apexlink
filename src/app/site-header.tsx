import Image from "next/image";
import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="relative z-10 flex items-center justify-between text-sm font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
      <Link href="/" className="flex items-center gap-3 text-[var(--ink)]">
        <Image
          src="/apex-link.svg"
          alt="Most Valuable Link"
          width={40}
          height={40}
          priority
          className="h-10 w-10 object-cover object-center"
        />
        Most Valuable Link
      </Link>
      <nav className="flex gap-5">
        <Link href="/history" className="hover:text-[var(--ink)]">
          History
        </Link>
        <Link href="/buy" className="hover:text-[var(--ink)]">
          Buy
        </Link>
      </nav>
    </header>
  );
}
