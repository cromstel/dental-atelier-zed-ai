import { prisma } from './prisma';
import { defaultSiteSettings, siteSettingKeys } from './site-settings';

export async function readSiteSettings() {
  const records = await prisma.setting.findMany({
    where: { key: { in: siteSettingKeys } },
  });

  return records.reduce((settings, { key, value }) => {
    if (siteSettingKeys.includes(key)) settings[key] = value;
    return settings;
  }, { ...defaultSiteSettings });
}
