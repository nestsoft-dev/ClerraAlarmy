import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AppSettings } from '../types';
import { Storage } from '../utils/storage';

interface SettingsContextType {
  settings: AppSettings;
  updateSettings: (changes: Partial<AppSettings>) => Promise<void>;
  isLoading: boolean;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<AppSettings>({
    strictMode: true,
    adaptiveDifficulty: true,
    maxVolumeOverride: true,
    gracePeriod: 5,
    defaultSoundId: 'radar', // fallback, updated in useEffect
    isPremium: false,
    preAlarmReminder: 5,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const loaded = await Storage.getSettings();
        setSettings(loaded);
      } catch (err) {
        console.error('Failed to load settings:', err);
      } finally {
        setIsLoading(false);
      }
    };
    loadSettings();
  }, []);

  const updateSettings = async (changes: Partial<AppSettings>) => {
    try {
      const updated = await Storage.updateSettings(changes);
      setSettings(updated);
    } catch (err) {
      console.error('Failed to update settings:', err);
    }
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, isLoading }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within SettingsProvider');
  }
  return context;
};
