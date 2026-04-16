<<<<<<< HEAD
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, Vibration } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { ChallengeDifficulty } from '../types';

interface QuizChallengeProps {
  difficulty: ChallengeDifficulty;
  onComplete: () => void;
  onFail: () => void;
}

import { QUIZ_BANKS, Question } from '../data/quizzes';

// Fisher-Yates array shuffle modifier
function shuffleArray(array: any[]) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

export const QuizChallenge: React.FC<QuizChallengeProps> = ({ difficulty, onComplete, onFail }) => {
  const { colors, isDark } = useTheme();
  const styles = getStyles(colors, isDark);

  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [shuffledOptions, setShuffledOptions] = useState<{text: string, isCorrect: boolean}[]>([]);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const cardAnim = useRef(new Animated.Value(0)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;

  const loadQuestion = useCallback(() => {
    const bank = QUIZ_BANKS[difficulty] || QUIZ_BANKS[1];
    const q = bank[Math.floor(Math.random() * bank.length)];
    
    // Shuffle options while keeping track of the correct one
    const optionsWithState = q.options.map((opt, index) => ({
      text: opt,
      isCorrect: index === q.answerIndex
    }));
    shuffleArray(optionsWithState);

    setCurrentQuestion(q);
    setShuffledOptions(optionsWithState);
    setSelectedIdx(null);
    setIsProcessing(false);

    cardAnim.setValue(0);
    Animated.spring(cardAnim, { toValue: 1, tension: 60, friction: 10, useNativeDriver: true }).start();
  }, [difficulty]);

  useEffect(() => {
    loadQuestion();
  }, [loadQuestion]);

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

  const handleSelect = (idx: number) => {
    if (isProcessing) return;
    setIsProcessing(true);
    setSelectedIdx(idx);

    const isCorrect = shuffledOptions[idx].isCorrect;

    if (isCorrect) {
      setTimeout(() => {
        onComplete();
      }, 400); // Tiny delay to show green color
    } else {
      Vibration.vibrate(250);
      triggerShake();
      setTimeout(() => {
        onFail();
        // Load a new question after failing to prevent brute forcing
        loadQuestion();
      }, 600);
    }
  };

  const difficultyLabel = ['Easy', 'Medium', 'Hard'][difficulty - 1];
  const difficultyColor = ['#34C759', '#FF9F0A', '#FF453A'][difficulty - 1];

  if (!currentQuestion) return null;

  return (
    <View style={styles.container}>
      <View style={styles.header}></View>

      <Animated.View style={[styles.card, { 
        transform: [
          { scale: cardAnim.interpolate({ inputRange: [0, 1], outputRange: [0.95, 1] }) },
          { translateX: shakeAnim }
        ],
        opacity: cardAnim
      }]}>
        <Text style={styles.questionText}>
          {currentQuestion.q}
        </Text>

        <View style={styles.optionsContainer}>
          {shuffledOptions.map((opt, idx) => {
            let itemStyle = styles.optionItem;
            let textStyle = styles.optionText;
            
            if (selectedIdx === idx) {
              if (opt.isCorrect) {
                itemStyle = styles.optionItemCorrect;
                textStyle = styles.optionTextCorrect;
              } else {
                itemStyle = styles.optionItemWrong;
                textStyle = styles.optionTextWrong;
              }
            } else if (selectedIdx !== null && opt.isCorrect) {
              // Highlight correct answer if they got it wrong
              itemStyle = styles.optionItemCorrect;
              textStyle = styles.optionTextCorrect;
            }

            return (
              <TouchableOpacity
                key={idx}
                style={itemStyle}
                onPress={() => handleSelect(idx)}
                disabled={isProcessing}
                activeOpacity={0.7}
              >
                <Text style={textStyle}>{opt.text}</Text>
              </TouchableOpacity>
            )
          })}
        </View>
      </Animated.View>
    </View>
  );
};

const getStyles = (colors: any, isDark: boolean) => StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 10,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  difficultyPill: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 6,
    gap: 8,
  },
  difficultyDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  difficultyText: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  card: {
    width: '100%',
    backgroundColor: colors.surface,
    borderRadius: 24,
    padding: 24,
    shadowColor: isDark ? '#000' : '#342521',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 4,
  },
  questionText: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.text,
    textAlign: 'center',
    lineHeight: 32,
    marginBottom: 32,
  },
  optionsContainer: {
    gap: 12,
  },
  optionItem: {
    backgroundColor: isDark ? colors.surfaceHighlight : '#FEF4EC',
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderWidth: 2,
    borderColor: isDark ? colors.border : 'transparent',
    alignItems: 'center',
  },
  optionText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  optionItemCorrect: {
    backgroundColor: '#34C759',
    borderColor: '#34C759',
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderWidth: 2,
    alignItems: 'center',
  },
  optionTextCorrect: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  optionItemWrong: {
    backgroundColor: '#FF453A',
    borderColor: '#FF453A',
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderWidth: 2,
    alignItems: 'center',
  },
  optionTextWrong: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
=======
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, Vibration } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { ChallengeDifficulty } from '../types';

interface QuizChallengeProps {
  difficulty: ChallengeDifficulty;
  onComplete: () => void;
  onFail: () => void;
}

import { QUIZ_BANKS, Question } from '../data/quizzes';

// Fisher-Yates array shuffle modifier
function shuffleArray(array: any[]) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

export const QuizChallenge: React.FC<QuizChallengeProps> = ({ difficulty, onComplete, onFail }) => {
  const { colors, isDark } = useTheme();
  const styles = getStyles(colors, isDark);

  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [shuffledOptions, setShuffledOptions] = useState<{text: string, isCorrect: boolean}[]>([]);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const cardAnim = useRef(new Animated.Value(0)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;

  const loadQuestion = useCallback(() => {
    const bank = QUIZ_BANKS[difficulty] || QUIZ_BANKS[1];
    const q = bank[Math.floor(Math.random() * bank.length)];
    
    // Shuffle options while keeping track of the correct one
    const optionsWithState = q.options.map((opt, index) => ({
      text: opt,
      isCorrect: index === q.answerIndex
    }));
    shuffleArray(optionsWithState);

    setCurrentQuestion(q);
    setShuffledOptions(optionsWithState);
    setSelectedIdx(null);
    setIsProcessing(false);

    cardAnim.setValue(0);
    Animated.spring(cardAnim, { toValue: 1, tension: 60, friction: 10, useNativeDriver: true }).start();
  }, [difficulty]);

  useEffect(() => {
    loadQuestion();
  }, [loadQuestion]);

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

  const handleSelect = (idx: number) => {
    if (isProcessing) return;
    setIsProcessing(true);
    setSelectedIdx(idx);

    const isCorrect = shuffledOptions[idx].isCorrect;

    if (isCorrect) {
      setTimeout(() => {
        onComplete();
      }, 400); // Tiny delay to show green color
    } else {
      Vibration.vibrate(250);
      triggerShake();
      setTimeout(() => {
        onFail();
        // Load a new question after failing to prevent brute forcing
        loadQuestion();
      }, 600);
    }
  };

  const difficultyLabel = ['Easy', 'Medium', 'Hard'][difficulty - 1];
  const difficultyColor = ['#34C759', '#FF9F0A', '#FF453A'][difficulty - 1];

  if (!currentQuestion) return null;

  return (
    <View style={styles.container}>
      <View style={styles.header}></View>

      <Animated.View style={[styles.card, { 
        transform: [
          { scale: cardAnim.interpolate({ inputRange: [0, 1], outputRange: [0.95, 1] }) },
          { translateX: shakeAnim }
        ],
        opacity: cardAnim
      }]}>
        <Text style={styles.questionText}>
          {currentQuestion.q}
        </Text>

        <View style={styles.optionsContainer}>
          {shuffledOptions.map((opt, idx) => {
            let itemStyle = styles.optionItem;
            let textStyle = styles.optionText;
            
            if (selectedIdx === idx) {
              if (opt.isCorrect) {
                itemStyle = styles.optionItemCorrect;
                textStyle = styles.optionTextCorrect;
              } else {
                itemStyle = styles.optionItemWrong;
                textStyle = styles.optionTextWrong;
              }
            } else if (selectedIdx !== null && opt.isCorrect) {
              // Highlight correct answer if they got it wrong
              itemStyle = styles.optionItemCorrect;
              textStyle = styles.optionTextCorrect;
            }

            return (
              <TouchableOpacity
                key={idx}
                style={itemStyle}
                onPress={() => handleSelect(idx)}
                disabled={isProcessing}
                activeOpacity={0.7}
              >
                <Text style={textStyle}>{opt.text}</Text>
              </TouchableOpacity>
            )
          })}
        </View>
      </Animated.View>
    </View>
  );
};

const getStyles = (colors: any, isDark: boolean) => StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 10,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  difficultyPill: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 6,
    gap: 8,
  },
  difficultyDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  difficultyText: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  card: {
    width: '100%',
    backgroundColor: colors.surface,
    borderRadius: 24,
    padding: 24,
    shadowColor: isDark ? '#000' : '#342521',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 4,
  },
  questionText: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.text,
    textAlign: 'center',
    lineHeight: 32,
    marginBottom: 32,
  },
  optionsContainer: {
    gap: 12,
  },
  optionItem: {
    backgroundColor: isDark ? colors.surfaceHighlight : '#FEF4EC',
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderWidth: 2,
    borderColor: isDark ? colors.border : 'transparent',
    alignItems: 'center',
  },
  optionText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  optionItemCorrect: {
    backgroundColor: '#34C759',
    borderColor: '#34C759',
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderWidth: 2,
    alignItems: 'center',
  },
  optionTextCorrect: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  optionItemWrong: {
    backgroundColor: '#FF453A',
    borderColor: '#FF453A',
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderWidth: 2,
    alignItems: 'center',
  },
  optionTextWrong: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
>>>>>>> origin/main
