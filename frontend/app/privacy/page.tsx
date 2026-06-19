import type { Metadata } from "next";
import { LegalPage, Section } from "@/components/legal-page";

export const metadata: Metadata = {
  title: "Privacy Policy — ClarityAI",
  description:
    "How ClarityAI handles your information: stateless processing, no accounts, on-device storage, and the AI providers involved.",
};

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy Policy" updated="June 19, 2026">
      <p>
        ClarityAI exists to make daunting paperwork understandable. The people who use it are
        often having a hard day — facing an eviction notice, a confusing bill, a form with a
        looming deadline. The least we can do is be honest and sparing with their information.
        This page explains, in plain language, exactly what happens to what you share.
      </p>
      <p>
        <strong>The short version:</strong> we have no accounts, no database, and no interest in
        building a profile of you. Your documents are processed in memory to generate your result
        and are not stored on our servers afterward. The only lasting copy lives on your own
        device, where you can erase it at any time.
      </p>

      <Section heading="What we do not collect">
        <ul>
          <li>No account, name, email, or password — there is nothing to sign up for.</li>
          <li>No advertising trackers, no analytics pixels, no third-party cookies.</li>
          <li>No selling, renting, or sharing of your information. Ever. There is no business model that depends on it.</li>
        </ul>
      </Section>

      <Section heading="What you give us, and why">
        <p>
          To produce a translation, ClarityAI processes the text you paste, the documents you
          upload (PDFs or photos), anything you type into the follow-up chat, and — optionally —
          your approximate location to find nearby help. We use this <strong>only</strong> to
          generate the result you asked for. Once your request is answered, the input is discarded
          from our backend; it is not written to any database, because we do not run one.
        </p>
      </Section>

      <Section heading="Removing sensitive details before AI sees them">
        <p>
          Before your text is sent to any AI provider, ClarityAI automatically redacts patterns
          that look like Social Security numbers, email addresses, and phone numbers. This is a
          best-effort safeguard, not a guarantee — please avoid pasting information you would not
          want a third-party AI service to process.
        </p>
      </Section>

      <Section heading="The providers that help us work">
        <p>
          ClarityAI is, candidly, a careful wrapper around some excellent specialist services. To
          deliver a result, your (PII-redacted) text may be sent to:
        </p>
        <ul>
          <li>
            <strong>NVIDIA</strong> — the AI model that reads and explains your document and powers
            the follow-up chat.
          </li>
          <li>
            <strong>Brave Search</strong> — used to find candidate local support organizations when
            you ask for help resources.
          </li>
          <li>
            <strong>Microsoft Azure</strong> — converts the summary to speech when you tap
            &ldquo;Listen.&rdquo;
          </li>
          <li>
            <strong>ip-api.com</strong> — best-effort approximate location (city/region) from your
            IP address, used to localize emergency numbers and nearby resources. You are never asked
            for precise GPS location.
          </li>
        </ul>
        <p>
          These providers process the data we send them under their own terms and privacy policies.
          We send them the minimum needed to perform their task.
        </p>
      </Section>

      <Section heading="What stays on your device">
        <p>
          Your translation history, checklist progress, follow-up conversations, and last session
          are saved in your browser&rsquo;s local storage — on your device, never on our servers.
          For offline use, the installable app may also cache your recent translations on the
          device. All of this is yours to clear:
        </p>
        <ul>
          <li>Open <strong>Settings → Erase my data</strong> to wipe everything ClarityAI stored locally, including cached translations.</li>
          <li>Clearing your browser data for this site removes it as well.</li>
        </ul>
      </Section>

      <Section heading="Children">
        <p>
          ClarityAI is intended for adults handling their own or their family&rsquo;s paperwork. It
          is not directed at children and does not knowingly collect information from them.
        </p>
      </Section>

      <Section heading="Changes to this policy">
        <p>
          If we change how ClarityAI handles information, we will update this page and the date
          above. Because we keep no contact details, we cannot notify you directly — please check
          back here if it matters to you.
        </p>
      </Section>

      <Section heading="A closing note">
        <p>
          ClarityAI organizes information and explains it in plain language. It does not give legal,
          medical, or financial advice, and it never files or submits anything on your behalf. For
          decisions that matter, please confirm with a qualified professional.
        </p>
      </Section>
    </LegalPage>
  );
}
