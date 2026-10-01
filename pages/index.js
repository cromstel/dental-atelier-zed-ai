import { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Button from '../components/Button';
import InfoCard from '../components/InfoCard';
import { pages } from '../lib/site-content';

const highlights = [
  { title: 'Sexy & powerful smile', description: 'Explore the role of smile aesthetics and discover a more confident smile.', href: '/sexy-and-powerful-smile', imageSrc: '/images/hero-sexy-powerful-smile-slide-01.webp', imageAlt: 'A smiling couple sharing a confident smile' },
  { title: 'Comfort & Self-confidence', description: 'Learn about restorative options planned around comfort and your individual needs.', href: '/comfort-and-self-confidence', imageSrc: '/images/hero-comfort-self-confidence-slide-01.webp', imageAlt: 'Portrait of a man' },
  { title: 'Looking young, feeling healthy', description: 'Understand how modern restorations can address changes in teeth over time.', href: '/looking-young-feeling-healthy', imageSrc: '/images/hero-looking-young-feeling-healthy-slide-01.webp', imageAlt: 'Close-up of a person’s smile' },
  { title: 'Facial analysis and Digital Smile Design', description: 'Visualize a planned smile and collaborate on your treatment plan.', href: '/facial-analysis-and-digital-smile-design', imageSrc: '/images/hero-smile-check-slide-01.webp', imageAlt: 'A man smiling at his reflection' },
];

const fallbackTestimonials = [
  { content: 'I was very happy to be served in Dental Atelier. The professional attitude and quality of service is great…thank you.', author: 'Karl' },
];

export default function Home() {
  const [testimonials, setTestimonials] = useState(fallbackTestimonials);

  useEffect(() => {
    let active = true;
    fetch('/api/testimonials')
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
        <title>Dental Atelier | A state-of-the-art laboratory</title>
        <meta name="description" content="Patient-centered dental craftsmanship, digital smile design, and restorative solutions in Brussels." />
        <meta property="og:title" content="Dental Atelier | A state-of-the-art laboratory" />
        <meta property="og:description" content="Patient-centered dental craftsmanship and restorative solutions in Brussels." />
      </Head>
      <section className="bg-brand text-white">
        <div className="mx-auto grid max-w-content gap-10 px-5 py-20 sm:py-28 lg:grid-cols-[1.3fr_0.7fr] lg:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-200">A state-of-the-art laboratory</p>
            <h1 className="mt-5 max-w-3xl text-4xl font-semibold leading-tight sm:text-6xl">Designed around your smile.</h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-blue-100">An ideal smile is linked to certain biometrical features. Discover a thoughtful, collaborative approach to dental craftsmanship.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button href="/smile-check-form">Start your smile check</Button>
              <Button href="/services" variant="secondary">Explore our services</Button>
            </div>
          </div>
          <div className="rounded-2xl border border-white/20 bg-white/10 p-8 backdrop-blur-sm">
            <p className="text-sm font-semibold uppercase tracking-wider text-blue-200">Dental Atelier</p>
            <p className="mt-4 text-2xl font-medium leading-9">Patient, dentist, and technician working together for a natural result.</p>
            <Link className="mt-6 inline-block text-sm font-semibold text-white underline underline-offset-4" href="/about-us">Get to know us</Link>
          </div>
        </div>
      </section>
      <section className="mx-auto max-w-content px-5 py-16 sm:py-20">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-coral">A smile that feels like you</p>
          <h2 className="mt-3 text-3xl font-semibold text-brand">Explore what is possible</h2>
          <p className="mt-4 leading-7 text-gray-700">Learn about our patient-centered approach, services, and digital planning tools.</p>
        </div>
        <div className="mt-8 grid gap-5 sm:grid-cols-2">
          {highlights.map((item) => <InfoCard key={item.href} {...item} />)}
        </div>
      </section>
      <section className="bg-white py-16 sm:py-20">
        <div className={`mx-auto grid max-w-content gap-8 px-5 md:items-center ${testimonials.length ? 'md:grid-cols-[0.7fr_1.3fr]' : ''}`}>
          <div>
            <h2 className="text-3xl font-semibold text-brand">A collaborative approach</h2>
            <p className="mt-4 leading-7 text-gray-700">From consultation and case planning to custom shading and delivery, we work closely with your dental team.</p>
            <Button className="mt-6" href="/services">View our services</Button>
          </div>
          {testimonials.length > 0 && (
            <div aria-label="Patient testimonials" className="space-y-4">
              {testimonials.slice(0, 3).map((testimonial, index) => (
                <blockquote className="rounded-xl bg-canvas p-8 sm:p-10" key={testimonial.id ?? `${testimonial.author}-${index}`}>
                  <p className="text-xl leading-8 text-gray-800">“{testimonial.content}”</p>
                  <footer className="mt-5 text-sm font-semibold text-brand">— {testimonial.author}</footer>
                </blockquote>
              ))}
            </div>
          )}
        </div>
      </section>
      <section className="mx-auto max-w-content px-5 py-16 text-center sm:py-20">
        <h2 className="text-3xl font-semibold text-brand">Ready to talk about your smile?</h2>
        <p className="mx-auto mt-4 max-w-xl leading-7 text-gray-700">Tell us what you are looking for. We’ll help you understand the next steps.</p>
        <div className="mt-7 flex justify-center gap-3">
          <Button href="/contact-us">Contact Dental Atelier</Button>
          <Button href="/portfolio" variant="secondary">See our portfolio</Button>
        </div>
      </section>
    </>
  );
}
