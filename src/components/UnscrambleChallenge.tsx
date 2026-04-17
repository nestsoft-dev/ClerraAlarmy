import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  Animated, Vibration, SafeAreaView
} from 'react-native';
import { ChallengeDifficulty } from '../types';
import { useTheme } from '../context/ThemeContext';

// ─── Word Banks ──────────────────────────────────────────────────────────────
const WORDS = {
  easy: [
    // 3-letter words
    'CAT', 'DOG', 'SUN', 'MAP', 'JAR', 'BUS', 'FLY', 'GUM',
    'HAT', 'JOY', 'KEY', 'LOG', 'MUD', 'NET', 'OAK', 'PIG',
  ],
  medium: [
    // 4-letter words
    'CAKE', 'LAMP', 'FROG', 'DESK', 'BIRD', 'SHIP', 'DRUM', 'LEAF',
    'COIN', 'FISH', 'JUMP', 'WOLF', 'MILK', 'RAIN', 'STAR', 'BALL',
  ],
  hard: [
    // 5-letter words
    'PLANT', 'BREAD', 'CHAIR', 'FLAME', 'GLOBE', 'HOUSE', 'JUICE', 'KNIFE',
    'LIGHT', 'MONEY', 'NIGHT', 'OCEAN', 'PEACE', 'QUEEN', 'RIVER', 'SMILE',
  ],
};

function scramble(word: string): string {
  const arr = word.split('');
  let result = word;
  let attempts = 0;
  while (result === word && attempts < 20) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    result = arr.join('');
    attempts++;
  }
  return result;
}

interface Props {
  difficulty: ChallengeDifficulty;
  onComplete: () => void;
  onFail: () => void;
}

export const UnscrambleChallenge: React.FC<Props> = ({ difficulty, onComplete, onFail }) => {
  const { colors, isDark } = useTheme();
  const styles = getStyles(colors, isDark);
  const pool = difficulty === 1 ? WORDS.easy : difficulty === 2 ? WORDS.medium : WORDS.hard;
  const diffLabel = difficulty === 1 ? 'Easy' : difficulty === 2 ? 'Medium' : 'Hard';

  const pickWord = () => pool[Math.floor(Math.random() * pool.length)];
  const [original, setOriginal] = useState(() => pickWord());
  const [scrambled, setScrambled] = useState<string>(() => scramble(original));

  const [pickedIndices, setPickedIndices] = useState<number[]>([]);
  const [result, setResult] = useState<'correct' | 'wrong' | null>(null);
  const attemptCount = useRef(0);
  const shakeAnim = useRef(new Animated.Value(0)).current;

  const currentAnswer = pickedIndices.map(i => scrambled[i]).join('');

  const handlePick = (index: number) => {
    if (!pickedIndices.includes(index) && pickedIndices.length < original.length) {
      setPickedIndices([...pickedIndices, index]);
    }
  };

  const handleUnpick = (indexToRemove: number) => {
    setPickedIndices(pickedIndices.filter(i => i !== indexToRemove));
  };

  const shake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 14, duration: 55, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -14, duration: 55, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 10, duration: 55, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 55, useNativeDriver: true }),
    ]).start();
  };

  const handleSubmit = () => {
    if (currentAnswer === original) {
      setResult('correct');
      Vibration.vibrate([0, 100, 60, 100]);
      setTimeout(() => onComplete(), 700);
    } else {
      setResult('wrong');
      shake();
      Vibration.vibrate([0, 400]);
      attemptCount.current += 1;
      setTimeout(() => {
        // Change word only every 3 failures
        if (attemptCount.current >= 3) {
          attemptCount.current = 0;
          const nextWord = pickWord();
          setOriginal(nextWord);
          setScrambled(scramble(nextWord));
        }
        setResult(null);
        setPickedIndices([]);
        onFail();
      }, 1000);
    }
  };

  return (
    <SafeAreaView style={styles.flex}>
      <View style={styles.container}>

        {/* Ultra-minimal answer area */}
        <Animated.View style={[styles.answerArea, { transform: [{ translateX: shakeAnim }] }]}>
          <View style={styles.answerRow}>
            {Array.from({ length: original.length }).map((_, i) => {
               const pickedIndex = pickedIndices[i];
               const isActive = pickedIndex !== undefined;
               const letter = isActive ? scrambled[pickedIndex] : '';
               
               return (
                 <TouchableOpacity
                   key={`ans-${i}`}
                   style={[styles.answerLine, result === 'wrong' && styles.answerLineWrong, result === 'correct' && styles.answerLineCorrect]}
                   onPress={() => isActive && handleUnpick(pickedIndex)}
                   disabled={!isActive || result !== null}
                   activeOpacity={isActive ? 0.6 : 1}
                 >
                   <Text style={[styles.answerText, result === 'wrong' && styles.answerTextWrong, result === 'correct' && styles.answerTextCorrect]}>
                     {letter}
                   </Text>
                 </TouchableOpacity>
               );
            })}
          </View>
        </Animated.View>

        {/* Minimal scrambled source pool */}
        <View style={styles.scrambledRow}>
          {scrambled.split('').map((letter, i) => {
            const isPicked = pickedIndices.includes(i);
            return (
              <TouchableOpacity
                key={i}
                style={[styles.letterTile, isPicked && styles.letterTileHidden]}
                onPress={() => handlePick(i)}
                disabled={isPicked || pickedIndices.length >= original.length || result !== null}
                activeOpacity={0.6}
              >
                <Text style={styles.letterText}>
                  {isPicked ? '' : letter}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <TouchableOpacity
          style={[styles.primaryBtn, pickedIndices.length < original.length && styles.primaryBtnDisabled]}
          onPress={handleSubmit}
          disabled={pickedIndices.length < original.length || result !== null}
          activeOpacity={0.8}
        >
          <Text style={[styles.primaryBtnText, pickedIndices.length < original.length && styles.primaryBtnTextDisabled]}>
            Complete
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const getStyles = (colors: any, isDark: boolean) => StyleSheet.create({
  flex: { 
    flex: 1, 
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  diffLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FF7F62',
    letterSpacing: 3,
    textTransform: 'uppercase',
    marginBottom: 32,
  },
  answerArea: {
    width: '100%',
    marginBottom: 80,
    alignItems: 'center',
  },
  answerRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  answerLine: {
    width: 32,
    height: 48,
    borderBottomWidth: 3,
    borderColor: colors.text,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: 4,
  },
  answerLineWrong: {
    borderColor: '#FF3B30',
  },
  answerLineCorrect: {
    borderColor: '#34C759',
  },
  answerText: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.text,
  },
  answerTextWrong: {
    color: '#FF3B30',
  },
  answerTextCorrect: {
    color: '#34C759',
  },
  scrambledRow: {
    flexDirection: 'row',
    gap: 12,
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 80,
  },
  letterTile: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: isDark ? colors.surfaceHighlight : 'rgba(46,30,26,0.04)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  letterTileHidden: {
    backgroundColor: 'transparent',
  },
  letterText: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.text,
  },
  primaryBtn: {
    backgroundColor: '#FF7F62',
    borderRadius: 30,
    height: 60,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBtnDisabled: { 
    backgroundColor: isDark ? colors.surface : 'rgba(46,30,26,0.04)',
  },
  primaryBtnText: { 
    color: '#fff', 
    fontSize: 18, 
    fontWeight: '700', 
    letterSpacing: 0.5 
  },
  primaryBtnTextDisabled: {
    color: colors.subtext,
  }
});
