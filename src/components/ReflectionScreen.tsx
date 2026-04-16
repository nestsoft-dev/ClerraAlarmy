<<<<<<< HEAD
import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard, Animated,
} from 'react-native';
import { generateId, getTodayDateString } from '../utils/storage';
import { Storage } from '../utils/storage';
import { useTheme } from '../context/ThemeContext';

interface ReflectionScreenProps {
  alarmId: string;
  onComplete: () => void;
}

// Time-of-day aware labels & prompts
function getTimeOfDay(): 'morning' | 'afternoon' | 'evening' | 'night' {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 21) return 'evening';
  return 'night';
}

const TIME_LABELS: Record<string, string> = {
  morning: 'MORNING REFLECTION',
  afternoon: 'AFTERNOON REFLECTION',
  evening: 'EVENING REFLECTION',
  night: 'NIGHT REFLECTION',
};

const PROMPTS_BY_TIME: Record<string, string[]> = {
  morning: [
    "What's your #1 priority today?",
    "What will you do differently today?",
    "Who are you trying to become?",
    "What are you grateful for this morning?",
  ],
  afternoon: [
    "Are you on track with today's goals?",
    "What's the most important thing left to do?",
    "What have you accomplished so far today?",
    "What do you need to let go of this afternoon?",
  ],
  evening: [
    "What was your biggest win today?",
    "What could you have done better?",
    "What are you most grateful for today?",
    "What will you do differently tomorrow?",
  ],
  night: [
    "Why are you still up? What matters most?",
    "What are you grateful for today?",
    "What will tomorrow's best version of you do?",
    "What's keeping you from resting?",
  ],
};

export const ReflectionScreen: React.FC<ReflectionScreenProps> = ({ alarmId, onComplete }) => {
  const { colors, isDark } = useTheme();
  const styles = getStyles(colors, isDark);
  const [message, setMessage] = useState('');
  const [activePromptIndex, setActivePromptIndex] = useState(0);
  const timeOfDay = getTimeOfDay();
  const prompts = PROMPTS_BY_TIME[timeOfDay];
  const labelText = TIME_LABELS[timeOfDay];
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    setActivePromptIndex(Math.floor(Math.random() * prompts.length));
    
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, tension: 50, friction: 12, useNativeDriver: true }),
    ]).start();
  }, []);

  const handleSubmit = async () => {
    if (message.trim()) {
      await Storage.addReflection({
        id: generateId(),
        alarmId,
        date: getTodayDateString(),
        message: message.trim(),
        createdAt: Date.now(),
      });
    }
    onComplete();
  };

  const prompt = prompts[activePromptIndex] || prompts[0];

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <Animated.View style={[styles.inner, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          
          <View style={styles.header}>
            <Text style={styles.subtitle}>{labelText}</Text>
            <Text style={styles.title}>{prompt}</Text>
          </View>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={message}
              onChangeText={setMessage}
              placeholder="Start typing..."
              placeholderTextColor={isDark ? colors.subtext : 'rgba(46,30,26,0.3)'}
              multiline
              autoFocus
              selectionColor="#FF7F62"
              textAlignVertical="top"
            />
          </View>

          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.submitBtn, !message.trim() && styles.submitBtnDim]}
              onPress={handleSubmit}
              activeOpacity={0.8}
            >
              <Text style={[styles.submitText, !message.trim() && styles.submitTextDim]}>
                {message.trim() ? 'Complete & Start Day' : 'Skip reflection'}
              </Text>
            </TouchableOpacity>
          </View>

        </Animated.View>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
};

const getStyles = (colors: any, isDark: boolean) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  inner: {
    flex: 1,
    paddingHorizontal: 32,
    paddingTop: Platform.OS === 'ios' ? 100 : 80,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
    justifyContent: 'space-between',
  },
  header: {
    marginBottom: 40,
  },
  subtitle: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.subtext,
    letterSpacing: 2,
    marginBottom: 16,
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 36,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: -1,
    lineHeight: 42,
  },
  inputContainer: {
    flex: 1,
  },
  input: {
    fontSize: 22,
    color: colors.text,
    lineHeight: 34,
    fontWeight: '500',
    flex: 1,
  },
  footer: {
    alignItems: 'center',
    paddingBottom: 20,
  },
  submitBtn: {
    width: '100%',
    height: 60,
    backgroundColor: '#FF7F62',
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FF7F62',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  submitBtnDim: {
    backgroundColor: isDark ? colors.surface : 'rgba(46,30,26,0.05)',
    shadowOpacity: 0,
    elevation: 0,
  },
  submitText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  submitTextDim: {
    color: colors.subtext,
  },
=======
import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard, Animated,
} from 'react-native';
import { generateId, getTodayDateString } from '../utils/storage';
import { Storage } from '../utils/storage';
import { useTheme } from '../context/ThemeContext';

interface ReflectionScreenProps {
  alarmId: string;
  onComplete: () => void;
}

// Time-of-day aware labels & prompts
function getTimeOfDay(): 'morning' | 'afternoon' | 'evening' | 'night' {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 21) return 'evening';
  return 'night';
}

const TIME_LABELS: Record<string, string> = {
  morning: 'MORNING REFLECTION',
  afternoon: 'AFTERNOON REFLECTION',
  evening: 'EVENING REFLECTION',
  night: 'NIGHT REFLECTION',
};

const PROMPTS_BY_TIME: Record<string, string[]> = {
  morning: [
    "What's your #1 priority today?",
    "What will you do differently today?",
    "Who are you trying to become?",
    "What are you grateful for this morning?",
  ],
  afternoon: [
    "Are you on track with today's goals?",
    "What's the most important thing left to do?",
    "What have you accomplished so far today?",
    "What do you need to let go of this afternoon?",
  ],
  evening: [
    "What was your biggest win today?",
    "What could you have done better?",
    "What are you most grateful for today?",
    "What will you do differently tomorrow?",
  ],
  night: [
    "Why are you still up? What matters most?",
    "What are you grateful for today?",
    "What will tomorrow's best version of you do?",
    "What's keeping you from resting?",
  ],
};

export const ReflectionScreen: React.FC<ReflectionScreenProps> = ({ alarmId, onComplete }) => {
  const { colors, isDark } = useTheme();
  const styles = getStyles(colors, isDark);
  const [message, setMessage] = useState('');
  const [activePromptIndex, setActivePromptIndex] = useState(0);
  const timeOfDay = getTimeOfDay();
  const prompts = PROMPTS_BY_TIME[timeOfDay];
  const labelText = TIME_LABELS[timeOfDay];
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    setActivePromptIndex(Math.floor(Math.random() * prompts.length));
    
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, tension: 50, friction: 12, useNativeDriver: true }),
    ]).start();
  }, []);

  const handleSubmit = async () => {
    if (message.trim()) {
      await Storage.addReflection({
        id: generateId(),
        alarmId,
        date: getTodayDateString(),
        message: message.trim(),
        createdAt: Date.now(),
      });
    }
    onComplete();
  };

  const prompt = prompts[activePromptIndex] || prompts[0];

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <Animated.View style={[styles.inner, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          
          <View style={styles.header}>
            <Text style={styles.subtitle}>{labelText}</Text>
            <Text style={styles.title}>{prompt}</Text>
          </View>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={message}
              onChangeText={setMessage}
              placeholder="Start typing..."
              placeholderTextColor={isDark ? colors.subtext : 'rgba(46,30,26,0.3)'}
              multiline
              autoFocus
              selectionColor="#FF7F62"
              textAlignVertical="top"
            />
          </View>

          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.submitBtn, !message.trim() && styles.submitBtnDim]}
              onPress={handleSubmit}
              activeOpacity={0.8}
            >
              <Text style={[styles.submitText, !message.trim() && styles.submitTextDim]}>
                {message.trim() ? 'Complete & Start Day' : 'Skip reflection'}
              </Text>
            </TouchableOpacity>
          </View>

        </Animated.View>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
};

const getStyles = (colors: any, isDark: boolean) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  inner: {
    flex: 1,
    paddingHorizontal: 32,
    paddingTop: Platform.OS === 'ios' ? 100 : 80,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
    justifyContent: 'space-between',
  },
  header: {
    marginBottom: 40,
  },
  subtitle: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.subtext,
    letterSpacing: 2,
    marginBottom: 16,
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 36,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: -1,
    lineHeight: 42,
  },
  inputContainer: {
    flex: 1,
  },
  input: {
    fontSize: 22,
    color: colors.text,
    lineHeight: 34,
    fontWeight: '500',
    flex: 1,
  },
  footer: {
    alignItems: 'center',
    paddingBottom: 20,
  },
  submitBtn: {
    width: '100%',
    height: 60,
    backgroundColor: '#FF7F62',
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FF7F62',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  submitBtnDim: {
    backgroundColor: isDark ? colors.surface : 'rgba(46,30,26,0.05)',
    shadowOpacity: 0,
    elevation: 0,
  },
  submitText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  submitTextDim: {
    color: colors.subtext,
  },
>>>>>>> origin/main
});