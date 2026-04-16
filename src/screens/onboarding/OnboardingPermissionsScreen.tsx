<<<<<<< HEAD
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { useTheme } from '../../context/ThemeContext';
import { ProgressBar } from '../../components/onboarding/ProgressBar';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Notifications from 'expo-notifications';

type Props = NativeStackScreenProps<RootStackParamList, 'OnboardingPermissions'>;

export const OnboardingPermissionsScreen: React.FC<Props> = ({ navigation }) => {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(false);

  const handleNext = () => {
    navigation.navigate('OnboardingChallenge');
  };

  const requestPermission = async () => {
    setLoading(true);
    try {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status === 'granted') {
        handleNext();
      } else {
        Alert.alert(
          "Notifications Disabled",
          "Without notifications, your alarms will not sound correctly. You can enable them later in Settings.",
          [{ text: "Continue anyway", onPress: handleNext }]
        );
      }
    } catch (error) {
      console.error('Permission error:', error);
      handleNext();
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <ProgressBar progress={5 / 7} />

      <View style={styles.content}>
        <View style={[styles.iconContainer, { backgroundColor: colors.surface }]}>
          <Ionicons name="notifications" size={60} color={colors.accent} />
        </View>

        <Text style={[styles.title, { color: colors.text }]}>
          Don't Miss Your{'\n'}Wake-up Call
        </Text>
        
        <Text style={[styles.sub, { color: colors.subtext }]}>
          To fire your alarm and challenges reliably, we need your permission to send notifications. This is the only way Clerra can wake you up.
        </Text>

        <View style={styles.benefits}>
          <View style={styles.benefitRow}>
            <Ionicons name="checkmark-circle" size={20} color={colors.accent} />
            <Text style={[styles.benefitText, { color: colors.text }]}>Alarms sound in the background</Text>
          </View>
          <View style={styles.benefitRow}>
            <Ionicons name="checkmark-circle" size={20} color={colors.accent} />
            <Text style={[styles.benefitText, { color: colors.text }]}>Dynamic challenges fire on lock screen</Text>
          </View>
        </View>
      </View>

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom + 16, 56) }]}>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: colors.accent }]}
          onPress={requestPermission}
          activeOpacity={0.85}
          disabled={loading}
        >
          <Text style={styles.buttonText}>Enable Notifications</Text>
          <Ionicons name="arrow-forward" size={20} color="#FFFFFF" style={{ marginLeft: 8 }} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.skipButton}
          onPress={handleNext}
          activeOpacity={0.7}
        >
          <Text style={[styles.skipText, { color: colors.subtext }]}>Maybe later</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: {
    flex: 1,
    paddingHorizontal: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 34,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 16,
    letterSpacing: -1,
    lineHeight: 40,
  },
  sub: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    marginBottom: 32,
    fontWeight: '400',
  },
  benefits: {
    alignSelf: 'stretch',
    gap: 16,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  benefitText: {
    fontSize: 15,
    fontWeight: '600',
  },
  footer: { paddingHorizontal: 24, gap: 12 },
  button: {
    height: 60,
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: { fontSize: 18, fontWeight: '800', color: '#FFFFFF', letterSpacing: -0.3 },
  skipButton: {
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  skipText: {
    fontSize: 15,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});
=======
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { useTheme } from '../../context/ThemeContext';
import { ProgressBar } from '../../components/onboarding/ProgressBar';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Notifications from 'expo-notifications';

type Props = NativeStackScreenProps<RootStackParamList, 'OnboardingPermissions'>;

export const OnboardingPermissionsScreen: React.FC<Props> = ({ navigation }) => {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(false);

  const handleNext = () => {
    navigation.navigate('OnboardingChallenge');
  };

  const requestPermission = async () => {
    setLoading(true);
    try {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status === 'granted') {
        handleNext();
      } else {
        Alert.alert(
          "Notifications Disabled",
          "Without notifications, your alarms will not sound correctly. You can enable them later in Settings.",
          [{ text: "Continue anyway", onPress: handleNext }]
        );
      }
    } catch (error) {
      console.error('Permission error:', error);
      handleNext();
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <ProgressBar progress={5 / 7} />

      <View style={styles.content}>
        <View style={[styles.iconContainer, { backgroundColor: colors.surface }]}>
          <Ionicons name="notifications" size={60} color={colors.accent} />
        </View>

        <Text style={[styles.title, { color: colors.text }]}>
          Don't Miss Your{'\n'}Wake-up Call
        </Text>
        
        <Text style={[styles.sub, { color: colors.subtext }]}>
          To fire your alarm and challenges reliably, we need your permission to send notifications. This is the only way Clerra can wake you up.
        </Text>

        <View style={styles.benefits}>
          <View style={styles.benefitRow}>
            <Ionicons name="checkmark-circle" size={20} color={colors.accent} />
            <Text style={[styles.benefitText, { color: colors.text }]}>Alarms sound in the background</Text>
          </View>
          <View style={styles.benefitRow}>
            <Ionicons name="checkmark-circle" size={20} color={colors.accent} />
            <Text style={[styles.benefitText, { color: colors.text }]}>Dynamic challenges fire on lock screen</Text>
          </View>
        </View>
      </View>

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom + 16, 56) }]}>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: colors.accent }]}
          onPress={requestPermission}
          activeOpacity={0.85}
          disabled={loading}
        >
          <Text style={styles.buttonText}>Enable Notifications</Text>
          <Ionicons name="arrow-forward" size={20} color="#FFFFFF" style={{ marginLeft: 8 }} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.skipButton}
          onPress={handleNext}
          activeOpacity={0.7}
        >
          <Text style={[styles.skipText, { color: colors.subtext }]}>Maybe later</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: {
    flex: 1,
    paddingHorizontal: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 34,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 16,
    letterSpacing: -1,
    lineHeight: 40,
  },
  sub: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    marginBottom: 32,
    fontWeight: '400',
  },
  benefits: {
    alignSelf: 'stretch',
    gap: 16,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  benefitText: {
    fontSize: 15,
    fontWeight: '600',
  },
  footer: { paddingHorizontal: 24, gap: 12 },
  button: {
    height: 60,
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: { fontSize: 18, fontWeight: '800', color: '#FFFFFF', letterSpacing: -0.3 },
  skipButton: {
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  skipText: {
    fontSize: 15,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});
>>>>>>> origin/main
