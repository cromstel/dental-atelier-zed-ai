import Head from 'next/head';
import AppointmentForm from '../components/AppointmentForm';

export default function RequestAppointment() {
  return (
    <>
      <Head>
        <title>Request an Appointment | Dental Atelier</title>
        <meta name="description" content="Request an appointment with Dental Atelier in Uccle, Brussels." />
      </Head>
      <div className="mx-auto max-w-3xl px-5 py-14 sm:py-20">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-coral">Let’s find a time</p>
        <h1 className="mt-3 text-4xl font-semibold text-brand sm:text-5xl">Request an appointment</h1>
        <p className="mt-5 mb-8 text-lg leading-8 text-gray-700">Share a preferred date and a way to reach you. We’ll contact you to confirm availability.</p>
        <AppointmentForm />
      </div>
    </>
  );
}
