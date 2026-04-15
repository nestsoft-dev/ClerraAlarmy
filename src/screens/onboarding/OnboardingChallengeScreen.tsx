import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { useTheme } from '../../context/ThemeContext';
import { ProgressBar } from '../../components/onboarding/ProgressBar';
import { useOnboarding } from '../../context/OnboardingContext';
import { ChallengeType } from '../../types';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type Props = NativeStackScreenProps<RootStackParamList, 'OnboardingChallenge'>;

const { width: SCREEN_W } = Dimensions.get('window');
const CARD_GAP = 12;
const H_PAD = 24;
const CARD_W = (SCREEN_W - H_PAD * 2 - CARD_GAP) / 2;

const CHALLENGES: {
  type: ChallengeType;
  emoji: string;
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  desc: string;
  intensity: 'Easy' | 'Medium' | 'Hard';
}[] = [
  { type: 'math',       emoji: '🧮', icon: 'calculator',       title: 'Math',         desc: 'Solve equations',              intensity: 'Medium' },
  { type: 'shake',      emoji: '📳', icon: 'phone-portrait',   title: 'Shake',        desc: 'Shake your phone hard',         intensity: 'Easy'   },
  { type: 'riddle',     emoji: '🧩', icon: 'help-circle',      title: 'Riddle',       desc: 'Outsmart the alarm',            intensity: 'Medium' },
  { type: 'photo',      emoji: '📸', icon: 'camera',           title: 'Photo Scan',   desc: 'Scan a physical target',        intensity: 'Hard'   },
  { type: 'pushup',     emoji: '💪', icon: 'barbell',          title: 'Push-ups',     desc: 'Get your body moving',          intensity: 'Hard'   },
  { type: 'jump',       emoji: '🦘', icon: 'trending-up',      title: 'Jumping Jacks', desc: 'Move to wake up',             intensity: 'Medium' },
  { type: 'unscramble', emoji: '🔀', icon: 'shuffle',          title: 'Unscramble',   desc: 'Rearrange scrambled words',     intensity: 'Medium' },
  { type: 'memory',     emoji: '🃏', icon: 'layers',           title: 'Memory',       desc: 'Recall a sequence',             intensity: 'Hard'   },
  { type: 'quiz',       emoji: '❓', icon: 'school',           title: 'Quiz',         desc: 'Answer trivia questions',       intensity: 'Medium' },
  { type: 'color',      emoji: '🎨', icon: 'color-palette',    title: 'Color Match',  desc: 'Match colors quickly',          intensity: 'Easy'   },
  { type: 'brush',      emoji: '🪥', icon: 'water',            title: 'Brush Teeth',  desc: 'Build a healthy habit',         intensity: 'Easy'   },
];

const INTENSITY_COLOR: Record<string, string> = {
  Easy:   '#34C759',
  Medium: '#FF9F0A',
  Hard:   '#FF3B30',
};

export const OnboardingChallengeScreen: React.FC<Props> = ({ navigation }) => {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { state, updateState } = useOnboarding();

  const selected = state.challengeTypes ?? (state.challengeType ? [state.challengeType] : []);

  const toggle = (type: ChallengeType) => {
    const already = selected.includes(type);
    const next = already
      ? selected.filter(t => t !== type)
      : [...selected, type];
    updateState({ challengeTypes: next, challengeType: next[0] });
  };

  const canContinue = selected.length > 0;

  // Pair up for 2-col grid
  const rows: (typeof CHALLENGES)[] = [];
  for (let i = 0; i < CHALLENGES.length; i += 2) {
    rows.push(CHALLENGES.slice(i, i + 2));
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <ProgressBar progress={7 / 7} />

      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Wake-up challenge</Text>
        <Text style={[styles.sub, { color: colors.subtext }]}>
          Complete this to silence the alarm. Pick one or mix several.
        </Text>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={[styles.grid, { paddingBottom: 32 }]}
        showsVerticalScrollIndicator={false}
      >
        {rows.map((pair, ri) => (
          <View key={ri} style={styles.row}>
            {pair.map(challenge => {
              const isSelected = selected.includes(challenge.type);
              return (
                <TouchableOpacity
                  key={challenge.type}
                  style={[
                    styles.card,
                    {
                      backgroundColor: colors.surface,
                      width: CARD_W,
                    },
                    isSelected && {
                      backgroundColor: colors.accent + '1A',
                      borderColor: colors.accent,
                      borderWidth: 1.5,
                    },
                  ]}
                  onPress={() => toggle(challenge.type)}
                  activeOpacity={0.75}
                >
                  {/* Selected badge */}
                  {isSelected && (
                    <View style={[styles.checkBadge, { backgroundColor: colors.accent }]}>
                      <Ionicons name="checkmark" size={11} color="#fff" />
                    </View>
                  )}

                  {/* Emoji */}
                  <Text style={styles.cardEmoji}>{challenge.emoji}</Text>

                  {/* Title */}
                  <Text
                    style={[
                      styles.cardTitle,
                      { color: isSelected ? colors.accent : colors.text },
                    ]}
                    numberOfLines={1}
                  >
                    {challenge.title}
                  </Text>

                  {/* Desc */}
                  <Text
                    style={[styles.cardDesc, { color: colors.subtext }]}
                    numberOfLines={2}
                  >
                    {challenge.desc}
                  </Text>

                  {/* Intensity pill */}
                  <View
                    style={[
                      styles.intensityPill,
                      { backgroundColor: INTENSITY_COLOR[challenge.intensity] + '22' },
                    ]}
                  >
                    <Text
                      style={[
                        styles.intensityText,
                        { color: INTENSITY_COLOR[challenge.intensity] },
                      ]}
                    >
                      {challenge.intensity}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}

            {/* Fill empty slot if odd row */}
            {pair.length === 1 && <View style={{ width: CARD_W }} />}
          </View>
        ))}
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom + 16, 56) }]}>
        {selected.length > 1 && (
          <Text style={[styles.mixNote, { color: colors.subtext }]}>
            {selected.length} challenges — one picked randomly each alarm
          </Text>
        )}
        <TouchableOpacity
          style={[
            styles.button,
            { backgroundColor: canContinue ? colors.accent : colors.surface },
          ]}
          onPress={() => navigation.navigate('OnboardingTestAlarm')}
          disabled={!canContinue}
          activeOpacity={0.85}
        >
          <Text style={[styles.buttonText, { color: canContinue ? '#FFFFFF' : colors.subtext }]}>
            {canContinue ? 'Review Alarm' : 'Pick a challenge'}
          </Text>
          {canContinue && (
            <Ionicons name="arrow-forward" size={20} color="#FFFFFF" style={{ marginLeft: 8 }} />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },

  header: {
    paddingHorizontal: H_PAD,
    paddingTop: 58,
    paddingBottom: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 34,
    fontWeight: '800',
    letterSpacing: -0.8,
    textAlign: 'center',
    marginBottom: 8,
  },
  sub: {
    fontSize: 14,
    fontWeight: '400',
    textAlign: 'center',
    lineHeight: 20,
  },

  grid: {
    paddingHorizontal: H_PAD,
    gap: CARD_GAP,
  },
  row: {
    flexDirection: 'row',
    gap: CARD_GAP,
  },

  card: {
    borderRadius: 18,
    padding: 16,
    minHeight: 150,
    justifyContent: 'flex-start',
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 1.5,
    borderColor: 'transparent',
  },

  checkBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },

  cardEmoji: {
    fontSize: 30,
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 4,
    letterSpacing: -0.2,
  },
  cardDesc: {
    fontSize: 11,
    fontWeight: '400',
    lineHeight: 15,
    marginBottom: 10,
  },

  intensityPill: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 100,
  },
  intensityText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.3,
  },

  footer: { paddingHorizontal: H_PAD },
  mixNote: {
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 10,
  },
  button: {
    height: 60,
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: { fontSize: 18, fontWeight: '800', letterSpacing: -0.3 },
});
