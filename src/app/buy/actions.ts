"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { formatMoney, SITE_NAME, SITE_URL } from "@/lib/config";
import { createPurchaseIntent, getCurrentLink } from "@/lib/apex-link";
import { getStripe } from "@/lib/stripe";

const purchaseSchema = z.object({
  url: z.string().trim().url().refine((value) => ["http:", "https:"].includes(new URL(value).protocol), {
    message: "Use a valid http or https URL.",
  }),
  email: z.union([z.literal(""), z.string().trim().email()]).optional(),
});

export async function startCheckout(formData: FormData) {
  const parsed = purchaseSchema.safeParse({
    url: formData.get("url"),
    email: formData.get("email"),
  });

  if (!parsed.success) {
    redirect(`/buy?error=${encodeURIComponent(parsed.error.issues[0]?.message ?? "Invalid submission")}`);
  }

  let checkoutUrl: string;

  try {
    const currentLink = await getCurrentLink();
    const stripe = getStripe();
    const email = parsed.data.email || undefined;

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      success_url: `${SITE_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${SITE_URL}/buy?canceled=1`,
      customer_email: email,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "usd",
            unit_amount: currentLink.priceCents,
            product_data: {
              name: `${SITE_NAME} Owner #${currentLink.ownerNumber + 1}`,
              description: `Take the homepage link for ${formatMoney(currentLink.priceCents)}.`,
            },
          },
        },
      ],
      metadata: {
        url: parsed.data.url,
        email: email ?? "",
        ownerNumber: String(currentLink.ownerNumber + 1),
        priceCents: String(currentLink.priceCents),
      },
    });

    if (!session.url) {
      throw new Error("Stripe did not return a checkout URL");
    }

    await createPurchaseIntent({
      url: parsed.data.url,
      email,
      stripeSessionId: session.id,
    });

    checkoutUrl = session.url;
  } catch (error) {
    console.error("Checkout setup failed", error);
    redirect("/buy?error=Payment setup failed. Please try again.");
  }

  redirect(checkoutUrl);
}
