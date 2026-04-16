import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { useTheme } from '../../context/ThemeContext';
import { ProgressBar } from '../../components/onboarding/ProgressBar';
import { useOnboarding } from '../../context/OnboardingContext';
import { ALARM_SOUNDS, SOUND_ASSETS, SOUND_META, CATEGORIES } from '../../constants/sounds';
import { Audio } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type Props = NativeStackScreenProps<RootStackParamList, 'OnboardingSound'>;



/* ── Animated equalizer bars ─────────────────────────────────────────── */
const EqBars: React.FC<{ color: string; playing: boolean }> = ({ color, playing }) => {
  const bars = [useRef(new Animated.Value(0.3)).current,
                useRef(new Animated.Value(0.6)).current,
                useRef(new Animated.Value(1.0)).current];

  useEffect(() => {
    if (playing) {
      const anims = bars.map((bar, i) =>
        Animated.loop(
          Animated.sequence([
            Animated.timing(bar, { toValue: 0.2 + Math.random() * 0.8, duration: 200 + i * 80, useNativeDriver: true }),
            Animated.timing(bar, { toValue: 0.4 + Math.random() * 0.6, duration: 200 + i * 80, useNativeDriver: true }),
          ])
        )
      );
      anims.forEach(a => a.start());
      return () => anims.forEach(a => a.stop());
    } else {
      bars.forEach(b => b.setValue(0.4));
    }
  }, [playing]);

  return (
    <View style={eqStyles.wrap}>
      {bars.map((bar, i) => (
        <Animated.View
          key={i}
          style={[eqStyles.bar, { backgroundColor: color, transform: [{ scaleY: bar }] }]}
        />
      ))}
    </View>
  );
};
const eqStyles = StyleSheet.create({
  wrap: { flexDirection: 'row', alignItems: 'center', gap: 3, height: 18 },
  bar:  { width: 3, height: 16, borderRadius: 2 },
});

/* ── Main screen ─────────────────────────────────────────────────────── */
export const OnboardingSoundScreen: React.FC<Props> = ({ navigation }) => {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { state, updateState } = useOnboarding();
  const [soundObject, setSoundObject] = useState<Audio.Sound | null>(null);
  const [playingId, setPlayingId] = useState<string | null>(null);

  const stopCurrent = async () => {
    if (soundObject) {
      await soundObject.stopAsync().catch(() => {});
      await soundObject.unloadAsync().catch(() => {});
      setSoundObject(null);
    }
    setPlayingId(null);
  };

  const playPreview = async (soundId: string) => {
    await stopCurrent();

    if (playingId === soundId) return; // toggled off

    updateState({ soundId });

    const asset = SOUND_ASSETS[soundId];
    if (!asset) return;

    try {
      const { sound } = await Audio.Sound.createAsync(asset);
      setSoundObject(sound);
      await sound.playAsync();
      setPlayingId(soundId);
      sound.setOnPlaybackStatusUpdate(status => {
        if ('didJustFinish' in status && status.didJustFinish) {
          setPlayingId(null);
          setSoundObject(null);
        }
      });
    } catch (_) {}
  };

  const handleNext = async () => {
    await stopCurrent();
    navigation.navigate('OnboardingPermissions');
  };

  const groupedSounds = CATEGORIES.map(cat => ({
    category: cat,
    sounds: ALARM_SOUNDS.filter(s => SOUND_META[s.id]?.category === cat),
  }));

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <ProgressBar progress={5 / 7} />

      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Wake-up sound</Text>
        <Text style={[styles.sub, { color: colors.subtext }]}>Tap to preview. Tap again to stop.</Text>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={[styles.list, { paddingBottom: 32 }]}
        showsVerticalScrollIndicator={false}
      >
        {groupedSounds.map(({ category, sounds }) => (
          <View key={category} style={styles.section}>
            {/* Category header */}
            <Text style={[styles.categoryLabel, { color: colors.subtext }]}>{category}</Text>

            {/* Sound rows */}
            {sounds.map(sound => {
              const meta = SOUND_META[sound.id];
              const isSelected = state.soundId === sound.id;
              const isPlaying = playingId === sound.id;

              return (
                <TouchableOpacity
                  key={sound.id}
                  style={[
                    styles.row,
                    { backgroundColor: colors.surface },
                    isSelected && { backgroundColor: colors.accent + '18' },
                  ]}
                  onPress={() => playPreview(sound.id)}
                  activeOpacity={0.7}
                >
                  {/* Emoji */}
                  <Text style={styles.emoji}>{meta?.emoji ?? '🔔'}</Text>

                  {/* Text */}
                  <View style={styles.rowText}>
                    <Text style={[styles.soundName, { color: isSelected ? colors.accent : colors.text }]}>
                      {sound.name}
                    </Text>
                    <Text style={[styles.soundDesc, { color: colors.subtext }]} numberOfLines={1}>
                      {meta?.desc ?? ''}
                    </Text>
                  </View>

                  {/* Right indicator */}
                  <View style={styles.rowRight}>
                    {isPlaying ? (
                      <EqBars color={colors.accent} playing />
                    ) : isSelected ? (
                      <Ionicons name="checkmark-circle" size={20} color={colors.accent} />
                    ) : (
                      <Ionicons name="play-circle-outline" size={20} color={colors.subtext} />
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        ))}
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom + 16, 56) }]}>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: colors.accent }]}
          onPress={handleNext}
          activeOpacity={0.85}
        >
          <Text style={styles.buttonText}>Continue</Text>
          <Ionicons name="arrow-forward" size={20} color="#FFFFFF" style={{ marginLeft: 8 }} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },

  header: {
    paddingHorizontal: 24,
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
  },

  list: { paddingHorizontal: 24, gap: 0 },

  section: { marginBottom: 24 },
  categoryLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: 8,
    marginLeft: 4,
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 13,
    paddingHorizontal: 14,
    borderRadius: 14,
    marginBottom: 6,
    gap: 12,
  },

  emoji: { fontSize: 22, width: 32, textAlign: 'center' },

  rowText: { flex: 1 },
  soundName: { fontSize: 15, fontWeight: '700', marginBottom: 1 },
  soundDesc: { fontSize: 12, fontWeight: '400' },

  rowRight: { width: 28, alignItems: 'center', justifyContent: 'center' },

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
