import { prisma } from '../../../lib/prisma';
import { requireAdmin } from '../../../lib/admin-auth';
import { pageContentKey, readAllPageContent, validatePageContent } from '../../../lib/page-content';

export default async function handler(req, res) {
  const session = await requireAdmin(req, res);
  if (!session) return res.status(401).json({ error: 'Administrator access required.' });

  try {
    if (req.method === 'GET') {
      return res.status(200).json(await readAllPageContent());
    }

    if (req.method === 'PUT') {
      const slug = typeof req.body?.slug === 'string' ? req.body.slug : '';
      const page = validatePageContent(slug, req.body);
      if (!page) return res.status(400).json({ error: 'Choose a supported page and provide valid page and section content.' });

      await prisma.setting.upsert({
        where: { key: pageContentKey(slug) },
        update: { value: JSON.stringify(page) },
        create: { key: pageContentKey(slug), value: JSON.stringify(page) },
      });

      let revalidated = false;
      try {
        await res.revalidate(`/${slug}`);
        revalidated = true;
      } catch (error) {
        console.error(`Unable to revalidate page ${slug}:`, error);
      }

      return res.status(200).json({ slug, page, revalidated });
    }

    res.setHeader('Allow', 'GET, PUT');
    return res.status(405).json({ error: 'Method not allowed.' });
  } catch (error) {
    console.error('Unable to manage page content:', error);
    return res.status(503).json({ error: 'Page content is temporarily unavailable.' });
  }
}
