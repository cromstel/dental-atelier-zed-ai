import { prisma } from '../../../lib/prisma';
import { requireAdmin } from '../../../lib/admin-auth';
import { cleanText } from '../../../lib/validation';

function readFaq(body) {
  const question = cleanText(body?.question, 500);
  const answer = cleanText(body?.answer, 10000);
  return question && answer ? { question, answer } : null;
}

export default async function handler(req, res) {
  const session = await requireAdmin(req, res);
  if (!session) return res.status(401).json({ error: 'Administrator access required.' });

  try {
    if (req.method === 'GET') {
      const faqs = await prisma.faq.findMany({ orderBy: { id: 'asc' }, take: 500 });
      return res.status(200).json(faqs);
    }

    if (req.method === 'POST') {
      const data = readFaq(req.body);
      if (!data) return res.status(400).json({ error: 'A question and answer are required.' });
      const faq = await prisma.faq.create({ data });
      return res.status(201).json(faq);
    }

    if (req.method === 'PUT') {
      const id = Number(req.body?.id);
      const data = readFaq(req.body);
      if (!Number.isInteger(id) || id < 1 || !data) {
        return res.status(400).json({ error: 'A valid FAQ id, question, and answer are required.' });
      }
      const faq = await prisma.faq.update({ where: { id }, data });
      return res.status(200).json(faq);
    }

    if (req.method === 'DELETE') {
      const id = Number(req.query.id);
      if (!Number.isInteger(id) || id < 1) return res.status(400).json({ error: 'A valid FAQ id is required.' });
      await prisma.faq.delete({ where: { id } });
      return res.status(204).end();
    }

    res.setHeader('Allow', 'GET, POST, PUT, DELETE');
    return res.status(405).json({ error: 'Method not allowed.' });
  } catch (error) {
    if (error?.code === 'P2025') return res.status(404).json({ error: 'FAQ not found.' });
    console.error('Unable to manage FAQs:', error);
    return res.status(503).json({ error: 'FAQs are temporarily unavailable.' });
  }
}
