import Head from 'next/head';
import FAQItem from '../components/FAQItem';
import { prisma } from '../lib/prisma';
import { faqContent } from '../lib/site-content';

export default function FAQs({ faqs }) {
  return (
    <>
      <Head>
        <title>{faqContent.title} | Dental Atelier</title>
        <meta name="description" content={faqContent.description} />
        <link rel="canonical" href="https://www.dentalatelier.co/faqs" />
        <meta property="og:title" content={`${faqContent.title} | Dental Atelier`} />
        <meta property="og:description" content={faqContent.description} />
      </Head>
      <section className="bg-white">
        <div className="mx-auto max-w-content px-5 py-14 sm:py-20">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-coral">Dental Atelier</p>
          <h1 className="mt-3 text-4xl font-semibold text-brand sm:text-5xl">{faqContent.title}</h1>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-gray-700">{faqContent.intro}</p>
        </div>
      </section>
      <section className="mx-auto max-w-content px-5 py-12">
        {faqs.length === 0 ? (
          <p className="text-gray-700">There are no FAQs available at the moment. Please contact us if you have a question.</p>
        ) : (
          <div className="max-w-4xl">
            {faqs.map((faq) => <FAQItem key={faq.id ?? faq.question} question={faq.question} answer={faq.answer} />)}
          </div>
        )}
      </section>
    </>
  );
}

export async function getServerSideProps() {
  try {
    const faqs = await prisma.faq.findMany({ orderBy: { id: 'asc' } });
    return { props: { faqs } };
  } catch (error) {
    console.error('Using fallback FAQ content because the database is unavailable:', error);
    const faqs = faqContent.sections.map(({ title, body }) => ({ question: title, answer: body }));
    return { props: { faqs } };
  }
}
