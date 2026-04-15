import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, Vibration, Animated, TouchableOpacity,
} from 'react-native';
import { Accelerometer } from 'expo-sensors';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { ChallengeDifficulty } from '../types';

interface JumpChallengeProps {
  difficulty: ChallengeDifficulty;
  onComplete: () => void;
  onFail: () => void;
}

const TARGET_BY_DIFFICULTY: Record<ChallengeDifficulty, number> = { 1: 10, 2: 20, 3: 30 };

export const JumpChallenge: React.FC<JumpChallengeProps> = ({ difficulty, onComplete }) => {
  const { colors, isDark } = useTheme();
  const styles = getStyles(colors, isDark);
  const [sensorAvailable, setSensorAvailable] = useState<boolean | null>(null);
  const [jumpCount, setJumpCount] = useState(0);
  const target = TARGET_BY_DIFFICULTY[difficulty];

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const ringScale = useRef(new Animated.Value(1)).current;
  const ringOpacity = useRef(new Animated.Value(0)).current;

  const phaseRef = useRef<'idle' | 'launch' | 'flight'>('idle');
  const lastEventTime = useRef(0);

  const triggerJumpAnim = () => {
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
    Accelerometer.isAvailableAsync().then(available => setSensorAvailable(available));
  }, []);

  useEffect(() => {
    if (!sensorAvailable) return;
    Accelerometer.setUpdateInterval(50);
    const sub = Accelerometer.addListener(({ x, y, z }) => {
      const magnitude = Math.sqrt(x * x + y * y + z * z);
      const now = Date.now();
      if (phaseRef.current === 'idle') {
        if (magnitude > 2.5 && now - lastEventTime.current > 600) {
          phaseRef.current = 'launch'; lastEventTime.current = now;
        }
      } else if (phaseRef.current === 'launch') {
        if (magnitude < 0.5 && now - lastEventTime.current > 80) {
          phaseRef.current = 'flight'; lastEventTime.current = now;
        }
        if (now - lastEventTime.current > 400) phaseRef.current = 'idle';
      } else if (phaseRef.current === 'flight') {
        if (magnitude > 2.0 && now - lastEventTime.current > 80) {
          phaseRef.current = 'idle'; lastEventTime.current = now;
          triggerJumpAnim();
          setJumpCount(prev => {
            const next = prev + 1;
            if (next >= target) {
              sub.remove();
              Vibration.vibrate([0, 100, 50, 100]);
              setTimeout(() => onComplete(), 300);
            }
            return next;
          });
        }
        if (now - lastEventTime.current > 600) phaseRef.current = 'idle';
      }
    });
    return () => sub.remove();
  }, [sensorAvailable, target, onComplete]);

  const progress = jumpCount / target;
  const remaining = target - jumpCount;
  const diffColor = ['#34C759', '#FF9F0A', '#FF453A'][difficulty - 1];
  const diffLabel = ['Easy', 'Medium', 'Hard'][difficulty - 1];

  if (sensorAvailable === null) {
    return <View style={styles.container}><Text style={styles.loadingText}>Checking sensors…</Text></View>;
  }

  if (!sensorAvailable) {
    return (
      <View style={styles.container}>
        <Text style={styles.topLabel}>JUMP CHALLENGE</Text>
        <View style={styles.permCard}>
          <Ionicons name="alert-circle" size={52} color="#FF7F62" style={styles.permIcon} />
          <Text style={styles.permTitle}>Motion Sensor Unavailable</Text>
          <Text style={styles.permText}>
            Your device does not support the motion sensors required for the Jump Challenge.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.wrapper, { backgroundColor: colors.background }]}>
      {/* Light background overlay */}
      <View style={styles.overlay}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.topLabel}>JUMP CHALLENGE</Text>
        </View>

        {/* Animated counter */}
        <View style={styles.counterArea}>
          <Animated.View style={[styles.ripple, { transform: [{ scale: ringScale }], opacity: ringOpacity }]} />
          <Animated.View style={[styles.countCircle, { transform: [{ scale: pulseAnim }] }]}>
            <Text style={styles.countNumber}>{jumpCount}</Text>
            <Text style={styles.countOf}>of {target}</Text>
          </Animated.View>
        </View>

        {/* Status */}
        <Text style={styles.statusText}>
          {remaining > 0
            ? `${remaining} jump${remaining !== 1 ? 's' : ''} remaining`
            : '🎉 Done!'}
        </Text>

        {/* Progress */}
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
        </View>

        <Text style={styles.hintText}>Jump as high as you can each time</Text>
      </View>
    </View>
  );
};

const getStyles = (colors: any, isDark: boolean) => StyleSheet.create({
  wrapper: { flex: 1 },
  overlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 20,
    paddingBottom: 40,
    paddingHorizontal: 24,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
    backgroundColor: colors.background,
  },
  loadingText: { fontSize: 16, color: colors.subtext },
  header: { alignItems: 'center', width: '100%' },
  topLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: isDark ? colors.subtext : 'rgba(46,30,26,0.35)',
    letterSpacing: 4,
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  diffBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  diffDot: { width: 6, height: 6, borderRadius: 3 },
  diffText: { fontSize: 12, fontWeight: '700' },
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
    shadowOpacity: 0.6,
    shadowRadius: 24,
    elevation: 10,
  },
  countNumber: {
    fontSize: 72,
    fontWeight: '900',
    color: colors.text,
    letterSpacing: -3,
  },
  countOf: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.subtext,
    letterSpacing: 0.5,
  },
  statusText: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.text,
    textAlign: 'center',
  },
  progressTrack: {
    width: '100%',
    height: 5,
    backgroundColor: isDark ? colors.border : 'rgba(46,30,26,0.1)',
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
  hintText: {
    fontSize: 13,
    color: colors.subtext,
    textAlign: 'center',
  },
  permCard: {
    backgroundColor: isDark ? colors.surface : 'rgba(46,30,26,0.03)',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: isDark ? colors.border : 'rgba(46,30,26,0.08)',
    padding: 28,
    alignItems: 'center',
    width: '100%',
  },
  permIcon: { marginBottom: 16 },
  permTitle: { fontSize: 20, fontWeight: '800', color: colors.text, marginBottom: 10 },
  permText: { fontSize: 15, color: colors.subtext, textAlign: 'center', lineHeight: 22, marginBottom: 24 },
  permBtn: {
    backgroundColor: '#FF7F62',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 16,
    shadowColor: '#FF7F62',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  permBtnText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
});
