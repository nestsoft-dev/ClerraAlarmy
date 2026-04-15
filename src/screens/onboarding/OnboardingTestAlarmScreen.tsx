import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Vibration,
  Alert, BackHandler, Animated, StatusBar, SafeAreaView, AppState,
} from 'react-native';
import { VideoView, useVideoPlayer } from 'expo-video';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { Audio } from 'expo-av';
import { useTheme } from '../../context/ThemeContext';
import { useOnboarding } from '../../context/OnboardingContext';
import { ChallengeWrapper } from '../../components/ChallengeWrapper';
import { Alarm, Challenge } from '../../types';
import { SOUND_ASSETS, DEFAULT_SOUND_ID } from '../../constants/sounds';
import { BUILT_IN_BACKGROUNDS } from '../../constants/backgrounds';
import { Ionicons } from '@expo/vector-icons';
// @ts-ignore
import ConfettiCannon from 'react-native-confetti-cannon';

type Props = NativeStackScreenProps<RootStackParamList, 'OnboardingTestAlarm'>;

const CHALLENGE_LABELS: Record<string, string> = {
  math: 'Math',
  shake: 'Shake',
  photo: 'Photo',
  jump: 'Jump',
  brush: 'Brush Teeth',
  pushup: 'Push-Up',
  color: 'Find Color',
  unscramble: 'Unscramble',
  riddle: 'Riddle',
  memory: 'Memory',
  quiz: 'Quiz',
};

// ─── Video wallpaper component ─────────────────────────────────────────────
const WallpaperVideo: React.FC<{ source: any }> = ({ source }) => {
  const player = useVideoPlayer(source, p => {
    p.loop = true;
    p.muted = true;
    p.play();
  });
  return (
    <VideoView
      player={player}
      style={StyleSheet.absoluteFillObject}
      contentFit="cover"
      nativeControls={false}
    />
  );
};

export const OnboardingTestAlarmScreen: React.FC<Props> = ({ navigation }) => {
  const { colors, isDark } = useTheme();
  const { buildAlarm } = useOnboarding();
  
  const styles = getStyles(colors, isDark);

  // Mock State
  const [phase, setPhase] = useState<'intro' | 'challenge' | 'success'>('intro');
  const [showChallenge, setShowChallenge] = useState(false);
  const [challengeKey, setChallengeKey] = useState(0);
  const [failCount, setFailCount] = useState(0);
  const [currentSequenceIndex, setCurrentSequenceIndex] = useState(0);
  const [challengeSequence, setChallengeSequence] = useState<Challenge[]>([]);
  const [currentChallenge, setCurrentChallenge] = useState<Challenge | null>(null);
  const [currentDifficulty, setCurrentDifficulty] = useState(1);

  const soundRef = useRef<Audio.Sound | null>(null);
  const volumeRef = useRef(1.0);

  // Animations
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const textFadeAnim = useRef(new Animated.Value(0)).current;
  const ringExpand = useRef(new Animated.Value(1)).current;
  const challengeSlide = useRef(new Animated.Value(60)).current;
  const challengeFade = useRef(new Animated.Value(0)).current;

  const alarm = buildAlarm() as Alarm;

  // ─── Block hardware back button ───────────────────────────────────────────
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => true);
    return () => backHandler.remove();
  }, []);

  // ─── Cleanup on unmount ───────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      stopAlarmSound();
    };
  }, []);

  // ─── Restart sound when app comes back to foreground ────────────────────
  useEffect(() => {
    const sub = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'active' && hasBooted.current) {
        startAlarmSound();
      }
    });
    return () => sub.remove();
  }, []);

  // ─── Boot sequence ────────────────────────────────────────────────────────
  const hasBooted = useRef(false);

  useEffect(() => {
    if (!hasBooted.current) {
      hasBooted.current = true;
      // Initialize sequence for mock
      const sequence: Challenge[] = [];
      if (alarm.challengeTypes?.length) {
        alarm.challengeTypes.forEach(type => {
            sequence.push({ type, difficulty: 1 });
        });
      } else if (alarm.challengeType) {
        sequence.push({ type: alarm.challengeType, difficulty: 1 });
      } else {
        sequence.push({ type: 'math', difficulty: 1 });
      }
      setChallengeSequence(sequence);
      setCurrentChallenge(sequence[0]);
      
      startAlarmSound();
    }
  }, []);

  // ─── Pulse animation ──────────────────────────────────────────────────────
  useEffect(() => {
    const speed = Math.max(280, 1200 - failCount * 200);
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.15, duration: speed, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: speed, useNativeDriver: true }),
      ])
    ).start();
    Animated.loop(
      Animated.sequence([
        Animated.timing(ringExpand, { toValue: 1.4, duration: speed * 1.5, useNativeDriver: false }),
        Animated.timing(ringExpand, { toValue: 1, duration: speed * 1.5, useNativeDriver: false }),
      ])
    ).start();
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, { toValue: 1, duration: speed * 1.5, useNativeDriver: false }),
        Animated.timing(glowAnim, { toValue: 0, duration: speed * 1.5, useNativeDriver: false }),
      ])
    ).start();
  }, [failCount]);

  // ─── Intro text fade ──────────────────────────────────────────────────────
  useEffect(() => {
    Animated.timing(textFadeAnim, { toValue: 1, duration: 900, useNativeDriver: true }).start();
  }, []);

  // ─── Animate challenge in ─────────────────────────────────────────────────
  const animateChallengeIn = () => {
    challengeSlide.setValue(60);
    challengeFade.setValue(0);
    Animated.parallel([
      Animated.spring(challengeSlide, { toValue: 0, tension: 60, friction: 12, useNativeDriver: true }),
      Animated.timing(challengeFade, { toValue: 1, duration: 400, useNativeDriver: true }),
    ]).start();
  };

  const handleStartChallenge = () => {
    setShowChallenge(true);
    setPhase('challenge');
    setTimeout(() => {
      animateChallengeIn();
    }, 50);
  };

  // ─── Sound ────────────────────────────────────────────────────────────────
  const startAlarmSound = async () => {
    try {
      await stopAlarmSound();
      
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
        shouldDuckAndroid: false,
      });
      const soundId = alarm?.soundId ?? DEFAULT_SOUND_ID;
      const asset = SOUND_ASSETS[soundId] ?? SOUND_ASSETS[DEFAULT_SOUND_ID];
      const { sound } = await Audio.Sound.createAsync(asset, {
        isLooping: true, volume: 1.0, shouldPlay: true,
      });
      soundRef.current = sound;
      volumeRef.current = 1.0;
    } catch (err) {
      console.warn('Failed to start alarm sound:', err);
    }
  };

  const stopAlarmSound = async () => {
    if (soundRef.current) {
      try {
        await soundRef.current.stopAsync();
        await soundRef.current.unloadAsync();
      } catch {}
      soundRef.current = null;
    }
  };

  const handleComplete = useCallback(async () => {
    if (currentSequenceIndex + 1 < challengeSequence.length) {
      const nextIndex = currentSequenceIndex + 1;
      const nextChallenge = challengeSequence[nextIndex];
      setCurrentSequenceIndex(nextIndex);
      setCurrentChallenge(nextChallenge);
      setCurrentDifficulty(nextChallenge.difficulty);
      setFailCount(0);
      Vibration.vibrate([0, 100, 50, 100]);
      setChallengeKey(k => k + 1);
      animateChallengeIn();
    } else {
      await stopAlarmSound();
      Vibration.vibrate([0, 100, 100, 100, 100, 100]);
      setShowChallenge(false);
      setPhase('success');

      // Navigate to summary after celebration
      setTimeout(() => {
        navigation.navigate('OnboardingPreview');
      }, 3500);
    }
  }, [currentSequenceIndex, challengeSequence, navigation]);

  const handleFail = useCallback(async () => {
    setFailCount(prev => prev + 1);
    Vibration.vibrate([0, 500, 200, 500, 200, 500]);
  }, []);

  // ─── Render: Challenge ────────────────────────────────────────────────────
  if (showChallenge && currentChallenge && phase === 'challenge') {
    const challengeLabel = CHALLENGE_LABELS[currentChallenge.type] ?? currentChallenge.type;
    const failDots = Array.from({ length: 3 }, (_, i) => i < failCount);

    return (
      <Animated.View style={[styles.screen, { backgroundColor: colors.background }]}>
        <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />
        <SafeAreaView style={styles.flex}>
          <View style={[styles.challengeHeader, { backgroundColor: colors.background }]}>
            <Text style={[styles.headerTime, { color: colors.text }]}>{alarm?.time || '—'}</Text>
            <Text style={[styles.headerLabel, { color: colors.subtext }]}>{alarm?.label || 'Wake Up!'}</Text>

            <View style={styles.metaRow}>
              {challengeSequence.length > 1 && (
                <View style={styles.metaPill}>
                  <Text style={styles.metaPillText}>
                    {currentSequenceIndex + 1}/{challengeSequence.length}
                  </Text>
                </View>
              )}
              <View style={styles.metaPill}>
                <Text style={styles.metaPillText}>{challengeLabel}</Text>
              </View>
              <View style={styles.metaPill}>
                <Text style={styles.metaPillText}>
                  {'★'.repeat(currentDifficulty)}{'☆'.repeat(3 - currentDifficulty)}
                </Text>
              </View>
            </View>

            <View style={styles.failRow}>
              {failDots.map((isActive, idx) => (
                <View
                  key={idx}
                  style={[
                    styles.failDot,
                    { backgroundColor: isDark ? colors.border : 'rgba(46,30,26,0.1)', borderColor: isDark ? '#333' : 'rgba(46,30,26,0.15)' },
                    isActive && styles.failDotActive
                  ]}
                />
              ))}
            </View>
          </View>

          <Animated.View style={[styles.challengeArea, { backgroundColor: colors.background, opacity: challengeFade }]}>
            <ChallengeWrapper
              key={challengeKey}
              challenge={currentChallenge}
              onComplete={handleComplete}
              onFail={handleFail}
            />
          </Animated.View>
        </SafeAreaView>
      </Animated.View>
    );
  }

  // ─── Render: Success ──────────────────────────────────────────────────────
  if (phase === 'success') {
    return (
      <View style={[styles.screen, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}>
        <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />
        
        <Animated.View style={{ alignItems: 'center', opacity: textFadeAnim }}>
          <View style={styles.successIconWrapper}>
            <Ionicons name="checkmark-circle" size={90} color={colors.accent} />
          </View>
          <Text style={[styles.successTitle, { color: colors.text }]}>Challenge Complete</Text>
          <Text style={[styles.successSub, { color: colors.subtext }]}>
             You're ready to wake up!
          </Text>
        </Animated.View>

        <ConfettiCannon
          count={150}
          origin={{ x: -10, y: 0 }}
          autoStart={true}
          fadeOut={true}
          fallSpeed={3000}
        />
      </View>
    );
  }

  // ─── Render: Intro ────────────────────────────────────────────────────────
  if (phase === 'intro') {
    const builtIn = alarm?.backgroundId
      ? BUILT_IN_BACKGROUNDS.find(b => b.id === alarm.backgroundId)
      : undefined;

    const hasBg = !!builtIn || !!alarm?.backgroundUri;
    const textColor = hasBg ? '#FFFFFF' : colors.text;
    const subtextColor = hasBg ? 'rgba(255,255,255,0.8)' : colors.subtext;

    const now = new Date();
    const dateString = now.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric'
    });

    const innerContent = (
      <>
        <StatusBar barStyle={hasBg ? 'light-content' : 'dark-content'} backgroundColor={hasBg ? '#000' : '#FEF4EC'} />
        {hasBg && <View style={[StyleSheet.absoluteFillObject, { backgroundColor: 'rgba(0,0,0,0.45)' }]} />}

        <SafeAreaView style={[styles.flex, styles.introInner]}>
          <Animated.View style={{ opacity: textFadeAnim, alignItems: 'center' }}>
            <Text style={[styles.introTime, { color: textColor }]}>{alarm?.time || '—'}</Text>
            <Text style={[styles.introDate, { color: subtextColor }]}>{dateString}</Text>
            <Text style={[styles.introLabel, { color: textColor }]}>{alarm?.label || 'Wake Up!'}</Text>
          </Animated.View>

          <Animated.View style={{ opacity: textFadeAnim }}>
            <TouchableOpacity style={styles.startChallengeBtn} onPress={handleStartChallenge} activeOpacity={0.8}>
              <Text style={styles.startChallengeText}>Start Challenge</Text>
              <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </Animated.View>
        </SafeAreaView>
      </>
    );

    if (builtIn) {
      if (builtIn.type === 'color') {
        return (
          <Animated.View style={[styles.screen, { backgroundColor: builtIn.color }]}>
            {innerContent}
          </Animated.View>
        );
      }
      return (
        <Animated.View style={[styles.screen, { backgroundColor: '#1A1A1A' }]}>
          <WallpaperVideo source={builtIn.source} />
          {innerContent}
        </Animated.View>
      );
    }

    if (alarm?.backgroundUri) {
      return (
        <Animated.View style={[styles.screen, { backgroundColor: '#1A1A1A' }]}>
          <WallpaperVideo source={{ uri: alarm.backgroundUri }} />
          {innerContent}
        </Animated.View>
      );
    }

    return (
      <Animated.View style={[styles.screen, { backgroundColor: colors.background }]}>
        {innerContent}
      </Animated.View>
    );
  }

  return <View style={[styles.screen, { backgroundColor: colors.background }]} />;
};

const getStyles = (colors: any, isDark: boolean) => StyleSheet.create({
  screen: { flex: 1 },
  flex: { flex: 1 },
  introInner: {
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 32,
    paddingTop: 60,
    paddingBottom: 60,
  },
  introTime: {
    fontSize: 80,
    fontWeight: '900',
    letterSpacing: -3,
    marginBottom: 4,
  },
  introDate: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    letterSpacing: 0.5,
  },
  introLabel: {
    fontSize: 22,
    fontWeight: '800',
  },
  startChallengeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FF7F62',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 24,
    shadowColor: '#FF7F62',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
    marginTop: 8,
  },
  startChallengeText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
  challengeHeader: {
    paddingTop: 16,
    paddingBottom: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  headerTime: {
    fontSize: 44,
    fontWeight: '900',
    color: colors.text,
    letterSpacing: -1.5,
    marginBottom: 2,
  },
  headerLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.subtext,
    marginBottom: 12,
  },
  metaRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  metaPill: {
    backgroundColor: isDark ? colors.surface : 'rgba(46,30,26,0.03)',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: isDark ? colors.border : 'rgba(46,30,26,0.08)',
  },
  metaPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.subtext,
    letterSpacing: 0.3,
  },
  failRow: {
    flexDirection: 'row',
    gap: 6,
  },
  failDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: isDark ? colors.surfaceHighlight : 'rgba(46,30,26,0.1)',
    borderWidth: 1,
    borderColor: isDark ? colors.border : 'rgba(46,30,26,0.15)',
  },
  failDotActive: {
    backgroundColor: '#e94560',
    borderColor: '#e94560',
    shadowColor: '#e94560',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
  },
  challengeArea: { flex: 1 },
  successIconWrapper: {
    marginBottom: 20,
    shadowColor: '#FF7F62',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  successTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: colors.text,
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  successSub: {
    fontSize: 16,
    color: colors.subtext,
    fontWeight: '600',
  },
});
