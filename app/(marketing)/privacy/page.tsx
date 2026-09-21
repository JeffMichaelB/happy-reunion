import type { Metadata } from "next"

import { CtaStrip } from "@/components/marketing/cta-strip"
import { FadeUp } from "@/components/marketing/motion"
import { buildMetadata } from "@/lib/seo/metadata"

export const metadata: Metadata = buildMetadata({
  title: "Privacy Policy",
  description:
    "The Reunion Projects Privacy Policy. Learn how we collect, use, and protect your personal information.",
  path: "/privacy",
})

export default function PrivacyPage() {
  return (
    <article>
      <header className="border-b border-border px-6 pt-24 pb-16 md:pt-32 md:pb-20">
        <div className="mx-auto max-w-4xl">
          <FadeUp>
            <p className="font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
              Legal
            </p>
          </FadeUp>
          <FadeUp delay={0.08}>
            <h1 className="mt-8 font-heading text-[clamp(2.5rem,6vw,4.5rem)] font-bold leading-[1.05] tracking-[-0.02em] text-foreground">
              Privacy Policy
            </h1>
          </FadeUp>
          <FadeUp delay={0.16}>
            <p className="mt-6 text-base text-muted-foreground">
              Effective Date: August 1, 2026
            </p>
          </FadeUp>
        </div>
      </header>

      <div className="px-6 py-16 md:py-24">
        <div className="mx-auto max-w-4xl">
            <p className="text-lg leading-relaxed text-muted-foreground">
              Reunion Projects (&ldquo;Reunion Projects,&rdquo; &ldquo;we,&rdquo;
              &ldquo;our,&rdquo; or &ldquo;us&rdquo;) is committed to protecting
              your privacy and earning your trust. This Privacy Policy explains
              how we collect, use, disclose, and safeguard your information when
              you visit our website, or otherwise interact with our services
              (collectively, the &ldquo;Services&rdquo;).
            </p>

            <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
              Please read this Privacy Policy carefully. By using our Services,
              you acknowledge the practices described below.
            </p>

            <Section title="Information We Collect">
              <SubSection title="Information You Provide">
                <p>
                  We may collect information you voluntarily provide, including:
                </p>
                <ul>
                  <li>Name</li>
                  <li>Email address</li>
                  <li>Phone number (optional)</li>
                  <li>City, state, or general location</li>
                  <li>
                    Graduation year, schools attended, employers, organizations,
                    or other information that helps facilitate reconnections
                  </li>
                  <li>Conversation preferences and interests</li>
                  <li>
                    Messages, invitations, referrals, nominations, and other
                    content you submit
                  </li>
                  <li>Customer support communications</li>
                  <li>
                    Payment information (processed through third-party payment
                    processors—we do not store complete payment card numbers)
                  </li>
                </ul>
              </SubSection>

              <SubSection title="Information Collected Automatically">
                <p>
                  When you use our Services, we may automatically collect:
                </p>
                <ul>
                  <li>IP address</li>
                  <li>Browser type</li>
                  <li>Device identifiers</li>
                  <li>Operating system</li>
                  <li>Pages viewed</li>
                  <li>Features used</li>
                  <li>Session duration</li>
                  <li>Referral URLs</li>
                  <li>Crash reports</li>
                  <li>Diagnostic information</li>
                  <li>Cookie and similar technology data</li>
                </ul>
              </SubSection>

              <SubSection title="Information From Third Parties">
                <p>We may receive information from:</p>
                <ul>
                  <li>
                    Authentication providers (Google, Apple, Microsoft, etc.)
                  </li>
                  <li>Social login providers (if enabled)</li>
                  <li>Referral invitations from existing users</li>
                  <li>Analytics providers</li>
                  <li>Marketing partners</li>
                  <li>
                    Publicly available information that helps verify identities
                    or improve user experience
                  </li>
                </ul>
              </SubSection>
            </Section>

            <Section title="How We Use Your Information">
              <p>We use your information to:</p>
              <ul>
                <li>Create and manage your account</li>
                <li>Facilitate introductions and reconnections</li>
                <li>Enable invitations and referrals</li>
                <li>Personalize your experience</li>
                <li>Improve our Services</li>
                <li>Develop new features</li>
                <li>Respond to customer support requests</li>
                <li>Send important service-related communications</li>
                <li>
                  Send optional newsletters and marketing communications (which
                  you may opt out of)
                </li>
                <li>
                  Detect fraud and protect the security of our platform
                </li>
                <li>Comply with legal obligations</li>
              </ul>
            </Section>

            <Section title="Our Philosophy">
              <p>
                Reunion Projects exists to strengthen meaningful human
                relationships.
              </p>
              <p>
                We collect only the information reasonably necessary to provide
                our Services, improve the user experience, and maintain the
                security of our platform.
              </p>
              <p className="font-semibold text-foreground">
                We do not sell your personal information.
              </p>
            </Section>

            <Section title="How We Share Information">
              <p>
                We may share information only in the following circumstances:
              </p>

              <SubSection title="Service Providers">
                <p>
                  We work with trusted vendors who help operate our Services,
                  including:
                </p>
                <ul>
                  <li>Cloud hosting providers</li>
                  <li>Payment processors</li>
                  <li>Email delivery providers</li>
                  <li>Analytics providers</li>
                  <li>Customer support platforms</li>
                </ul>
                <p>
                  These providers may access information only to perform
                  services on our behalf.
                </p>
              </SubSection>

              <SubSection title="With Other Users">
                <p>
                  Certain profile information that you choose to make visible
                  may be shared with other users to facilitate introductions and
                  meaningful conversations.
                </p>
                <p>You control much of what appears on your profile.</p>
              </SubSection>

              <SubSection title="Legal Requirements">
                <p>
                  We may disclose information if required by law or if we
                  believe disclosure is reasonably necessary to:
                </p>
                <ul>
                  <li>Comply with legal obligations</li>
                  <li>Protect our rights</li>
                  <li>Investigate fraud</li>
                  <li>Protect users or the public</li>
                </ul>
              </SubSection>

              <SubSection title="Business Transfers">
                <p>
                  If Reunion Projects is involved in a merger, acquisition,
                  financing, or sale of assets, your information may be
                  transferred as part of that transaction.
                </p>
              </SubSection>
            </Section>

            <Section title="Cookies and Similar Technologies">
              <p>We use cookies and similar technologies to:</p>
              <ul>
                <li>Keep you signed in</li>
                <li>Remember preferences</li>
                <li>Measure site performance</li>
                <li>Improve usability</li>
                <li>Analyze traffic</li>
                <li>Prevent fraud</li>
              </ul>
              <p>
                Most browsers allow you to control cookies through browser
                settings.
              </p>
            </Section>

            <Section title="Analytics">
              <p>
                We may use analytics services (such as Google Analytics or
                similar providers) to understand how people use our Services.
              </p>
              <p>
                These services may collect information regarding device usage,
                browsing behavior, and interactions with our platform.
              </p>
            </Section>

            <Section title="Marketing Communications">
              <p>
                If you subscribe to newsletters or updates, we may send
                promotional emails.
              </p>
              <p>
                You may unsubscribe at any time using the link included in our
                emails.
              </p>
              <p>
                Service-related communications (such as password resets or
                account notifications) cannot be opted out of while maintaining
                an active account.
              </p>
            </Section>

            <Section title="Data Retention">
              <p>
                We retain personal information only as long as reasonably
                necessary to:
              </p>
              <ul>
                <li>Provide our Services</li>
                <li>Comply with legal obligations</li>
                <li>Resolve disputes</li>
                <li>Enforce our agreements</li>
              </ul>
              <p>
                When information is no longer needed, we will securely delete or
                anonymize it where practical.
              </p>
            </Section>

            <Section title="Security">
              <p>
                We maintain reasonable administrative, technical, and physical
                safeguards designed to protect your information.
              </p>
              <p>
                However, no method of electronic storage or Internet
                transmission is completely secure, and we cannot guarantee
                absolute security.
              </p>
            </Section>

            <Section title="Your Privacy Choices">
              <p>
                Subject to applicable law, you may have the right to:
              </p>
              <ul>
                <li>Access your personal information</li>
                <li>Correct inaccurate information</li>
                <li>Delete your account</li>
                <li>Request a copy of your data</li>
                <li>Object to certain processing</li>
                <li>Restrict certain processing</li>
                <li>Withdraw consent where applicable</li>
              </ul>
              <p>
                To exercise these rights, contact us using the information
                below.
              </p>
            </Section>

            <Section title="California Privacy Rights">
              <p>
                If you are a California resident, you may have rights under the
                California Consumer Privacy Act (CCPA), as amended by the
                California Privacy Rights Act (CPRA), including rights to:
              </p>
              <ul>
                <li>Know what personal information we collect</li>
                <li>Request deletion of personal information</li>
                <li>Correct inaccurate personal information</li>
                <li>Request access to your information</li>
                <li>
                  Limit certain uses of sensitive personal information (where
                  applicable)
                </li>
                <li>
                  Be free from discrimination for exercising your privacy rights
                </li>
              </ul>
              <p className="font-semibold text-foreground">
                Reunion Projects does not sell personal information as defined
                under California law.
              </p>
            </Section>

            <Section title="International Users">
              <p>
                If you access our Services from outside the United States, your
                information may be processed in the United States or other
                countries where our service providers operate.
              </p>
              <p>
                By using our Services, you acknowledge that your information may
                be transferred internationally.
              </p>
            </Section>

            <Section title="Children's Privacy">
              <p>
                Our Services are intended for adults and are not directed toward
                children under 18 years of age.
              </p>
              <p>
                We do not knowingly collect personal information from children
                under 18.
              </p>
              <p>
                If we become aware that such information has been collected, we
                will promptly delete it.
              </p>
            </Section>

            <Section title="Third-Party Links">
              <p>
                Our Services may contain links to third-party websites.
              </p>
              <p>
                We are not responsible for the privacy practices of those
                websites.
              </p>
            </Section>

            <Section title="Changes to This Privacy Policy">
              <p>We may update this Privacy Policy periodically.</p>
              <p>
                If we make material changes, we will post the updated policy on
                our website and update the Effective Date.
              </p>
              <p>
                Continued use of the Services after changes become effective
                constitutes acceptance of the revised policy.
              </p>
            </Section>

            <Section title="Contact Us">
              <p>
                If you have questions about this Privacy Policy or our privacy
                practices, please contact us:
              </p>
              <div className="mt-4 rounded-lg border border-border bg-muted/30 p-6">
                <p className="font-semibold text-foreground">Reunion Projects</p>
                <p className="mt-2">
                  Email:{" "}
                  <a
                    href="mailto:jstump@thereunionprojects.com"
                    className="text-foreground underline underline-offset-4 transition-colors hover:text-primary"
                  >
                    jstump@thereunionprojects.com
                  </a>
                </p>
                <p className="mt-1">
                  Website:{" "}
                  <a
                    href="https://www.thereunionprojects.com"
                    className="text-foreground underline underline-offset-4 transition-colors hover:text-primary"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    www.thereunionprojects.com
                  </a>
                </p>
              </div>
            </Section>

            <section className="mt-16 rounded-lg border border-border bg-muted/30 p-8 md:p-10">
              <h2 className="font-heading text-xl font-semibold tracking-tight text-foreground md:text-2xl">
                Our Privacy Promise
              </h2>
              <p className="mt-4 text-muted-foreground">
                The Reunion Projects was created to help people reconnect
                through authentic conversations—not to monetize personal
                information.
              </p>
              <p className="mt-4 font-medium text-foreground">
                Our commitment is simple:
              </p>
              <ul className="mt-4 space-y-2 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 block h-1.5 w-1.5 shrink-0 rounded-full bg-foreground/50" />
                  We will collect only what we need.
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 block h-1.5 w-1.5 shrink-0 rounded-full bg-foreground/50" />
                  We will be transparent about how we use it.
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 block h-1.5 w-1.5 shrink-0 rounded-full bg-foreground/50" />
                  We will never sell your personal information.
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 block h-1.5 w-1.5 shrink-0 rounded-full bg-foreground/50" />
                  We will give you meaningful control over your data.
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 block h-1.5 w-1.5 shrink-0 rounded-full bg-foreground/50" />
                  We will continually work to protect your information and earn
                  your trust.
                </li>
              </ul>
              <p className="mt-6 italic text-muted-foreground">
                We believe privacy is an essential part of building meaningful
                human connection.
              </p>
            </section>
          </div>
      </div>

      <div className="px-6 pb-24 md:pb-32">
        <CtaStrip
          heading="Ready to start your Reunion?"
          subheading="Host a conversation worth keeping."
        />
      </div>
    </article>
  )
}

function Section({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <section className="mt-12 first:mt-8">
      <h2 className="font-heading text-xl font-semibold tracking-tight text-foreground md:text-2xl">
        {title}
      </h2>
      <div className="mt-4 space-y-4 text-base leading-relaxed text-muted-foreground [&_li]:ml-4 [&_li]:list-disc [&_ul]:space-y-2">
        {children}
      </div>
    </section>
  )
}

function SubSection({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <div className="mt-6 first:mt-0">
      <h3 className="font-heading text-lg font-medium text-foreground">
        {title}
      </h3>
      <div className="mt-3 space-y-3 [&_li]:ml-4 [&_li]:list-disc [&_ul]:space-y-2">
        {children}
      </div>
    </div>
  )
}
