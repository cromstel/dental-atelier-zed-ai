const SITE_NAME = 'Dental Atelier';

export function getPageTitle(title) {
  const pageTitle = typeof title === 'string' ? title.trim() : '';
  if (!pageTitle) return SITE_NAME;
  if (pageTitle.endsWith(` | ${SITE_NAME}`)) return pageTitle;
  return `${pageTitle} | ${SITE_NAME}`;
}
