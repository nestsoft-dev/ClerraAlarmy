import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, Vibration,
  KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard,
  Animated,
} from 'react-native';
import { ChallengeDifficulty } from '../types';
import { useTheme } from '../context/ThemeContext';

interface MathChallengeProps {
  difficulty: ChallengeDifficulty;
  onComplete: () => void;
  onFail: () => void;
}

export const MathChallenge: React.FC<MathChallengeProps> = ({ difficulty, onComplete, onFail }) => {
  const { colors, isDark } = useTheme();
  const styles = getStyles(colors, isDark);
  const [problemText, setProblemText] = useState('');
  const [correctAnswer, setCorrectAnswer] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback] = useState<'wrong' | null>(null);

  const shakeAnim = useRef(new Animated.Value(0)).current;
  const feedbackAnim = useRef(new Animated.Value(0)).current;
  const cardAnim = useRef(new Animated.Value(0)).current;

  const generateProblem = useCallback(() => {
    let text = '';
    let answer = 0;

    if (difficulty === 1) {
      const isAdd = Math.random() > 0.5;
      if (isAdd) {
        const a = Math.floor(Math.random() * 10) + 1;
        const b = Math.floor(Math.random() * 10) + 1;
        text = `${a} + ${b} =`;
        answer = a + b;
      } else {
        const a = Math.floor(Math.random() * 15) + 5;
        const b = Math.floor(Math.random() * a) + 1;
        text = `${a} - ${b} =`;
        answer = a - b;
      }
    } else if (difficulty === 2) {
      const ops = ['+', '-', '×'];
      const op = ops[Math.floor(Math.random() * ops.length)];
      if (op === '+') {
        const a = Math.floor(Math.random() * 40) + 10;
        const b = Math.floor(Math.random() * 40) + 10;
        text = `${a} + ${b} =`;
        answer = a + b;
      } else if (op === '-') {
        const a = Math.floor(Math.random() * 50) + 20;
        const b = Math.floor(Math.random() * a) + 1;
        text = `${a} - ${b} =`;
        answer = a - b;
      } else {
        const a = Math.floor(Math.random() * 10) + 2;
        const b = Math.floor(Math.random() * 10) + 2;
        text = `${a} × ${b} =`;
        answer = a * b;
      }
    } else {
      // Hard difficulty: Mix of 3-operand and complex 2-operand
      const types = ['3op-mul-add', '3op-mul-sub', '2op-mul-large', '2op-div'];
      const type = types[Math.floor(Math.random() * types.length)];
      
      if (type === '3op-mul-add') {
        const a = Math.floor(Math.random() * 8) + 3;
        const b = Math.floor(Math.random() * 8) + 3;
        const c = Math.floor(Math.random() * 20) + 5;
        text = `${a} × ${b} + ${c} =`;
        answer = (a * b) + c;
      } else if (type === '3op-mul-sub') {
        const a = Math.floor(Math.random() * 8) + 3;
        const b = Math.floor(Math.random() * 8) + 3;
        const c = Math.floor(Math.random() * (a * b - 1)) + 1; // Ensure no negative outcome
        text = `${a} × ${b} - ${c} =`;
        answer = (a * b) - c;
      } else if (type === '2op-mul-large') {
        const a = Math.floor(Math.random() * 15) + 5;
        const b = Math.floor(Math.random() * 15) + 5;
        text = `${a} × ${b} =`;
        answer = a * b;
      } else {
        const b = Math.floor(Math.random() * 12) + 3;
        const answerVal = Math.floor(Math.random() * 12) + 3;
        const a = answerVal * b;
        text = `${a} ÷ ${b} =`;
        answer = answerVal;
      }
    }

    setProblemText(text);
    setCorrectAnswer(answer);
    setUserAnswer('');
    setFeedback(null);
    Animated.spring(cardAnim, { toValue: 1, tension: 60, friction: 10, useNativeDriver: true }).start();
  }, [difficulty]);

  useEffect(() => {
    generateProblem();
  }, [generateProblem]);

  const triggerShake = () => {
    shakeAnim.setValue(0);
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 8, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -8, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 40, useNativeDriver: true }),
    ]).start();
  };

  const handleSubmit = () => {
    const answer = parseFloat(userAnswer);
    if (answer === correctAnswer) {
      onComplete();
    } else {
      Vibration.vibrate(250);
      triggerShake();
      setFeedback('wrong');
      setTimeout(() => {
        setFeedback(null);
        setUserAnswer('');
        onFail();
      }, 600);
    }
  };

  const handleKeypadPress = (val: string) => {
    if (val === 'C') {
      setUserAnswer('');
    } else if (val === 'DEL') {
      setUserAnswer((prev) => prev.slice(0, -1));
    } else {
      setUserAnswer((prev) => (prev.length < 5 ? prev + val : prev));
    }
  };

  const difficultyLabel = ['Easy', 'Medium', 'Hard'][difficulty - 1];
  const difficultyColor = ['#34C759', '#FF9F0A', '#FF453A'][difficulty - 1];

  return (
    <View style={styles.container}>
      {/* MATH CHALLENGE text and difficulty pill removed since AlarmRingScreen handles it */}
      <View style={styles.header}></View>

      {/* Inline Math Problem Area */}
      <Animated.View style={[styles.inlineRow, { transform: [{ translateX: shakeAnim }] }]}>
        <Text style={styles.problemText} adjustsFontSizeToFit numberOfLines={1}>
          {problemText}
        </Text>
        <View
          style={[
            styles.inlineInput,
            feedback === 'wrong' && styles.inputError,
          ]}
        >
          <Text style={[styles.inlineInputText, !userAnswer && styles.placeholderText]}>
            {userAnswer || '?'}
          </Text>
        </View>
      </Animated.View>


      {/* Custom Numpad */}
      <View style={styles.keypadContainer}>
        {[
          ['1', '2', '3'],
          ['4', '5', '6'],
          ['7', '8', '9'],
          ['C', '0', 'DEL']
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
                  (key === 'C' || key === 'DEL') && styles.keypadActionText
                ]}>
                  {key === 'DEL' ? '⌫' : key}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        ))}
      </View>

      {/* Submit Button */}
      <TouchableOpacity
        style={[styles.submitBtn, !userAnswer && styles.submitBtnDisabled]}
        onPress={handleSubmit}
        disabled={!userAnswer}
        activeOpacity={0.8}
      >
        <Text style={styles.submitText}>Submit Answer</Text>
      </TouchableOpacity>
    </View>
  );
};

const getStyles = (colors: any, isDark: boolean) => StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
    paddingBottom: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 36,
  },
  topLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: isDark ? colors.subtext : 'rgba(46,30,26,0.35)',
    letterSpacing: 4,
    marginBottom: 12,
    textTransform: 'uppercase',
  },
  difficultyPill: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 5,
    gap: 6,
  },
  difficultyDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  difficultyText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  inlineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: isDark ? colors.surfaceHighlight : 'rgba(46,30,26,0.03)',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: isDark ? colors.border : 'rgba(46,30,26,0.08)',
    paddingVertical: 20,
    paddingHorizontal: 24,
    marginBottom: 32,
    gap: 16,
    width: '100%',
  },
  problemText: {
    fontSize: 48,
    fontWeight: '900',
    color: colors.text,
    letterSpacing: -1,
    flexShrink: 1,
  },
  inlineInput: {
    width: 90,
    height: 72,
    backgroundColor: isDark ? colors.surface : 'rgba(46,30,26,0.05)',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: isDark ? colors.border : 'rgba(46,30,26,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  inlineInputText: {
    fontSize: 40,
    fontWeight: '800',
    color: colors.text,
    textAlign: 'center',
    letterSpacing: -1,
  },
  placeholderText: {
    color: isDark ? colors.border : 'rgba(46,30,26,0.2)',
  },
  inputError: {
    borderColor: '#FF453A',
    backgroundColor: 'rgba(255,69,58,0.1)',
  },
  submitBtn: {
    width: '100%',
    height: 58,
    backgroundColor: '#FF7F62',
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: '#FF7F62',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  submitBtnDisabled: {
    backgroundColor: 'rgba(255,127,98,0.3)',
    shadowOpacity: 0,
    elevation: 0,
  },
  submitText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  hintText: {
    fontSize: 13,
    color: colors.subtext,
    textAlign: 'center',
  },
  keypadContainer: {
    width: '100%',
    paddingHorizontal: 10,
    marginBottom: 24,
    gap: 12,
  },
  keypadRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  keypadButton: {
    flex: 1,
    height: 60,
    backgroundColor: isDark ? colors.surfaceHighlight : 'rgba(46,30,26,0.04)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: isDark ? colors.border : 'rgba(46,30,26,0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  keypadButtonText: {
    fontSize: 26,
    fontWeight: '600',
    color: colors.text,
  },
  keypadActionText: {
    fontSize: 22,
    color: colors.subtext,
  },
});