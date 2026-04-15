import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Vibration, Animated } from 'react-native';
import { Accelerometer } from 'expo-sensors';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { ChallengeDifficulty } from '../types';

interface ShakeChallengeProps {
  difficulty: ChallengeDifficulty;
  onComplete: () => void;
  onFail: () => void;
}

export const ShakeChallenge: React.FC<ShakeChallengeProps> = ({ difficulty, onComplete, onFail }) => {
  const { colors, isDark } = useTheme();
  const styles = getStyles(colors, isDark);
  const [shakeCount, setShakeCount] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [sensorAvailable, setSensorAvailable] = useState<boolean | null>(null);
  const lastShake = useRef(0);
  const hasFailedRef = useRef(false);

  const targetShakes = difficulty === 1 ? 10 : difficulty === 2 ? 15 : 20;
  const timeLimit = difficulty === 1 ? 30 : difficulty === 2 ? 20 : 15;

  const phoneAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const glowOpacity = useRef(new Animated.Value(0)).current;

  // Idle breathing animation
  useEffect(() => {
    Accelerometer.isAvailableAsync().then(available => setSensorAvailable(available));
  }, []);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.06, duration: 900, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 900, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const triggerShakeAnim = () => {
    phoneAnim.setValue(0);
    Animated.sequence([
      Animated.timing(phoneAnim, { toValue: -18, duration: 40, useNativeDriver: true }),
      Animated.timing(phoneAnim, { toValue: 18, duration: 40, useNativeDriver: true }),
      Animated.timing(phoneAnim, { toValue: -12, duration: 35, useNativeDriver: true }),
      Animated.timing(phoneAnim, { toValue: 12, duration: 35, useNativeDriver: true }),
      Animated.timing(phoneAnim, { toValue: 0, duration: 30, useNativeDriver: true }),
    ]).start();

    Animated.sequence([
      Animated.timing(glowOpacity, { toValue: 1, duration: 80, useNativeDriver: true }),
      Animated.timing(glowOpacity, { toValue: 0, duration: 300, useNativeDriver: true }),
    ]).start();
  };

  useEffect(() => {
    hasFailedRef.current = false;
    setTimeLeft(timeLimit);

    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          if (!hasFailedRef.current) {
            hasFailedRef.current = true;
            setTimeout(() => {
              Vibration.vibrate(300);
              onFail();
            }, 0);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    Accelerometer.setUpdateInterval(50);
    const subscription = Accelerometer.addListener(({ x, y, z }) => {
      const total = Math.abs(x) + Math.abs(y) + Math.abs(z);
      const now = Date.now();
      if (total > 2 && now - lastShake.current > 450) {
        lastShake.current = now;
        triggerShakeAnim();
        setShakeCount(prev => {
          const newCount = prev + 1;
          if (newCount >= targetShakes) onComplete();
          return newCount;
        });
      }
    });

    return () => {
      subscription.remove();
      clearInterval(interval);
    };
  }, [difficulty, targetShakes, timeLimit, onComplete, onFail]);

  const progress = Math.min(shakeCount / targetShakes, 1);
  const isUrgent = timeLeft <= 5;

  // ── Guard: sensor not yet checked ────────────────────────────────────────
  if (sensorAvailable === null) {
    return (
      <View style={styles.container}>
        <Text style={styles.topLabel}>SHAKE CHALLENGE</Text>
        <Text style={styles.hintText}>Checking sensors…</Text>
      </View>
    );
  }

  // ── Guard: sensor not available on device ──────────────────────────────
  if (!sensorAvailable) {
    return (
      <View style={styles.container}>
        <Text style={styles.topLabel}>SHAKE CHALLENGE</Text>
        <View style={styles.unavailableCard}>
          <Ionicons name="alert-circle" size={52} color="#FF7F62" style={{ marginBottom: 16 }} />
          <Text style={styles.unavailableTitle}>Sensor Unavailable</Text>
          <Text style={styles.unavailableText}>
            Your device does not support the motion sensors required for the Shake Challenge.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Ambient glow */}
      <Animated.View style={[styles.ambientGlow, { opacity: glowOpacity }]} />

      <Text style={styles.topLabel}>SHAKE CHALLENGE</Text>

      {/* Timer arc mockup — simple circular timer */}
      <View style={styles.timerArea}>
        <Text style={[styles.timerNumber, isUrgent && styles.timerUrgent]}>
          {timeLeft}
        </Text>
        <Text style={styles.timerLabel}>seconds</Text>
      </View>

      {/* Animated phone icon */}
      <Animated.View style={[
        styles.phoneContainer,
        { transform: [{ translateX: phoneAnim }, { scale: pulseAnim }] }
      ]}>
        <View style={styles.phoneFrame}>
          <Ionicons name="phone-portrait" size={60} color="#FF7F62" style={styles.phoneIcon} />
        </View>
        <Animated.View style={[styles.phoneGlow, { opacity: glowOpacity }]} />
      </Animated.View>

      {/* Count display */}
      <View style={styles.countRow}>
        <Text style={styles.countCurrent}>{shakeCount}</Text>
        <Text style={styles.countSeparator}>/</Text>
        <Text style={styles.countTarget}>{targetShakes}</Text>
      </View>
      <Text style={styles.countLabel}>
        {shakeCount >= targetShakes
          ? '🎉 Done!'
          : `${targetShakes - shakeCount} more shake${targetShakes - shakeCount !== 1 ? 's' : ''}`}
      </Text>

      {/* Progress bar */}
      <View style={styles.progressTrack}>
        <Animated.View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
        <View style={[styles.progressDot, { left: `${Math.max(0, progress * 100 - 1)}%` }]} />
      </View>

      <Text style={styles.hintText}>Shake as fast as you can!</Text>
    </View>
  );
};

const getStyles = (colors: any, isDark: boolean) => StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
    paddingBottom: 24,
    backgroundColor: colors.background,
  },
  ambientGlow: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(255,127,98,0.08)',
    top: '25%',
    alignSelf: 'center',
    opacity: 0,
  },
  topLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: isDark ? colors.subtext : 'rgba(46,30,26,0.35)',
    letterSpacing: 4,
    marginBottom: 28,
  },
  timerArea: {
    alignItems: 'center',
    marginBottom: 28,
  },
  timerNumber: {
    fontSize: 56,
    fontWeight: '900',
    color: colors.text,
    letterSpacing: -2,
  },
  timerUrgent: {
    color: '#FF453A',
  },
  timerLabel: {
    fontSize: 13,
    color: colors.subtext,
    fontWeight: '600',
    letterSpacing: 1,
    marginTop: -4,
  },
  phoneContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
    position: 'relative',
  },
  phoneFrame: {
    width: 100,
    height: 100,
    borderRadius: 28,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: isDark ? colors.border : 'rgba(46,30,26,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 4,
  },
  phoneIcon: { opacity: 0.9 },
  phoneGlow: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,127,98,0.15)',
    shadowColor: '#FF7F62',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 0,
    zIndex: -1,
  },
  countRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
    marginBottom: 6,
  },
  countCurrent: {
    fontSize: 64,
    fontWeight: '900',
    color: colors.text,
    letterSpacing: -2,
  },
  countSeparator: {
    fontSize: 30,
    fontWeight: '300',
    color: isDark ? colors.border : 'rgba(46,30,26,0.2)',
  },
  countTarget: {
    fontSize: 30,
    fontWeight: '700',
    color: colors.subtext,
  },
  countLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.subtext,
    marginBottom: 28,
  },
  progressTrack: {
    width: '100%',
    height: 6,
    backgroundColor: isDark ? colors.border : 'rgba(46,30,26,0.08)',
    borderRadius: 3,
    overflow: 'visible',
    marginBottom: 20,
    position: 'relative',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FF7F62',
    borderRadius: 3,
    shadowColor: '#FF7F62',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
  },
  progressDot: {
    position: 'absolute',
    top: -3,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#FF7F62',
  },
  hintText: {
    fontSize: 14,
    color: colors.subtext,
    fontWeight: '500',
  },
  unavailableCard: {
    backgroundColor: isDark ? colors.surface : 'rgba(46,30,26,0.04)',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: isDark ? colors.border : 'rgba(46,30,26,0.1)',
    padding: 28,
    alignItems: 'center',
    width: '100%',
    marginTop: 16,
  },
  unavailableTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 10,
    textAlign: 'center',
  },
  unavailableText: {
    fontSize: 15,
    color: colors.subtext,
    textAlign: 'center',
    lineHeight: 22,
  },
});