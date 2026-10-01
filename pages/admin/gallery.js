import { useState } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../lib/auth';
import { prisma } from '../../lib/prisma';
import { galleryAssets } from '../../lib/gallery-assets';

const emptyDraft = { url: '', title: '', altText: '', category: 'PORTFOLIO' };

export default function AdminGallery({ initialImages }) {
  const [images, setImages] = useState(initialImages);
  const [draft, setDraft] = useState(emptyDraft);
  const [editingId, setEditingId] = useState(null);
  const [status, setStatus] = useState({ kind: 'idle', message: '' });

  function resetEditor() {
    setDraft(emptyDraft);
    setEditingId(null);
  }

  function editImage(image) {
    setDraft({ url: image.url, title: image.title || '', altText: image.altText || '', category: image.category || 'PORTFOLIO' });
    setEditingId(image.id);
    setStatus({ kind: 'idle', message: '' });
  }

  function selectAsset(url) {
    const asset = galleryAssets.find((item) => item.url === url);
    if (!asset) return;
    setDraft((current) => ({ ...current, ...asset }));
  }

  async function saveImage(event) {
    event.preventDefault();
    setStatus({ kind: 'pending', message: 'Saving gallery image…' });

    try {
      const response = await fetch('/api/admin/gallery', {
        method: editingId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingId ? { ...draft, id: editingId } : draft),
      });
      const result = response.status === 204 ? null : await response.json();
      if (!response.ok) throw new Error(result?.error || 'Unable to save the gallery image.');

      setImages((current) => {
        if (!editingId) return [result, ...current];
        return current.map((image) => (image.id === editingId ? result : image));
      });
      resetEditor();
      setStatus({ kind: 'success', message: 'Gallery image saved.' });
    } catch (error) {
      setStatus({ kind: 'error', message: error.message || 'Unable to save the gallery image.' });
    }
  }

  async function deleteImage(id) {
    if (!window.confirm('Remove this image from the gallery? The WebP file itself will remain in the site assets.')) return;
    setStatus({ kind: 'pending', message: 'Removing gallery image…' });

    try {
      const response = await fetch(`/api/admin/gallery?id=${id}`, { method: 'DELETE' });
      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || 'Unable to remove the gallery image.');
      }
      setImages((current) => current.filter((image) => image.id !== id));
      if (editingId === id) resetEditor();
      setStatus({ kind: 'success', message: 'Image removed from the gallery.' });
    } catch (error) {
      setStatus({ kind: 'error', message: error.message || 'Unable to remove the gallery image.' });
    }
  }

  const fieldClass = 'mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2.5';

  return (
    <>
      <Head>
        <title>Manage Gallery | Dental Atelier</title>
        <meta name="robots" content="noindex,nofollow" />
      </Head>
      <div className="mx-auto max-w-content px-5 py-12 sm:py-16">
        <Link className="text-sm font-semibold text-brand underline" href="/admin">← Back to dashboard</Link>
        <header className="mt-5">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-coral">Content management</p>
          <h1 className="mt-2 text-4xl font-semibold text-brand">Image gallery</h1>
          <p className="mt-3 max-w-2xl leading-7 text-gray-700">Manage curated WebP assets in the portfolio and laboratory galleries. Uploading new files requires a storage provider and is not enabled here.</p>
        </header>

        <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
          <form className="h-fit space-y-4 rounded-xl border border-gray-200 bg-white p-6 shadow-sm" onSubmit={saveImage}>
            <h2 className="text-xl font-semibold text-brand">{editingId ? 'Edit gallery entry' : 'Add an image'}</h2>
            <label className="block text-sm font-medium" htmlFor="gallery-asset">
              Site image
              <select className={fieldClass} id="gallery-asset" required value={draft.url} onChange={(event) => selectAsset(event.target.value)}>
                <option value="" disabled>Select a WebP asset</option>
                {galleryAssets.map((asset) => <option key={asset.url} value={asset.url}>{asset.label}</option>)}
              </select>
            </label>
            {draft.url && (
              <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-gray-100">
                <Image alt={draft.altText} className="object-cover" fill sizes="(max-width: 1024px) 100vw, 40vw" src={draft.url} />
              </div>
            )}
            <label className="block text-sm font-medium" htmlFor="gallery-title">
              Caption
              <input className={fieldClass} id="gallery-title" maxLength={120} required value={draft.title} onChange={(event) => setDraft((current) => ({ ...current, title: event.target.value }))} />
            </label>
            <label className="block text-sm font-medium" htmlFor="gallery-alt">
              Alt text
              <input className={fieldClass} id="gallery-alt" maxLength={250} required value={draft.altText} onChange={(event) => setDraft((current) => ({ ...current, altText: event.target.value }))} />
            </label>
            <label className="block text-sm font-medium" htmlFor="gallery-category">
              Gallery
              <select className={fieldClass} id="gallery-category" value={draft.category} onChange={(event) => setDraft((current) => ({ ...current, category: event.target.value }))}>
                <option value="PORTFOLIO">Portfolio</option>
                <option value="LAB">Laboratory</option>
              </select>
            </label>
            <div className="flex flex-wrap gap-3">
              <button className="rounded-md bg-brand px-5 py-3 text-sm font-semibold text-white hover:bg-blue-900 disabled:opacity-60" disabled={status.kind === 'pending'} type="submit">{status.kind === 'pending' ? 'Saving…' : editingId ? 'Save changes' : 'Add to gallery'}</button>
              {editingId && <button className="rounded-md border border-gray-300 px-5 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50" onClick={resetEditor} type="button">Cancel</button>}
            </div>
            <p aria-live="polite" className={`text-sm ${status.kind === 'error' ? 'text-red-700' : status.kind === 'success' ? 'text-green-700' : 'text-gray-600'}`}>{status.message}</p>
          </form>

          <section aria-labelledby="gallery-list-heading">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="text-xl font-semibold text-brand" id="gallery-list-heading">Current gallery entries</h2>
              <span className="rounded-full bg-blue-50 px-3 py-1 text-sm font-semibold text-brand">{images.length}</span>
            </div>
            {images.length === 0 ? (
              <p className="rounded-xl border border-dashed border-gray-300 bg-white p-6 text-gray-600">No images are in the gallery yet.</p>
            ) : (
              <ul className="grid gap-4 sm:grid-cols-2">
                {images.map((image) => (
                  <li className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm" key={image.id}>
                    <div className="relative aspect-[4/3] bg-gray-100">
                      <Image alt={image.altText || ''} className="object-cover" fill sizes="(max-width: 640px) 100vw, 50vw" src={image.url} />
                    </div>
                    <div className="p-4">
                      <p className="font-semibold text-gray-900">{image.title}</p>
                      <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-gray-500">{image.category}</p>
                      <div className="mt-3 flex gap-4 text-sm font-semibold">
                        <button className="text-brand underline" onClick={() => editImage(image)} type="button">Edit</button>
                        <button className="text-red-700 underline" onClick={() => deleteImage(image.id)} type="button">Remove</button>
                      </div>
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

  const images = await prisma.galleryImage.findMany({ orderBy: { createdAt: 'desc' }, take: 500 });
  return { props: { initialImages: JSON.parse(JSON.stringify(images)) } };
}
