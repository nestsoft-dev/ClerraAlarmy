import React, { useEffect, useRef } from 'react';
import { StatusBar, View, useColorScheme } from 'react-native';
import { AlarmProvider, useAlarm } from './src/context/AlarmContext';
import * as Notifications from 'expo-notifications';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppNavigator } from './src/navigation/AppNavigator';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import { OnboardingProvider } from './src/context/OnboardingContext';
import { SettingsProvider } from './src/context/SettingsContext';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import * as SplashScreen from 'expo-splash-screen';
import { Asset } from 'expo-asset';
import { NavigationContainerRef } from '@react-navigation/native';
import { RootStackParamList } from './src/navigation/AppNavigator';

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

  useEffect(() => {
    currentAlarmIdRef.current = currentAlarmId;
  }, [currentAlarmId]);

  useEffect(() => {
    const triggerAlarmRing = (alarmId: string) => {
      // Prevent restarting the challenge if we're already ringing it
      if (currentAlarmIdRef.current === alarmId) return;
      
      setCurrentAlarm(alarmId);
      startChallenge(1, alarmId);
      setTimeout(() => {
        navigationRef.current?.navigate('AlarmRing', { alarmId });
      }, 500); 
    };

    const checkActiveNotifications = async () => {
      // 1. Try to get response from notification tap first (Cold Start)
      const lastResponse = await Notifications.getLastNotificationResponseAsync();
      if (lastResponse) {
        const data = extractAlarmData(lastResponse.notification.request.content.data);
        if (data?.alarmId && !data.isPreAlarm) {
          triggerAlarmRing(data.alarmId);
          return;
        }
      }

      // 2. Check actively ringing notifications in the tray (App icon tap)
      const presented = await Notifications.getPresentedNotificationsAsync();
      for (const notification of presented) {
        const data = extractAlarmData(notification.request.content.data);
        if (data?.alarmId && !data.isPreAlarm) {
          triggerAlarmRing(data.alarmId);
          return; 
        }
      }
    };
    
    // Check on mount
    checkActiveNotifications();

    // Check whenever app comes to the foreground (Warm start)
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

    // ── Background: notification tapped from notification tray ──────────────
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
  }, []);

  return <AppNavigator navigationRef={navigationRef} onReady={onReady} />;
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
        const assetPromise = Asset.loadAsync([
          require('./assets/ClerraAlarm Light1.png'),
        ]);

        await Promise.all([delayPromise, assetPromise]);
        console.log('DEBUG: Assets Preloaded and Min Delay Finished.');
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