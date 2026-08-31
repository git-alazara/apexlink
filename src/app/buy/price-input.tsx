"use client";

import { useState, type KeyboardEvent } from "react";
import { getPriceValidationMessage } from "@/lib/purchase-input";

type PriceInputProps = {
  minimumPriceCents: number;
  minimumPriceDollars: string;
  minimumPriceLabel: string;
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

export function PriceInput({ minimumPriceCents, minimumPriceDollars, minimumPriceLabel }: PriceInputProps) {
  const [value, setValue] = useState(minimumPriceDollars);
  const [validationMessage, setValidationMessage] = useState("");

  function updateValue(nextValue: string, input: HTMLInputElement) {
    const nextValidationMessage = getPriceValidationMessage(
      nextValue,
      minimumPriceCents,
      minimumPriceLabel,
    );

    input.setCustomValidity(nextValidationMessage);
    setValidationMessage(nextValidationMessage);
    setValue(nextValue);
  }

  return (
    <>
      <input
        name="priceDollars"
        type="text"
        inputMode="decimal"
        required
        value={value}
        aria-describedby={validationMessage ? "price-validation-message" : undefined}
        aria-invalid={validationMessage ? true : undefined}
        onKeyDown={(event) => {
          if (!isAllowedKey(event)) {
            event.preventDefault();
          }
        }}
        onChange={(event) => {
          updateValue(sanitizePriceInput(event.target.value), event.currentTarget);
        }}
        onBlur={(event) => {
          updateValue(formatPrice(value) || minimumPriceDollars, event.currentTarget);
        }}
        className="h-14 rounded-none border border-[var(--line)] bg-white px-4 text-base font-semibold normal-case tracking-normal text-[var(--ink)] outline-none transition focus:border-[var(--ink)]"
      />
      {validationMessage ? (
        <span
          id="price-validation-message"
          role="alert"
          className="text-sm font-semibold normal-case tracking-normal text-[var(--danger)]"
        >
          {validationMessage}
        </span>
      ) : null}
    </>
  );
}
