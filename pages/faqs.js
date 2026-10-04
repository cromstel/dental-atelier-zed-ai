import Head from "next/head";
import FAQItem from "../components/FAQItem";
import PageHero from "../components/PageHero";
import { prisma } from "../lib/prisma";
import { faqContent } from "../lib/site-content";
import { getPageTitle } from "../lib/seo";

export default function FAQs({ faqs }) {
  return (
    <>
      <Head>
        <title>{getPageTitle(faqContent.title)}</title>
        <meta name="description" content={faqContent.description} />
        <link rel="canonical" href="https://www.dentalatelier.co/faqs" />
        <meta
          property="og:title"
          content={`${faqContent.title} | Dental Atelier`}
        />
        <meta property="og:description" content={faqContent.description} />
      </Head>
      <PageHero
        eyebrow="Dental Atelier"
        title={faqContent.title}
        description={faqContent.intro}
        imageSrc={faqContent.heroImage}
        imageAlt={faqContent.heroAlt}
      />
      <section className="mx-auto max-w-content px-5 py-12">
        {faqs.length === 0 ? (
          <p className="text-gray-700">
            There are no FAQs available at the moment. Please contact us if you
            have a question.
          </p>
        ) : (
          <div className="max-w-4xl">
            {faqs.map((faq) => (
              <FAQItem
                key={faq.id ?? faq.question}
                question={faq.question}
                answer={faq.answer}
              />
            ))}
          </div>
        )}
      </section>
    </>
  );
}

export async function getServerSideProps() {
  try {
    const faqs = await prisma.faq.findMany({ orderBy: { id: "asc" } });
    return { props: { faqs } };
  } catch (error) {
    console.error(
      "Using fallback FAQ content because the database is unavailable:",
      error,
    );
    const faqs = faqContent.sections.map(({ title, body }) => ({
      question: title,
      answer: body,
    }));
    return { props: { faqs } };
  }
}
