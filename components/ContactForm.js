import { useState } from 'react';

const initialState = { firstName: '', lastName: '', email: '', phone: '', message: '' };

export default function ContactForm({ inquiryType = 'GENERAL', heading = 'Send us a message' }) {
  const [form, setForm] = useState(initialState);
  const [status, setStatus] = useState({ kind: 'idle', message: '' });

  function updateField(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  async function submitForm(event) {
    event.preventDefault();
    setStatus({ kind: 'sending', message: 'Sending your message…' });

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, inquiryType }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Unable to send your message.');

      setForm(initialState);
      setStatus({ kind: 'success', message: 'Thank you. Your message has been sent.' });
    } catch (error) {
      setStatus({ kind: 'error', message: error.message || 'Unable to send your message.' });
    }
  }

  const inputClass = 'mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2.5 text-ink placeholder:text-gray-400';

  return (
    <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8" aria-labelledby="contact-form-heading">
      <h2 id="contact-form-heading" className="text-2xl font-semibold text-brand">{heading}</h2>
      <form className="mt-6 space-y-4" onSubmit={submitForm}>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="text-sm font-medium" htmlFor="firstName">
            First name
            <input className={inputClass} id="firstName" name="firstName" autoComplete="given-name" required maxLength={100} value={form.firstName} onChange={updateField} />
          </label>
          <label className="text-sm font-medium" htmlFor="lastName">
            Last name
            <input className={inputClass} id="lastName" name="lastName" autoComplete="family-name" required maxLength={100} value={form.lastName} onChange={updateField} />
          </label>
        </div>
        <label className="block text-sm font-medium" htmlFor="email">
          Email
          <input className={inputClass} id="email" name="email" type="email" autoComplete="email" required maxLength={254} value={form.email} onChange={updateField} />
        </label>
        <label className="block text-sm font-medium" htmlFor="phone">
          Phone <span className="font-normal text-gray-500">(optional)</span>
          <input className={inputClass} id="phone" name="phone" type="tel" autoComplete="tel" maxLength={40} value={form.phone} onChange={updateField} />
        </label>
        <label className="block text-sm font-medium" htmlFor="message">
          How can we help?
          <textarea className={inputClass} id="message" name="message" rows={5} required maxLength={5000} value={form.message} onChange={updateField} />
        </label>
        <button className="rounded-md bg-brand px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-900 disabled:cursor-wait disabled:opacity-60" type="submit" disabled={status.kind === 'sending'}>
          {status.kind === 'sending' ? 'Sending…' : 'Send message'}
        </button>
        <p aria-live="polite" className={`text-sm ${status.kind === 'error' ? 'text-red-700' : status.kind === 'success' ? 'text-green-700' : 'text-gray-600'}`}>
          {status.message}
        </p>
        <p className="text-xs leading-5 text-gray-500">Please do not include sensitive medical information in this form.</p>
      </form>
    </section>
  );
}
