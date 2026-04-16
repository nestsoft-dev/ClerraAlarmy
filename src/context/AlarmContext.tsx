import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { Alarm, UserStats, Challenge, ChallengeType } from '../types';
import { Storage, generateId, getTodayDateString } from '../utils/storage';
import { DEFAULT_SOUND_ID } from '../constants/sounds';
import * as Notifications from 'expo-notifications';
import { useSettings } from './SettingsContext';
import { cancelAlarmNotifications, scheduleAlarmNotifications } from '../utils/notificationScheduler';

interface AlarmContextType {
  alarms: Alarm[];
  stats: UserStats;
  currentAlarmId: string | null;
  currentChallenge: Challenge | null;
  currentDifficulty: number;
  failCount: number;
  challengeSequence: Challenge[];
  currentSequenceIndex: number;
  addAlarm: (alarm: Omit<Alarm, 'id' | 'createdAt'> | Alarm) => Promise<void>;
  updateAlarm: (alarm: Alarm) => Promise<void>;
  deleteAlarm: (id: string) => Promise<void>;
  toggleAlarm: (id: string) => Promise<void>;
  setCurrentAlarm: (id: string | null) => void;
  startChallenge: (difficulty?: number, alarmId?: string) => void;
  completeChallenge: () => Promise<boolean>;
  failChallenge: () => Promise<void>;
  resetChallenge: () => void;
  refreshStats: () => Promise<void>;
  syncScheduledNotifications: () => Promise<void>;
}

const AlarmContext = createContext<AlarmContextType | undefined>(undefined);

export const AlarmProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [alarms, setAlarms] = useState<Alarm[]>([]);
  const [stats, setStats] = useState<UserStats>({
    currentStreak: 0,
    longestStreak: 0,
    totalAlarms: 0,
    totalCompleted: 0,
    totalFailed: 0,
  });
  const [currentAlarmId, setCurrentAlarmId] = useState<string | null>(null);
  const [currentChallenge, setCurrentChallenge] = useState<Challenge | null>(null);
  const [currentDifficulty, setCurrentDifficulty] = useState(1);
  const [failCount, setFailCount] = useState(0);
  const [challengeSequence, setChallengeSequence] = useState<Challenge[]>([]);
  const [currentSequenceIndex, setCurrentSequenceIndex] = useState(0);
  const [challengeStartTime, setChallengeStartTime] = useState<number | null>(null);
  const { settings } = useSettings();

  const loadAlarms = useCallback(async () => {
    const loaded = await Storage.getAlarms();
    setAlarms(loaded);
  }, []);

  const refreshStats = useCallback(async () => {
    const loaded = await Storage.getStats();
    setStats(loaded);
  }, []);

  // ─── Auto-disable alarms that have already passed today ──────────────────
  const disablePastAlarms = useCallback(async () => {
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const loaded = await Storage.getAlarms();

    const toDisable = loaded.filter(alarm => {
      if (!alarm.enabled) return false;
      // Never auto-disable a repeating alarm just because its time has passed today
      if (alarm.repeatDays && alarm.repeatDays.length > 0) return false;
      
      const [h, m] = alarm.time.split(':').map(Number);
      const alarmMinutes = h * 60 + m;
      return alarmMinutes < currentMinutes;
    });

    if (toDisable.length > 0) {
      for (const alarm of toDisable) {
        // CRITICAL FIX: Cancel local notifications when auto-disabling
        await cancelAlarmNotifications(alarm);
        await Storage.updateAlarm({ ...alarm, enabled: false, notificationIds: [] });
      }
      await loadAlarms();
    }
  }, [loadAlarms]);

  /**
   * SAFETY SYNC: "The Healer"
   * Scans OS scheduler and cancels any notification that belongs to a disabled or deleted alarm.
   */
  const syncScheduledNotifications = useCallback(async () => {
    try {
      const scheduled = await Notifications.getAllScheduledNotificationsAsync();
      const loadedAlarms = await Storage.getAlarms();
      const activeAlarmIds = new Set(loadedAlarms.filter(a => a.enabled).map(a => a.id));

      for (const notif of scheduled) {
        const data = notif.content.data;
        const alarmId = data?.alarmId as string | undefined;

        // If notification has an alarmId but it's not in our list of ENABLED alarms, kill it.
        if (alarmId && !activeAlarmIds.has(alarmId)) {
          console.log(`[Sync] Cancelling phantom notification ${notif.identifier} for alarm ${alarmId}`);
          await Notifications.cancelScheduledNotificationAsync(notif.identifier);
        }
      }
    } catch (e) {
      console.warn('Sync failed', e);
    }
  }, []);

  useEffect(() => {
    loadAlarms();
    refreshStats();
    syncScheduledNotifications();
  }, [loadAlarms, refreshStats, syncScheduledNotifications]);

  // Run the past-alarm check once on mount
  useEffect(() => {
    disablePastAlarms();
  }, [disablePastAlarms]);

  const addAlarm = useCallback(async (alarmData: Omit<Alarm, 'id' | 'createdAt'> | Alarm) => {
    // Support pre-generated IDs (when notification ID was embedded before save)
    const alarm: Alarm = 'id' in alarmData && alarmData.id
      ? (alarmData as Alarm)
      : {
          ...alarmData,
          soundId: (alarmData as any).soundId ?? DEFAULT_SOUND_ID,
          volume: (alarmData as any).volume ?? 1.0,
          id: generateId(),
          createdAt: Date.now(),
        };
    await Storage.addAlarm(alarm);
    await loadAlarms();
  }, [loadAlarms]);

  const updateAlarm = useCallback(async (alarm: Alarm) => {
    await Storage.updateAlarm(alarm);
    await loadAlarms();
  }, [loadAlarms]);

  const deleteAlarm = useCallback(async (id: string) => {
    const alarm = alarms.find(a => a.id === id);
    if (alarm) await cancelAlarmNotifications(alarm);
    await Storage.deleteAlarm(id);
    await loadAlarms();
  }, [alarms, loadAlarms]);

  const toggleAlarm = useCallback(async (id: string) => {
    const alarm = alarms.find(a => a.id === id);
    if (!alarm) return;

    const nowEnabled = !alarm.enabled;

    if (!nowEnabled) {
      // Turning OFF: cancel all scheduled notifications
      await cancelAlarmNotifications(alarm);
      const updated = { ...alarm, enabled: false, notificationIds: [] };
      await Storage.updateAlarm(updated);
    } else {
      // Turning ON: re-schedule notifications
      const notificationIds = await scheduleAlarmNotifications(alarm);
      const updated = { ...alarm, enabled: true, notificationIds };
      await Storage.updateAlarm(updated);
    }
    await loadAlarms();
  }, [alarms, loadAlarms]);

  const setCurrentAlarm = useCallback((id: string | null) => {
    // Only reset challenge state when switching to a DIFFERENT alarm
    if (id !== currentAlarmId) {
      setCurrentAlarmId(id);
      setFailCount(0);
      setCurrentDifficulty(1);
      setCurrentChallenge(null);
      setChallengeSequence([]);
      setCurrentSequenceIndex(0);
    }
  }, [currentAlarmId]);

  const startChallenge = useCallback((fallbackDifficulty: number = 1, alarmIdOverride?: string) => {
    setCurrentDifficulty(fallbackDifficulty);

    const resolvedAlarmId = alarmIdOverride ?? currentAlarmId;
    const alarm = alarms.find(a => a.id === resolvedAlarmId);

    // Build the unrolled sequence of Challenge objects
    const sequence: Challenge[] = [];

    if (alarm?.challengeConfigs && alarm.challengeConfigs.length > 0) {
      alarm.challengeConfigs.forEach(config => {
        const count = config.numProblems || 1;
        const diff = config.difficulty || fallbackDifficulty;
        for (let i = 0; i < count; i++) {
          sequence.push({ type: config.type, difficulty: diff as 1|2|3 });
        }
      });
    } else if (alarm?.challengeTypes?.length) {
      alarm.challengeTypes.forEach(type => {
        sequence.push({ type, difficulty: fallbackDifficulty as 1|2|3 });
      });
    } else if (alarm?.challengeType) {
      sequence.push({ type: alarm.challengeType, difficulty: fallbackDifficulty as 1|2|3 });
    } else {
      sequence.push({ type: 'math', difficulty: fallbackDifficulty as 1|2|3 });
    }

    setChallengeSequence(sequence);
    setCurrentSequenceIndex(0);
    
    if (sequence.length > 0) {
      setCurrentChallenge(sequence[0]);
      setCurrentDifficulty(sequence[0].difficulty);
    } else {
      setCurrentChallenge(null);
    }
    
    setFailCount(0);
    setChallengeStartTime(Date.now());
  }, [alarms, currentAlarmId]);

  const completeChallenge = useCallback(async (): Promise<boolean> => {
    if (currentSequenceIndex + 1 < challengeSequence.length) {
      // Advance to the next challenge in the sequence
      const nextIndex = currentSequenceIndex + 1;
      const nextChallenge = challengeSequence[nextIndex];
      setCurrentSequenceIndex(nextIndex);
      setCurrentChallenge(nextChallenge);
      setCurrentDifficulty(nextChallenge.difficulty);
      setFailCount(0);
      return false; // Sequence not finished yet
    }

    if (currentAlarmId) {
      await Storage.incrementStreak();
      
      // Add log entry
      await Storage.addLog({
        id: generateId(),
        alarmId: currentAlarmId,
        date: new Date().toISOString().split('T')[0],
        completed: true,
        challengeType: currentChallenge?.type,
        challengeDifficulty: currentDifficulty as 1|2|3,
        durationMs: challengeStartTime ? Date.now() - challengeStartTime : undefined,
      });

      await refreshStats();

      // Auto-disable one-time alarms after they've been completed
      const alarm = alarms.find(a => a.id === currentAlarmId);
      if (alarm && alarm.repeatDays.length === 0) {
        // CRITICAL FIX: Ensure notifications are cleared when auto-disabling
        await cancelAlarmNotifications(alarm);
        await Storage.updateAlarm({ ...alarm, enabled: false, notificationIds: [] });
        await loadAlarms();
      }
    }
    setCurrentAlarmId(null);
    setCurrentChallenge(null);
    setChallengeSequence([]);
    setCurrentSequenceIndex(0);
    setFailCount(0);
    setChallengeStartTime(null);
    return true; // Sequence fully complete
  }, [currentSequenceIndex, challengeSequence, currentDifficulty, currentAlarmId, alarms, refreshStats, loadAlarms]);

  const failChallenge = useCallback(async () => {
    const newFailCount = failCount + 1;
    setFailCount(newFailCount);
    
    let newDifficulty = currentDifficulty;
    if (settings.adaptiveDifficulty) {
      newDifficulty = Math.min(3, currentDifficulty + 1);
    }
    setCurrentDifficulty(newDifficulty as 1 | 2 | 3);

    // Keep the same challenge type for the current step, just escalate difficulty
    const currentBaseChallenge = challengeSequence[currentSequenceIndex];
    const currentType = currentBaseChallenge ? currentBaseChallenge.type : 'math';
    const nextChallenge: Challenge = { type: currentType, difficulty: newDifficulty };

    setCurrentChallenge(nextChallenge);

    if (currentAlarmId) {
      await Storage.recordFailure();

      // Add log entry
      await Storage.addLog({
        id: generateId(),
        alarmId: currentAlarmId,
        date: new Date().toISOString().split('T')[0],
        completed: false,
        challengeType: currentChallenge?.type,
        challengeDifficulty: currentDifficulty as 1|2|3,
        failedAt: Date.now(),
      });

      await refreshStats();
    }
  }, [failCount, currentDifficulty, currentSequenceIndex, challengeSequence, currentAlarmId, refreshStats]);

  const resetChallenge = useCallback(() => {
    setCurrentAlarmId(null);
    setCurrentChallenge(null);
    setChallengeSequence([]);
    setCurrentSequenceIndex(0);
    setFailCount(0);
    setCurrentDifficulty(1);
    setChallengeStartTime(null);
  }, []);

  return (
    <AlarmContext.Provider
      value={{
        alarms,
        stats,
        currentAlarmId,
        currentChallenge,
        currentDifficulty,
        failCount,
        challengeSequence,
        currentSequenceIndex,
        addAlarm,
        updateAlarm,
        deleteAlarm,
        toggleAlarm,
        setCurrentAlarm,
        startChallenge,
        completeChallenge,
        failChallenge,
        resetChallenge,
        refreshStats,
        syncScheduledNotifications,
      }}
    >
      {children}
    </AlarmContext.Provider>
  );
};

export const useAlarm = () => {
  const context = useContext(AlarmContext);
  if (!context) {
    throw new Error('useAlarm must be used within AlarmProvider');
  }
  return context;
};