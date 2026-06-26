import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shipping & Delivery Policy | StudioSmart",
  description: "Learn about StudioSmart's digital delivery process for photo galleries and albums.",
};

export default function ShippingPolicyPage() {
  return (
    <article className="prose-legal">
      <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-3 brand-text-gradient">
        Shipping &amp; Delivery Policy
      </h1>
      <p className="text-white/40 text-sm mb-12">
        Last updated: June 26, 2026
      </p>

      <Section title="1. Digital Service">
        <p>
          StudioSmart is a <strong>100% digital service</strong>. We do not ship any physical
          products. All services and deliverables are provided electronically through our platform at{" "}
          <a href="https://studiosmart.in" className="text-brand hover:underline">
            https://studiosmart.in
          </a>{" "}
          and the StudioSmart desktop application.
        </p>
      </Section>

      <Section title="2. What We Deliver">
        <p>Our digital deliverables include:</p>
        <ul>
          <li>
            <strong>Photo Galleries:</strong> Online albums hosted on our platform, accessible via
            unique shareable links
          </li>
          <li>
            <strong>Client Proofing Access:</strong> Interactive galleries where clients can view,
            select, and mark their preferred photos
          </li>
          <li>
            <strong>Digital Invitations:</strong> Custom digital invites that can be shared via link
          </li>
          <li>
            <strong>Desktop Application:</strong> Software download for bulk photo management and
            upload
          </li>
        </ul>
      </Section>

      <Section title="3. Delivery Timeline">
        <h3 className="text-lg font-semibold text-white mb-3">3.1 Album Creation</h3>
        <p>
          Once a photographer creates an album and uploads photos, the gallery link is generated
          <strong> instantly</strong>. The photographer can share this link with their clients
          immediately.
        </p>

        <h3 className="text-lg font-semibold text-white mt-6 mb-3">3.2 Payment-Gated Access</h3>
        <p>
          For payment-gated galleries, client access is granted <strong>immediately</strong> upon
          successful payment verification. There is no waiting period — once payment is confirmed
          via Razorpay, the gallery unlocks automatically.
        </p>

        <h3 className="text-lg font-semibold text-white mt-6 mb-3">3.3 Account Activation</h3>
        <p>
          New photographer accounts are activated immediately upon successful registration. You can
          start creating albums and uploading photos right away.
        </p>
      </Section>

      <Section title="4. Service Availability">
        <p>
          Our platform is available 24/7, subject to scheduled maintenance and unforeseen technical
          issues. We strive to maintain 99.9% uptime but cannot guarantee uninterrupted service at
          all times.
        </p>
      </Section>

      <Section title="5. Album Hosting Duration">
        <p>
          Albums are hosted on our platform for the period specified in your plan (currently 6 months
          from creation). During this period, the gallery link remains active and accessible to
          clients. Photographers are notified before their album hosting period expires.
        </p>
      </Section>

      <Section title="6. Delivery Issues">
        <p>
          If you experience any issues with accessing your digital content after payment, please
          contact us immediately:
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
        </ul>
        <p>
          We will resolve any delivery-related issues within <strong>24 hours</strong> of receiving
          your complaint.
        </p>
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
