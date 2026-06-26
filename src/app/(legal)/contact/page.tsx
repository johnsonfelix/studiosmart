import type { Metadata } from "next";
import { Mail, Phone, Globe, MapPin, Clock } from "lucide-react";

export const metadata: Metadata = {
  title: "Contact Us | StudioSmart",
  description: "Get in touch with the StudioSmart team for support, inquiries, or feedback.",
};

export default function ContactPage() {
  return (
    <article className="prose-legal">
      <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-3 brand-text-gradient">
        Contact Us
      </h1>
      <p className="text-white/40 text-sm mb-12">
        We&apos;d love to hear from you. Reach out to us for support, inquiries, or feedback.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
        <ContactCard
          icon={<Mail className="w-6 h-6" />}
          title="Email"
          value="studiosmart94@gmail.com"
          href="mailto:studiosmart94@gmail.com"
          description="For general inquiries, support, and refund requests"
        />
        <ContactCard
          icon={<Phone className="w-6 h-6" />}
          title="Phone"
          value="+91 7010997983"
          href="tel:+917010997983"
          description="Available Monday – Saturday, 10 AM – 7 PM IST"
        />
        <ContactCard
          icon={<Globe className="w-6 h-6" />}
          title="Website"
          value="studiosmart.in"
          href="https://studiosmart.in"
          description="Visit our website for more information"
        />
        <ContactCard
          icon={<Clock className="w-6 h-6" />}
          title="Support Hours"
          value="Mon – Sat, 10 AM – 7 PM"
          description="Indian Standard Time (IST)"
        />
      </div>

      <Section title="Business Information">
        <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 space-y-4">
          <div className="flex items-start gap-3">
            <MapPin className="w-5 h-5 text-brand shrink-0 mt-0.5" />
            <div>
              <p className="text-white font-semibold">StudioSmart</p>
              <p className="text-white/50">Tamil Nadu, India</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Mail className="w-5 h-5 text-brand shrink-0 mt-0.5" />
            <div>
              <p className="text-white font-semibold">Email</p>
              <a href="mailto:studiosmart94@gmail.com" className="text-white/50 hover:text-brand transition-colors">
                studiosmart94@gmail.com
              </a>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Phone className="w-5 h-5 text-brand shrink-0 mt-0.5" />
            <div>
              <p className="text-white font-semibold">Phone</p>
              <a href="tel:+917010997983" className="text-white/50 hover:text-brand transition-colors">
                +91 7010997983
              </a>
            </div>
          </div>
        </div>
      </Section>

      <Section title="Common Inquiries">
        <div className="space-y-6">
          <FAQ
            question="I made a payment but can't access the gallery. What should I do?"
            answer="Please contact us with your payment ID/transaction reference and we will resolve the issue within 24 hours."
          />
          <FAQ
            question="How do I request a refund?"
            answer="Email us at studiosmart94@gmail.com with your payment details and reason for the refund. We process refund requests within 5-7 business days."
          />
          <FAQ
            question="I'm a photographer and need help setting up my studio."
            answer="Reach out to us via email or phone and our team will guide you through the setup process."
          />
          <FAQ
            question="How can I report a technical issue?"
            answer="Send us a detailed description of the issue along with any screenshots to studiosmart94@gmail.com. Include your device, browser, and steps to reproduce the problem."
          />
        </div>
      </Section>
    </article>
  );
}

function ContactCard({
  icon,
  title,
  value,
  href,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
  href?: string;
  description: string;
}) {
  return (
    <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 hover:bg-white/[0.05] transition-colors group">
      <div className="w-12 h-12 rounded-xl bg-brand/10 border border-brand/20 flex items-center justify-center text-brand mb-4 group-hover:bg-brand/20 transition-colors">
        {icon}
      </div>
      <h3 className="text-lg font-bold text-white mb-1">{title}</h3>
      {href ? (
        <a
          href={href}
          className="text-brand font-medium hover:underline block mb-2"
          target={href.startsWith("http") ? "_blank" : undefined}
          rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
        >
          {value}
        </a>
      ) : (
        <p className="text-white font-medium mb-2">{value}</p>
      )}
      <p className="text-sm text-white/40">{description}</p>
    </div>
  );
}

function FAQ({ question, answer }: { question: string; answer: string }) {
  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
      <h3 className="text-base font-semibold text-white mb-2">{question}</h3>
      <p className="text-sm text-white/50 leading-relaxed">{answer}</p>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-12">
      <h2 className="text-2xl font-bold text-white mb-6">{title}</h2>
      <div className="text-white/60 leading-relaxed space-y-4">
        {children}
      </div>
    </section>
  );
}
