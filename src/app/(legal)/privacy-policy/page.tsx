import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy | StudioSmart",
  description: "Learn how StudioSmart collects, uses, and protects your personal information.",
};

export default function PrivacyPolicyPage() {
  return (
    <article className="prose-legal">
      <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-3 brand-text-gradient">
        Privacy Policy
      </h1>
      <p className="text-white/40 text-sm mb-12">
        Last updated: June 26, 2026
      </p>

      <Section title="1. Introduction">
        <p>
          StudioSmart (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) operates the website{" "}
          <a href="https://studiosmart.in" className="text-brand hover:underline">
            https://studiosmart.in
          </a>{" "}
          and the StudioSmart desktop application (collectively, the &quot;Service&quot;). This Privacy Policy
          explains how we collect, use, disclose, and safeguard your information when you use our
          Service.
        </p>
        <p>
          By using the Service, you agree to the collection and use of information in accordance with
          this policy. If you do not agree with the terms of this Privacy Policy, please do not
          access the Service.
        </p>
      </Section>

      <Section title="2. Information We Collect">
        <h3 className="text-lg font-semibold text-white mb-3">2.1 Personal Information</h3>
        <p>We may collect the following personal information when you register or use our Service:</p>
        <ul>
          <li>Full name</li>
          <li>Email address</li>
          <li>Phone number</li>
          <li>Studio/business name</li>
          <li>Payment and billing information (processed securely via Razorpay)</li>
        </ul>

        <h3 className="text-lg font-semibold text-white mt-6 mb-3">2.2 Automatically Collected Information</h3>
        <p>When you access our Service, we may automatically collect:</p>
        <ul>
          <li>Device type and browser information</li>
          <li>IP address and approximate location</li>
          <li>Pages visited and usage patterns</li>
          <li>Cookies and similar tracking technologies</li>
        </ul>

        <h3 className="text-lg font-semibold text-white mt-6 mb-3">2.3 Uploaded Content</h3>
        <p>
          Photographers upload photos to our platform for client proofing. We store these photos
          securely on our cloud infrastructure for the purpose of delivering the Service.
        </p>
      </Section>

      <Section title="3. How We Use Your Information">
        <p>We use the information we collect for the following purposes:</p>
        <ul>
          <li>To create and manage your account</li>
          <li>To provide, maintain, and improve our Service</li>
          <li>To process payments and transactions via Razorpay</li>
          <li>To send service-related notifications (e.g., album sharing links, payment confirmations)</li>
          <li>To respond to your inquiries and provide customer support</li>
          <li>To detect, prevent, and address fraud or technical issues</li>
          <li>To comply with legal obligations</li>
        </ul>
      </Section>

      <Section title="4. Payment Information">
        <p>
          All payment transactions are processed through{" "}
          <a href="https://razorpay.com" target="_blank" rel="noopener noreferrer" className="text-brand hover:underline">
            Razorpay
          </a>
          , a PCI-DSS compliant payment gateway. We do not store your credit/debit card numbers,
          CVV, or banking details on our servers. Please review{" "}
          <a href="https://razorpay.com/privacy/" target="_blank" rel="noopener noreferrer" className="text-brand hover:underline">
            Razorpay&apos;s Privacy Policy
          </a>{" "}
          for information on how they handle your payment data.
        </p>
      </Section>

      <Section title="5. Data Sharing and Disclosure">
        <p>
          We do not sell, trade, or rent your personal information to third parties. We may share
          your information only in the following circumstances:
        </p>
        <ul>
          <li>
            <strong>Service Providers:</strong> With trusted third-party services (e.g., Razorpay for payments,
            AWS for hosting) that assist in operating our Service, under strict confidentiality
            agreements.
          </li>
          <li>
            <strong>Legal Requirements:</strong> When required by law, subpoena, or other legal
            process, or to protect our rights and safety.
          </li>
          <li>
            <strong>Business Transfers:</strong> In the event of a merger, acquisition, or asset
            sale, your information may be transferred as part of the business assets.
          </li>
        </ul>
      </Section>

      <Section title="6. Data Security">
        <p>
          We implement industry-standard security measures to protect your personal information,
          including:
        </p>
        <ul>
          <li>SSL/TLS encryption for all data in transit</li>
          <li>Encrypted storage for sensitive data at rest</li>
          <li>Regular security audits and monitoring</li>
          <li>Role-based access controls</li>
        </ul>
        <p>
          However, no method of transmission over the Internet or electronic storage is 100% secure.
          While we strive to protect your information, we cannot guarantee absolute security.
        </p>
      </Section>

      <Section title="7. Data Retention">
        <p>
          We retain your personal information for as long as your account is active or as needed to
          provide the Service. Album data (photos) is retained for the hosting period as described in
          your plan (e.g., 6 months). You may request deletion of your data at any time by
          contacting us.
        </p>
      </Section>

      <Section title="8. Cookies">
        <p>
          We use cookies and similar technologies to maintain your session, remember preferences, and
          improve your experience. You can control cookie preferences through your browser settings.
          Disabling cookies may limit some features of the Service.
        </p>
      </Section>

      <Section title="9. Third-Party Links">
        <p>
          Our Service may contain links to third-party websites or services. We are not responsible
          for the privacy practices of those third parties. We encourage you to review their privacy
          policies before providing any personal information.
        </p>
      </Section>

      <Section title="10. Children's Privacy">
        <p>
          Our Service is not directed to individuals under 18 years of age. We do not knowingly
          collect personal information from children. If you believe a child has provided us with
          personal data, please contact us and we will promptly delete it.
        </p>
      </Section>

      <Section title="11. Your Rights">
        <p>Depending on your jurisdiction, you may have the right to:</p>
        <ul>
          <li>Access the personal data we hold about you</li>
          <li>Request correction of inaccurate data</li>
          <li>Request deletion of your personal data</li>
          <li>Object to or restrict processing of your data</li>
          <li>Withdraw consent at any time</li>
        </ul>
        <p>
          To exercise any of these rights, please contact us at{" "}
          <a href="mailto:studiosmart94@gmail.com" className="text-brand hover:underline">
            studiosmart94@gmail.com
          </a>.
        </p>
      </Section>

      <Section title="12. Changes to This Policy">
        <p>
          We may update this Privacy Policy from time to time. We will notify you of any material
          changes by posting the updated policy on this page with a revised &quot;Last updated&quot; date.
          Your continued use of the Service after any changes constitutes acceptance of the updated
          policy.
        </p>
      </Section>

      <Section title="13. Contact Us">
        <p>If you have any questions about this Privacy Policy, please contact us:</p>
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
