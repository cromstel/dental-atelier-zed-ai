import { prisma } from './prisma';
import { cleanText } from './validation';
import { homePageContent, pages } from './site-content';

const editablePages = { home: homePageContent, ...pages };
export const editablePageSlugs = Object.keys(editablePages);

export function pageContentKey(slug) {
  return `page-content:${slug}`;
}

export function validatePageContent(slug, input) {
  if (!Object.prototype.hasOwnProperty.call(editablePages, slug) || !input || typeof input !== 'object' || Array.isArray(input)) {
    return null;
  }

  const defaults = editablePages[slug];
  const title = cleanText(input.title, 160);
  const description = cleanText(input.description, 320);
  const intro = cleanText(input.intro, 2000);
  if (!title || !description || !intro || !Array.isArray(input.sections) || input.sections.length !== defaults.sections.length) {
    return null;
  }

  const sections = defaults.sections.map((defaultSection, index) => {
    const section = input.sections[index];
    if (!section || typeof section !== 'object' || Array.isArray(section)) return null;

    const sectionTitle = slug === 'home' ? defaultSection.title : cleanText(section.title, 160);
    const body = cleanText(section.body, 4000);
    if (!sectionTitle || !body) return null;

    return { ...defaultSection, title: sectionTitle, body };
  });

  if (sections.some((section) => section === null)) return null;
  return { title, description, intro, sections };
}

function readStoredPageContent(slug, value) {
  try {
    const parsed = JSON.parse(value);
    return validatePageContent(slug, parsed) || editablePages[slug];
  } catch {
    return editablePages[slug];
  }
}

export async function readPageContent(slug) {
  if (!Object.prototype.hasOwnProperty.call(editablePages, slug)) return null;

  const record = await prisma.setting.findUnique({ where: { key: pageContentKey(slug) } });
  return record ? readStoredPageContent(slug, record.value) : editablePages[slug];
}

export async function readAllPageContent() {
  const records = await prisma.setting.findMany({
    where: { key: { in: editablePageSlugs.map(pageContentKey) } },
  });
  const storedContent = new Map(records.map((record) => [record.key, record.value]));

  return editablePageSlugs.map((slug) => ({
    slug,
    ...readStoredPageContent(slug, storedContent.get(pageContentKey(slug)) || ''),
  }));
}
