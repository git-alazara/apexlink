export function parsePriceCents(value: unknown) {
  if (typeof value !== "string") {
    return NaN;
  }

  const normalizedValue = value.trim();

  if (!/^\d+(?:\.\d{0,2})?$/.test(normalizedValue)) {
    return NaN;
  }

  const [wholeDollars, fractionalDollars = ""] = normalizedValue.split(".");
  const priceCents = Number(wholeDollars) * 100 + Number(fractionalDollars.padEnd(2, "0"));

  return Number.isSafeInteger(priceCents) ? priceCents : NaN;
}

export function getPriceValidationMessage(
  value: string,
  minimumPriceCents: number,
  minimumPriceLabel: string,
) {
  if (value.length === 0) {
    return "";
  }

  const priceCents = parsePriceCents(value);

  if (!Number.isFinite(priceCents) || priceCents <= 0) {
    return "Enter a valid USD amount.";
  }

  if (priceCents < minimumPriceCents) {
    return `Price must be at least ${minimumPriceLabel}.`;
  }

  return "";
}
