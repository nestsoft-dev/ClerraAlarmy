<<<<<<< HEAD
import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer, NavigationContainerRef } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { HomeScreen } from '../screens/HomeScreen';
import { CreateAlarmScreen } from '../screens/CreateAlarmScreen';
import { AlarmRingScreen } from '../screens/AlarmRingScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { OnboardingWelcomeScreen } from '../screens/onboarding/OnboardingWelcomeScreen';
import { OnboardingQuestionsScreen } from '../screens/onboarding/OnboardingQuestionsScreen';
import { OnboardingTimeScreen } from '../screens/onboarding/OnboardingTimeScreen';
import { OnboardingDaysScreen } from '../screens/onboarding/OnboardingDaysScreen';
import { OnboardingWallpaperScreen } from '../screens/onboarding/OnboardingWallpaperScreen';
import { OnboardingSoundScreen } from '../screens/onboarding/OnboardingSoundScreen';
import { OnboardingChallengeScreen } from '../screens/onboarding/OnboardingChallengeScreen';
import { OnboardingTestAlarmScreen } from '../screens/onboarding/OnboardingTestAlarmScreen';
import { OnboardingPreviewScreen } from '../screens/onboarding/OnboardingPreviewScreen';
import { OnboardingPermissionsScreen } from '../screens/onboarding/OnboardingPermissionsScreen';
import { OnboardingSetupIntroScreen } from '../screens/onboarding/OnboardingSetupIntroScreen';
import { OnboardingPaywallScreen } from '../screens/onboarding/OnboardingPaywallScreen';
import { SpecialOfferScreen } from '../screens/SpecialOfferScreen';
import { ScorecardScreen } from '../screens/ScorecardScreen';
import { Alarm } from '../types';
import { Storage } from '../utils/storage';
import { useTheme } from '../context/ThemeContext';

export type RootStackParamList = {
  Home: undefined;
  CreateAlarm: { alarm?: Alarm };
  AlarmRing: { alarmId: string };
  Settings: undefined;
  OnboardingWelcome: undefined;
  OnboardingQuestions: undefined;
  OnboardingSetupIntro: undefined;
  OnboardingTime: undefined;
  OnboardingDays: undefined;
  OnboardingWallpaper: undefined;
  OnboardingSound: undefined;
  OnboardingPermissions: undefined;
  OnboardingChallenge: undefined;
  OnboardingTestAlarm: undefined;
  OnboardingPreview: undefined;
  OnboardingPaywall: undefined;
  SpecialOffer: undefined;
  Scorecard: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

interface AppNavigatorProps {
  navigationRef?: React.RefObject<NavigationContainerRef<RootStackParamList> | null>;
  onReady?: () => void;
}

export const AppNavigator: React.FC<AppNavigatorProps> = ({ navigationRef, onReady }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState<boolean | null>(null);
  const { colors } = useTheme();

  useEffect(() => {
    const checkOnboarding = async () => {
      try {
        console.log('DEBUG: Checking Onboarding Status...');
        const completed = await Storage.getHasCompletedOnboarding();
        console.log('DEBUG: Onboarding completed =', completed);
        setHasCompletedOnboarding(completed);
      } catch (e) {
        console.error('DEBUG: Failed to load onboarding status', e);
        setHasCompletedOnboarding(false);
      } finally {
        console.log('DEBUG: AppNavigator Ready.');
        setIsLoading(false);
      }
    };
    checkOnboarding();
  }, []);

  useEffect(() => {
    if (!isLoading) {
      onReady?.();
    }
  }, [isLoading, onReady]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  const shouldShowOnboarding = !hasCompletedOnboarding;

  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator
        initialRouteName={shouldShowOnboarding ? 'OnboardingWelcome' : 'Home'}
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
        }}
      >
        {/* Onboarding Stack */}
        <Stack.Screen name="OnboardingWelcome" component={OnboardingWelcomeScreen} />
        <Stack.Screen name="OnboardingQuestions" component={OnboardingQuestionsScreen} />
        <Stack.Screen name="OnboardingSetupIntro" component={OnboardingSetupIntroScreen} />
        <Stack.Screen name="OnboardingTime" component={OnboardingTimeScreen} />
        <Stack.Screen name="OnboardingDays" component={OnboardingDaysScreen} />
        <Stack.Screen name="OnboardingWallpaper" component={OnboardingWallpaperScreen} />
        <Stack.Screen name="OnboardingSound" component={OnboardingSoundScreen} />
        <Stack.Screen name="OnboardingPermissions" component={OnboardingPermissionsScreen} />
        <Stack.Screen name="OnboardingChallenge" component={OnboardingChallengeScreen} />
        <Stack.Screen name="OnboardingTestAlarm" component={OnboardingTestAlarmScreen} />
        <Stack.Screen name="OnboardingPreview" component={OnboardingPreviewScreen} />
        <Stack.Screen name="OnboardingPaywall" component={OnboardingPaywallScreen} />

        {/* Main App Stack */}
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="CreateAlarm" component={CreateAlarmScreen} />
        <Stack.Screen
          name="AlarmRing"
          component={AlarmRingScreen}
          options={{
            presentation: 'fullScreenModal',
            animation: 'fade',
            gestureEnabled: false,
          }}
        />
        <Stack.Screen name="Settings" component={SettingsScreen} />
        <Stack.Screen
          name="SpecialOffer"
          component={SpecialOfferScreen}
          options={{
            presentation: 'fullScreenModal',
            animation: 'slide_from_bottom',
          }}
        />
        <Stack.Screen name="Scorecard" component={ScorecardScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
=======
import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer, NavigationContainerRef } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { HomeScreen } from '../screens/HomeScreen';
import { CreateAlarmScreen } from '../screens/CreateAlarmScreen';
import { AlarmRingScreen } from '../screens/AlarmRingScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { OnboardingWelcomeScreen } from '../screens/onboarding/OnboardingWelcomeScreen';
import { OnboardingQuestionsScreen } from '../screens/onboarding/OnboardingQuestionsScreen';
import { OnboardingTimeScreen } from '../screens/onboarding/OnboardingTimeScreen';
import { OnboardingDaysScreen } from '../screens/onboarding/OnboardingDaysScreen';
import { OnboardingWallpaperScreen } from '../screens/onboarding/OnboardingWallpaperScreen';
import { OnboardingSoundScreen } from '../screens/onboarding/OnboardingSoundScreen';
import { OnboardingChallengeScreen } from '../screens/onboarding/OnboardingChallengeScreen';
import { OnboardingTestAlarmScreen } from '../screens/onboarding/OnboardingTestAlarmScreen';
import { OnboardingPreviewScreen } from '../screens/onboarding/OnboardingPreviewScreen';
import { OnboardingPermissionsScreen } from '../screens/onboarding/OnboardingPermissionsScreen';
import { OnboardingSetupIntroScreen } from '../screens/onboarding/OnboardingSetupIntroScreen';
import { OnboardingPaywallScreen } from '../screens/onboarding/OnboardingPaywallScreen';
import { SpecialOfferScreen } from '../screens/SpecialOfferScreen';
import { ScorecardScreen } from '../screens/ScorecardScreen';
import { Alarm } from '../types';
import { Storage } from '../utils/storage';
import { useTheme } from '../context/ThemeContext';

export type RootStackParamList = {
  Home: undefined;
  CreateAlarm: { alarm?: Alarm };
  AlarmRing: { alarmId: string };
  Settings: undefined;
  OnboardingWelcome: undefined;
  OnboardingQuestions: undefined;
  OnboardingSetupIntro: undefined;
  OnboardingTime: undefined;
  OnboardingDays: undefined;
  OnboardingWallpaper: undefined;
  OnboardingSound: undefined;
  OnboardingPermissions: undefined;
  OnboardingChallenge: undefined;
  OnboardingTestAlarm: undefined;
  OnboardingPreview: undefined;
  OnboardingPaywall: undefined;
  SpecialOffer: undefined;
  Scorecard: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

interface AppNavigatorProps {
  navigationRef?: React.RefObject<NavigationContainerRef<RootStackParamList> | null>;
  onReady?: () => void;
}

export const AppNavigator: React.FC<AppNavigatorProps> = ({ navigationRef, onReady }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState<boolean | null>(null);
  const { colors } = useTheme();

  useEffect(() => {
    const checkOnboarding = async () => {
      try {
        console.log('DEBUG: Checking Onboarding Status...');
        const completed = await Storage.getHasCompletedOnboarding();
        console.log('DEBUG: Onboarding completed =', completed);
        setHasCompletedOnboarding(completed);
      } catch (e) {
        console.error('DEBUG: Failed to load onboarding status', e);
        setHasCompletedOnboarding(false);
      } finally {
        console.log('DEBUG: AppNavigator Ready.');
        setIsLoading(false);
      }
    };
    checkOnboarding();
  }, []);

  useEffect(() => {
    if (!isLoading) {
      onReady?.();
    }
  }, [isLoading, onReady]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  const shouldShowOnboarding = !hasCompletedOnboarding;

  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator
        initialRouteName={shouldShowOnboarding ? 'OnboardingWelcome' : 'Home'}
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
        }}
      >
        {/* Onboarding Stack */}
        <Stack.Screen name="OnboardingWelcome" component={OnboardingWelcomeScreen} />
        <Stack.Screen name="OnboardingQuestions" component={OnboardingQuestionsScreen} />
        <Stack.Screen name="OnboardingSetupIntro" component={OnboardingSetupIntroScreen} />
        <Stack.Screen name="OnboardingTime" component={OnboardingTimeScreen} />
        <Stack.Screen name="OnboardingDays" component={OnboardingDaysScreen} />
        <Stack.Screen name="OnboardingWallpaper" component={OnboardingWallpaperScreen} />
        <Stack.Screen name="OnboardingSound" component={OnboardingSoundScreen} />
        <Stack.Screen name="OnboardingPermissions" component={OnboardingPermissionsScreen} />
        <Stack.Screen name="OnboardingChallenge" component={OnboardingChallengeScreen} />
        <Stack.Screen name="OnboardingTestAlarm" component={OnboardingTestAlarmScreen} />
        <Stack.Screen name="OnboardingPreview" component={OnboardingPreviewScreen} />
        <Stack.Screen name="OnboardingPaywall" component={OnboardingPaywallScreen} />

        {/* Main App Stack */}
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="CreateAlarm" component={CreateAlarmScreen} />
        <Stack.Screen
          name="AlarmRing"
          component={AlarmRingScreen}
          options={{
            presentation: 'fullScreenModal',
            animation: 'fade',
            gestureEnabled: false,
          }}
        />
        <Stack.Screen name="Settings" component={SettingsScreen} />
        <Stack.Screen
          name="SpecialOffer"
          component={SpecialOfferScreen}
          options={{
            presentation: 'fullScreenModal',
            animation: 'slide_from_bottom',
          }}
        />
        <Stack.Screen name="Scorecard" component={ScorecardScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
>>>>>>> origin/main
};