import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  Animated, Vibration,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { ChallengeDifficulty } from '../types';

const DIGIT_COUNT = { 1: 4, 2: 5, 3: 6 };
const SHOW_DURATION = { 1: 5, 2: 4, 3: 3 }; // seconds to memorise

function generateNumber(digits: number): string {
  let result = String(Math.floor(Math.random() * 9) + 1);
  for (let i = 1; i < digits; i++) {
    result += String(Math.floor(Math.random() * 10));
  }
  return result;
}

interface Props {
  difficulty: ChallengeDifficulty;
  onComplete: () => void;
  onFail: () => void;
}

type Phase = 'memorise' | 'input' | 'result';

export const MemoryChallenge: React.FC<Props> = ({ difficulty, onComplete, onFail }) => {
  const { colors, isDark } = useTheme();
  const styles = getStyles(colors, isDark);
  const digits = DIGIT_COUNT[difficulty];
  const showDuration = SHOW_DURATION[difficulty];

  const [target, setTarget] = useState(() => generateNumber(digits));
  const [phase, setPhase] = useState<Phase>('memorise');
  const [timeLeft, setTimeLeft] = useState(showDuration);
  const [userInput, setUserInput] = useState('');
  const [result, setResult] = useState<'correct' | 'wrong' | null>(null);

  const fadeAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const isFirstRender = useRef(true);
  const [resetKey, setResetKey] = useState(0);

  // When difficulty escalates (after fail) OR resetKey bumps, regenerate with correct digit count
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    const newDigits = DIGIT_COUNT[difficulty];
    setTarget(generateNumber(newDigits));
    setUserInput('');
    setResult(null);
    fadeAnim.setValue(1);
    scaleAnim.setValue(1);
    setTimeLeft(SHOW_DURATION[difficulty]);
    setPhase('memorise');
  }, [difficulty, resetKey]);

  // Countdown timer
  useEffect(() => {
    if (phase !== 'memorise') return;
    if (timeLeft <= 0) {
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 0, duration: 400, useNativeDriver: true }),
        Animated.timing(scaleAnim, { toValue: 0.7, duration: 400, useNativeDriver: true }),
      ]).start(() => {
        setPhase('input');
      });
      return;
    }
    const timer = setTimeout(() => setTimeLeft(t => t - 1), 1000);
    return () => clearTimeout(timer);
  }, [phase, timeLeft]);

  const shake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 14, duration: 55, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -14, duration: 55, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 10, duration: 55, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 55, useNativeDriver: true }),
    ]).start();
  };

  const handleSubmit = () => {
    if (userInput.trim() === target) {
      setResult('correct');
      Vibration.vibrate([0, 100, 60, 100]);
      setTimeout(() => onComplete(), 900);
    } else {
      setResult('wrong');
      shake();
      Vibration.vibrate([0, 400]);
      setTimeout(() => {
        // Bump resetKey — the useEffect above will regenerate with the
        // correct (possibly escalated) difficulty after onFail() fires.
        onFail();
        setResetKey(k => k + 1);
      }, 1400);
    }
  };

  const handleKeypadPress = (val: string) => {
    if (result) return; // lock input during feedback
    if (val === 'C') {
      setUserInput('');
    } else if (val === 'DEL') {
      setUserInput(prev => prev.slice(0, -1));
    } else {
      setUserInput(prev => (prev.length < digits ? prev + val : prev));
    }
  };

  const timerColor = timeLeft <= 1 ? '#FF3B30' : timeLeft <= 2 ? '#FF9500' : '#34C759';

  // ── Render digit boxes ────────────────────────────────────────────────────
  const renderDigitBoxes = () => {
    return (
      <Animated.View style={[styles.digitRow, { transform: [{ translateX: shakeAnim }] }]}>
        {Array.from({ length: digits }).map((_, i) => {
          const char = userInput[i];
          const isCurrent = i === userInput.length;
          const isCorrect = result === 'correct';
          const isWrong = result === 'wrong';
          return (
            <View
              key={i}
              style={[
                styles.digitBox,
                char && styles.digitBoxFilled,
                isCurrent && !char && styles.digitBoxActive,
                isCorrect && styles.digitBoxCorrect,
                isWrong && styles.digitBoxWrong,
              ]}
            >
              <Text style={[styles.digitChar, !char && styles.digitPlaceholder]}>
                {char || '·'}
              </Text>
            </View>
          );
        })}
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>

      {/* ── Top content area (centred above the fixed keypad) ── */}
      <View style={styles.topContent}>
      

        {/* MEMORISE PHASE */}
        {phase === 'memorise' && (
          <View style={styles.memoriseArea}>
            <Text style={styles.instructionText}>Memorise this number</Text>

            <View style={[styles.timerRing, { borderColor: timerColor }]}>
              <Text style={[styles.timerCount, { color: timerColor }]}>{timeLeft}</Text>
            </View>

            <Animated.View style={{ opacity: fadeAnim, transform: [{ scale: scaleAnim }] }}>
              <View style={styles.numberCard}>
                <Text style={styles.numberText} adjustsFontSizeToFit numberOfLines={1}>
                  {target}
                </Text>
              </View>
            </Animated.View>

            <Text style={styles.subInstruction}>It disappears when the timer hits 0</Text>
          </View>
        )}

        {/* INPUT PHASE — only shows digit boxes + hint above the fixed keypad */}
        {phase === 'input' && (
          <View style={styles.inputTopArea}>
            <Text style={styles.instructionText}>What was the number?</Text>
            {renderDigitBoxes()}
            <Text style={styles.digitHint}>{userInput.length}/{digits} digits</Text>
          </View>
        )}
      </View>

      {/* ── Fixed bottom: numpad + submit (always same position) ── */}
      {phase === 'input' && (
        <View style={styles.fixedBottom}>
          <View style={styles.keypadContainer}>
            {[
              ['1', '2', '3'],
              ['4', '5', '6'],
              ['7', '8', '9'],
              ['C', '0', 'DEL'],
            ].map((row, rowIndex) => (
              <View key={rowIndex} style={styles.keypadRow}>
                {row.map((key) => (
                  <TouchableOpacity
                    key={key}
                    style={styles.keypadButton}
                    onPress={() => handleKeypadPress(key)}
                    activeOpacity={0.7}
                  >
                    <Text style={[
                      styles.keypadButtonText,
                      (key === 'C' || key === 'DEL') && styles.keypadActionText,
                    ]}>
                      {key === 'DEL' ? '⌫' : key}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            ))}
          </View>

          <TouchableOpacity
            style={[styles.primaryBtn, userInput.length < digits && styles.primaryBtnDisabled]}
            onPress={handleSubmit}
            disabled={userInput.length < digits}
            activeOpacity={0.8}
          >
            <Text style={styles.primaryBtnText}>Submit</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const getStyles = (colors: any, isDark: boolean) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  topContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  diffBadge: {
    backgroundColor: 'rgba(255,127,98,0.12)',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 5,
    marginBottom: 24,
  },
  diffText: { fontSize: 13, fontWeight: '700', color: '#FF7F62' },

  // ── Memorise
  memoriseArea: { alignItems: 'center', width: '100%', gap: 20 },
  instructionText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.subtext,
    textAlign: 'center',
  },
  timerRing: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timerCount: {
    fontSize: 26,
    fontWeight: '900',
  },
  numberCard: {
    backgroundColor: isDark ? colors.surface : '#fff',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: isDark ? colors.border : 'rgba(46,30,26,0.07)',
    paddingHorizontal: 32,
    paddingVertical: 28,
    alignItems: 'center',
    minWidth: 240,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 20,
    elevation: 4,
  },
  numberText: {
    fontSize: 52,
    fontWeight: '900',
    color: colors.text,
    letterSpacing: 8,
  },
  subInstruction: {
    fontSize: 13,
    color: isDark ? colors.border : 'rgba(46,30,26,0.3)',
    fontWeight: '500',
    textAlign: 'center',
  },

  // ── Input
  inputTopArea: {
    alignItems: 'center',
    width: '100%',
    gap: 14,
  },
  fixedBottom: {
    width: '100%',
    paddingHorizontal: 24,
    paddingBottom: 24,
    gap: 12,
    backgroundColor: colors.background,
  },

  // Digit boxes
  digitRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  digitBox: {
    width: 44,
    height: 52,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: isDark ? colors.border : 'rgba(46,30,26,0.12)',
    backgroundColor: isDark ? colors.surface : '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  digitBoxFilled: {
    backgroundColor: 'rgba(255,127,98,0.08)',
    borderColor: 'rgba(255,127,98,0.4)',
  },
  digitBoxActive: {
    borderColor: '#FF7F62',
    borderWidth: 2,
  },
  digitBoxCorrect: {
    borderColor: '#34C759',
    backgroundColor: 'rgba(52,199,89,0.08)',
  },
  digitBoxWrong: {
    borderColor: '#FF3B30',
    backgroundColor: 'rgba(255,59,48,0.08)',
  },
  digitChar: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.text,
  },
  digitPlaceholder: {
    color: isDark ? colors.border : 'rgba(46,30,26,0.15)',
  },
  digitHint: {
    fontSize: 12,
    color: colors.subtext,
    fontWeight: '600',
  },

  // Numpad
  keypadContainer: {
    width: '100%',
    gap: 10,
  },
  keypadRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  keypadButton: {
    flex: 1,
    height: 56,
    backgroundColor: isDark ? colors.surfaceHighlight : 'rgba(46,30,26,0.04)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: isDark ? colors.border : 'rgba(46,30,26,0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  keypadButtonText: {
    fontSize: 24,
    fontWeight: '600',
    color: colors.text,
  },
  keypadActionText: {
    fontSize: 20,
    color: colors.subtext,
  },

  // Submit
  primaryBtn: {
    backgroundColor: '#FF7F62',
    borderRadius: 16,
    height: 54,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FF7F62',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 8,
  },
  primaryBtnDisabled: {
    backgroundColor: 'rgba(255,127,98,0.3)',
    shadowOpacity: 0,
    elevation: 0,
  },
  primaryBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
