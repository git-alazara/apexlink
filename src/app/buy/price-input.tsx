"use client";

import { useState, type KeyboardEvent } from "react";

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

function sanitizePriceInput(value: string) {
  const normalizedValue = value.replace(/,/g, ".").replace(/[^0-9.]/g, "");
  const [wholePart = "", ...decimalParts] = normalizedValue.split(".");
  const decimalPart = decimalParts.join("").slice(0, 2);

  return decimalParts.length > 0 ? `${wholePart}.${decimalPart}` : wholePart;
}

function isAllowedKey(event: KeyboardEvent<HTMLInputElement>) {
  if (event.metaKey || event.ctrlKey || event.altKey) {
    return true;
  }

  const allowedKeys = ["Backspace", "Delete", "ArrowLeft", "ArrowRight", "Tab", "Enter", "Home", "End"];

  if (allowedKeys.includes(event.key)) {
    return true;
  }

  if (/^[0-9]$/.test(event.key)) {
    return true;
  }

  if (event.key !== ".") {
    return false;
  }

  return !event.currentTarget.value.includes(".");
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
      onKeyDown={(event) => {
        if (!isAllowedKey(event)) {
          event.preventDefault();
        }
      }}
      onPaste={(event) => {
        const pastedValue = event.clipboardData.getData("text");

        if (sanitizePriceInput(pastedValue) !== pastedValue) {
          event.preventDefault();
          setValue(sanitizePriceInput(pastedValue));
        }
      }}
      onChange={(event) => setValue(sanitizePriceInput(event.target.value))}
      onBlur={() => setValue((currentValue) => formatPrice(currentValue) || minimumPriceDollars)}
      className="h-14 rounded-none border border-[var(--line)] bg-white px-4 text-base font-semibold normal-case tracking-normal text-[var(--ink)] outline-none transition focus:border-[var(--ink)]"
    />
  );
}
