import { prisma } from '../../../lib/prisma';
import { requireAdmin } from '../../../lib/admin-auth';
import { cleanText, isEmail } from '../../../lib/validation';
import { readSiteSettings } from '../../../lib/site-settings-server';
import { siteSettingKeys } from '../../../lib/site-settings';

function parseSettings(body) {
  const contactAddress = cleanText(body?.contactAddress, 300);
  const contactEmail = cleanText(body?.contactEmail, 254).toLowerCase();
  const contactPhone = cleanText(body?.contactPhone, 40);
  const phoneDigits = contactPhone.replace(/\D/g, '');

  if (!contactAddress) return null;
  if (contactEmail && !isEmail(contactEmail)) return null;
  if (contactPhone && (!/^[+\d][\d\s().-]*$/.test(contactPhone) || phoneDigits.length < 5 || phoneDigits.length > 20)) return null;

  return { contactAddress, contactEmail, contactPhone };
}

export default async function handler(req, res) {
  const session = await requireAdmin(req, res);
  if (!session) return res.status(401).json({ error: 'Administrator access required.' });

  try {
    if (req.method === 'GET') {
      return res.status(200).json(await readSiteSettings());
    }

    if (req.method === 'PUT') {
      const settings = parseSettings(req.body);
      if (!settings) {
        return res.status(400).json({ error: 'Enter a valid address and, if provided, a valid email and phone number.' });
      }

      const updates = siteSettingKeys.map((key) => prisma.setting.upsert({
        where: { key },
        update: { value: settings[key] },
        create: { key, value: settings[key] },
      }));
      await prisma.$transaction(updates);
      return res.status(200).json(settings);
    }

    res.setHeader('Allow', 'GET, PUT');
    return res.status(405).json({ error: 'Method not allowed.' });
  } catch (error) {
    console.error('Unable to manage site settings:', error);
    return res.status(503).json({ error: 'Site settings are temporarily unavailable.' });
  }
}
