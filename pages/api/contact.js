import { prisma } from '../../lib/prisma';
import { cleanText, isEmail } from '../../lib/validation';

const inquiryTypes = new Set(['GENERAL', 'CONTACT', 'SMILE_CHECK', 'REQUEST_INFO']);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed.' });
  }

  const firstName = cleanText(req.body?.firstName, 100);
  const lastName = cleanText(req.body?.lastName, 100);
  const email = cleanText(req.body?.email, 254).toLowerCase();
  const phone = cleanText(req.body?.phone, 40);
  const message = cleanText(req.body?.message, 5000);
  const requestedType = cleanText(req.body?.inquiryType, 30).toUpperCase();
  const inquiryType = inquiryTypes.has(requestedType) ? requestedType : 'GENERAL';

  if (!firstName || !lastName || !isEmail(email) || !message) {
    return res.status(400).json({ error: 'Enter your first name, last name, a valid email, and a message.' });
  }

  try {
    await prisma.contactMessage.create({
      data: { firstName, lastName, email, phone: phone || null, message, inquiryType },
    });
    return res.status(201).json({ success: true });
  } catch (error) {
    console.error('Unable to save contact inquiry:', error);
    return res.status(503).json({ error: 'Your message could not be saved right now. Please try again later.' });
  }
}
