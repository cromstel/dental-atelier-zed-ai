import Head from "next/head";
import ContactForm from "../components/ContactForm";
import PageHero from "../components/PageHero";

const questions = [
  "Are your teeth crooked or crowded?",
  "Are your teeth worn down?",
  "Are you unhappy with the shape or color of your teeth?",
  "Do you avoid smiling in photographs?",
];

export default function SmileCheck() {
  return (
    <>
      <Head>
        <title>Smile Check | Dental Atelier</title>
        <meta
          name="description"
          content="Complete a smile check and tell Dental Atelier what you would like to discuss."
        />
      </Head>
      <PageHero
        eyebrow="Your first step"
        title="Smile check"
        description="If any of these questions sound familiar, tell us what you would like to improve. Our team can help you understand how to begin a conversation with your dentist."
        imageSrc="/images/hero-comfort-self-confidence-slide-02.webp"
        imageAlt="People greeting each other during a conversation"
      />
      <div className="mx-auto grid max-w-content gap-10 px-5 py-14 sm:py-20 lg:grid-cols-2">
        <div>
          <ul className="space-y-4">
            {questions.map((question) => (
              <li
                className="flex gap-3 rounded-lg bg-white p-4 leading-6 shadow-sm"
                key={question}
              >
                <span aria-hidden="true" className="font-bold text-coral">
                  ✓
                </span>
                <span>{question}</span>
              </li>
            ))}
          </ul>
          <p className="mt-5 text-sm leading-6 text-gray-600">
            This form is an inquiry, not a diagnosis or substitute for
            professional dental advice.
          </p>
        </div>
        <ContactForm
          inquiryType="SMILE_CHECK"
          heading="Tell us about your smile"
        />
      </div>
    </>
  );
}
