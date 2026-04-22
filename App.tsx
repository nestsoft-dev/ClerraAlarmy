import React, { useEffect, useRef, useCallback } from 'react';
import { StatusBar, View, useColorScheme } from 'react-native';
import { AlarmProvider, useAlarm } from './src/context/AlarmContext';
import * as Notifications from 'expo-notifications';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppNavigator } from './src/navigation/AppNavigator';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import { OnboardingProvider } from './src/context/OnboardingContext';
import { SettingsProvider } from './src/context/SettingsContext';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import * as SplashScreen from 'expo-splash-screen';
import { Asset } from 'expo-asset';
import { NavigationContainerRef } from '@react-navigation/native';
import { RootStackParamList } from './src/navigation/AppNavigator';
import { SOUND_ASSETS } from './src/constants/sounds';
import { Audio } from 'expo-av';
import { BUILT_IN_BACKGROUNDS } from './src/constants/backgrounds';
import * as Font from 'expo-font';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setupAndroidAlarmChannel } from './src/utils/notificationScheduler';
import { BACKGROUND_NOTIFICATION_TASK } from './index';
import { Storage } from './src/utils/storage';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync().catch(() => {
  /* reloading the app might cause some errors here, we can ignore them */
});

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

/** Extract alarmId and isPreAlarm from any notification payload */
const extractAlarmData = (data: unknown): { alarmId?: string; isPreAlarm?: boolean } | undefined => {
  if (data && typeof data === 'object' && 'alarmId' in data) {
    return data as { alarmId?: string; isPreAlarm?: boolean };
  }
  return undefined;
};

import { AppState, AppStateStatus } from 'react-native';

const AppContent: React.FC<{ onReady: () => void }> = ({ onReady }) => {
  const { setCurrentAlarm, startChallenge, currentAlarmId } = useAlarm();
  const navigationRef = useRef<NavigationContainerRef<RootStackParamList>>(null);
  const currentAlarmIdRef = useRef(currentAlarmId);
  // Track whether the navigation container is ready to receive navigations
  const navigatorReadyRef = useRef(false);
  // Queue an alarm ID that arrived before the navigator was ready
  const pendingAlarmIdRef = useRef<string | null>(null);

  useEffect(() => {
    currentAlarmIdRef.current = currentAlarmId;
  }, [currentAlarmId]);

  // ── Build a dedup key so the same alarm instance isn't re-triggered ────────
  const buildDedupKey = (alarmId: string, alarmTime: string) => {
    const d = new Date();
    const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    return `TRIGGERED_${alarmId}_${alarmTime}_${dateStr}`;
  };

  const triggerAlarmRing = useCallback(async (alarmId: string) => {
    // Prevent restarting the challenge if we're already ringing it
    if (currentAlarmIdRef.current === alarmId) return;

    // Mark this alarm instance as triggered so it isn't re-triggered on next foreground
    try {
      const alarms = await Storage.getAlarms();
      const alarm = alarms.find(a => a.id === alarmId);
      if (alarm) {
        await AsyncStorage.setItem(buildDedupKey(alarmId, alarm.time), '1');
      }
    } catch (_) {}

    setCurrentAlarm(alarmId);
    startChallenge(1, alarmId);

    const doNavigate = () => {
      setTimeout(() => {
        navigationRef.current?.navigate('AlarmRing', { alarmId });
      }, 100);
    };

    if (navigatorReadyRef.current) {
      doNavigate();
    } else {
      // Navigator not ready yet — queue it and let handleNavigatorReady drain it
      pendingAlarmIdRef.current = alarmId;
    }
  }, [setCurrentAlarm, startChallenge]);

  // Called by AppNavigator once the navigation container is mounted and ready
  const handleNavigatorReady = useCallback(() => {
    navigatorReadyRef.current = true;
    // Drain any alarm that was queued before the navigator was ready
    if (pendingAlarmIdRef.current) {
      const pending = pendingAlarmIdRef.current;
      pendingAlarmIdRef.current = null;
      setTimeout(() => {
        navigationRef.current?.navigate('AlarmRing', { alarmId: pending });
      }, 200);
    }
    onReady();
  }, [onReady]);

  useEffect(() => {
    // ── Time-based fallback: check if any enabled alarm should currently be ringing
    // This is the most reliable path when the notification was dismissed or the
    // background task didn't fire (local notifications on iOS don't wake the BG task).
    const checkAlarmByTime = async (): Promise<string | null> => {
      try {
        const alarms = await Storage.getAlarms();
        const now = new Date();
        const todayDay = now.getDay(); // 0 = Sunday
        const nowMin = now.getHours() * 60 + now.getMinutes();

        for (const alarm of alarms) {
          if (!alarm.enabled) continue;
          const [h, m] = alarm.time.split(':').map(Number);
          const alarmMin = h * 60 + m;
          const diffMin = nowMin - alarmMin;
          // Ring if the alarm fired within the last 30 minutes
          if (diffMin < 0 || diffMin >= 30) continue;
          // Check it fires today
          const firesToday =
            alarm.repeatDays.length === 0 || alarm.repeatDays.includes(todayDay);
          if (!firesToday) continue;
          // Skip if we already triggered this exact alarm instance today
          const already = await AsyncStorage.getItem(buildDedupKey(alarm.id, alarm.time));
          if (already) continue;
          return alarm.id;
        }
      } catch (e) {
        console.warn('[TimeCheck] Failed:', e);
      }
      return null;
    };

    const checkActiveNotifications = async () => {
      // 1. Check AsyncStorage for alarm stored by background task (Android / remote push)
      try {
        const pendingAlarmId = await AsyncStorage.getItem('PENDING_ALARM_ID');
        const pendingTs = await AsyncStorage.getItem('PENDING_ALARM_TS');
        if (pendingAlarmId) {
          const age = pendingTs ? Date.now() - parseInt(pendingTs, 10) : 0;
          await AsyncStorage.removeItem('PENDING_ALARM_ID');
          await AsyncStorage.removeItem('PENDING_ALARM_TS');
          if (age < 30 * 60 * 1000) {
            triggerAlarmRing(pendingAlarmId);
            return;
          }
        }
      } catch (_) {}

      // 2. Notification tapped (cold start)
      const lastResponse = await Notifications.getLastNotificationResponseAsync();
      if (lastResponse) {
        const data = extractAlarmData(lastResponse.notification.request.content.data);
        if (data?.alarmId && !data.isPreAlarm) {
          triggerAlarmRing(data.alarmId);
          return;
        }
      }

      // 3. Notification still in the tray (warm start / app icon tap)
      const presented = await Notifications.getPresentedNotificationsAsync();
      for (const notification of presented) {
        const data = extractAlarmData(notification.request.content.data);
        if (data?.alarmId && !data.isPreAlarm) {
          triggerAlarmRing(data.alarmId);
          return;
        }
      }

      // 4. Time-based fallback — most reliable on iOS for local notifications
      const timeAlarmId = await checkAlarmByTime();
      if (timeAlarmId) {
        triggerAlarmRing(timeAlarmId);
      }
    };

    // Check on mount
    checkActiveNotifications();

    // Check whenever app comes to the foreground
    const appStateSub = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        checkActiveNotifications();
      }
    });

    // ── Foreground: notification received while app is open ─────────────────
    const receivedSub = Notifications.addNotificationReceivedListener(
      (notification: Notifications.Notification) => {
        const data = extractAlarmData(notification.request.content.data);
        if (data?.alarmId && !data.isPreAlarm) {
          triggerAlarmRing(data.alarmId);
        }
      }
    );

    // ── Background / killed: notification tapped from tray ──────────────────
    const responseSub = Notifications.addNotificationResponseReceivedListener(
      (response: Notifications.NotificationResponse) => {
        const data = extractAlarmData(response.notification.request.content.data);
        if (data?.alarmId && !data.isPreAlarm) {
          triggerAlarmRing(data.alarmId);
        }
      }
    );

    return () => {
      appStateSub.remove();
      receivedSub.remove();
      responseSub.remove();
    };
  }, [triggerAlarmRing]);

  return <AppNavigator navigationRef={navigationRef} onReady={handleNavigatorReady} />;
};
const ThemedStatusBar: React.FC = () => {
  const { isDark, colors } = useTheme();
  return <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor={colors.background} />;
};




export default function App() {
  const [isReady, setIsReady] = React.useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        console.log('DEBUG: Starting App Boot...');
        
        // Ensure minimum visibility time for the splash screen
        const delayPromise = new Promise(resolve => setTimeout(resolve, 2000));
        
        // Pre-load essential assets
        const essentialImages = [
          require('./assets/ClerraAlarm Light1.png'),
        ];

        const sounds = Object.values(SOUND_ASSETS);
        const backgrounds = BUILT_IN_BACKGROUNDS.flatMap(bg => {
          const assets = [];
          if (bg.source) assets.push(bg.source);
          if (bg.thumbnail) assets.push(bg.thumbnail);
          return assets;
        });

        const assetPromise = Asset.loadAsync([...essentialImages, ...sounds, ...backgrounds]);
        const fontPromise = Font.loadAsync({
          ...Ionicons.font,
        });

        const audioModePromise = Audio.setAudioModeAsync({
          playsInSilentModeIOS: true,
          staysActiveInBackground: true,
          shouldDuckAndroid: false,
        });

        // Set up Android alarm notification channel (safe to call every boot)
        const channelPromise = setupAndroidAlarmChannel();

        // Register background notification task so the app can store the
        // alarmId when a notification fires while the app is killed/background
        const taskPromise = Notifications.registerTaskAsync(BACKGROUND_NOTIFICATION_TASK).catch(
          e => console.warn('[Boot] Background task registration failed (Expo Go unsupported):', e)
        );

        await Promise.all([delayPromise, assetPromise, fontPromise, audioModePromise, channelPromise, taskPromise]);
        console.log('DEBUG: All Assets & Fonts Preloaded.');
      } catch (e) {
        console.warn('DEBUG: Boot Error', e);
      } finally {
        setIsReady(true);
      }
    }
    prepare();
  }, []);

  const handleNavigatorReady = React.useCallback(async () => {
    console.log('DEBUG: Navigator signaled readiness. Hiding Splash Screen.');
    // Small delay to ensure the first frame is rendered
    setTimeout(async () => {
      await SplashScreen.hideAsync().catch(() => {});
    }, 100);
  }, []);

  const systemColorScheme = useColorScheme();
  const splashBackground = systemColorScheme === 'dark' ? '#121212' : '#FEF4EC';

  if (!isReady) {
    return <View style={{ flex: 1, backgroundColor: splashBackground }} />;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider>
          <OnboardingProvider>
            <SettingsProvider>
              <AlarmProvider>
                <ThemedStatusBar />
                <AppContent onReady={handleNavigatorReady} />
              </AlarmProvider>
            </SettingsProvider>
          </OnboardingProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}