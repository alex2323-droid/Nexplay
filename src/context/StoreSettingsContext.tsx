import React, { createContext, useContext, useState, useEffect } from 'react';
import { StoreSettings } from '../types';
import { api } from '../services/api';

interface SettingsContextType {
  settings: StoreSettings;
  reloadSettings: () => Promise<void>;
  updateSettings: (newSettings: Partial<StoreSettings>) => Promise<void>;
  loading: boolean;
}

const defaultSettings: StoreSettings = {
  storeName: 'NEXPLAY',
  storeTagline: 'Tienda de Recargas Digitales de Videojuegos',
  logoUrl: '/src/assets/images/nexplay_logo_icon_1791138458973.jpg',
  faviconUrl: '/src/assets/images/nexplay_logo_icon_1791138458973.jpg',
  currencySymbol: '$',
  currencyCode: 'USD',
  timezone: 'America/Mexico_City',
  supportEmail: 'soporte@nexplay.gg',
  supportPhoneWhatsapp: '+52 55 9876 5432',
  discordUrl: 'https://discord.gg/nexplay',
  activeProvider: 'mock',
  testMode: true,
  providerApiUrl: 'https://api.rechargeprovider.com/v1',
  providerApiKeyConfigured: true,
  providerWebhookSecretConfigured: true,
  enabledPaymentMethods: ['stripe', 'paypal', 'card', 'apple_pay', 'google_pay', 'crypto', 'cash']
};

const SettingsContext = createContext<SettingsContextType>({
  settings: defaultSettings,
  reloadSettings: async () => {},
  updateSettings: async () => {},
  loading: true
});

export const StoreSettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<StoreSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);

  const reloadSettings = async () => {
    try {
      const data = await api.getSettings();
      setSettings(data);
    } catch (e) {
      console.error('Failed to load store settings:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    reloadSettings();
  }, []);

  const updateSettings = async (newSettings: Partial<StoreSettings>) => {
    const updated = await api.updateSettings(newSettings);
    setSettings(updated);
  };

  return (
    <SettingsContext.Provider value={{ settings, reloadSettings, updateSettings, loading }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useStoreSettings = () => useContext(SettingsContext);
