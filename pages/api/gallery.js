import { prisma } from '../../lib/prisma';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed.' });
  }

  try {
    const images = await prisma.galleryImage.findMany({ orderBy: { createdAt: 'desc' } });
    return res.status(200).json(images);
  } catch (error) {
    console.error('Unable to load gallery:', error);
    return res.status(503).json({ error: 'The gallery is temporarily unavailable.' });
  }
}
