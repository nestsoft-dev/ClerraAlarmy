import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { useTheme } from '../../context/ThemeContext';
import { useOnboarding } from '../../context/OnboardingContext';
import { useAlarm } from '../../context/AlarmContext';
import { Storage } from '../../utils/storage';
import * as Notifications from 'expo-notifications';
import { AlarmItem } from '../../components/AlarmItem';
import { Alarm } from '../../types';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type Props = NativeStackScreenProps<RootStackParamList, 'OnboardingPreview'>;

const CHECKLIST: { icon: keyof typeof Ionicons.glyphMap; getLabel: (alarm: Alarm) => string }[] = [
  { icon: 'notifications', getLabel: a => `${a.time} — Alarm rings` },
  { icon: 'flash',          getLabel: a => `Complete ${a.challengeTypes?.[0] ?? 'challenge'} mission` },
  { icon: 'checkmark-done', getLabel: _ => "You're up. Day started." },
];

export const OnboardingPreviewScreen: React.FC<Props> = ({ navigation }) => {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { state, buildAlarm } = useOnboarding();
  const { addAlarm } = useAlarm();
  const [saving, setSaving] = useState(false);

  const handleFinish = () => {
    navigation.navigate('OnboardingPaywall');
  };

  const previewAlarm: Alarm = {
    ...buildAlarm(),
    id: 'preview',
    createdAt: Date.now(),
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <View style={styles.inner}>
        {/* Header */}
        <View style={styles.header}>
          <View style={[styles.iconCircle, { backgroundColor: colors.accent }]}>
            <Ionicons name="checkmark" size={32} color="#FFFFFF" />
          </View>
          <Text style={[styles.title, { color: colors.text }]}>Your alarm is armed.</Text>
          <Text style={[styles.sub, { color: colors.subtext }]}>
            No snooze. No excuses.{'\n'}Here's what tomorrow looks like.
          </Text>
        </View>

        {/* Real AlarmItem preview */}
        <View style={styles.previewContainer} pointerEvents="none">
          <AlarmItem
            alarm={previewAlarm}
            onToggle={() => {}}
            onPress={() => {}}
            onDelete={() => {}}
          />
        </View>

        {/* Timeline checklist */}
        <View style={[styles.checklist, { backgroundColor: colors.surface }]}>
          <Text style={[styles.checklistTitle, { color: colors.subtext }]}>HERE'S TOMORROW</Text>
          {CHECKLIST.map((item, i) => (
            <View key={i} style={styles.checklistRow}>
              <View style={[styles.checklistDot, { backgroundColor: colors.text }]}>
                <Ionicons name={item.icon} size={16} color={colors.background} />
              </View>
              {i < CHECKLIST.length - 1 && (
                <View style={[styles.connector, { backgroundColor: colors.border }]} />
              )}
              <Text style={[styles.checklistText, { color: colors.text }]}>
                {item.getLabel(previewAlarm)}
              </Text>
            </View>
          ))}
        </View>
      </View>

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom + 16, 56) }]}>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: colors.accent }]}
          onPress={handleFinish}
          disabled={saving}
          activeOpacity={0.85}
        >
          <Text style={styles.buttonText}>{saving ? 'Saving...' : 'Continue'}</Text>
          {!saving && <Ionicons name="arrow-forward" size={20} color="#FFFFFF" style={{ marginLeft: 8 }} />}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  inner: { flex: 1, paddingHorizontal: 24, paddingTop: 24 },
  header: { alignItems: 'center', marginBottom: 28 },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 18,
  },
  title: { fontSize: 30, fontWeight: '900', letterSpacing: -0.8, textAlign: 'center', marginBottom: 10 },
  sub: { fontSize: 15, textAlign: 'center', lineHeight: 22, fontWeight: '400' },
  previewContainer: { width: '100%', marginBottom: 16 },
  checklist: {
    borderRadius: 16,
    padding: 20,
  },
  checklistTitle: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 16,
  },
  checklistRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 16,
    position: 'relative',
  },
  checklistDot: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  connector: {
    position: 'absolute',
    left: 18,
    top: 38,
    width: 2,
    height: 20,
  },
  checklistText: { fontSize: 15, fontWeight: '600', flex: 1 },
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
