import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Refund & Cancellation Policy | StudioSmart",
  description: "Understand StudioSmart's refund and cancellation policies for album purchases and client payments.",
};

export default function RefundPolicyPage() {
  return (
    <article className="prose-legal">
      <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-3 brand-text-gradient">
        Refund &amp; Cancellation Policy
      </h1>
      <p className="text-white/40 text-sm mb-12">
        Last updated: June 26, 2026
      </p>

      <Section title="1. Overview">
        <p>
          At StudioSmart, we strive to provide an excellent experience for both photographers and
          their clients. This Refund &amp; Cancellation Policy outlines the terms under which refunds
          may be issued for payments made through our platform at{" "}
          <a href="https://studiosmart.in" className="text-brand hover:underline">
            https://studiosmart.in
          </a>.
        </p>
      </Section>

      <Section title="2. Album Purchases by Photographers">
        <h3 className="text-lg font-semibold text-white mb-3">2.1 Before Album Creation</h3>
        <p>
          If payment has been made but the album has not yet been created or activated, a full refund
          may be requested within 7 days of payment.
        </p>

        <h3 className="text-lg font-semibold text-white mt-6 mb-3">2.2 After Album Creation</h3>
        <p>
          Once an album has been created and photos have been uploaded, the service is considered
          delivered. Refunds will generally not be provided for active albums. However, we may
          consider refund requests on a case-by-case basis if there are genuine service issues.
        </p>

        <h3 className="text-lg font-semibold text-white mt-6 mb-3">2.3 Technical Issues</h3>
        <p>
          If a payment was processed but the album could not be created due to a technical error on
          our end, a full refund will be issued within 5-7 business days.
        </p>
      </Section>

      <Section title="3. Client Gallery Payments">
        <h3 className="text-lg font-semibold text-white mb-3">3.1 Payment-Gated Galleries</h3>
        <p>
          When clients pay to access a photographer&apos;s gallery, the payment is a service fee for
          accessing and selecting photos. Once payment is made and gallery access is granted, the
          service is considered delivered.
        </p>

        <h3 className="text-lg font-semibold text-white mt-6 mb-3">3.2 Refund Eligibility</h3>
        <p>Refunds for client gallery payments may be considered in the following cases:</p>
        <ul>
          <li>Payment was charged but gallery access was not granted due to a technical error</li>
          <li>Duplicate payment was processed for the same gallery</li>
          <li>The gallery was empty or the album was deactivated by the photographer after payment</li>
        </ul>

        <h3 className="text-lg font-semibold text-white mt-6 mb-3">3.3 Photographer Responsibility</h3>
        <p>
          For client-related refund disputes, the photographer (studio) is the primary party
          responsible. StudioSmart facilitates the payment processing but the service agreement is
          between the photographer and their client.
        </p>
      </Section>

      <Section title="4. Wallet Deposits">
        <p>
          Deposits made to a StudioSmart studio wallet are non-refundable once credited, as they are
          intended for use within the platform. In exceptional circumstances, refund requests for
          wallet deposits will be reviewed on a case-by-case basis.
        </p>
      </Section>

      <Section title="5. How to Request a Refund">
        <p>To request a refund, please contact us with the following details:</p>
        <ul>
          <li>Your registered email address or studio name</li>
          <li>Payment ID / Transaction reference number</li>
          <li>Reason for the refund request</li>
          <li>Any supporting screenshots or documentation</li>
        </ul>
        <p>
          Send your refund request to{" "}
          <a href="mailto:studiosmart94@gmail.com" className="text-brand hover:underline">
            studiosmart94@gmail.com
          </a>{" "}
          or call us at{" "}
          <a href="tel:+917010997983" className="text-brand hover:underline">
            +91 7010997983
          </a>.
        </p>
      </Section>

      <Section title="6. Refund Processing">
        <ul>
          <li>Approved refunds will be processed within <strong>5-7 business days</strong>.</li>
          <li>
            Refunds will be credited to the original payment method used during the transaction.
          </li>
          <li>
            The refund amount may exclude payment gateway fees charged by Razorpay, if applicable.
          </li>
        </ul>
      </Section>

      <Section title="7. Cancellation">
        <h3 className="text-lg font-semibold text-white mb-3">7.1 Account Cancellation</h3>
        <p>
          You may cancel your StudioSmart account at any time by contacting our support team. Upon
          cancellation:
        </p>
        <ul>
          <li>Active albums will remain accessible until their hosting period expires</li>
          <li>Any remaining wallet balance can be used before account deletion</li>
          <li>Your data will be deleted in accordance with our Privacy Policy</li>
        </ul>

        <h3 className="text-lg font-semibold text-white mt-6 mb-3">7.2 Album Cancellation</h3>
        <p>
          Photographers can deactivate individual albums at any time through their dashboard. Once
          deactivated, the album will no longer be accessible to clients. No refund is provided for
          voluntarily deactivated albums.
        </p>
      </Section>

      <Section title="8. Contact Us">
        <p>
          For any refund or cancellation queries, please reach out to us:
        </p>
        <ul>
          <li>
            <strong>Email:</strong>{" "}
            <a href="mailto:studiosmart94@gmail.com" className="text-brand hover:underline">
              studiosmart94@gmail.com
            </a>
          </li>
          <li>
            <strong>Phone:</strong>{" "}
            <a href="tel:+917010997983" className="text-brand hover:underline">
              +91 7010997983
            </a>
          </li>
          <li>
            <strong>Website:</strong>{" "}
            <a href="https://studiosmart.in" className="text-brand hover:underline">
              https://studiosmart.in
            </a>
          </li>
        </ul>
      </Section>
    </article>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-12">
      <h2 className="text-2xl font-bold text-white mb-4">{title}</h2>
      <div className="text-white/60 leading-relaxed space-y-4 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-2 [&_li]:text-white/50">
        {children}
      </div>
    </section>
  );
}
