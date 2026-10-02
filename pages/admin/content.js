import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../lib/auth';
import { readAllPageContent } from '../../lib/page-content';

export default function AdminPageContent({ initialPages }) {
  const [contentPages, setContentPages] = useState(initialPages);
  const [selectedSlug, setSelectedSlug] = useState(initialPages[0]?.slug || '');
  const [status, setStatus] = useState({ kind: 'idle', message: '' });
  const selectedPage = contentPages.find((page) => page.slug === selectedSlug);
  const isHomePage = selectedSlug === 'home';

  function updatePage(field, value) {
    setContentPages((current) => current.map((page) => (
      page.slug === selectedSlug ? { ...page, [field]: value } : page
    )));
  }

  function updateSection(index, field, value) {
    setContentPages((current) => current.map((page) => {
      if (page.slug !== selectedSlug) return page;
      return {
        ...page,
        sections: page.sections.map((section, sectionIndex) => (
          sectionIndex === index ? { ...section, [field]: value } : section
        )),
      };
    }));
  }

  async function savePage(event) {
    event.preventDefault();
    if (!selectedPage) return;
    setStatus({ kind: 'pending', message: 'Saving page content…' });

    try {
      const response = await fetch('/api/admin/page-content', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(selectedPage),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result?.error || 'Unable to save page content.');

      setContentPages((current) => current.map((page) => (
        page.slug === result.slug ? { ...page, ...result.page } : page
      )));
      setStatus({
        kind: 'success',
        message: result.revalidated
          ? 'Page content saved and published.'
          : 'Page content saved. The live page will refresh through its next revalidation.',
      });
    } catch (error) {
      setStatus({ kind: 'error', message: error.message || 'Unable to save page content.' });
    }
  }

  const fieldClass = 'mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2.5';

  return (
    <>
      <Head>
        <title>Page Content | Dental Atelier</title>
        <meta name="robots" content="noindex,nofollow" />
      </Head>
      <div className="mx-auto max-w-content px-5 py-12 sm:py-16">
        <Link className="text-sm font-semibold text-brand underline" href="/admin">← Back to dashboard</Link>
        <header className="mt-5">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-coral">Administration</p>
          <h1 className="mt-2 text-4xl font-semibold text-brand">Page content</h1>
          <p className="mt-3 max-w-2xl leading-7 text-gray-700">Edit page headings, descriptions, introductions, and existing section copy. Page structure and section links remain controlled by the application.</p>
        </header>

        <form className="mt-8 max-w-3xl space-y-5 rounded-xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8" onSubmit={savePage}>
          <label className="block text-sm font-medium" htmlFor="content-page">
            Page
            <select className={fieldClass} id="content-page" value={selectedSlug} onChange={(event) => { setSelectedSlug(event.target.value); setStatus({ kind: 'idle', message: '' }); }}>
              {contentPages.map((page) => <option key={page.slug} value={page.slug}>{page.slug === 'home' ? 'Home (/)' : `${page.title} (/${page.slug})`}</option>)}
            </select>
          </label>
          {selectedPage && (
            <>
              <label className="block text-sm font-medium" htmlFor="page-title">
                Page title
                <input className={fieldClass} id="page-title" maxLength={160} required value={selectedPage.title} onChange={(event) => updatePage('title', event.target.value)} />
              </label>
              <label className="block text-sm font-medium" htmlFor="page-description">
                Search description
                <textarea className={fieldClass} id="page-description" maxLength={320} required rows={2} value={selectedPage.description} onChange={(event) => updatePage('description', event.target.value)} />
              </label>
              <label className="block text-sm font-medium" htmlFor="page-intro">
                Introduction
                <textarea className={fieldClass} id="page-intro" maxLength={2000} required rows={4} value={selectedPage.intro} onChange={(event) => updatePage('intro', event.target.value)} />
              </label>
              {selectedPage.sections.map((section, index) => (
                <fieldset className="space-y-4 rounded-lg border border-gray-200 p-4" key={`${selectedSlug}-${index}`}>
                  <legend className="px-2 text-sm font-semibold text-brand">{isHomePage ? section.title : `Section ${index + 1}`}</legend>
                  {!isHomePage && (
                    <label className="block text-sm font-medium" htmlFor={`section-title-${index}`}>
                      Heading
                      <input className={fieldClass} id={`section-title-${index}`} maxLength={160} required value={section.title} onChange={(event) => updateSection(index, 'title', event.target.value)} />
                    </label>
                  )}
                  <label className="block text-sm font-medium" htmlFor={`section-body-${index}`}>
                    {isHomePage ? section.title : 'Copy'}
                    <textarea className={fieldClass} id={`section-body-${index}`} maxLength={4000} required rows={isHomePage ? 2 : 4} value={section.body} onChange={(event) => updateSection(index, 'body', event.target.value)} />
                  </label>
                </fieldset>
              ))}
              <button className="rounded-md bg-brand px-5 py-3 text-sm font-semibold text-white hover:bg-blue-900 disabled:opacity-60" disabled={status.kind === 'pending'} type="submit">
                {status.kind === 'pending' ? 'Saving…' : 'Save and publish'}
              </button>
            </>
          )}
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

  return { props: { initialPages: await readAllPageContent() } };
}
