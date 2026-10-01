import { navigation, pages } from '../lib/site-content';

const baseUrl = 'https://www.dentalatelier.co';
const publicRoutes = [
  ...navigation.map(({ href }) => href),
  ...Object.keys(pages).map((slug) => `/${slug}`),
  '/smile-check-form',
  '/request-appointment',
];

export async function getServerSideProps({ res }) {
  const urls = [...new Set(publicRoutes)]
    .map((route) => `<url><loc>${baseUrl}${route === '/' ? '' : route}</loc></url>`)
    .join('');
  res.setHeader('Content-Type', 'text/xml; charset=utf-8');
  res.write(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`);
  res.end();
  return { props: {} };
}

export default function Sitemap() {
  return null;
}
