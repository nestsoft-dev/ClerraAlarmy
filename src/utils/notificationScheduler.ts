import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Alarm } from '../types';
import { ALARM_SOUNDS } from '../constants/sounds';
import { Storage } from './storage';
import { Platform } from 'react-native';

export const ALARM_CHANNEL_ID = 'clerra_alarm_channel';

/**
 * Creates the Android alarm notification channel.
 * Must be called once at app boot (safe to call multiple times).
 */
export const setupAndroidAlarmChannel = async (): Promise<void> => {
  if (Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync(ALARM_CHANNEL_ID, {
    name: 'Alarms',
    importance: Notifications.AndroidImportance.MAX,
    sound: 'alarm_clock.wav',
    vibrationPattern: [0, 500, 300, 500, 300, 500],
    bypassDnd: true,
    lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
    enableLights: true,
    lightColor: '#e94560',
  });
};

/**
 * Cancels all scheduled notifications for a given alarm.
 */
export const cancelAlarmNotifications = async (alarm: Alarm): Promise<void> => {
  if (!alarm.notificationIds?.length) return;
  for (const nid of alarm.notificationIds) {
    try {
      await Notifications.cancelScheduledNotificationAsync(nid);
    } catch (e) {
      console.error('[Notification] Failed to cancel notification', e);
    }
  }
};
/**
 * Cancels ALL scheduled notifications for the entire app.
 * Use this for app resets.
 */
export const cancelAllLocalNotifications = async (): Promise<void> => {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch (e) {
    console.error('[Notification] Failed to cancel all notifications', e);
  }
};

/**
 * Schedules notifications for an alarm.
 * - Repeat alarm  (repeatDays.length > 0): one WEEKLY notification per selected weekday
 * - One-time alarm (repeatDays.length === 0): one DATE notification for the next occurrence
 *
 * Returns the array of scheduled notification IDs (store these on the alarm).
 */
export const scheduleAlarmNotifications = async (alarm: Alarm): Promise<string[]> => {
  if (!Device.isDevice) return [];

  const { status } = await Notifications.requestPermissionsAsync();
  if (status !== 'granted') return [];

  const soundMeta = ALARM_SOUNDS.find(s => s.id === alarm.soundId);
  const notificationSound = soundMeta?.filename ?? 'alarm_clock.wav';

  const settings = await Storage.getSettings();
  const preAlarmReminder = settings.preAlarmReminder ?? 5; // fallback just in case

  const baseContent: Notifications.NotificationContentInput = {
    title: '⏰ ALARM',
    body: alarm.disciplineMode
      ? 'Complete your challenge to stop the alarm!'
      : 'Wake up!',
    sound: notificationSound,
    priority: Notifications.AndroidNotificationPriority.MAX,
    data: { alarmId: alarm.id },
    // Android: make notification sticky so it can't be swiped away
    sticky: true,
    // Marks this as an alarm-category notification (affects lock screen behavior)
    categoryIdentifier: 'alarm',
    // Android: use our dedicated high-importance alarm channel
    ...(Platform.OS === 'android' ? { channelId: ALARM_CHANNEL_ID } : {}),
    // Android: full-screen intent — launches the app even from locked/killed state
    ...(Platform.OS === 'android'
      ? { fullScreenAction: { identifier: Notifications.DEFAULT_ACTION_IDENTIFIER } }
      : {}),
  };

  const preBaseContent: Notifications.NotificationContentInput = {
    title: '⏰ Upcoming Alarm',
    body: `Your alarm will ring in ${preAlarmReminder} ${preAlarmReminder === 1 ? 'minute' : 'minutes'}.`,
    sound: 'default',
    priority: Notifications.AndroidNotificationPriority.HIGH,
    data: { alarmId: alarm.id, isPreAlarm: true },
  };

  const [hours, minutes] = alarm.time.split(':').map(Number);
  const ids: string[] = [];

  // Helper to calculate X mins before, where X is preAlarmReminder
  const getPreAlarmTime = (h: number, m: number, w?: number) => {
    let preM = m - preAlarmReminder;
    let preH = h;
    let preW = w;
    while (preM < 0) {
      preM += 60;
      preH -= 1;
      if (preH < 0) {
        preH += 24;
        if (preW !== undefined) {
          preW -= 1;
          if (preW < 1) preW = 7;
        }
      }
    }
    return { preH, preM, preW };
  };

  if (alarm.repeatDays.length > 0) {
    // ── Repeat: one WEEKLY trigger per selected day ───────────────────────
    for (const jsDay of alarm.repeatDays) {
      const expoWeekday = (jsDay + 1) as 1 | 2 | 3 | 4 | 5 | 6 | 7;
      
      // Main Alarm
      const id = await Notifications.scheduleNotificationAsync({
        content: baseContent,
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
          weekday: expoWeekday,
          hour: hours,
          minute: minutes,
        },
      });
      ids.push(id);

      // Pre-Alarm
      if (preAlarmReminder > 0) {
        const { preH, preM, preW } = getPreAlarmTime(hours, minutes, expoWeekday);
        const preId = await Notifications.scheduleNotificationAsync({
          content: preBaseContent,
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
            weekday: preW as 1 | 2 | 3 | 4 | 5 | 6 | 7,
            hour: preH,
            minute: preM,
          },
        });
        ids.push(preId);
      }
    }
  } else {
    // ── One-time: next occurrence of the chosen time ──────────────────────
    const now = new Date();
    const target = new Date();
    target.setHours(hours, minutes, 0, 0);

    // Push to tomorrow if the time has already passed today
    if (target <= now) {
      target.setDate(target.getDate() + 1);
    }

    // Main Alarm
    const id = await Notifications.scheduleNotificationAsync({
      content: baseContent,
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: target,
      },
    });
    ids.push(id);

    // ── iOS follow-up notifications ────────────────────────────────────────
    // iOS notification sounds are capped at ~30 seconds. To keep the alarm
    // ringing while the app is minimized, schedule follow-up notifications
    // every 25 seconds for the first 10 minutes.
    if (Platform.OS === 'ios') {
      const REPEAT_INTERVAL_MS = 25 * 1000; // 25 seconds
      const REPEAT_DURATION_MS = 10 * 60 * 1000; // 10 minutes
      const repeatCount = Math.floor(REPEAT_DURATION_MS / REPEAT_INTERVAL_MS);
      for (let i = 1; i <= repeatCount; i++) {
        const repeatTarget = new Date(target.getTime() + i * REPEAT_INTERVAL_MS);
        const repeatId = await Notifications.scheduleNotificationAsync({
          content: baseContent,
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.DATE,
            date: repeatTarget,
          },
        });
        ids.push(repeatId);
      }
    }

    // Pre-Alarm
    if (preAlarmReminder > 0) {
      const preTarget = new Date(target.getTime() - preAlarmReminder * 60000);
      // Only schedule pre-alarm if it's still in the future
      if (preTarget > now) {
        const preId = await Notifications.scheduleNotificationAsync({
          content: preBaseContent,
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.DATE,
            date: preTarget,
          },
        });
        ids.push(preId);
      }
    }
  }

  return ids;
};
