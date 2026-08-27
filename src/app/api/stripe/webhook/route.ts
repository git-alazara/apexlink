import { completePurchase } from "@/lib/apex-link";
import { getStripe } from "@/lib/stripe";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!signature || !webhookSecret) {
    return Response.json({ error: "Stripe webhook is not configured" }, { status: 400 });
  }

  const body = await request.text();
  const stripe = getStripe();

  try {
    const event = stripe.webhooks.constructEvent(body, signature, webhookSecret);

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const paymentIntentId =
        typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id;

      await completePurchase(session.id, paymentIntentId);
    }

    return Response.json({ received: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Webhook verification failed";
    return Response.json({ error: message }, { status: 400 });
  }
}
