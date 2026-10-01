import { prisma } from '../../lib/prisma';
import { cleanText, isEmail } from '../../lib/validation';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed.' });
  }

  const firstName = cleanText(req.body?.firstName, 100);
  const lastName = cleanText(req.body?.lastName, 100);
  const email = cleanText(req.body?.email, 254).toLowerCase();
  const phone = cleanText(req.body?.phone, 40);
  const notes = cleanText(req.body?.notes, 5000);
  const dateTime = new Date(req.body?.dateTime);

  if (!firstName || !lastName || !isEmail(email) || Number.isNaN(dateTime.getTime()) || dateTime <= new Date()) {
    return res.status(400).json({ error: 'Enter your name, a valid email, and a future requested date and time.' });
  }

  try {
    await prisma.appointment.create({
      data: { firstName, lastName, email, phone: phone || null, notes: notes || null, dateTime },
    });
    return res.status(201).json({ success: true });
  } catch (error) {
    console.error('Unable to save appointment request:', error);
    return res.status(503).json({ error: 'Your request could not be saved right now. Please try again later.' });
  }
}
