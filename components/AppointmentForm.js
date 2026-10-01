import { useState } from 'react';

const blankForm = { firstName: '', lastName: '', email: '', phone: '', dateTime: '', notes: '' };

function minimumDateTime() {
  const localNow = new Date(Date.now() - new Date().getTimezoneOffset() * 60_000);
  return localNow.toISOString().slice(0, 16);
}

export default function AppointmentForm() {
  const [form, setForm] = useState(blankForm);
  const [status, setStatus] = useState({ kind: 'idle', message: '' });
  const fieldClass = 'mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2.5';

  function updateField(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  async function submitForm(event) {
    event.preventDefault();
    setStatus({ kind: 'sending', message: 'Sending your request…' });

    try {
      const response = await fetch('/api/appointment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, dateTime: new Date(form.dateTime).toISOString() }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Unable to send your request.');
      setForm(blankForm);
      setStatus({ kind: 'success', message: 'Thank you. We received your appointment request and will be in touch to confirm.' });
    } catch (error) {
      setStatus({ kind: 'error', message: error.message || 'Unable to send your request.' });
    }
  }

  return (
    <form className="space-y-4 rounded-xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8" onSubmit={submitForm}>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="text-sm font-medium" htmlFor="appointment-firstName">First name<input className={fieldClass} id="appointment-firstName" name="firstName" autoComplete="given-name" required maxLength={100} value={form.firstName} onChange={updateField} /></label>
        <label className="text-sm font-medium" htmlFor="appointment-lastName">Last name<input className={fieldClass} id="appointment-lastName" name="lastName" autoComplete="family-name" required maxLength={100} value={form.lastName} onChange={updateField} /></label>
      </div>
      <label className="block text-sm font-medium" htmlFor="appointment-email">Email<input className={fieldClass} id="appointment-email" name="email" type="email" autoComplete="email" required maxLength={254} value={form.email} onChange={updateField} /></label>
      <label className="block text-sm font-medium" htmlFor="appointment-phone">Phone <span className="font-normal text-gray-500">(optional)</span><input className={fieldClass} id="appointment-phone" name="phone" type="tel" autoComplete="tel" maxLength={40} value={form.phone} onChange={updateField} /></label>
      <label className="block text-sm font-medium" htmlFor="appointment-dateTime">Preferred date and time<input className={fieldClass} id="appointment-dateTime" name="dateTime" type="datetime-local" min={minimumDateTime()} required value={form.dateTime} onChange={updateField} /></label>
      <label className="block text-sm font-medium" htmlFor="appointment-notes">Notes <span className="font-normal text-gray-500">(optional)</span><textarea className={fieldClass} id="appointment-notes" name="notes" rows={4} maxLength={5000} value={form.notes} onChange={updateField} /></label>
      <button className="rounded-md bg-brand px-5 py-3 text-sm font-semibold text-white hover:bg-blue-900 disabled:opacity-60" type="submit" disabled={status.kind === 'sending'}>{status.kind === 'sending' ? 'Sending…' : 'Request appointment'}</button>
      <p aria-live="polite" className={`text-sm ${status.kind === 'error' ? 'text-red-700' : status.kind === 'success' ? 'text-green-700' : 'text-gray-600'}`}>{status.message}</p>
      <p className="text-xs leading-5 text-gray-500">This is a request only; your appointment is not confirmed until we contact you. Please do not include sensitive medical information.</p>
    </form>
  );
}
