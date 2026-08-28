"use client";

import { useState } from "react";

type PriceInputProps = {
  minimumPriceDollars: string;
};

function formatPrice(value: string) {
  const amount = Number(value);

  if (!Number.isFinite(amount)) {
    return "";
  }

  return amount.toFixed(2);
}

export function PriceInput({ minimumPriceDollars }: PriceInputProps) {
  const [value, setValue] = useState(minimumPriceDollars);

  return (
    <input
      name="priceDollars"
      type="text"
      inputMode="decimal"
      required
      value={value}
      onChange={(event) => setValue(event.target.value)}
      onBlur={() => setValue((currentValue) => formatPrice(currentValue) || minimumPriceDollars)}
      className="h-14 rounded-none border border-[var(--line)] bg-white px-4 text-base font-semibold normal-case tracking-normal text-[var(--ink)] outline-none transition focus:border-[var(--ink)]"
    />
  );
}
