import type { Metadata } from "next";
import Link from "next/link";
import { PolicyPage } from "@/app/policy-page";
import { PRICE_DECAY_DAYS, SITE_DOMAIN } from "@/lib/config";

export const metadata: Metadata = {
  title: "How It Works | Most Valuable Link",
  description: "The purchase, ownership, link, and refund rules for Most Valuable Link.",
};

export default function HowItWorksPage() {
  return (
    <PolicyPage
      eyebrow="The rules"
      title="One link. One owner at a time."
      intro={`Buy the link and your URL becomes the featured link on ${SITE_DOMAIN} after Stripe confirms payment.`}
    >
      <section>
        <h2>What you buy</h2>
        <p>You buy one hyperlink, not advertising services, traffic, an endorsement, or a guaranteed result. The link remains featured until another completed purchase replaces it. That could happen at any time.</p>
        <p>When replaced, your URL, owner number, price, ownership dates, and click count remain in the public ownership history.</p>
      </section>
      <section>
        <h2>Price and checkout</h2>
        <p>The displayed minimum price slowly decays toward its floor over {PRICE_DECAY_DAYS} days. You may choose any price at or above the minimum shown when checkout starts. After a purchase, the next minimum is one cent more than the price paid and a new decay period begins.</p>
        <p>Checkout does not reserve the link. If payments overlap, ownership follows the order in which Stripe confirmations are processed.</p>
      </section>
      <section>
        <h2>Links we do not allow</h2>
        <p>No illegal content, malware, phishing, pornography, hate or extremist material, impersonation, deceptive downloads, or obvious scams. We may reject, disable, or remove a link that violates these rules or creates a security or legal risk.</p>
        <p>Links are not necessarily reviewed before appearing. A featured or historical link is not vetted, recommended, or endorsed by this site. Visit external sites at your own risk.</p>
      </section>
      <section>
        <h2>Refunds</h2>
        <p>Being replaced by another buyer is the product, so it is not grounds for a refund. We also do not offer refunds for buyer&apos;s remorse or unmet traffic expectations.</p>
        <p>We will correct duplicate charges and failures where payment succeeds but the purchased link never goes live because of our error. Any refund rights required by applicable law still apply. A rules violation may result in removal without a refund where the law permits.</p>
      </section>
      <section>
        <h2>Availability and changes</h2>
        <p>We do not guarantee uninterrupted availability or any minimum ownership duration. We may update these rules for future purchases; the version accepted at checkout is recorded.</p>
        <p>See the <Link href="/privacy">privacy page</Link> for the data the site keeps.</p>
      </section>
      <p className="policy-updated">Effective August 30, 2026</p>
    </PolicyPage>
  );
}