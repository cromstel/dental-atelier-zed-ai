import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../lib/auth';
import { prisma } from '../../lib/prisma';

const emptyDraft = { question: '', answer: '' };

export default function AdminFAQs({ initialFaqs }) {
  const [faqs, setFaqs] = useState(initialFaqs);
  const [draft, setDraft] = useState(emptyDraft);
  const [editingId, setEditingId] = useState(null);
  const [status, setStatus] = useState({ kind: 'idle', message: '' });

  function resetEditor() {
    setDraft(emptyDraft);
    setEditingId(null);
  }

  function editFaq(faq) {
    setDraft({ question: faq.question, answer: faq.answer });
    setEditingId(faq.id);
    setStatus({ kind: 'idle', message: '' });
  }

  async function saveFaq(event) {
    event.preventDefault();
    setStatus({ kind: 'pending', message: 'Saving FAQ…' });

    try {
      const response = await fetch('/api/admin/faqs', {
        method: editingId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingId ? { ...draft, id: editingId } : draft),
      });
      const result = response.status === 204 ? null : await response.json();
      if (!response.ok) throw new Error(result?.error || 'Unable to save the FAQ.');

      setFaqs((current) => {
        if (!editingId) return [...current, result].sort((left, right) => left.id - right.id);
        return current.map((faq) => (faq.id === editingId ? result : faq));
      });
      resetEditor();
      setStatus({ kind: 'success', message: 'FAQ saved.' });
    } catch (error) {
      setStatus({ kind: 'error', message: error.message || 'Unable to save the FAQ.' });
    }
  }

  async function deleteFaq(id) {
    if (!window.confirm('Delete this FAQ? This cannot be undone.')) return;
    setStatus({ kind: 'pending', message: 'Deleting FAQ…' });

    try {
      const response = await fetch(`/api/admin/faqs?id=${id}`, { method: 'DELETE' });
      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || 'Unable to delete the FAQ.');
      }
      setFaqs((current) => current.filter((faq) => faq.id !== id));
      if (editingId === id) resetEditor();
      setStatus({ kind: 'success', message: 'FAQ deleted.' });
    } catch (error) {
      setStatus({ kind: 'error', message: error.message || 'Unable to delete the FAQ.' });
    }
  }

  const fieldClass = 'mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2.5';

  return (
    <>
      <Head>
        <title>Manage FAQs | Dental Atelier</title>
        <meta name="robots" content="noindex,nofollow" />
      </Head>
      <div className="mx-auto max-w-content px-5 py-12 sm:py-16">
        <Link className="text-sm font-semibold text-brand underline" href="/admin">← Back to dashboard</Link>
        <header className="mt-5">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-coral">Content management</p>
          <h1 className="mt-2 text-4xl font-semibold text-brand">Frequently Asked Questions</h1>
          <p className="mt-3 max-w-2xl leading-7 text-gray-700">Changes are saved to the database and shown on the public FAQs page.</p>
        </header>

        <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
          <form className="h-fit space-y-4 rounded-xl border border-gray-200 bg-white p-6 shadow-sm" onSubmit={saveFaq}>
            <h2 className="text-xl font-semibold text-brand">{editingId ? 'Edit FAQ' : 'Add an FAQ'}</h2>
            <label className="block text-sm font-medium" htmlFor="faq-question">
              Question
              <input className={fieldClass} id="faq-question" maxLength={500} required value={draft.question} onChange={(event) => setDraft((current) => ({ ...current, question: event.target.value }))} />
            </label>
            <label className="block text-sm font-medium" htmlFor="faq-answer">
              Answer
              <textarea className={fieldClass} id="faq-answer" maxLength={10000} required rows={7} value={draft.answer} onChange={(event) => setDraft((current) => ({ ...current, answer: event.target.value }))} />
            </label>
            <div className="flex flex-wrap gap-3">
              <button className="rounded-md bg-brand px-5 py-3 text-sm font-semibold text-white hover:bg-blue-900 disabled:opacity-60" disabled={status.kind === 'pending'} type="submit">{status.kind === 'pending' ? 'Saving…' : editingId ? 'Save changes' : 'Add FAQ'}</button>
              {editingId && <button className="rounded-md border border-gray-300 px-5 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50" onClick={resetEditor} type="button">Cancel</button>}
            </div>
            <p aria-live="polite" className={`text-sm ${status.kind === 'error' ? 'text-red-700' : status.kind === 'success' ? 'text-green-700' : 'text-gray-600'}`}>{status.message}</p>
          </form>

          <section aria-labelledby="faq-list-heading">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="text-xl font-semibold text-brand" id="faq-list-heading">Saved FAQs</h2>
              <span className="rounded-full bg-blue-50 px-3 py-1 text-sm font-semibold text-brand">{faqs.length}</span>
            </div>
            {faqs.length === 0 ? (
              <p className="rounded-xl border border-dashed border-gray-300 bg-white p-6 text-gray-600">No FAQs yet. Add the first one using the form.</p>
            ) : (
              <ul className="space-y-3">
                {faqs.map((faq) => (
                  <li className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm" key={faq.id}>
                    <h3 className="font-semibold text-gray-900">{faq.question}</h3>
                    <p className="mt-2 whitespace-pre-line text-sm leading-6 text-gray-700">{faq.answer}</p>
                    <div className="mt-4 flex gap-4 text-sm font-semibold">
                      <button className="text-brand underline" onClick={() => editFaq(faq)} type="button">Edit</button>
                      <button className="text-red-700 underline" onClick={() => deleteFaq(faq.id)} type="button">Delete</button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>
    </>
  );
}

export async function getServerSideProps(context) {
  const session = await getServerSession(context.req, context.res, authOptions);
  if (session?.user?.role !== 'ADMIN') {
    return { redirect: { destination: '/admin/login', permanent: false } };
  }

  const faqs = await prisma.faq.findMany({ orderBy: { id: 'asc' }, take: 500 });
  return { props: { initialFaqs: faqs } };
}
