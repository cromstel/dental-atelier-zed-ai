import { prisma } from '../../lib/prisma';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed.' });
  }

  try {
    const testimonials = await prisma.testimonial.findMany({ orderBy: { createdAt: 'desc' } });
    return res.status(200).json(testimonials);
  } catch (error) {
    console.error('Unable to load testimonials:', error);
    return res.status(503).json({ error: 'Testimonials are temporarily unavailable.' });
  }
}
