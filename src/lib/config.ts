export const SITE_NAME = "Most Valuable Link";
export const SITE_DOMAIN = process.env.NEXT_PUBLIC_SITE_DOMAIN ?? "mostvaluable.link";
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? `https://${SITE_DOMAIN}`;

export const INITIAL_PRICE_CENTS = Number(process.env.INITIAL_PRICE_CENTS ?? 1000);
export const PRICE_DECAY_DAYS = Number(process.env.PRICE_DECAY_DAYS ?? 90);
const PRICE_INCREMENT_RATE = 0.01;
const MAX_PRICE_INCREMENT_CENTS = 2500;

export function getPriceIncrementCents(priceCents: number) {
  return Math.min(MAX_PRICE_INCREMENT_CENTS, Math.max(1, Math.ceil(priceCents * PRICE_INCREMENT_RATE)));
}

export function formatMoney(cents: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: cents % 100 === 0 ? 0 : 2,
  }).format(cents / 100);
}

export function formatDuration(start: Date, end: Date = new Date()) {
  const totalMinutes = Math.max(0, Math.floor((end.getTime() - start.getTime()) / 60000));

  if (totalMinutes < 1) {
    return "less than a minute";
  }

  const days = Math.floor(totalMinutes / 1440);
  const hours = Math.floor((totalMinutes % 1440) / 60);
  const minutes = totalMinutes % 60;

  if (days > 0) {
    return hours > 0 ? `${days}d ${hours}h` : `${days}d`;
  }

  if (hours > 0) {
    return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
  }

  return `${minutes}m`;
}
