import type { Metadata } from "next";
import { PolicyPage } from "@/app/policy-page";

export const metadata: Metadata = {
  title: "Privacy | Most Valuable Link",
  description: "What Most Valuable Link collects, publishes, and shares.",
};

export default function PrivacyPage() {
  return (
    <PolicyPage
      eyebrow="Privacy"
      title="We keep the data footprint small."
      intro="There are no accounts, newsletters, advertising pixels, or cross-site tracking on this website."
    >
      <section>
        <h2>Visits and clicks</h2>
        <p>We store the page visited and its timestamp to produce aggregate view counts. When somebody follows a featured or historical link, we store the destination URL, owner number, and timestamp to produce public click counts.</p>
        <p>To estimate total unique visitors, we assign a random identifier in an HTTP-only first-party cookie named apex_visitor for one year. We store that identifier, a sequential visitor number, and first and most recent visit timestamps. It is not used across other websites. Clearing cookies or changing browsers can cause another count, so this measures unique browsers rather than verified people.</p>
        <p>Like any web service, our hosting and network providers may temporarily process ordinary request data such as an IP address and browser headers for delivery, security, and operational logs.</p>
      </section>
      <section>
        <h2>Purchases</h2>
        <p>We store the URL submitted, price, owner number, checkout status, the version of the rules accepted, Stripe session and payment identifiers, and timestamps. Stripe processes payment and contact details under its own privacy policy. We do not receive or store full card details.</p>
      </section>
      <section>
        <h2>What becomes public</h2>
        <p>A successful purchase publishes the URL, owner number, price, ownership dates, and click count. Those details remain in ownership history after the link is replaced. Do not submit a URL containing personal or confidential information.</p>
      </section>
      <section>
        <h2>Retention and sharing</h2>
        <p>Ownership history, unique visitor records, and aggregate measurement records are retained as part of the service&apos;s operation and public record. Unpaid checkout records may be retained for fraud prevention, troubleshooting, and accounting. Payment records are retained as needed for tax, accounting, disputes, and legal obligations.</p>
        <p>We do not sell personal data. Data is shared only with service providers needed to operate the site, such as Stripe, hosting, database, and network providers, or when required for security or by law.</p>
      </section>
      <p className="policy-updated">Effective August 30, 2026</p>
    </PolicyPage>
  );
}