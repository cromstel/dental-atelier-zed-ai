import { createContext, useContext, useEffect, useState } from 'react';
import { defaultSiteSettings } from '../lib/site-settings';

const SiteSettingsContext = createContext({
  settings: defaultSiteSettings,
  setSettings: () => {},
});

export function SiteSettingsProvider({ children }) {
  const [settings, setSettings] = useState(defaultSiteSettings);

  useEffect(() => {
    let active = true;

    fetch('/api/site-settings')
      .then((response) => (response.ok ? response.json() : null))
      .then((result) => {
        if (active && result) setSettings(result);
      })
      .catch(() => {});

    return () => {
      active = false;
    };
  }, []);

  return (
    <SiteSettingsContext.Provider value={{ settings, setSettings }}>
      {children}
    </SiteSettingsContext.Provider>
  );
}

export function useSiteSettings() {
  return useContext(SiteSettingsContext);
}
