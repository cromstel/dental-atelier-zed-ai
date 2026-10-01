import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../lib/auth';
import { readSiteSettings } from '../../lib/site-settings-server';
import { useSiteSettings } from '../../components/SiteSettingsContext';

export default function AdminSettings({ initialSettings }) {
  const [settings, setSettings] = useState(initialSettings);
  const [status, setStatus] = useState({ kind: 'idle', message: '' });
  const { setSettings: setPublicSettings } = useSiteSettings();

  async function saveSettings(event) {
    event.preventDefault();
    setStatus({ kind: 'pending', message: 'Saving site settings…' });

    try {
      const response = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result?.error || 'Unable to save site settings.');

      setSettings(result);
      setPublicSettings(result);
      setStatus({ kind: 'success', message: 'Site settings saved.' });
    } catch (error) {
      setStatus({ kind: 'error', message: error.message || 'Unable to save site settings.' });
    }
  }

  const fieldClass = 'mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2.5';

  return (
    <>
      <Head>
        <title>Site Settings | Dental Atelier</title>
        <meta name="robots" content="noindex,nofollow" />
      </Head>
      <div className="mx-auto max-w-content px-5 py-12 sm:py-16">
        <Link className="text-sm font-semibold text-brand underline" href="/admin">← Back to dashboard</Link>
        <header className="mt-5">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-coral">Administration</p>
          <h1 className="mt-2 text-4xl font-semibold text-brand">Site settings</h1>
          <p className="mt-3 max-w-2xl leading-7 text-gray-700">Update the contact details displayed in the public site footer and contact page. Leave email or phone blank to hide it.</p>
        </header>

        <form className="mt-8 max-w-2xl space-y-5 rounded-xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8" onSubmit={saveSettings}>
          <label className="block text-sm font-medium" htmlFor="contact-address">
            Public address
            <textarea className={fieldClass} id="contact-address" maxLength={300} required rows={3} value={settings.contactAddress} onChange={(event) => setSettings((current) => ({ ...current, contactAddress: event.target.value }))} />
          </label>
          <label className="block text-sm font-medium" htmlFor="contact-email">
            Public contact email <span className="font-normal text-gray-500">(optional)</span>
            <input className={fieldClass} id="contact-email" maxLength={254} type="email" value={settings.contactEmail} onChange={(event) => setSettings((current) => ({ ...current, contactEmail: event.target.value }))} />
          </label>
          <label className="block text-sm font-medium" htmlFor="contact-phone">
            Public phone number <span className="font-normal text-gray-500">(optional)</span>
            <input className={fieldClass} id="contact-phone" maxLength={40} type="tel" value={settings.contactPhone} onChange={(event) => setSettings((current) => ({ ...current, contactPhone: event.target.value }))} />
          </label>
          <button className="rounded-md bg-brand px-5 py-3 text-sm font-semibold text-white hover:bg-blue-900 disabled:opacity-60" disabled={status.kind === 'pending'} type="submit">
            {status.kind === 'pending' ? 'Saving…' : 'Save settings'}
          </button>
          <p aria-live="polite" className={`text-sm ${status.kind === 'error' ? 'text-red-700' : status.kind === 'success' ? 'text-green-700' : 'text-gray-600'}`}>{status.message}</p>
        </form>
      </div>
    </>
  );
}

export async function getServerSideProps(context) {
  const session = await getServerSession(context.req, context.res, authOptions);
  if (session?.user?.role !== 'ADMIN') {
    return { redirect: { destination: '/admin/login', permanent: false } };
  }

  return { props: { initialSettings: await readSiteSettings() } };
}
