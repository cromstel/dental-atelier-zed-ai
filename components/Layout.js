import Head from 'next/head';
import Link from 'next/link';
import { navigation } from '../lib/site-content';
import { SiteSettingsProvider, useSiteSettings } from './SiteSettingsContext';

function Header() {
  return (
    <header className="border-b border-gray-200 bg-white">
      <a className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:bg-white focus:p-3" href="#main-content">
        Skip to content
      </a>
      <div className="mx-auto flex max-w-content flex-col gap-4 px-5 py-5 md:flex-row md:items-center md:justify-between">
        <Link className="text-xl font-bold tracking-tight text-brand" href="/" aria-label="Dental Atelier home">
          Dental Atelier
          <span className="mt-1 block text-xs font-normal uppercase tracking-[0.2em] text-gray-500">A state-of-the-art laboratory</span>
        </Link>
        <nav aria-label="Main navigation" className="flex flex-wrap gap-x-5 gap-y-2 text-sm font-medium text-gray-700">
          {navigation.map((item) => (
            <Link className="transition hover:text-brand" href={item.href} key={item.href}>
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}

function Footer() {
  const { settings } = useSiteSettings();

  return (
    <footer className="mt-20 bg-brand text-white">
      <div className="mx-auto flex max-w-content flex-col gap-8 px-5 py-12 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-lg font-semibold">Dental Atelier</p>
          <p className="mt-2 max-w-md text-sm leading-6 text-blue-100">
            Patient-centered dental craftsmanship in Uccle, Brussels.
          </p>
          {settings.contactAddress && <p className="mt-3 whitespace-pre-line text-sm text-blue-100">{settings.contactAddress}</p>}
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-sm text-blue-100">
            {settings.contactEmail && <a className="hover:text-white" href={`mailto:${settings.contactEmail}`}>{settings.contactEmail}</a>}
            {settings.contactPhone && <a className="hover:text-white" href={`tel:${settings.contactPhone}`}>{settings.contactPhone}</a>}
          </div>
        </div>
        <div className="flex gap-5 text-sm text-blue-100">
          <Link className="hover:text-white" href="/contact-us">Contact us</Link>
          <Link className="hover:text-white" href="/admin/login">Admin</Link>
        </div>
        <p className="text-xs text-blue-100">© {new Date().getFullYear()} Dental Atelier</p>
      </div>
    </footer>
  );
}

export default function Layout({ children }) {
  return (
    <SiteSettingsProvider>
      <>
        <Head>
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <meta name="theme-color" content="#0B3D91" />
          <meta property="og:site_name" content="Dental Atelier" />
        </Head>
        <Header />
        <main id="main-content">{children}</main>
        <Footer />
      </>
    </SiteSettingsProvider>
  );
}
