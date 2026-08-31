import { z } from "zod";

export function normalizeWebsiteUrl(value: string) {
  const trimmedValue = value.trim();

  if (trimmedValue.startsWith("//")) {
    return `https:${trimmedValue}`;
  }

  const schemeMatch = /^[a-z][a-z\d+.-]*:/i.exec(trimmedValue);

  if (schemeMatch && !/^\d+(?:[/?#]|$)/.test(trimmedValue.slice(schemeMatch[0].length))) {
    return trimmedValue;
  }

  return `https://${trimmedValue}`;
}

export function isHttpWebsiteUrl(value: string) {
  try {
    return ["http:", "https:"].includes(new URL(value).protocol);
  } catch {
    return false;
  }
}

export const purchaseSchema = z.object({
  url: z.string()
    .trim()
    .transform(normalizeWebsiteUrl)
    .pipe(
      z.string().url({ message: "Use a valid http or https URL." }).refine(
        isHttpWebsiteUrl,
        { message: "Use a valid http or https URL." },
      ),
    ),
  priceCents: z.coerce.number().int().positive(),
});
