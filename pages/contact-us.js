import Head from 'next/head';
import ContactForm from '../components/ContactForm';
import { useSiteSettings } from '../components/SiteSettingsContext';

export default function ContactUs() {
  const { settings } = useSiteSettings();
  const mapHref = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(settings.contactAddress)}`;

  return (
    <>
      <Head>
        <title>Contact Us | Dental Atelier</title>
        <meta name="description" content="Contact Dental Atelier in Uccle, Brussels, to discuss a case or ask a question." />
      </Head>
      <div className="mx-auto max-w-content px-5 py-14 sm:py-20">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-coral">We’re here to help</p>
          <h1 className="mt-3 text-4xl font-semibold text-brand sm:text-5xl">Contact us</h1>
          <p className="mt-5 text-lg leading-8 text-gray-700">Get in touch to discuss your case, request information, or arrange a consultation.</p>
        </div>
        <div className="mt-10 grid gap-8 lg:grid-cols-[0.7fr_1.3fr]">
          <aside className="rounded-xl bg-white p-6 shadow-sm sm:p-8">
            <h2 className="text-xl font-semibold text-brand">Visit Dental Atelier</h2>
            <address className="mt-4 whitespace-pre-line not-italic leading-7 text-gray-700">{settings.contactAddress}</address>
            <div className="mt-4 flex flex-col items-start gap-2 text-sm">
              {settings.contactEmail && <a className="font-medium text-brand underline" href={`mailto:${settings.contactEmail}`}>{settings.contactEmail}</a>}
              {settings.contactPhone && <a className="font-medium text-brand underline" href={`tel:${settings.contactPhone}`}>{settings.contactPhone}</a>}
            </div>
            <h3 className="mt-7 font-semibold text-brand">Getting here</h3>
            <ul className="mt-3 space-y-2 text-sm leading-6 text-gray-700">
              <li>By car: plan your route to Uccle, Brussels.</li>
              <li>By public transport: check local routes before traveling.</li>
            </ul>
            <a className="mt-5 inline-block text-sm font-semibold text-brand underline" href={mapHref} target="_blank" rel="noreferrer">Open directions in Google Maps</a>
          </aside>
          <ContactForm inquiryType="CONTACT" />
        </div>
      </div>
    </>
  );
}
