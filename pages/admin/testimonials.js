import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../lib/auth';
import { prisma } from '../../lib/prisma';

const emptyDraft = { author: '', content: '' };

export default function AdminTestimonials({ initialTestimonials }) {
  const [testimonials, setTestimonials] = useState(initialTestimonials);
  const [draft, setDraft] = useState(emptyDraft);
  const [editingId, setEditingId] = useState(null);
  const [status, setStatus] = useState({ kind: 'idle', message: '' });

  function resetEditor() {
    setDraft(emptyDraft);
    setEditingId(null);
  }

  function editTestimonial(testimonial) {
    setDraft({ author: testimonial.author, content: testimonial.content });
    setEditingId(testimonial.id);
    setStatus({ kind: 'idle', message: '' });
  }

  async function saveTestimonial(event) {
    event.preventDefault();
    setStatus({ kind: 'pending', message: 'Saving testimonial…' });

    try {
      const response = await fetch('/api/admin/testimonials', {
        method: editingId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingId ? { ...draft, id: editingId } : draft),
      });
      const result = response.status === 204 ? null : await response.json();
      if (!response.ok) throw new Error(result?.error || 'Unable to save the testimonial.');

      setTestimonials((current) => {
        if (!editingId) return [result, ...current];
        return current.map((testimonial) => (testimonial.id === editingId ? result : testimonial));
      });
      resetEditor();
      setStatus({ kind: 'success', message: 'Testimonial saved.' });
    } catch (error) {
      setStatus({ kind: 'error', message: error.message || 'Unable to save the testimonial.' });
    }
  }

  async function deleteTestimonial(id) {
    if (!window.confirm('Delete this testimonial? This cannot be undone.')) return;
    setStatus({ kind: 'pending', message: 'Deleting testimonial…' });

    try {
      const response = await fetch(`/api/admin/testimonials?id=${id}`, { method: 'DELETE' });
      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || 'Unable to delete the testimonial.');
      }
      setTestimonials((current) => current.filter((testimonial) => testimonial.id !== id));
      if (editingId === id) resetEditor();
      setStatus({ kind: 'success', message: 'Testimonial deleted.' });
    } catch (error) {
      setStatus({ kind: 'error', message: error.message || 'Unable to delete the testimonial.' });
    }
  }

  const fieldClass = 'mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2.5';

  return (
    <>
      <Head>
        <title>Manage Testimonials | Dental Atelier</title>
        <meta name="robots" content="noindex,nofollow" />
      </Head>
      <div className="mx-auto max-w-content px-5 py-12 sm:py-16">
        <Link className="text-sm font-semibold text-brand underline" href="/admin">← Back to dashboard</Link>
        <header className="mt-5">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-coral">Content management</p>
          <h1 className="mt-2 text-4xl font-semibold text-brand">Testimonials</h1>
          <p className="mt-3 max-w-2xl leading-7 text-gray-700">Published testimonials are visible on the homepage. Confirm consent before publishing a quote.</p>
        </header>

        <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
          <form className="h-fit space-y-4 rounded-xl border border-gray-200 bg-white p-6 shadow-sm" onSubmit={saveTestimonial}>
            <h2 className="text-xl font-semibold text-brand">{editingId ? 'Edit testimonial' : 'Add a testimonial'}</h2>
            <label className="block text-sm font-medium" htmlFor="testimonial-author">
              Display name
              <input className={fieldClass} id="testimonial-author" maxLength={100} required value={draft.author} onChange={(event) => setDraft((current) => ({ ...current, author: event.target.value }))} />
            </label>
            <label className="block text-sm font-medium" htmlFor="testimonial-content">
              Quote
              <textarea className={fieldClass} id="testimonial-content" maxLength={10000} required rows={7} value={draft.content} onChange={(event) => setDraft((current) => ({ ...current, content: event.target.value }))} />
            </label>
            <div className="flex flex-wrap gap-3">
              <button className="rounded-md bg-brand px-5 py-3 text-sm font-semibold text-white hover:bg-blue-900 disabled:opacity-60" disabled={status.kind === 'pending'} type="submit">{status.kind === 'pending' ? 'Saving…' : editingId ? 'Save changes' : 'Add testimonial'}</button>
              {editingId && <button className="rounded-md border border-gray-300 px-5 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50" onClick={resetEditor} type="button">Cancel</button>}
            </div>
            <p aria-live="polite" className={`text-sm ${status.kind === 'error' ? 'text-red-700' : status.kind === 'success' ? 'text-green-700' : 'text-gray-600'}`}>{status.message}</p>
          </form>

          <section aria-labelledby="testimonial-list-heading">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="text-xl font-semibold text-brand" id="testimonial-list-heading">Published testimonials</h2>
              <span className="rounded-full bg-blue-50 px-3 py-1 text-sm font-semibold text-brand">{testimonials.length}</span>
            </div>
            {testimonials.length === 0 ? (
              <p className="rounded-xl border border-dashed border-gray-300 bg-white p-6 text-gray-600">No testimonials yet. Add one after confirming the author’s consent.</p>
            ) : (
              <ul className="space-y-3">
                {testimonials.map((testimonial) => (
                  <li className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm" key={testimonial.id}>
                    <p className="leading-7 text-gray-800">“{testimonial.content}”</p>
                    <p className="mt-3 text-sm font-semibold text-brand">— {testimonial.author}</p>
                    <div className="mt-4 flex gap-4 text-sm font-semibold">
                      <button className="text-brand underline" onClick={() => editTestimonial(testimonial)} type="button">Edit</button>
                      <button className="text-red-700 underline" onClick={() => deleteTestimonial(testimonial.id)} type="button">Delete</button>
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

  const testimonials = await prisma.testimonial.findMany({ orderBy: { createdAt: 'desc' }, take: 500 });
  return { props: { initialTestimonials: JSON.parse(JSON.stringify(testimonials)) } };
}
