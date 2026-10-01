import { prisma } from '../../../lib/prisma';
import { requireAdmin } from '../../../lib/admin-auth';
import { cleanText } from '../../../lib/validation';
import { galleryAssets } from '../../../lib/gallery-assets';

const allowedUrls = new Set(galleryAssets.map((asset) => asset.url));
const allowedCategories = new Set(['PORTFOLIO', 'LAB']);

function readGalleryImage(body) {
  const url = cleanText(body?.url, 500);
  const title = cleanText(body?.title, 120);
  const altText = cleanText(body?.altText, 250);
  const category = cleanText(body?.category, 30).toUpperCase();
  if (!allowedUrls.has(url) || !title || !altText || !allowedCategories.has(category)) return null;
  return { url, title, altText, category };
}

export default async function handler(req, res) {
  const session = await requireAdmin(req, res);
  if (!session) return res.status(401).json({ error: 'Administrator access required.' });

  try {
    if (req.method === 'GET') {
      const images = await prisma.galleryImage.findMany({ orderBy: { createdAt: 'desc' }, take: 500 });
      return res.status(200).json(images);
    }

    if (req.method === 'POST') {
      const data = readGalleryImage(req.body);
      if (!data) return res.status(400).json({ error: 'Choose a site WebP image and provide its title, alt text, and category.' });
      const image = await prisma.galleryImage.create({ data });
      return res.status(201).json(image);
    }

    if (req.method === 'PUT') {
      const id = Number(req.body?.id);
      const data = readGalleryImage(req.body);
      if (!Number.isInteger(id) || id < 1 || !data) {
        return res.status(400).json({ error: 'A valid image id, WebP image, title, alt text, and category are required.' });
      }
      const image = await prisma.galleryImage.update({ where: { id }, data });
      return res.status(200).json(image);
    }

    if (req.method === 'DELETE') {
      const id = Number(req.query.id);
      if (!Number.isInteger(id) || id < 1) return res.status(400).json({ error: 'A valid gallery image id is required.' });
      await prisma.galleryImage.delete({ where: { id } });
      return res.status(204).end();
    }

    res.setHeader('Allow', 'GET, POST, PUT, DELETE');
    return res.status(405).json({ error: 'Method not allowed.' });
  } catch (error) {
    if (error?.code === 'P2025') return res.status(404).json({ error: 'Gallery image not found.' });
    console.error('Unable to manage gallery:', error);
    return res.status(503).json({ error: 'The gallery is temporarily unavailable.' });
  }
}
