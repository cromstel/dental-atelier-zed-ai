import Head from "next/head";
import ContactForm from "../components/ContactForm";
import PageHero from "../components/PageHero";
import { useSiteSettings } from "../components/SiteSettingsContext";

export default function ContactUs() {
  const { settings } = useSiteSettings();
  const mapHref = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(settings.contactAddress)}`;

  return (
    <>
      <Head>
        <title>Contact Us | Dental Atelier</title>
        <meta
          name="description"
          content="Contact Dental Atelier in Uccle, Brussels, to discuss a case or ask a question."
        />
      </Head>
      <PageHero
        eyebrow="We’re here to help"
        title="Contact us"
        description="Get in touch to discuss your case, request information, or arrange a consultation."
        imageSrc="/images/about-dental-lab-photo-05.webp"
        imageAlt="Inside the Dental Atelier laboratory"
      />
      <div className="mx-auto max-w-content px-5 py-14 sm:py-20">
        <div className="grid gap-8 lg:grid-cols-[0.7fr_1.3fr]">
          <aside className="rounded-xl bg-white p-6 shadow-sm sm:p-8">
            <h2 className="text-xl font-semibold text-brand">
              Visit Dental Atelier
            </h2>
            <address className="mt-4 whitespace-pre-line not-italic leading-7 text-gray-700">
              {settings.contactAddress}
            </address>
            <div className="mt-4 flex flex-col items-start gap-2 text-sm">
              {settings.contactEmail && (
                <a
                  className="font-medium text-brand underline"
                  href={`mailto:${settings.contactEmail}`}
                >
                  {settings.contactEmail}
                </a>
              )}
              {settings.contactPhone && (
                <a
                  className="font-medium text-brand underline"
                  href={`tel:${settings.contactPhone}`}
                >
                  {settings.contactPhone}
                </a>
              )}
            </div>
            <h3 className="mt-7 font-semibold text-brand">Getting here</h3>
            <ul className="mt-3 space-y-2 text-sm leading-6 text-gray-700">
              <li>By car: plan your route to Uccle, Brussels.</li>
              <li>By public transport: check local routes before traveling.</li>
            </ul>
            <a
              className="mt-5 inline-block text-sm font-semibold text-brand underline"
              href={mapHref}
              target="_blank"
              rel="noreferrer"
            >
              Open directions in Google Maps
            </a>
          </aside>
          <ContactForm inquiryType="CONTACT" />
        </div>
      </div>
    </>
  );
}
