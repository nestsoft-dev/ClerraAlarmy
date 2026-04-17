import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Vibration,
  Alert, BackHandler, Animated, StatusBar, SafeAreaView, AppState, Image,
} from 'react-native';
import { VideoView, useVideoPlayer } from 'expo-video';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Audio } from 'expo-av';
import { Asset } from 'expo-asset';
import { useAlarm } from '../context/AlarmContext';
import { useTheme } from '../context/ThemeContext';
import { useSettings } from '../context/SettingsContext';
import { ChallengeWrapper } from '../components/ChallengeWrapper';
import { Alarm } from '../types';
import { SOUND_ASSETS, DEFAULT_SOUND_ID } from '../constants/sounds';
import { BUILT_IN_BACKGROUNDS } from '../constants/backgrounds';
import { Ionicons } from '@expo/vector-icons';
import * as Notifications from 'expo-notifications';
import ConfettiCannon from 'react-native-confetti-cannon';

type RootStackParamList = {
  Home: undefined;
  CreateAlarm: { alarm?: Alarm };
  AlarmRing: { alarmId: string };
};

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

// ─── Video wallpaper component (must be top-level for hooks) ────────────────
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

export const AlarmRingScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'AlarmRing'>>();
  const { alarmId } = route.params;
  const { colors, isDark } = useTheme();

  const styles = getStyles(colors, isDark);

  const {
    alarms, startChallenge, completeChallenge, failChallenge,
    currentChallenge, currentDifficulty, failCount, setCurrentAlarm,
    challengeSequence, currentSequenceIndex
  } = useAlarm();
  const { settings } = useSettings();

  const [showChallenge, setShowChallenge] = useState(false);
  const [phase, setPhase] = useState<'intro' | 'challenge' | 'success'>('intro');
  const [challengeKey, setChallengeKey] = useState(0);

  const soundRef = useRef<Audio.Sound | null>(null);

  // Animations
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const textFadeAnim = useRef(new Animated.Value(0)).current;
  const ringExpand = useRef(new Animated.Value(1)).current;
  const challengeSlide = useRef(new Animated.Value(60)).current;
  const challengeFade = useRef(new Animated.Value(0)).current;

  const alarm = alarms.find(a => a.id === alarmId);

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
        // Returned from background — ensure sound is still playing
        // We use a light-weight check
        resumeAlarmSound();
      }
    });
    return () => sub.remove();
  }, []);

  // Audio mode is now handled globally in App.tsx boot sequence

  // ─── Boot sequence ────────────────────────────────────────────────────────
  const hasBooted = useRef(false);

  useEffect(() => {
    setCurrentAlarm(alarmId);
    if (!hasBooted.current) {
      hasBooted.current = true;
      // Start loading immediately in the background
      preloadAlarmSound();
      bootAlarm();
    } else {
      resumeAlarmSound();
    }
  }, [alarmId]);

  // ─── Pulse animation — gets aggressive with each fail ────────────────────
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

  // ─── Core alarm boot ──────────────────────────────────────────────────────
  const bootAlarm = async () => {
    if (settings.gracePeriod > 0) {
      // Wait for the grace period before starting sound
      await new Promise(resolve => setTimeout(resolve, settings.gracePeriod * 1000));
      
      // Double check we haven't already finished or moved to challenge
      if (hasBooted.current && phase !== 'success') {
        await startAlarmSound();
      }
    } else {
      // Immediately start or wait for in-flight loading
      await startAlarmSound();
    }
  };

  const handleStartChallenge = () => {
    startChallenge(1, alarmId);
    setShowChallenge(true);
    setPhase('challenge');
    setTimeout(() => {
      animateChallengeIn();
    }, 50);
  };

  const isSoundLoading = useRef(false);
  const soundLoadingPromise = useRef<Promise<void> | null>(null);

  const preloadAlarmSound = async () => {
    if (soundRef.current || isSoundLoading.current) return;
    
    isSoundLoading.current = true;
    soundLoadingPromise.current = (async () => {
      try {
        const soundId = alarm?.soundId ?? DEFAULT_SOUND_ID;
        const asset = SOUND_ASSETS[soundId] ?? SOUND_ASSETS[DEFAULT_SOUND_ID];
        
        // Ensure asset is actually cached/ready
        await Asset.fromModule(asset).downloadAsync();
        
        const { sound } = await Audio.Sound.createAsync(
          asset, 
          { 
            isLooping: true, 
            volume: 1.0, 
            shouldPlay: settings.gracePeriod === 0 // If no grace period, play as soon as loaded
          }
        );
        soundRef.current = sound;
      } catch (err) {
        console.warn('Failed to preload sound:', err);
      } finally {
        isSoundLoading.current = false;
      }
    })();
    return soundLoadingPromise.current;
  };

  const startAlarmSound = async () => {
    try {
      // 1. Wait for preloading to finish if it's already in flight
      if (soundLoadingPromise.current) {
        await soundLoadingPromise.current;
      }

      // 2. If it failed or wasn't kicked off, try one last time
      if (!soundRef.current) {
        await preloadAlarmSound();
        if (soundLoadingPromise.current) await soundLoadingPromise.current;
      }

      // 3. Play if we have a sound and it's not already playing (it might be playing if shouldPlay was true in createAsync)
      if (soundRef.current) {
        const status = await soundRef.current.getStatusAsync();
        if (status.isLoaded && !status.isPlaying) {
          await soundRef.current.setStatusAsync({ shouldPlay: true, volume: 1.0 });
        }
      }
    } catch (err) {
      console.warn('Failed to play alarm sound:', err);
    }
  };

  const resumeAlarmSound = async () => {
    if (soundRef.current) {
      try {
        const status = await soundRef.current.getStatusAsync();
        if (status.isLoaded && !status.isPlaying) {
          await soundRef.current.playAsync();
        }
      } catch {}
    } else {
      startAlarmSound();
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
    const fullyComplete = await completeChallenge();
    if (fullyComplete) {
      await stopAlarmSound();
      await Notifications.dismissAllNotificationsAsync();
      Vibration.vibrate([0, 100, 100, 100, 100, 100]);
      setShowChallenge(false);
      setPhase('success');

      // Trigger a fresh fade-in for the success screen
      textFadeAnim.setValue(0);
      Animated.timing(textFadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();

      // Return home after celebration (3.5 seconds)
      setTimeout(() => {
        navigation.goBack();
      }, 3500);
    } else {
      Vibration.vibrate([0, 100, 50, 100]);
      setChallengeKey(k => k + 1);
      animateChallengeIn();
    }
  }, [completeChallenge, navigation]);

  const handleFail = useCallback(async () => {
    await failChallenge();
    Vibration.vibrate([0, 500, 200, 500, 200, 500]);
  }, [failChallenge]);
  const handleSkip = () => {
    Alert.alert(
      'Skip Alarm?',
      'Skipping breaks your streak and counts as a failure.',
      [
        { text: 'Keep Going', style: 'cancel' },
        {
          text: 'Skip (Fail)',
          style: 'destructive',
          onPress: () => {
            setChallengeKey(k => k + 1);
            handleFail();
          },
        },
      ]
    );
  };


  // ─── Render: Challenge ────────────────────────────────────────────────────
  if (showChallenge && currentChallenge && phase === 'challenge') {
    const glowColor = glowAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [colors.background, isDark ? colors.surfaceHighlight : '#F4E7DF'],
    });

    const challengeLabel = CHALLENGE_LABELS[currentChallenge.type] ?? currentChallenge.type;
    const failDots = Array.from({ length: 3 }, (_, i) => i < failCount);

    return (
      <Animated.View style={[styles.screen, { backgroundColor: colors.background }]}>
        <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />
        <SafeAreaView style={styles.flex}>
          {/* Top meta strip mapping to safe area background blending */}
          <View style={[styles.challengeHeader, { backgroundColor: colors.background }]}>

            <Text style={[styles.headerTime, { color: colors.text }]}>{alarm?.time || '—'}</Text>
            <Text style={[styles.headerLabel, { color: colors.subtext }]}>{alarm?.label || 'Wake Up!'}</Text>

            {/* Challenge type + difficulty + progress */}
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

            {/* Fail indicators */}
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

          {/* Challenge area */}
          <Animated.View style={[styles.challengeArea, { backgroundColor: colors.background, opacity: challengeFade }]}>
            <ChallengeWrapper
              key={challengeKey}
              challenge={currentChallenge}
              onComplete={handleComplete}
              onFail={handleFail}
            />
          </Animated.View>

          {/* Skip — buried at the bottom, hard to tap */}
          {!settings.strictMode && (
            <TouchableOpacity style={styles.skipBtn} onPress={handleSkip}>
              <Text style={styles.skipText}>Skip (breaks streak)</Text>
            </TouchableOpacity>
          )}

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
            Great job completing: {alarm?.label || 'Wake-Up'}
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

  // ─── Render: Intro (first 3 seconds) ─────────────────────────────────────
  if (phase === 'intro') {
    const glowColorIntro = glowAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [colors.background, isDark ? colors.surfaceHighlight : '#F4E7DF'],
    });

    const builtIn = alarm?.backgroundId
      ? BUILT_IN_BACKGROUNDS.find(b => b.id === alarm.backgroundId)
      : undefined;

    const hasBg = !!builtIn || !!alarm?.backgroundUri;
    const isVideo = !!alarm?.backgroundUri || (builtIn && builtIn.type === 'video');
    const showBranding = !isVideo;
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
          {/* Header info (Top) */}
          <Animated.View style={{ opacity: textFadeAnim, alignItems: 'center' }}>
            <Text style={[styles.introTime, { color: textColor }]}>{alarm?.time || '—'}</Text>
            <Text style={[styles.introDate, { color: subtextColor }]}>{dateString}</Text>
            <Text style={[styles.introLabel, { color: textColor }]}>{alarm?.label || 'Wake Up!'}</Text>
          </Animated.View>

          {/* Branding (Center) - Only show if not video */}
          {showBranding && (
            <Animated.View style={[styles.brandingContainer, { opacity: textFadeAnim }]}>
              <Image 
                source={require('../../assets/ClerraAlarm Light1.png')} 
                style={styles.logoImage}
                resizeMode="contain"
              />
              <Text style={[styles.logoText, { color: textColor }]}>ClerraAlarm</Text>
            </Animated.View>
          )}

          {/* Action (Bottom) */}
          <Animated.View style={{ opacity: textFadeAnim }}>
            <TouchableOpacity style={styles.startChallengeBtn} onPress={handleStartChallenge} activeOpacity={0.8}>
              <Text style={styles.startChallengeText}>Start Challenge</Text>
              <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </Animated.View>
        </SafeAreaView>
      </>
    );

    // Built-in color/video
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

    // Custom uploaded video
    if (alarm?.backgroundUri) {
      return (
        <Animated.View style={[styles.screen, { backgroundColor: '#1A1A1A' }]}>
          <WallpaperVideo source={{ uri: alarm.backgroundUri }} />
          {innerContent}
        </Animated.View>
      );
    }

    // Default — no background
    return (
      <Animated.View style={[styles.screen, { backgroundColor: glowColorIntro }]}>
        {innerContent}
      </Animated.View>
    );
  }

  // Blank fallback during phase transitions (e.g., waiting for completeChallenge promise)
  return <View style={[styles.screen, { backgroundColor: colors.background }]} />;
};

const getStyles = (colors: any, isDark: boolean) => StyleSheet.create({
  screen: { flex: 1 },
  flex: { flex: 1 },

  // ─── Intro ────────────────────────────────────────────────────────────────
  introInner: {
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 32,
    paddingTop: 80,
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
  brandingContainer: {
    alignItems: 'center',
    gap: 8,
    marginTop: -40, // Offset to push it slightly up towards center
  },
  logoImage: {
    width: 100,
    height: 100,
  },
  logoText: {
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: -1,
  },
  // ─── Challenge ────────────────────────────────────────────────────────────
  challengeHeader: {
    paddingTop: 16,
    paddingBottom: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(233,69,96,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(233,69,96,0.2)',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 5,
    marginBottom: 12,
  },
  liveDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#e94560',
  },
  liveText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#e94560',
    letterSpacing: 1.5,
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
  skipBtn: {
    alignSelf: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginBottom: 8,
  },
  skipText: {
    color: isDark ? colors.subtext : 'rgba(46,30,26,0.3)',
    fontSize: 13,
    fontWeight: '600',
  },

  // ─── Success ──────────────────────────────────────────────────────────────
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