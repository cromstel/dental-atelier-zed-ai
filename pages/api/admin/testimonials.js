import { prisma } from '../../../lib/prisma';
import { requireAdmin } from '../../../lib/admin-auth';
import { cleanText } from '../../../lib/validation';

function readTestimonial(body) {
  const author = cleanText(body?.author, 100);
  const content = cleanText(body?.content, 10000);
  return author && content ? { author, content } : null;
}

export default async function handler(req, res) {
  const session = await requireAdmin(req, res);
  if (!session) return res.status(401).json({ error: 'Administrator access required.' });

  try {
    if (req.method === 'GET') {
      const testimonials = await prisma.testimonial.findMany({ orderBy: { createdAt: 'desc' }, take: 500 });
      return res.status(200).json(testimonials);
    }

    if (req.method === 'POST') {
      const data = readTestimonial(req.body);
      if (!data) return res.status(400).json({ error: 'An author and testimonial are required.' });
      const testimonial = await prisma.testimonial.create({ data });
      return res.status(201).json(testimonial);
    }

    if (req.method === 'PUT') {
      const id = Number(req.body?.id);
      const data = readTestimonial(req.body);
      if (!Number.isInteger(id) || id < 1 || !data) {
        return res.status(400).json({ error: 'A valid testimonial id, author, and quote are required.' });
      }
      const testimonial = await prisma.testimonial.update({ where: { id }, data });
      return res.status(200).json(testimonial);
    }

    if (req.method === 'DELETE') {
      const id = Number(req.query.id);
      if (!Number.isInteger(id) || id < 1) return res.status(400).json({ error: 'A valid testimonial id is required.' });
      await prisma.testimonial.delete({ where: { id } });
      return res.status(204).end();
    }

    res.setHeader('Allow', 'GET, POST, PUT, DELETE');
    return res.status(405).json({ error: 'Method not allowed.' });
  } catch (error) {
    if (error?.code === 'P2025') return res.status(404).json({ error: 'Testimonial not found.' });
    console.error('Unable to manage testimonials:', error);
    return res.status(503).json({ error: 'Testimonials are temporarily unavailable.' });
  }
}
