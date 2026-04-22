import 'react-native-gesture-handler';
import { registerRootComponent } from 'expo';
import * as TaskManager from 'expo-task-manager';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';

import App from './App';

export const BACKGROUND_NOTIFICATION_TASK = 'BACKGROUND-ALARM-NOTIFICATION-TASK';

/**
 * This task runs when a notification arrives while the app is in the
 * background or killed state. We store the alarmId so that when the
 * app opens (via fullScreenAction or user tapping) it can immediately
 * navigate to the AlarmRing screen.
 */
TaskManager.defineTask(BACKGROUND_NOTIFICATION_TASK, async ({ data, error }: any) => {
  if (error) {
    console.error('[BGTask] Background notification task error:', error);
    return;
  }
  try {
    const notification = data?.notification as Notifications.Notification | undefined;
    const payload = notification?.request?.content?.data;
    const alarmId = payload?.alarmId as string | undefined;
    const isPreAlarm = payload?.isPreAlarm as boolean | undefined;
    if (alarmId && !isPreAlarm) {
      console.log('[BGTask] Storing pending alarm:', alarmId);
      await AsyncStorage.setItem('PENDING_ALARM_ID', alarmId);
      await AsyncStorage.setItem('PENDING_ALARM_TS', Date.now().toString());
    }
  } catch (e) {
    console.warn('[BGTask] Failed to store pending alarm', e);
  }
});

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
