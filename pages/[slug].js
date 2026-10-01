import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import ContactForm from '../components/ContactForm';

import ManagedGallery from '../components/ManagedGallery';
import InfoCard from '../components/InfoCard';
import { pages } from '../lib/site-content';
import { readPageContent } from '../lib/page-content';

const labImages = Array.from({ length: 6 }, (_, index) => ({
  src: `/images/about-dental-lab-photo-${String(index + 1).padStart(2, '0')}.webp`,
  alt: `Dental Atelier laboratory photo ${index + 1}`,
}));

const portfolioImages = [
  { src: '/images/portfolio-smile-before.webp', alt: 'Patient smile before treatment', caption: 'Before' },
  { src: '/images/portfolio-smile-after.webp', alt: 'Patient smile after treatment', caption: 'After' },
];

export default function ContentPage({ slug, page }) {

  const isAboutPage = slug === 'about-us';
  const isPortfolioPage = slug === 'portfolio';
  const isInfoRequestPage = slug === 'facial-analysis-and-digital-smile-design';

  return (
    <>
      <Head>
        <title>{page.title} | Dental Atelier</title>
        <meta name="description" content={page.description} />
        <link rel="canonical" href={`https://www.dentalatelier.co/${slug}`} />
        <meta property="og:title" content={`${page.title} | Dental Atelier`} />
        <meta property="og:description" content={page.description} />
      </Head>
      <section className="bg-white">
        <div className="mx-auto max-w-content px-5 py-14 sm:py-20">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-coral">Dental Atelier</p>
          <h1 className="mt-3 text-4xl font-semibold text-brand sm:text-5xl">{page.title}</h1>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-gray-700">{page.intro}</p>
        </div>
      </section>
      {isAboutPage && (
        <section className="mx-auto grid max-w-content gap-8 px-5 pb-8 md:grid-cols-[minmax(220px,0.7fr)_1.3fr] md:items-center">
          <figure className="max-w-sm">
            <div className="relative aspect-[3/4] overflow-hidden rounded-xl bg-gray-100">
              <Image alt="Michal Siakel, Director of Dental Atelier" className="object-cover" fill sizes="(max-width: 768px) 100vw, 35vw" src="/images/about-michal-siakel-portrait.webp" />
            </div>
            <figcaption className="mt-3 text-sm font-medium text-gray-600">Michal Siakel, Director</figcaption>
          </figure>
          <div>
            <h2 className="text-2xl font-semibold text-brand">A personal, collaborative approach</h2>
            <p className="mt-4 max-w-2xl leading-7 text-gray-700">We bring patients, dentists, and technicians together to plan dental work with care and attention to detail.</p>
          </div>
        </section>
      )}
      <section className="mx-auto max-w-content px-5 py-12">
        {isPortfolioPage ? (
          <ManagedGallery category="PORTFOLIO" columns={2} fallbackImages={portfolioImages} label="Before and after smile portfolio" />
        ) : (
          <div className="grid gap-5 md:grid-cols-2">
            {page.sections.map((section) => <InfoCard key={section.title} {...section} description={section.body} />)}
          </div>
        )}
        {isAboutPage && (
          <div className="mt-14">
            <h2 className="mb-6 text-2xl font-semibold text-brand">Inside the laboratory</h2>
            <ManagedGallery category="LAB" fallbackImages={labImages} label="Dental Atelier laboratory photos" />
          </div>
        )}
        {isInfoRequestPage && <div className="mt-12 max-w-2xl"><ContactForm inquiryType="REQUEST_INFO" heading="Request more information" /></div>}
        {slug.startsWith('sexy-') || slug.startsWith('comfort-') || slug.startsWith('looking-') ? (
          <p className="mt-10 text-center text-gray-700">Have questions? <Link className="font-semibold text-brand underline" href="/smile-check-form">Start your smile check</Link>.</p>
        ) : null}
      </section>
    </>
  );
}

export function getStaticPaths() {
  return { paths: Object.keys(pages).map((slug) => ({ params: { slug } })), fallback: false };
}

export async function getStaticProps({ params }) {
  if (!pages[params.slug]) return { notFound: true };

  let page = pages[params.slug];
  try {
    page = await readPageContent(params.slug);
  } catch (error) {
    console.error(`Unable to load editable content for ${params.slug}:`, error);
  }

  return { props: { slug: params.slug, page }, revalidate: 60 };
}
