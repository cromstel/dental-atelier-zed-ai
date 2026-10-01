import { prisma } from '../../../lib/prisma';
import { cleanText, isEmail } from '../../../lib/validation';
import { requireAdmin } from '../../../lib/admin-auth';

const statuses = new Set(['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED']);

export default async function handler(req, res) {
  const session = await requireAdmin(req, res);
  if (!session) return res.status(401).json({ error: 'Administrator access required.' });

  try {
    if (req.method === 'GET') {
      const appointments = await prisma.appointment.findMany({ orderBy: { createdAt: 'desc' }, take: 100 });
      return res.status(200).json(appointments);
    }

    if (req.method === 'POST') {
      const firstName = cleanText(req.body?.firstName, 100);
      const lastName = cleanText(req.body?.lastName, 100);
      const email = cleanText(req.body?.email, 254).toLowerCase();
      const dateTime = new Date(req.body?.dateTime);
      if (!firstName || !lastName || !isEmail(email) || Number.isNaN(dateTime.getTime())) {
        return res.status(400).json({ error: 'Valid name, email, and date/time are required.' });
      }
      const appointment = await prisma.appointment.create({
        data: {
          firstName,
          lastName,
          email,
          phone: cleanText(req.body?.phone, 40) || null,
          notes: cleanText(req.body?.notes, 5000) || null,
          dateTime,
        },
      });
      return res.status(201).json(appointment);
    }

    if (req.method === 'PUT') {
      const id = Number(req.body?.id);
      const status = cleanText(req.body?.status, 20).toUpperCase();
      if (!Number.isInteger(id) || id < 1 || !statuses.has(status)) {
        return res.status(400).json({ error: 'A valid appointment id and status are required.' });
      }
      const appointment = await prisma.appointment.update({ where: { id }, data: { status } });
      return res.status(200).json(appointment);
    }

    if (req.method === 'DELETE') {
      const id = Number(req.query.id);
      if (!Number.isInteger(id) || id < 1) return res.status(400).json({ error: 'A valid appointment id is required.' });
      await prisma.appointment.delete({ where: { id } });
      return res.status(204).end();
    }

    res.setHeader('Allow', 'GET, POST, PUT, DELETE');
    return res.status(405).json({ error: 'Method not allowed.' });
  } catch (error) {
    if (error?.code === 'P2025') return res.status(404).json({ error: 'Appointment not found.' });
    console.error('Unable to manage appointments:', error);
    return res.status(503).json({ error: 'Appointments are temporarily unavailable.' });
  }
}
