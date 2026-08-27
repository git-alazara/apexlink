export const SITE_NAME = "Apex Link";
export const SITE_DOMAIN = process.env.NEXT_PUBLIC_SITE_DOMAIN ?? "buyapexlink.com";
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? `https://${SITE_DOMAIN}`;

export const INITIAL_PRICE_CENTS = Number(process.env.INITIAL_PRICE_CENTS ?? 1000);
export const PRICE_INCREMENT_CENTS = Number(process.env.PRICE_INCREMENT_CENTS ?? 100);

export function formatMoney(cents: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: cents % 100 === 0 ? 0 : 2,
  }).format(cents / 100);
}
