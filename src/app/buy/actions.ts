"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { formatMoney, RULES_VERSION, SITE_NAME, SITE_URL } from "@/lib/config";
import { createPurchaseIntent, getPurchaseState } from "@/lib/apex-link";
import { getStripe } from "@/lib/stripe";

const purchaseSchema = z.object({
  url: z.string().trim().url().refine((value) => ["http:", "https:"].includes(new URL(value).protocol), {
    message: "Use a valid http or https URL.",
  }),
  priceCents: z.coerce.number().int().positive(),
});

function parsePriceCents(value: FormDataEntryValue | null) {
  if (typeof value !== "string") {
    return NaN;
  }

  return Math.round(Number(value) * 100);
}

export async function startCheckout(formData: FormData) {
  if (formData.get("rulesAccepted") !== "accepted") {
    redirect("/buy?error=You must agree to How It Works and the Privacy Policy.");
  }

  const parsed = purchaseSchema.safeParse({
    url: formData.get("url"),
    priceCents: parsePriceCents(formData.get("priceDollars")),
  });

  if (!parsed.success) {
    redirect(`/buy?error=${encodeURIComponent(parsed.error.issues[0]?.message ?? "Invalid submission")}`);
  }

  let purchaseState: Awaited<ReturnType<typeof getPurchaseState>>;

  try {
    purchaseState = await getPurchaseState();
  } catch (error) {
    console.error("Purchase state lookup failed", error);
    redirect("/buy?error=Payment setup failed. Please try again.");
  }

  const minimumPriceCents = purchaseState.price.currentPriceCents;

  if (parsed.data.priceCents < minimumPriceCents) {
    redirect(`/buy?error=${encodeURIComponent(`Price must be at least ${formatMoney(minimumPriceCents)}.`)}`);
  }

  let checkoutUrl: string;

  try {
    const { currentLink } = purchaseState;
    const stripe = getStripe();

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      allow_promotion_codes: true,
      success_url: `${SITE_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${SITE_URL}/buy?canceled=1`,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "usd",
            unit_amount: parsed.data.priceCents,
            product_data: {
              name: `${SITE_NAME} Owner #${currentLink.ownerNumber + 1}`,
              description: `Take the homepage link for ${formatMoney(parsed.data.priceCents)}.`,
            },
          },
        },
      ],
      metadata: {
        url: parsed.data.url,
        ownerNumber: String(currentLink.ownerNumber + 1),
        priceCents: String(parsed.data.priceCents),
        rulesVersion: RULES_VERSION,
      },
    });

    if (!session.url) {
      throw new Error("Stripe did not return a checkout URL");
    }

    await createPurchaseIntent({
      url: parsed.data.url,
      stripeSessionId: session.id,
      priceCents: parsed.data.priceCents,
      nextOwnerNumber: currentLink.ownerNumber + 1,
      rulesVersion: RULES_VERSION,
    });

    checkoutUrl = session.url;
  } catch (error) {
    console.error("Checkout setup failed", error);
    redirect("/buy?error=Payment setup failed. Please try again.");
  }

  redirect(checkoutUrl);
}
