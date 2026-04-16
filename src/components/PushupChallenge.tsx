import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, Vibration, Animated, TouchableOpacity,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { ChallengeDifficulty } from '../types';

interface PushupChallengeProps {
  difficulty: ChallengeDifficulty;
  onComplete: () => void;
  onFail: () => void;
}

const TARGET_BY_DIFFICULTY: Record<ChallengeDifficulty, number> = { 1: 10, 2: 20, 3: 30 };

export const PushupChallenge: React.FC<PushupChallengeProps> = ({ difficulty, onComplete }) => {
  const { colors, isDark } = useTheme();
  const styles = getStyles(colors, isDark);
  const [permission, requestPermission] = useCameraPermissions();
  const [repCount, setRepCount] = useState(0);
  const [showInstructions, setShowInstructions] = useState(true);
  const target = TARGET_BY_DIFFICULTY[difficulty];

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const ringScale = useRef(new Animated.Value(1)).current;
  const ringOpacity = useRef(new Animated.Value(0)).current;
  const lastEventTime = useRef(0);

  const handleNoseTap = () => {
    const now = Date.now();
    if (now - lastEventTime.current > 800) {
      lastEventTime.current = now;
      triggerRepAnim();
      setRepCount(prev => {
        const next = prev + 1;
        if (next >= target) {
          Vibration.vibrate([0, 100, 50, 100]);
          setTimeout(() => onComplete(), 300);
        }
        return next;
      });
    }
  };

  const triggerRepAnim = () => {
    ringOpacity.setValue(1);
    Animated.parallel([
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.35, duration: 100, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
      ]),
      Animated.sequence([
        Animated.timing(ringScale, { toValue: 1.8, duration: 400, useNativeDriver: true }),
        Animated.timing(ringOpacity, { toValue: 0, duration: 200, useNativeDriver: true }),
      ]),
    ]).start(() => ringScale.setValue(1));
  };

  useEffect(() => {
    // We no longer use accelerometer, relying entirely on screen tap / nose tap for reliability.
  }, [permission?.granted, showInstructions, target, onComplete]);

  const progress = repCount / target;
  const remaining = target - repCount;
  const diffColor = ['#34C759', '#FF9F0A', '#FF453A'][difficulty - 1];
  const diffLabel = ['Easy', 'Medium', 'Hard'][difficulty - 1];

  const SETUP_STEPS = [
    { step: '1', text: 'Place your phone face-up on the floor' },
    { step: '2', text: 'Get into push-up position above it' },
    { step: '3', text: 'Lower your nose till it touches the surface of your phone' },
    { step: '4', text: "Push back up — that's one rep!" },
  ];

  if (!permission) {
    return <View style={styles.container}><Text style={styles.loadingText}>Loading…</Text></View>;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.topLabel}>PUSH-UP CHALLENGE</Text>
        <View style={styles.card}>
          <Ionicons name="barbell" size={52} color="#FF7F62" style={styles.cardIcon} />
          <Text style={styles.cardTitle}>Camera Access</Text>
          <Text style={styles.cardText}>Watch yourself do push-ups using the front camera.</Text>
          <TouchableOpacity style={styles.primaryBtn} onPress={requestPermission}>
            <Text style={styles.primaryBtnText}>Enable Camera</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (showInstructions) {
    return (
      <View style={styles.container}>
        <Text style={[styles.topLabel, { marginBottom: 16, color: isDark ? colors.subtext : 'rgba(46,30,26,0.35)' }]}>
          PUSH-UP CHALLENGE
        </Text>

        <View style={styles.card}>
          <Ionicons name="barbell" size={52} color="#FF7F62" style={styles.cardIcon} />
          <Text style={styles.cardTitle}>Push-Up Challenge</Text>
          <Text style={styles.setupSubtitle}>Set up in 4 steps</Text>

          <View style={styles.stepsList}>
            {SETUP_STEPS.map(({ step, text }) => (
              <View key={step} style={styles.stepRow}>
                <View style={styles.stepBadge}>
                  <Text style={styles.stepNum}>{step}</Text>
                </View>
                <Text style={styles.stepText}>{text}</Text>
              </View>
            ))}
          </View>

          <TouchableOpacity style={styles.primaryBtn} onPress={() => setShowInstructions(false)}>
            <Text style={styles.primaryBtnText}>I'm Ready</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.wrapper}>
      <CameraView style={StyleSheet.absoluteFillObject} facing="front" />
      <TouchableOpacity activeOpacity={1} style={styles.overlay} onPress={handleNoseTap}>
        <View style={styles.header}>
          <View style={styles.headerPill}>
            <Text style={styles.topLabel}>PUSH-UP CHALLENGE</Text>
          </View>
        </View>

        <View style={styles.counterArea}>
          <Animated.View style={[styles.ripple, { transform: [{ scale: ringScale }], opacity: ringOpacity }]} />
          <Animated.View style={[styles.countCircle, { transform: [{ scale: pulseAnim }] }]}>
            <Text style={styles.countNumber}>{repCount}</Text>
            <Text style={styles.countOf}>of {target}</Text>
          </Animated.View>
        </View>

        <View style={styles.trackerContainer}>
          <Animated.View style={[styles.trackerDot, { transform: [{ translateY: pulseAnim.interpolate({
            inputRange: [1, 1.35],
            outputRange: [0, 80]
          }) }] }]} />
        </View>

        <Text style={styles.statusText}>
          {remaining > 0
            ? `${remaining} rep${remaining !== 1 ? 's' : ''} remaining`
            : '🎉 Done!'}
        </Text>

        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
        </View>

        <View style={styles.hintPill}>
          <Text style={styles.hintText}>Tap phone with nose on way down</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const getStyles = (colors: any, isDark: boolean) => StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: '#000' },
  overlay: {
    flex: 1,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 40,
    paddingBottom: 40,
    paddingHorizontal: 24,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingBottom: 20,
    marginTop: 20,
    backgroundColor: colors.background,
  },
  loadingText: { fontSize: 16, color: 'rgba(255,255,255,0.8)' },
  headerPill: {
    backgroundColor: 'rgba(0,0,0,0.4)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 24,
    alignItems: 'center',
    marginBottom: 16,
  },
  topLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: 'rgba(255,255,255,0.9)',
    letterSpacing: 4,
  },
  diffBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 5,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderColor: 'rgba(255,255,255,0.1)',
  },
  diffDot: { width: 6, height: 6, borderRadius: 3 },
  diffText: { fontSize: 12, fontWeight: '700' },
  header: { alignItems: 'center', width: '100%' },
  card: {
    backgroundColor: isDark ? colors.surface : 'rgba(46,30,26,0.04)',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: isDark ? colors.border : 'rgba(46,30,26,0.1)',
    padding: 28,
    alignItems: 'center',
    width: '100%',
  },
  cardIcon: { marginBottom: 14 },
  cardTitle: { fontSize: 22, fontWeight: '800', color: colors.text, marginBottom: 8, textAlign: 'center' },
  cardText: { fontSize: 15, color: colors.subtext, textAlign: 'center', lineHeight: 22, marginBottom: 24 },
  setupSubtitle: {
    fontSize: 12,
    fontWeight: '700',
    color: isDark ? colors.border : 'rgba(46,30,26,0.3)',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: 16,
  },
  stepsList: { width: '100%', marginBottom: 24, gap: 12 },
  stepRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  stepBadge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(255,127,98,0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255,127,98,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  stepNum: { fontSize: 12, fontWeight: '800', color: '#FF7F62' },
  stepText: { fontSize: 14, color: colors.subtext, lineHeight: 20, flex: 1, paddingTop: 3 },
  primaryBtn: {
    width: '100%',
    height: 52,
    backgroundColor: '#FF7F62',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FF7F62',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  primaryBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  counterArea: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 180,
    height: 180,
  },
  ripple: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 3,
    borderColor: '#FF7F62',
  },
  countCircle: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(255,127,98,0.2)',
    borderWidth: 2,
    borderColor: 'rgba(255,127,98,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FF7F62',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 8,
  },
  countNumber: { fontSize: 72, fontWeight: '900', color: '#FFFFFF', letterSpacing: -3 },
  countOf: { fontSize: 14, fontWeight: '600', color: 'rgba(255,255,255,0.6)', letterSpacing: 0.5 },
  statusText: { 
    fontSize: 20, 
    fontWeight: '800', 
    color: '#FFFFFF', 
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  trackerContainer: {
    position: 'absolute',
    right: 20,
    top: '40%',
    width: 6,
    height: 120,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 3,
  },
  trackerDot: {
    width: 14,
    height: 14,
    backgroundColor: '#FF7F62',
    borderRadius: 7,
    position: 'absolute',
    left: -4,
    top: 5,
    shadowColor: '#FF7F62',
    shadowOpacity: 1,
    shadowRadius: 10,
  },
  progressTrack: {
    width: '100%',
    height: 5,
    backgroundColor: 'rgba(46,30,26,0.1)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FF7F62',
    borderRadius: 3,
    shadowColor: '#FF7F62',
    shadowOpacity: 0.8,
    shadowRadius: 6,
  },
  hintPill: {
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginTop: 12,
  },
  hintText: { fontSize: 13, color: '#FFFFFF', textAlign: 'center', fontWeight: '600' },
});
