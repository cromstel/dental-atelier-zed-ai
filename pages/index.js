import { useEffect, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import Button from "../components/Button";
import InfoCard from "../components/InfoCard";
import PageHero from "../components/PageHero";
import { homePageContent } from "../lib/site-content";
import { readPageContent } from "../lib/page-content";

const highlights = [
  {
    titleIndex: 7,
    descriptionIndex: 8,
    href: "/sexy-and-powerful-smile",
    imageSrc: "/images/hero-sexy-powerful-smile-slide-01.webp",
    imageAlt: "A smiling couple sharing a confident smile",
  },
  {
    titleIndex: 9,
    descriptionIndex: 10,
    href: "/comfort-and-self-confidence",
    imageSrc: "/images/hero-comfort-self-confidence-slide-01.webp",
    imageAlt: "Portrait of a man",
  },
  {
    titleIndex: 11,
    descriptionIndex: 12,
    href: "/looking-young-feeling-healthy",
    imageSrc: "/images/hero-looking-young-feeling-healthy-slide-01.webp",
    imageAlt: "Close-up of a person’s smile",
  },
  {
    titleIndex: 13,
    descriptionIndex: 14,
    href: "/facial-analysis-and-digital-smile-design",
    imageSrc: "/images/hero-smile-check-slide-01.webp",
    imageAlt: "A man smiling at his reflection",
  },
];

const fallbackTestimonials = [
  {
    content:
      "I was very happy to be served in Dental Atelier. The professional attitude and quality of service is great…thank you.",
    author: "Karl",
  },
];

export default function Home({ pageContent }) {
  const [testimonials, setTestimonials] = useState(fallbackTestimonials);
  const copy = pageContent.sections.map((section) => section.body);

  useEffect(() => {
    let active = true;
    fetch("/api/testimonials")
      .then((response) => (response.ok ? response.json() : null))
      .then((items) => {
        if (active && Array.isArray(items)) setTestimonials(items);
      })
      .catch(() => {});

    return () => {
      active = false;
    };
  }, []);

  return (
    <>
      <Head>
        <title>{pageContent.title}</title>
        <meta name="description" content={pageContent.description} />
        <meta property="og:title" content={pageContent.title} />
        <meta property="og:description" content={pageContent.description} />
      </Head>
      <PageHero
        eyebrow={copy[0]}
        title={copy[1]}
        description={pageContent.intro}
        imageSrc={pageContent.heroImage}
        imageAlt={pageContent.heroAlt}
        imageCaption={{ eyebrow: copy[2], text: copy[3] }}
      >
        <Button href="/smile-check-form">Start your smile check</Button>
        <Button href="/services" variant="secondary">
          Explore our services
        </Button>
      </PageHero>
      <section className="mx-auto max-w-content px-5 py-16 sm:py-20">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-coral">
            {copy[4]}
          </p>
          <h2 className="mt-3 text-3xl font-semibold text-brand">{copy[5]}</h2>
          <p className="mt-4 leading-7 text-gray-700">{copy[6]}</p>
        </div>
        <div className="mt-8 grid gap-5 sm:grid-cols-2">
          {highlights.map((item) => (
            <InfoCard
              key={item.href}
              {...item}
              title={copy[item.titleIndex]}
              description={copy[item.descriptionIndex]}
            />
          ))}
        </div>
      </section>
      <section className="bg-white py-16 sm:py-20">
        <div
          className={`mx-auto grid max-w-content gap-8 px-5 md:items-center ${testimonials.length ? "md:grid-cols-[0.7fr_1.3fr]" : ""}`}
        >
          <div>
            <h2 className="text-3xl font-semibold text-brand">{copy[15]}</h2>
            <p className="mt-4 leading-7 text-gray-700">{copy[16]}</p>
            <Button className="mt-6" href="/services">
              View our services
            </Button>
          </div>
          {testimonials.length > 0 && (
            <div aria-label="Patient testimonials" className="space-y-4">
              {testimonials.slice(0, 3).map((testimonial, index) => (
                <blockquote
                  className="rounded-xl bg-canvas p-8 sm:p-10"
                  key={testimonial.id ?? `${testimonial.author}-${index}`}
                >
                  <p className="text-xl leading-8 text-gray-800">
                    “{testimonial.content}”
                  </p>
                  <footer className="mt-5 text-sm font-semibold text-brand">
                    — {testimonial.author}
                  </footer>
                </blockquote>
              ))}
            </div>
          )}
        </div>
      </section>
      <section className="mx-auto max-w-content px-5 py-16 text-center sm:py-20">
        <h2 className="text-3xl font-semibold text-brand">{copy[17]}</h2>
        <p className="mx-auto mt-4 max-w-xl leading-7 text-gray-700">
          {copy[18]}
        </p>
        <div className="mt-7 flex justify-center gap-3">
          <Button href="/contact-us">Contact Dental Atelier</Button>
          <Button href="/portfolio" variant="secondary">
            See our portfolio
          </Button>
        </div>
      </section>
    </>
  );
}

export async function getStaticProps({ revalidateReason }) {
  let pageContent = homePageContent;

  if (revalidateReason !== "build") {
    try {
      pageContent = await readPageContent("home");
    } catch (error) {
      console.error("Unable to load editable homepage content:", error);
    }
  }

  return { props: { pageContent }, revalidate: 60 };
}
