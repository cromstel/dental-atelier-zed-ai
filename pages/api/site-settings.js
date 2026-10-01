import { readSiteSettings } from '../../lib/site-settings-server';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed.' });
  }

  res.setHeader('Cache-Control', 'no-store');
  try {
    return res.status(200).json(await readSiteSettings());
  } catch (error) {
    console.error('Unable to load public site settings:', error);
    return res.status(503).json({ error: 'Site contact details are temporarily unavailable.' });
  }
}
