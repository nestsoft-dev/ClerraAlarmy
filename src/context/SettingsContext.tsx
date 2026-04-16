import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AppSettings } from '../types';
import { Storage } from '../utils/storage';

interface SettingsContextType {
  settings: AppSettings;
  updateSettings: (changes: Partial<AppSettings>) => Promise<void>;
  isLoading: boolean;
  resetContext: () => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

const DEFAULT_SETTINGS: AppSettings = {
  strictMode: true,
  adaptiveDifficulty: true,
  gracePeriod: 0,
  defaultSoundId: 'radar',
  isPremium: false,
  subscriptionPlan: undefined,
  preAlarmReminder: 5,
};

export const SettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
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

  const resetContext = () => {
    setSettings(DEFAULT_SETTINGS);
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, isLoading, resetContext }}>
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
