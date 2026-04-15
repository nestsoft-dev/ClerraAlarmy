import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Pressable,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { useTheme } from '../../context/ThemeContext';
import { ProgressBar } from '../../components/onboarding/ProgressBar';
import { useOnboarding } from '../../context/OnboardingContext';
import { DayOfWeek } from '../../types';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type Props = NativeStackScreenProps<RootStackParamList, 'OnboardingDays'>;

const DAYS: { short: string; value: DayOfWeek }[] = [
  { short: 'S', value: 0 },
  { short: 'M', value: 1 },
  { short: 'T', value: 2 },
  { short: 'W', value: 3 },
  { short: 'T', value: 4 },
  { short: 'F', value: 5 },
  { short: 'S', value: 6 },
];

const PRESETS: { label: string; days: DayOfWeek[] }[] = [
  { label: 'Weekdays', days: [1, 2, 3, 4, 5] },
  { label: 'Every day', days: [0, 1, 2, 3, 4, 5, 6] },
  { label: 'Weekends', days: [0, 6] },
];

export const OnboardingDaysScreen: React.FC<Props> = ({ navigation }) => {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { state, updateState } = useOnboarding();

  const toggleDay = (day: DayOfWeek) => {
    const isSelected = state.repeatDays.includes(day);
    if (isSelected) {
      updateState({ repeatDays: state.repeatDays.filter(d => d !== day) as DayOfWeek[] });
    } else {
      updateState({ repeatDays: [...state.repeatDays, day].sort() as DayOfWeek[] });
    }
  };

  const applyPreset = (days: DayOfWeek[]) => {
    updateState({ repeatDays: days });
  };

  const canContinue = state.repeatDays.length > 0;

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <ProgressBar progress={4 / 7} />

      <View style={styles.inner}>
        {/* Header */}
        <Text style={[styles.title, { color: colors.text }]}>Which days?</Text>
        <Text style={[styles.sub, { color: colors.subtext }]}>
          Consistency is the foundation of discipline.
        </Text>

        {/* Day bubbles */}
        <View style={styles.bubblesRow}>
          {DAYS.map((day, i) => {
            const selected = state.repeatDays.includes(day.value);
            return (
              <Pressable
                key={i}
                onPress={() => toggleDay(day.value)}
                style={({ pressed }) => [
                  styles.bubble,
                  {
                    backgroundColor: selected ? colors.accent : colors.surface,
                    opacity: pressed ? 0.7 : 1,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.bubbleText,
                    { color: selected ? '#FFFFFF' : colors.subtext },
                  ]}
                >
                  {day.short}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Preset pills */}
        <View style={styles.presetsRow}>
          {PRESETS.map(preset => {
            const isActive =
              preset.days.length === state.repeatDays.length &&
              preset.days.every(d => state.repeatDays.includes(d));
            return (
              <TouchableOpacity
                key={preset.label}
                onPress={() => applyPreset(preset.days)}
                activeOpacity={0.7}
                style={[
                  styles.preset,
                  {
                    backgroundColor: isActive ? colors.accent : 'transparent',
                    borderColor: isActive ? colors.accent : colors.surface,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.presetText,
                    { color: isActive ? '#FFFFFF' : colors.subtext },
                  ]}
                >
                  {preset.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Footer */}
      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom + 16, 56) }]}>
        <TouchableOpacity
          style={[
            styles.button,
            { backgroundColor: canContinue ? colors.accent : colors.surface },
          ]}
          onPress={() => navigation.navigate('OnboardingWallpaper')}
          disabled={!canContinue}
          activeOpacity={0.85}
        >
          <Text style={[styles.buttonText, { color: canContinue ? '#FFFFFF' : colors.subtext }]}>
            {canContinue ? 'Continue' : 'Select at least one day'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const BUBBLE_SIZE = 44;

const styles = StyleSheet.create({
  container: { flex: 1 },
  inner: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 58,
    alignItems: 'center',
  },

  title: {
    fontSize: 34,
    fontWeight: '800',
    lineHeight: 40,
    marginBottom: 10,
    letterSpacing: -0.8,
    textAlign: 'center',
  },
  sub: {
    fontSize: 15,
    fontWeight: '400',
    marginBottom: 48,
    textAlign: 'center',
  },

  /* Day bubbles */
  bubblesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 28,
  },
  bubble: {
    width: BUBBLE_SIZE,
    height: BUBBLE_SIZE,
    borderRadius: BUBBLE_SIZE / 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bubbleText: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.2,
  },

  /* Preset pills */
  presetsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  preset: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 100,
    borderWidth: 1.5,
  },
  presetText: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.1,
  },

  /* Footer */
  footer: { paddingHorizontal: 24 },
  button: {
    height: 60,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
});
