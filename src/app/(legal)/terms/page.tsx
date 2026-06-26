import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms & Conditions | StudioSmart",
  description: "Read the terms and conditions governing the use of StudioSmart photo proofing and delivery platform.",
};

export default function TermsPage() {
  return (
    <article className="prose-legal">
      <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-3 brand-text-gradient">
        Terms &amp; Conditions
      </h1>
      <p className="text-white/40 text-sm mb-12">
        Last updated: June 26, 2026
      </p>

      <Section title="1. Acceptance of Terms">
        <p>
          By accessing or using StudioSmart (&quot;Service&quot;), operated via{" "}
          <a href="https://studiosmart.in" className="text-brand hover:underline">
            https://studiosmart.in
          </a>{" "}
          and the StudioSmart desktop application, you agree to be bound by these Terms &amp; Conditions.
          If you do not agree to all the terms and conditions, you must not use or access the Service.
        </p>
      </Section>

      <Section title="2. Description of Service">
        <p>
          StudioSmart is a cloud-based platform for professional photographers that provides:
        </p>
        <ul>
          <li>Photo upload and gallery hosting for client proofing and selection</li>
          <li>Anti-screenshot and photo protection features</li>
          <li>Client-facing gallery access with optional payment gating</li>
          <li>Digital invitation creation and sharing</li>
          <li>Wallet-based payment management for photographers</li>
          <li>Desktop application for bulk photo management</li>
        </ul>
      </Section>

      <Section title="3. User Accounts">
        <h3 className="text-lg font-semibold text-white mb-3">3.1 Registration</h3>
        <p>
          To use certain features of the Service, you must register for an account. You agree to
          provide accurate, current, and complete information during registration and keep your
          account information updated.
        </p>

        <h3 className="text-lg font-semibold text-white mt-6 mb-3">3.2 Account Security</h3>
        <p>
          You are responsible for safeguarding your password and for all activities that occur under
          your account. You must notify us immediately of any unauthorized access to your account.
        </p>

        <h3 className="text-lg font-semibold text-white mt-6 mb-3">3.3 Account Types</h3>
        <p>
          <strong>Photographers/Studios:</strong> Registered users who upload photos, create albums,
          and manage client galleries.
        </p>
        <p>
          <strong>Clients/Guests:</strong> End users who access shared galleries via unique links to
          view and select photos.
        </p>
      </Section>

      <Section title="4. Payments and Pricing">
        <h3 className="text-lg font-semibold text-white mb-3">4.1 Pricing</h3>
        <p>
          StudioSmart charges on a per-album basis. Current pricing is displayed on the website and
          is subject to change. Any price changes will not affect existing active albums.
        </p>

        <h3 className="text-lg font-semibold text-white mt-6 mb-3">4.2 Payment Processing</h3>
        <p>
          All payments are processed securely through Razorpay. By making a payment, you also agree
          to Razorpay&apos;s terms of service. We accept UPI, debit cards, credit cards, net banking,
          and other payment methods supported by Razorpay.
        </p>

        <h3 className="text-lg font-semibold text-white mt-6 mb-3">4.3 Client Payments</h3>
        <p>
          Photographers may set up payment-gated galleries where clients must pay to access photos.
          These payments are collected via Razorpay and credited to the photographer&apos;s StudioSmart
          wallet after successful verification.
        </p>

        <h3 className="text-lg font-semibold text-white mt-6 mb-3">4.4 Wallet</h3>
        <p>
          Funds from client payments are credited to your StudioSmart wallet. Wallet balance and
          transaction history are available in your studio dashboard.
        </p>
      </Section>

      <Section title="5. Content and Intellectual Property">
        <h3 className="text-lg font-semibold text-white mb-3">5.1 Your Content</h3>
        <p>
          You retain full ownership of all photos and content you upload to the Service. By uploading
          content, you grant StudioSmart a limited, non-exclusive license to store, display, and
          deliver your content solely for the purpose of providing the Service.
        </p>

        <h3 className="text-lg font-semibold text-white mt-6 mb-3">5.2 Prohibited Content</h3>
        <p>You agree not to upload content that:</p>
        <ul>
          <li>Infringes on intellectual property rights of others</li>
          <li>Contains illegal, obscene, or harmful material</li>
          <li>Violates any applicable law or regulation</li>
          <li>Contains malware or harmful code</li>
        </ul>

        <h3 className="text-lg font-semibold text-white mt-6 mb-3">5.3 Our Property</h3>
        <p>
          The StudioSmart platform, including its design, code, logos, and branding, is owned by
          StudioSmart and protected by intellectual property laws. You may not copy, modify, or
          distribute any part of the platform without prior written consent.
        </p>
      </Section>

      <Section title="6. Album Hosting and Data Retention">
        <p>
          Albums are hosted for the duration specified in your plan (currently 6 months from
          creation). After the hosting period, albums and associated photos may be deleted from our
          servers. We recommend that photographers maintain their own backups of all original photos.
        </p>
      </Section>

      <Section title="7. Anti-Screenshot and Photo Protection">
        <p>
          StudioSmart provides browser-level deterrents to discourage unauthorized screenshots and
          downloads. These features are provided on a best-effort basis. We do not guarantee that
          they will prevent all forms of unauthorized capture. StudioSmart is not liable for any
          unauthorized use of photos by third parties.
        </p>
      </Section>

      <Section title="8. Prohibited Activities">
        <p>You agree not to:</p>
        <ul>
          <li>Use the Service for any unlawful purpose</li>
          <li>Attempt to gain unauthorized access to our systems or other users&apos; accounts</li>
          <li>Interfere with or disrupt the Service</li>
          <li>Circumvent or disable any security features of the platform</li>
          <li>Use automated bots, scrapers, or similar tools to access the Service</li>
          <li>Reverse engineer, decompile, or disassemble any part of the Service</li>
        </ul>
      </Section>

      <Section title="9. Limitation of Liability">
        <p>
          To the maximum extent permitted by applicable law, StudioSmart shall not be liable for any
          indirect, incidental, special, consequential, or punitive damages, or any loss of profits,
          data, or goodwill, arising from your use of or inability to use the Service.
        </p>
        <p>
          Our total liability for any claim arising from these Terms shall not exceed the amount you
          have paid to StudioSmart in the 12 months preceding the claim.
        </p>
      </Section>

      <Section title="10. Disclaimer of Warranties">
        <p>
          The Service is provided &quot;as is&quot; and &quot;as available&quot; without warranties of any kind, whether
          express or implied. We do not guarantee that the Service will be uninterrupted, error-free,
          or secure at all times.
        </p>
      </Section>

      <Section title="11. Termination">
        <p>
          We reserve the right to suspend or terminate your account at any time, with or without
          cause, including for violation of these Terms. You may also delete your account at any time
          by contacting us. Upon termination, your right to use the Service ceases immediately.
        </p>
      </Section>

      <Section title="12. Governing Law">
        <p>
          These Terms shall be governed by and construed in accordance with the laws of India. Any
          disputes arising from these Terms shall be subject to the exclusive jurisdiction of the
          courts in Tamil Nadu, India.
        </p>
      </Section>

      <Section title="13. Changes to Terms">
        <p>
          We reserve the right to modify these Terms at any time. Material changes will be notified
          via the Service or by email. Your continued use of the Service after such changes
          constitutes acceptance of the revised Terms.
        </p>
      </Section>

      <Section title="14. Contact Us">
        <p>If you have any questions about these Terms, please contact us:</p>
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
