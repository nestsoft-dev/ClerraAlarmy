import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alarm, AlarmLog, Reflection, UserStats, ChallengeType, ChallengeDifficulty } from '../types';
import { DEFAULT_SOUND_ID } from '../constants/sounds';

const KEYS = {
  ALARMS: '@clerra_alarms',
  LOGS: '@clerra_logs',
  REFLECTIONS: '@clerra_reflections',
  STATS: '@clerra_stats',
  ONBOARDING: '@clerra_onboarding_completed',
  SETTINGS: '@clerra_settings',
};

export const Storage = {
  async getAlarms(): Promise<Alarm[]> {
    const data = await AsyncStorage.getItem(KEYS.ALARMS);
    if (!data) return [];
    const alarms: Alarm[] = JSON.parse(data);
    return alarms.map(alarm => ({
      ...alarm,
      // Backwards-compat: old alarms won't have soundId
      soundId: alarm.soundId ?? DEFAULT_SOUND_ID,
      volume: alarm.volume ?? 1.0,
      enabled: typeof alarm.enabled === 'string' ? alarm.enabled === 'true' : Boolean(alarm.enabled),
      disciplineMode: typeof alarm.disciplineMode === 'string' ? alarm.disciplineMode === 'true' : Boolean(alarm.disciplineMode),
    }));
  },

  async getHasCompletedOnboarding(): Promise<boolean> {
    const data = await AsyncStorage.getItem(KEYS.ONBOARDING);
    return data === 'true';
  },

  async setHasCompletedOnboarding(completed: boolean): Promise<void> {
    await AsyncStorage.setItem(KEYS.ONBOARDING, completed ? 'true' : 'false');
  },

  async saveAlarms(alarms: Alarm[]): Promise<void> {
    await AsyncStorage.setItem(KEYS.ALARMS, JSON.stringify(alarms));
  },

  async addAlarm(alarm: Alarm): Promise<void> {
    const alarms = await this.getAlarms();
    alarms.push(alarm);
    await this.saveAlarms(alarms);
  },

  async updateAlarm(alarm: Alarm): Promise<void> {
    const alarms = await this.getAlarms();
    const index = alarms.findIndex(a => a.id === alarm.id);
    if (index !== -1) {
      alarms[index] = alarm;
      await this.saveAlarms(alarms);
    }
  },

  async deleteAlarm(id: string): Promise<void> {
    const alarms = await this.getAlarms();
    const filtered = alarms.filter(a => a.id !== id);
    await this.saveAlarms(filtered);
  },

  async getLogs(): Promise<AlarmLog[]> {
    const data = await AsyncStorage.getItem(KEYS.LOGS);
    return data ? JSON.parse(data) : [];
  },

  async addLog(log: AlarmLog): Promise<void> {
    const logs = await this.getLogs();
    logs.push(log);
    await AsyncStorage.setItem(KEYS.LOGS, JSON.stringify(logs));
  },

  async getReflections(): Promise<Reflection[]> {
    const data = await AsyncStorage.getItem(KEYS.REFLECTIONS);
    return data ? JSON.parse(data) : [];
  },

  async addReflection(reflection: Reflection): Promise<void> {
    const reflections = await this.getReflections();
    reflections.push(reflection);
    await AsyncStorage.setItem(KEYS.REFLECTIONS, JSON.stringify(reflections));
  },

  async getStats(): Promise<UserStats> {
    const data = await AsyncStorage.getItem(KEYS.STATS);
    if (data) {
      return JSON.parse(data);
    }
    return {
      currentStreak: 0,
      longestStreak: 0,
      totalAlarms: 0,
      totalCompleted: 0,
      totalFailed: 0,
    };
  },

  async updateStats(stats: UserStats): Promise<void> {
    await AsyncStorage.setItem(KEYS.STATS, JSON.stringify(stats));
  },

  async incrementStreak(): Promise<UserStats> {
    const stats = await this.getStats();
    const today = new Date().toISOString().split('T')[0];

    if (stats.lastAlarmDate === today) {
      return stats;
    }

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    if (stats.lastAlarmDate === yesterdayStr) {
      stats.currentStreak += 1;
    } else if (stats.lastAlarmDate !== today) {
      stats.currentStreak = 1;
    }

    if (stats.currentStreak > stats.longestStreak) {
      stats.longestStreak = stats.currentStreak;
    }

    stats.lastAlarmDate = today;
    stats.totalAlarms += 1;
    stats.totalCompleted += 1;

    await this.updateStats(stats);
    return stats;
  },

  async recordFailure(): Promise<UserStats> {
    const stats = await this.getStats();
    const today = new Date().toISOString().split('T')[0];

    stats.currentStreak = 0;
    stats.lastAlarmDate = today;
    stats.totalAlarms += 1;
    stats.totalFailed += 1;

    await this.updateStats(stats);
    return stats;
  },

  async getSettings(): Promise<AppSettings> {
    const data = await AsyncStorage.getItem(KEYS.SETTINGS);
    const defaults: AppSettings = {
      strictMode: true,
      adaptiveDifficulty: true,

      maxVolumeOverride: true,
      gracePeriod: 0,
      defaultSoundId: DEFAULT_SOUND_ID,
      isPremium: false,
      preAlarmReminder: 5,
      hasPromptedForReview: false,
    };
    if (!data) return defaults;
    return { ...defaults, ...JSON.parse(data) };
  },

  async updateSettings(settings: Partial<AppSettings>): Promise<AppSettings> {
    const current = await this.getSettings();
    const updated = { ...current, ...settings };
    await AsyncStorage.setItem(KEYS.SETTINGS, JSON.stringify(updated));
    return updated;
  },

  async clearAllData(): Promise<void> {
    const keys = Object.values(KEYS);
    await AsyncStorage.multiRemove(keys);
  },
};

export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

/**
 * Returns a random challenge type from all 7 available types.
 * If the alarm has a specific challengeType set, that is used instead (handled by caller).
 * If the alarm has a targetColor, color is included. Otherwise it's excluded.
 */
export const getRandomChallenge = (
  difficulty: ChallengeDifficulty = 1,
  hasTargetColor = false
): { type: ChallengeType; difficulty: ChallengeDifficulty } => {
  const types: ChallengeType[] = ['math', 'shake', 'photo', 'jump', 'brush', 'pushup', 'unscramble', 'riddle', 'memory'];
  if (hasTargetColor) {
    types.push('color');
  }
  const type = types[Math.floor(Math.random() * types.length)];
  const adjustedDifficulty = Math.min(3, Math.max(1, difficulty + Math.floor(Math.random() * 2) - 1)) as ChallengeDifficulty;
  return { type, difficulty: adjustedDifficulty };
};

export const getTodayDateString = (): string => {
  return new Date().toISOString().split('T')[0];
};