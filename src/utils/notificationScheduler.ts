import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Alarm } from '../types';
import { ALARM_SOUNDS } from '../constants/sounds';
import { Storage } from './storage';

/**
 * Cancels all scheduled notifications for a given alarm.
 */
export const cancelAlarmNotifications = async (alarm: Alarm): Promise<void> => {
  if (!alarm.notificationIds?.length) return;
  for (const nid of alarm.notificationIds) {
    try {
      await Notifications.cancelScheduledNotificationAsync(nid);
    } catch {}
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
