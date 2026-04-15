import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Pressable,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { useTheme } from '../../context/ThemeContext';
import { ProgressBar } from '../../components/onboarding/ProgressBar';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type Props = NativeStackScreenProps<RootStackParamList, 'OnboardingQuestions'>;
type Option = { icon: keyof typeof Ionicons.glyphMap; text: string };

const QUESTIONS: { question: string; sub?: string; options: Option[] }[] = [
  {
    question: 'How hard is it to wake up?',
    options: [
      { icon: 'checkmark-circle', text: 'Usually fine' },
      { icon: 'cafe-outline',     text: 'A bit groggy' },
      { icon: 'alarm-outline',    text: 'I hit snooze often' },
      { icon: 'bed-outline',      text: "It's a daily struggle" },
      { icon: 'alert-circle',     text: 'I sleep through alarms' },
    ],
  },
  {
    question: "What's holding you back?",
    options: [
      { icon: 'alarm-outline',  text: 'Hitting Snooze' },
      { icon: 'phone-portrait', text: 'Phone Distraction' },
      { icon: 'moon',           text: 'Late Nights' },
      { icon: 'home-outline',   text: 'Room is too cozy' },
    ],
  },
  {
    question: 'Why do you want more discipline?',
    options: [
      { icon: 'briefcase', text: 'Work / School' },
      { icon: 'sunny',     text: 'Morning Routine' },
      { icon: 'barbell',   text: 'Gym / Fitness' },
      { icon: 'bulb',      text: 'Mental Clarity' },
    ],
  },
  {
    question: 'Rate your current discipline',
    sub: "Be honest — we've seen everything",
    options: [
      { icon: 'remove-circle',    text: '1–3: Needs Work' },
      { icon: 'radio-button-off', text: '4–7: Average' },
      { icon: 'flame',            text: '8–10: Elite' },
    ],
  },
];

/* ── Animated option card ─────────────────────────────────────────────── */
const OptionCard: React.FC<{
  option: Option;
  isSelected: boolean;
  onPress: () => void;
  colors: any;
}> = ({ option, isSelected, onPress, colors }) => {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePress = () => {
    Animated.sequence([
      Animated.timing(scale, { toValue: 0.96, duration: 80, useNativeDriver: true }),
      Animated.timing(scale, { toValue: 1,    duration: 120, useNativeDriver: true }),
    ]).start();
    onPress();
  };

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <Pressable
        onPress={handlePress}
        style={[
          styles.optionCard,
          { backgroundColor: colors.surface },
          isSelected && {
            backgroundColor: colors.accent + '18',
            borderColor: colors.accent,
            borderWidth: 1.5,
          },
        ]}
      >
        {/* Icon bubble */}
        <View
          style={[
            styles.iconBubble,
            {
              backgroundColor: isSelected
                ? colors.accent
                : colors.background,
            },
          ]}
        >
          <Ionicons
            name={option.icon}
            size={18}
            color={isSelected ? '#FFFFFF' : colors.subtext}
          />
        </View>

        {/* Label */}
        <Text
          style={[
            styles.optionText,
            { color: isSelected ? colors.accent : colors.text },
          ]}
        >
          {option.text}
        </Text>

        {/* Radio dot */}
        <View
          style={[
            styles.radioDot,
            {
              borderColor: isSelected ? colors.accent : colors.subtext + '60',
              backgroundColor: isSelected ? colors.accent : 'transparent',
            },
          ]}
        >
          {isSelected && (
            <View style={styles.radioDotInner} />
          )}
        </View>
      </Pressable>
    </Animated.View>
  );
};

/* ── Main screen ──────────────────────────────────────────────────────── */
export const OnboardingQuestionsScreen: React.FC<Props> = ({ navigation }) => {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const fadeAnim      = useRef(new Animated.Value(1)).current;
  const translateAnim = useRef(new Animated.Value(0)).current;

  const goNext = () => {
    if (selectedIdx === null) return;
    Animated.parallel([
      Animated.timing(fadeAnim,      { toValue: 0,   duration: 200, useNativeDriver: true }),
      Animated.timing(translateAnim, { toValue: -24, duration: 200, useNativeDriver: true }),
    ]).start(() => {
      if (currentStep < QUESTIONS.length - 1) {
        setCurrentStep(prev => prev + 1);
        setSelectedIdx(null);
        translateAnim.setValue(32);
        Animated.parallel([
          Animated.timing(fadeAnim,      { toValue: 1, duration: 300, useNativeDriver: true }),
          Animated.timing(translateAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
        ]).start();
      } else {
        navigation.navigate('OnboardingSetupIntro');
      }
    });
  };

  const goBack = () => {
    if (currentStep > 0) {
      Animated.parallel([
        Animated.timing(fadeAnim,      { toValue: 0,  duration: 200, useNativeDriver: true }),
        Animated.timing(translateAnim, { toValue: 32, duration: 200, useNativeDriver: true }),
      ]).start(() => {
        setCurrentStep(prev => prev - 1);
        setSelectedIdx(null);
        translateAnim.setValue(-24);
        Animated.parallel([
          Animated.timing(fadeAnim,      { toValue: 1, duration: 300, useNativeDriver: true }),
          Animated.timing(translateAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
        ]).start();
      });
    } else {
      navigation.goBack();
    }
  };

  const currentQ  = QUESTIONS[currentStep];
  const canAdvance = selectedIdx !== null;

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <ProgressBar progress={(currentStep + 1) / 7} onBack={goBack} />

      <View style={styles.inner}>
        <Animated.View
          style={[
            styles.slide,
            { opacity: fadeAnim, transform: [{ translateY: translateAnim }] },
          ]}
        >

          {/* Question */}
          <Text style={[styles.question, { color: colors.text }]}>
            {currentQ.question}
          </Text>
          {currentQ.sub && (
            <Text style={[styles.sub, { color: colors.subtext }]}>
              {currentQ.sub}
            </Text>
          )}

          {/* Options */}
          <View style={styles.options}>
            {currentQ.options.map((option, idx) => (
              <OptionCard
                key={idx}
                option={option}
                isSelected={selectedIdx === idx}
                onPress={() => setSelectedIdx(idx)}
                colors={colors}
              />
            ))}
          </View>
        </Animated.View>
      </View>

      {/* Footer */}
      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom + 16, 48) }]}>
        <TouchableOpacity
          style={[
            styles.button,
            { backgroundColor: canAdvance ? colors.accent : colors.surface },
          ]}
          onPress={goNext}
          disabled={!canAdvance}
          activeOpacity={0.85}
        >
          <Text style={[styles.buttonText, { color: canAdvance ? '#FFFFFF' : colors.subtext }]}>
            {currentStep < QUESTIONS.length - 1 ? 'Next' : 'Continue'}
          </Text>
          {canAdvance && (
            <Ionicons name="arrow-forward" size={20} color="#FFFFFF" style={{ marginLeft: 8 }} />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  inner: { flex: 1, paddingHorizontal: 24, paddingTop: 68 },
  slide: { flex: 1 },


  question: {
    fontSize: 32,
    fontWeight: '800',
    lineHeight: 38,
    marginBottom: 8,
    letterSpacing: -0.8,
    textAlign: 'center',
  },
  sub: {
    fontSize: 14,
    fontWeight: '400',
    marginBottom: 4,
    textAlign: 'center',
  },

  options: { marginTop: 28, gap: 10 },

  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 16,
    gap: 14,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },

  iconBubble: {
    width: 38,
    height: 38,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },

  optionText: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },

  /* Radio dot */
  radioDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioDotInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
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
