import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { useTheme } from '../../context/ThemeContext';
import { ProgressBar } from '../../components/onboarding/ProgressBar';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useOnboarding } from '../../context/OnboardingContext';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type Props = NativeStackScreenProps<RootStackParamList, 'OnboardingTime'>;

type TimeContext = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  sub: string;
};

const getTimeContext = (hours: number): TimeContext => {
  if (hours < 5)  return { icon: 'moon',         label: 'Night Owl',       sub: 'Rare and dedicated.' };
  if (hours < 8)  return { icon: 'sunny',         label: 'Early Bird',      sub: 'Top 10% of disciplined people.' };
  if (hours < 10) return { icon: 'partly-sunny',  label: 'Morning Warrior', sub: 'The golden hour.' };
  if (hours < 12) return { icon: 'cloud',         label: 'Late Morning',    sub: 'Still a great start.' };
  return               { icon: 'cafe',            label: 'Afternoon Start', sub: "Let's work on that." };
};

export const OnboardingTimeScreen: React.FC<Props> = ({ navigation }) => {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { updateState } = useOnboarding();
  const [date, setDate] = useState(() => {
    const d = new Date();
    d.setHours(7, 0, 0, 0);
    return d;
  });

  const handleNext = () => {
    const hours   = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    updateState({ time: `${hours}:${minutes}` });
    navigation.navigate('OnboardingDays');
  };

  const ctx = getTimeContext(date.getHours());

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <ProgressBar progress={3 / 7} />

      <View style={styles.inner}>
        <Text style={[styles.title, { color: colors.text }]}>
          What time do you{"\n"}want to wake up?
        </Text>
        <Text style={[styles.sub, { color: colors.subtext }]}>
          ClerraAlarm will make sure you actually get up.
        </Text>

        <View style={styles.pickerWrapper}>
          <DateTimePicker
            testID="dateTimePicker"
            value={date}
            mode="time"
            display="spinner"
            onChange={(_, selectedDate) => {
              if (selectedDate) setDate(selectedDate);
            }}
            textColor={colors.text}
          />
        </View>

        {/* Context card */}
        <View style={[styles.contextCard, { backgroundColor: colors.surface }]}>
          <View style={[styles.contextIconBg, { backgroundColor: colors.accent }]}>
            <Ionicons name={ctx.icon} size={22} color="#FFFFFF" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.contextLabel, { color: colors.accent }]}>{ctx.label}</Text>
            <Text style={[styles.contextSub, { color: colors.subtext }]}>{ctx.sub}</Text>
          </View>
        </View>
      </View>

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom + 16, 56) }]}>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: colors.accent }]}
          onPress={handleNext}
          activeOpacity={0.85}
        >
          <Text style={styles.buttonText}>Next</Text>
          <Ionicons name="arrow-forward" size={20} color="#FFFFFF" style={{ marginLeft: 8 }} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  inner: { flex: 1, paddingHorizontal: 24, paddingTop: 58 },
  title: { fontSize: 30, fontWeight: '800', lineHeight: 37, marginBottom: 10, letterSpacing: -0.8, textAlign: 'center' },
  sub: { fontSize: 15, fontWeight: '400', marginBottom: 8, textAlign: 'center' },
  pickerWrapper: { alignItems: 'center', marginVertical: 16 },
  contextCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    gap: 14,
    marginTop: 8,
  },
  contextIconBg: {
    width: 46,
    height: 46,
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contextLabel: { fontSize: 16, fontWeight: '800', marginBottom: 2 },
  contextSub: { fontSize: 13, fontWeight: '400' },
  footer: { paddingHorizontal: 24 },
  button: {
    height: 60,
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: { fontSize: 18, fontWeight: '800', color: '#FFFFFF', letterSpacing: -0.3 },
});
