import Head from "next/head";
import AppointmentForm from "../components/AppointmentForm";
import PageHero from "../components/PageHero";

export default function RequestAppointment() {
  return (
    <>
      <Head>
        <title>Request an Appointment | Dental Atelier</title>
        <meta
          name="description"
          content="Request an appointment with Dental Atelier in Uccle, Brussels."
        />
      </Head>
      <>
        <PageHero
          eyebrow="Let’s find a time"
          title="Request an appointment"
          description="Share a preferred date and a way to reach you. We’ll contact you to confirm availability."
          imageSrc="/images/about-dental-lab-photo-06.webp"
          imageAlt="A workspace inside the Dental Atelier laboratory"
        />
        <div className="mx-auto max-w-3xl px-5 py-14 sm:py-20">
          <AppointmentForm />
        </div>
      </>
    </>
  );
}
