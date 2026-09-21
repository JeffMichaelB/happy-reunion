import type { Metadata } from "next"

import { CtaStrip } from "@/components/marketing/cta-strip"
import { FadeUp } from "@/components/marketing/motion"
import { buildMetadata } from "@/lib/seo/metadata"

export const metadata: Metadata = buildMetadata({
  title: "Terms and Conditions",
  description:
    "The Reunion Projects Terms and Conditions. Please read these terms carefully before using our platform.",
  path: "/terms",
})

export default function TermsPage() {
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
              Terms and Conditions
            </h1>
          </FadeUp>
          <FadeUp delay={0.16}>
            <p className="mt-6 text-base text-muted-foreground">
              Last Updated: July 23, 2026
            </p>
          </FadeUp>
        </div>
      </header>

      <div className="px-6 py-16 md:py-24">
        <div className="mx-auto max-w-4xl">
            <p className="lead text-lg text-muted-foreground">
              Please read these Terms and Conditions (&ldquo;Terms&rdquo;)
              carefully before using The Reunion Projects platform, website, and
              related services (collectively, the &ldquo;Service&rdquo;). The
              Service is operated by The Reunion Projects (&ldquo;The Reunion
              Projects,&rdquo; &ldquo;Company,&rdquo; &ldquo;we,&rdquo;
              &ldquo;us,&rdquo; or &ldquo;our&rdquo;).
            </p>

            <p className="text-muted-foreground">
              By creating an account, purchasing a Reunion, hosting a Reunion,
              participating as a guest, or otherwise accessing the Service, you
              (&ldquo;you,&rdquo; &ldquo;User,&rdquo; or &ldquo;Host&rdquo;)
              agree to be bound by these Terms. If you do not agree, you may not
              use the Service.
            </p>

            <Section number="1" title="Description of Service">
              <p>
                The Reunion Projects is a platform that facilitates recorded
                conversations (&ldquo;Reunions&rdquo;) between a Host(s) and one
                or more invited participants (&ldquo;Guests&rdquo;) — including
                friends, family members, colleagues, mentors, and other personal
                connections. The Service provides scheduling tools, a recording
                and hosting portal, storage, transcription, and optional editing
                and archival features to support these conversations.
              </p>
              <p>
                The Reunion Projects is a facilitation platform only. We do not
                select, screen, or vouch for any Host, Guest, or the content of
                any Reunion, and we are not a party to the personal relationship
                between any Host and Guest.
              </p>
            </Section>

            <Section number="2" title="Eligibility and Accounts">
              <ul>
                <li>
                  You must be at least 18 years old to create an account or host
                  a Reunion. Guests under 18 may only participate with the
                  involvement and consent of a parent or legal guardian.
                </li>
                <li>
                  You are responsible for maintaining the confidentiality of
                  your account credentials and for all activity that occurs
                  under your account.
                </li>
                <li>
                  You agree to provide accurate, current information when
                  creating an account and when inviting Guests.
                </li>
                <li>
                  We reserve the right to suspend or terminate accounts that
                  violate these Terms or that we reasonably believe pose a risk
                  to other Users.
                </li>
              </ul>
            </Section>

            <Section number="3" title="Recording, Consent, and Third-Party Guests">
              <p>
                Reunions involve the recording of spoken conversation between
                two or more individuals. Recording-consent laws vary by state
                and country — some jurisdictions require the consent of all
                parties to a recorded conversation, not just the Host.
              </p>
              <ul>
                <li>
                  As Host, you are solely responsible for obtaining the informed
                  consent of every Guest before recording begins, and for
                  complying with all applicable recording, wiretapping, and
                  privacy laws in your and your Guest&rsquo;s jurisdiction.
                </li>
                <li>
                  The Service will present a consent confirmation step to Guests
                  prior to any recording, but this does not relieve the Host of
                  independent legal responsibility for lawful recording.
                </li>
                <li>
                  Guests may withdraw consent and end a recording at any time.
                  Withdrawal of consent by a Guest does not entitle the Host to
                  a refund.
                </li>
                <li>
                  The Reunion Projects does not review recordings for legal
                  compliance and disclaims responsibility for a Host&rsquo;s
                  failure to obtain proper consent.
                </li>
              </ul>
            </Section>

            <Section number="4" title="User Content and Intellectual Property">
              <p>
                &ldquo;User Content&rdquo; means any audio, video, transcript,
                or other material generated through a Reunion, including
                highlight reels and archive packages.
              </p>
              <ul>
                <li>
                  As between Host, Guest, and The Reunion Projects, ownership of
                  the underlying recording is shared jointly by the Host and any
                  participating Guest(s), consistent with applicable law, unless
                  otherwise agreed in writing.
                </li>
                <li>
                  By using the Service, you grant The Reunion Projects a
                  limited, non-exclusive license to store, process, transcribe,
                  and technically transmit User Content solely as necessary to
                  provide and improve the Service.
                </li>
                <li>
                  The Reunion Projects will not publish, license, sell, or
                  otherwise distribute a User&rsquo;s Reunion recording to third
                  parties without express written consent from the Host and any
                  participating Guest(s).
                </li>
                <li>
                  All Reunion Projects trademarks, branding, software, and
                  platform design remain the exclusive property of the Company.
                </li>
              </ul>
            </Section>

            <Section number="5" title="Acceptable Use">
              <p>You agree not to use the Service to:</p>
              <ul>
                <li>
                  Record any individual without that individual&rsquo;s
                  knowledge and consent;
                </li>
                <li>
                  Harass, threaten, defame, or exploit any Guest or third party;
                </li>
                <li>Upload or transmit unlawful, infringing, or harmful content;</li>
                <li>
                  Circumvent, disable, or interfere with the security or proper
                  functioning of the Service;
                </li>
                <li>
                  Use the Service for any commercial recording, broadcast, or
                  journalistic purpose without our prior written consent.
                </li>
              </ul>
            </Section>

            <Section number="6" title="Data Storage and Retention">
              <p>
                Standard Reunion recordings are stored for 3 years following the
                recording date. Legacy Archive Package purchases extend storage
                and provide enhanced retention and searchability, as described
                at checkout. The Reunion Projects is not responsible for data
                loss due to circumstances beyond its reasonable control, and
                Users are encouraged to download and retain personal copies of
                important recordings.
              </p>
            </Section>

            <Section number="7" title="Disclaimers">
              <p>
                The Service is provided on an &ldquo;as is&rdquo; and &ldquo;as
                available&rdquo; basis. The Reunion Projects makes no warranty
                regarding the emotional, relational, or personal outcome of any
                Reunion, and is not responsible for the content, tone, or
                consequences of conversations between Hosts and Guests. To the
                fullest extent permitted by law, we disclaim all warranties,
                express or implied, including merchantability, fitness for a
                particular purpose, and non-infringement.
              </p>
            </Section>

            <Section number="8" title="Limitation of Liability">
              <p>
                To the maximum extent permitted by law, The Reunion Projects and
                its officers, employees, and affiliates shall not be liable for
                any indirect, incidental, special, consequential, or punitive
                damages, or any loss of data, goodwill, or emotional distress,
                arising from your use of the Service. Our total aggregate
                liability for any claim arising out of these Terms shall not
                exceed the amount you paid to us in the twelve (12) months
                preceding the claim.
              </p>
            </Section>

            <Section number="9" title="Indemnification">
              <p>
                You agree to indemnify and hold harmless The Reunion Projects
                from any claims, damages, or expenses (including reasonable
                attorneys&rsquo; fees) arising from your use of the Service,
                your failure to obtain proper recording consent, or your
                violation of these Terms or applicable law.
              </p>
            </Section>

            <Section number="10" title="Termination">
              <p>
                We may suspend or terminate your access to the Service at any
                time for violation of these Terms. You may close your account at
                any time.
              </p>
            </Section>

            <Section number="11" title="Governing Law and Disputes">
              <p>
                These Terms are governed by the laws of the State of Georgia,
                without regard to its conflict-of-laws principles. Any dispute
                arising under these Terms shall be resolved in the state or
                federal courts located in Fulton County, Georgia, and you
                consent to personal jurisdiction there.
              </p>
            </Section>

            <Section number="12" title="Changes to These Terms">
              <p>
                We may update these Terms from time to time. Material changes
                will be posted on the Service with an updated &ldquo;Last
                Updated&rdquo; date. Continued use of the Service after changes
                take effect constitutes acceptance of the revised Terms.
              </p>
            </Section>

            <Section number="13" title="Contact">
              <p>
                Questions about these Terms may be directed to{" "}
                <a
                  href="mailto:jstump@thereunionprojects.com"
                  className="text-foreground underline underline-offset-4 transition-colors hover:text-primary"
                >
                  jstump@thereunionprojects.com
                </a>
              </p>
            </Section>
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
  number,
  title,
  children,
}: {
  number: string
  title: string
  children: React.ReactNode
}) {
  return (
    <section className="mt-12 first:mt-8">
      <h2 className="font-heading text-xl font-semibold tracking-tight text-foreground md:text-2xl">
        {number}. {title}
      </h2>
      <div className="mt-4 space-y-4 text-base leading-relaxed text-muted-foreground [&_li]:ml-4 [&_li]:list-disc [&_ul]:space-y-2">
        {children}
      </div>
    </section>
  )
}
