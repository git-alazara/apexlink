"use client";

import { useEffect, useState } from "react";

export function VisitorBadge() {
  const [totalVisitors, setTotalVisitors] = useState<number | null>(null);

  useEffect(() => {
    let isMounted = true;

    fetch("/api/visitor", { cache: "no-store" })
      .then((response) => (response.ok ? response.json() : null))
      .then((data: { totalVisitors?: number } | null) => {
        if (isMounted && typeof data?.totalVisitors === "number") {
          setTotalVisitors(data.totalVisitors);
        }
      })
      .catch(() => undefined);

    return () => {
      isMounted = false;
    };
  }, []);

  if (totalVisitors === null) {
    return null;
  }

  return (
    <p className="mt-5 inline-flex border border-[var(--line)] bg-white px-3 py-2 text-xs font-black uppercase tracking-[0.16em] text-[var(--muted)] shadow-[4px_4px_0_var(--shadow)]">
      Total unique visitors {totalVisitors.toLocaleString()}
    </p>
  );
}