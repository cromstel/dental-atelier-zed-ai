import Head from 'next/head';
import Link from 'next/link';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../lib/auth';
import { prisma } from '../../lib/prisma';

function formatDate(date) {
  return new Intl.DateTimeFormat('en-BE', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Europe/Brussels',
  }).format(new Date(date));
}

export default function AdminInquiries({ messages }) {
  return (
    <>
      <Head>
        <title>Contact Inquiries | Dental Atelier</title>
        <meta name="robots" content="noindex,nofollow" />
      </Head>
      <div className="mx-auto max-w-content px-5 py-12 sm:py-16">
        <Link className="text-sm font-semibold text-brand underline" href="/admin">← Back to dashboard</Link>
        <header className="mt-5">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-coral">Administration</p>
          <h1 className="mt-2 text-4xl font-semibold text-brand">Contact inquiries</h1>
          <p className="mt-3 max-w-2xl leading-7 text-gray-700">Messages submitted through the public contact and information forms.</p>
        </header>

        <section className="mt-8" aria-labelledby="inquiries-heading">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-xl font-semibold text-brand" id="inquiries-heading">Recent messages</h2>
            <span className="rounded-full bg-blue-50 px-3 py-1 text-sm font-semibold text-brand">{messages.length} shown</span>
          </div>
          {messages.length === 0 ? (
            <p className="rounded-xl border border-dashed border-gray-300 bg-white p-6 text-gray-600">No contact inquiries yet.</p>
          ) : (
            <ul className="space-y-4">
              {messages.map((message) => (
                <li className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6" key={message.id}>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-semibold text-brand">{message.firstName} {message.lastName}</h3>
                      <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-gray-500">{message.inquiryType.replace(/_/g, ' ')}</p>
                    </div>
                    <time className="text-sm text-gray-600" dateTime={new Date(message.createdAt).toISOString()}>{formatDate(message.createdAt)}</time>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm">
                    <a className="font-medium text-brand underline" href={`mailto:${message.email}`}>{message.email}</a>
                    {message.phone && <a className="font-medium text-brand underline" href={`tel:${message.phone}`}>{message.phone}</a>}
                  </div>
                  <p className="mt-4 whitespace-pre-wrap break-words leading-7 text-gray-800">{message.message}</p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </>
  );
}

export async function getServerSideProps(context) {
  const session = await getServerSession(context.req, context.res, authOptions);
  if (session?.user?.role !== 'ADMIN') {
    return { redirect: { destination: '/admin/login', permanent: false } };
  }

  const messages = await prisma.contactMessage.findMany({
    orderBy: { createdAt: 'desc' },
    take: 100,
  });
  return { props: { messages: JSON.parse(JSON.stringify(messages)) } };
}
