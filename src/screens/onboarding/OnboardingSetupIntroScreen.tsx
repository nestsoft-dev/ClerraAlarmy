<<<<<<< HEAD
import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { useTheme } from '../../context/ThemeContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AlarmItem } from '../../components/AlarmItem';
import { Alarm } from '../../types';

type Props = NativeStackScreenProps<RootStackParamList, 'OnboardingSetupIntro'>;

const MOCK_ALARM_1: Alarm = {
  id: 'mock1',
  time: '07:30',
  enabled: true,
  repeatDays: [1, 2, 3, 4, 5],
  disciplineMode: false,
  soundId: 'radar',
  challengeType: 'math',
  createdAt: Date.now(),
  label: 'Work Days',
};

const MOCK_ALARM_2: Alarm = {
  id: 'mock2',
  time: '10:00',
  enabled: true,
  repeatDays: [0, 6],
  disciplineMode: false,
  soundId: 'radar',
  challengeType: 'photo',
  createdAt: Date.now(),
  label: 'Weekend Sleep In',
};

export const OnboardingSetupIntroScreen: React.FC<Props> = ({ navigation }) => {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  // Simple Entrance Animation
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacityAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <View style={styles.content}>
        <Animated.View style={[styles.cardsContainer, { opacity: opacityAnim, transform: [{ translateY: slideAnim }] }]}>
          {/* Top Card */}
          <View style={{ width: '100%', transform: [{ rotate: '-3deg' }], marginBottom: 4 }}>
            <AlarmItem 
              alarm={MOCK_ALARM_1}
              onToggle={() => {}}
              onPress={() => {}}
              onDelete={() => {}}
            />
          </View>

          {/* Bottom Card */}
          <View style={{ width: '100%', transform: [{ rotate: '2deg' }] }}>
            <AlarmItem 
              alarm={MOCK_ALARM_2}
              onToggle={() => {}}
              onPress={() => {}}
              onDelete={() => {}}
            />
          </View>
        </Animated.View>

        <Animated.View style={[styles.textContainer, { opacity: opacityAnim, transform: [{ translateY: slideAnim }] }]}>
          <Text style={[styles.title, { color: colors.text }]}>Let's set up{"\n"}your first alarm</Text>
          <Text style={[styles.subtitle, { color: colors.subtext }]}>We'll ask a few questions{"\n"}to personalize your experience.</Text>
        </Animated.View>
      </View>

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom + 16, 48) }]}>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: colors.accent }]}
          onPress={() => navigation.navigate('OnboardingTime')}
          activeOpacity={0.85}
        >
           <Text style={[styles.buttonText, { color: '#FFFFFF' }]}>Get Started</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, justifyContent: 'center', paddingHorizontal: 24, marginTop: -20 },
  cardsContainer: {
    alignItems: 'stretch',
    marginBottom: 40,
    width: '100%',
    paddingHorizontal: 8,
  },
  textContainer: {
    alignItems: 'center',
  },
  title: {
    fontSize: 34,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 16,
    letterSpacing: -0.5,
    lineHeight: 40,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  footer: { paddingHorizontal: 24 },
  button: {
    height: 60,
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: { fontSize: 18, fontWeight: '800', letterSpacing: -0.3 },
});
=======
import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { useTheme } from '../../context/ThemeContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AlarmItem } from '../../components/AlarmItem';
import { Alarm } from '../../types';

type Props = NativeStackScreenProps<RootStackParamList, 'OnboardingSetupIntro'>;

const MOCK_ALARM_1: Alarm = {
  id: 'mock1',
  time: '07:30',
  enabled: true,
  repeatDays: [1, 2, 3, 4, 5],
  disciplineMode: false,
  soundId: 'radar',
  challengeType: 'math',
  createdAt: Date.now(),
  label: 'Work Days',
};

const MOCK_ALARM_2: Alarm = {
  id: 'mock2',
  time: '10:00',
  enabled: true,
  repeatDays: [0, 6],
  disciplineMode: false,
  soundId: 'radar',
  challengeType: 'photo',
  createdAt: Date.now(),
  label: 'Weekend Sleep In',
};

export const OnboardingSetupIntroScreen: React.FC<Props> = ({ navigation }) => {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  // Simple Entrance Animation
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacityAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <View style={styles.content}>
        <Animated.View style={[styles.cardsContainer, { opacity: opacityAnim, transform: [{ translateY: slideAnim }] }]}>
          {/* Top Card */}
          <View style={{ width: '100%', transform: [{ rotate: '-3deg' }], marginBottom: 4 }}>
            <AlarmItem 
              alarm={MOCK_ALARM_1}
              onToggle={() => {}}
              onPress={() => {}}
              onDelete={() => {}}
            />
          </View>

          {/* Bottom Card */}
          <View style={{ width: '100%', transform: [{ rotate: '2deg' }] }}>
            <AlarmItem 
              alarm={MOCK_ALARM_2}
              onToggle={() => {}}
              onPress={() => {}}
              onDelete={() => {}}
            />
          </View>
        </Animated.View>

        <Animated.View style={[styles.textContainer, { opacity: opacityAnim, transform: [{ translateY: slideAnim }] }]}>
          <Text style={[styles.title, { color: colors.text }]}>Let's set up{"\n"}your first alarm</Text>
          <Text style={[styles.subtitle, { color: colors.subtext }]}>We'll ask a few questions{"\n"}to personalize your experience.</Text>
        </Animated.View>
      </View>

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom + 16, 48) }]}>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: colors.accent }]}
          onPress={() => navigation.navigate('OnboardingTime')}
          activeOpacity={0.85}
        >
           <Text style={[styles.buttonText, { color: '#FFFFFF' }]}>Get Started</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, justifyContent: 'center', paddingHorizontal: 24, marginTop: -20 },
  cardsContainer: {
    alignItems: 'stretch',
    marginBottom: 40,
    width: '100%',
    paddingHorizontal: 8,
  },
  textContainer: {
    alignItems: 'center',
  },
  title: {
    fontSize: 34,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 16,
    letterSpacing: -0.5,
    lineHeight: 40,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  footer: { paddingHorizontal: 24 },
  button: {
    height: 60,
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: { fontSize: 18, fontWeight: '800', letterSpacing: -0.3 },
});
>>>>>>> origin/main
