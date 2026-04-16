<<<<<<< HEAD
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { ChallengeConfig, ChallengeType, ChallengeDifficulty } from '../types';

interface ChallengeConfigModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (config: ChallengeConfig) => void;
  initialConfig: ChallengeConfig | null;
}

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

const CHALLENGE_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  math: 'calculator',
  shake: 'phone-portrait',
  photo: 'camera',
  jump: 'arrow-up',
  brush: 'water',
  pushup: 'barbell',
  color: 'color-palette',
  unscramble: 'text',
  riddle: 'help-circle',
  memory: 'grid',
  quiz: 'list',
};

const CONFIGURABLE_CHALLENGES = ['math', 'shake', 'unscramble', 'riddle', 'memory', 'quiz', 'jump', 'pushup'];

export const ChallengeConfigModal: React.FC<ChallengeConfigModalProps> = ({
  visible,
  onClose,
  onSave,
  initialConfig,
}) => {
  const { colors, isDark } = useTheme();
  const styles = getStyles(colors, isDark);

  const [numProblems, setNumProblems] = useState(1);
  const [difficulty, setDifficulty] = useState<ChallengeDifficulty>(1);

  // Sync state when modal opens
  useEffect(() => {
    if (visible && initialConfig) {
      setNumProblems(initialConfig.numProblems || 1);
      setDifficulty(initialConfig.difficulty || 1);
    }
  }, [visible, initialConfig]);

  if (!initialConfig) return null;

  const isConfigurable = CONFIGURABLE_CHALLENGES.includes(initialConfig.type);
  const iconName = CHALLENGE_ICONS[initialConfig.type] || 'flask';

  const handleSave = () => {
    if (isConfigurable) {
      onSave({
        ...initialConfig,
        numProblems,
        difficulty,
      });
    } else {
      // Allow overriding just numProblems for non-configurable challenges like Shake if the user wants?
      // Actually, per requested "all challenges", everything gets numProblems config now!
      onSave({
        ...initialConfig,
        numProblems,
        difficulty: 1, 
      });
    }
    onClose();
  };

  const adjustProblems = (amount: number) => {
    setNumProblems((prev) => {
      const next = prev + amount;
      if (next < 1) return 1;
      if (next > 10) return 10;
      return next;
    });
  };

  const getPreviewText = () => {
    switch (initialConfig.type) {
      case 'math':
        return difficulty === 1 ? '5 + 3 = ?' : difficulty === 2 ? '21 + 4 × 9 = ?' : '15 × (4 + 6) = ?';
      case 'unscramble':
        return difficulty === 1 ? 'd g o (dog)' : difficulty === 2 ? 'l w e a t h (wealth)' : 'c a n s d e l p a (landscape)';
      case 'color':
        return 'Find the color Red';
      case 'riddle':
        return difficulty === 1 ? 'What has keys but no locks?' : difficulty === 2 ? 'I speak without a mouth.' : 'I am not alive, but I grow.';
      case 'memory':
        return difficulty === 1 ? 'Memorise 4 digits' : difficulty === 2 ? 'Memorise 5 digits' : 'Memorise 6 digits';
      case 'quiz':
        return difficulty === 1 ? 'Which is a primary color?' : difficulty === 2 ? 'What is the sum of angles in a triangle?' : 'Who wrote the Odyssey?';
      case 'jump':
        return difficulty === 1 ? 'Jump up 10 times' : difficulty === 2 ? 'Jump up 20 times' : 'Jump up 30 times';
      case 'pushup':
        return difficulty === 1 ? 'Do 10 push-ups' : difficulty === 2 ? 'Do 20 push-ups' : 'Do 30 push-ups';
      case 'shake':
        return difficulty === 1 ? 'Shake 10 times' : difficulty === 2 ? 'Shake 15 times' : 'Shake 20 times';
      default:
        // E.g. shake, brush, photo
        return `Complete ${CHALLENGE_LABELS[initialConfig.type]} mission`;
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="chevron-down" size={28} color={colors.text} />
            </TouchableOpacity>
            <Text style={styles.title}>{CHALLENGE_LABELS[initialConfig.type]} Mission</Text>
            <TouchableOpacity onPress={handleSave}>
              <Text style={styles.saveButtonText}>Save</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollArea} showsVerticalScrollIndicator={false}>
            
            {/* Preview Card */}
            <View style={styles.card}>
              <View style={styles.previewHeaderRow}>
                <Ionicons name={iconName} size={20} color={colors.accent} />
                <Text style={styles.previewLabel}>LIVE PREVIEW</Text>
              </View>
              <View style={styles.previewContentContainer}>
                <Text style={styles.previewContentText}>{getPreviewText()}</Text>
              </View>
            </View>

            {/* Config Card: Number of Problems (Applies to ALL challenges) */}
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Number of Rounds</Text>
              <Text style={styles.sectionSub}>How many times to repeat this challenge</Text>
              
              <View style={styles.stepperContainer}>
                <TouchableOpacity 
                   onPress={() => adjustProblems(-1)} 
                   style={[styles.stepperBtn, numProblems <= 1 && { opacity: 0.3 }]}
                   disabled={numProblems <= 1}
                >
                  <Ionicons name="remove" size={28} color={colors.text} />
                </TouchableOpacity>
                
                <Text style={styles.stepperValue}>{numProblems}</Text>
                
                <TouchableOpacity 
                   onPress={() => adjustProblems(1)} 
                   style={[styles.stepperBtn, numProblems >= 10 && { opacity: 0.3 }]}
                   disabled={numProblems >= 10}
                >
                  <Ionicons name="add" size={28} color={colors.text} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Config Card: Difficulty (Only if configurable) */}
            {isConfigurable && (
              <View style={styles.card}>
                <Text style={styles.sectionTitle}>Difficulty Level</Text>
                <Text style={styles.sectionSub}>Adjust the complexity of the puzzle</Text>
                
                <View style={styles.segmentedControl}>
                  {(['1', '2', '3'] as const).map((levelStr) => {
                    const level = parseInt(levelStr) as ChallengeDifficulty;
                    const isActive = difficulty === level;
                    const label = level === 1 ? 'Easy' : level === 2 ? 'Normal' : 'Hard';
                    
                    return (
                      <TouchableOpacity
                        key={level}
                        style={[
                          styles.segmentBtn,
                          isActive && styles.segmentBtnActive
                        ]}
                        onPress={() => setDifficulty(level)}
                        activeOpacity={0.7}
                      >
                        <Text style={[
                          styles.segmentText,
                          isActive && styles.segmentTextActive
                        ]}>{label}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            )}

            {!isConfigurable && (
              <View style={styles.card}>
                <Text style={[styles.sectionSub, {marginBottom: 0, textAlign: 'center'}]}>
                  Difficulty settings are not available for this challenge type.
                </Text>
              </View>
            )}

          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const getStyles = (colors: any, isDark: boolean) => StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: isDark ? 'rgba(0,0,0,0.8)' : 'rgba(52,37,33,0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    height: '75%',
    backgroundColor: colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    marginBottom: 16,
  },
  closeBtn: {
    padding: 4,
    marginLeft: -4,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
  },
  saveButtonText: {
    fontSize: 18,
    color: colors.accent,
    fontWeight: 'bold',
    padding: 4,
    marginRight: -4,
  },
  scrollArea: {
    flex: 1,
    paddingHorizontal: 24,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    padding: 24,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  previewHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    gap: 8,
  },
  previewLabel: {
    fontSize: 12,
    color: colors.subtext,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  previewContentContainer: {
    backgroundColor: isDark ? colors.background : '#F8F1EB',
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 100,
  },
  previewContentText: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.text,
    textAlign: 'center',
  },
  sectionTitle: { 
    fontSize: 18, 
    fontWeight: '800', 
    color: colors.text, 
    marginBottom: 6 
  },
  sectionSub: { 
    fontSize: 13, 
    color: colors.subtext, 
    marginBottom: 24
  },
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: isDark ? colors.background : '#F8F1EB',
    borderRadius: 16,
    padding: 8,
  },
  stepperBtn: {
    width: 50,
    height: 50,
    borderRadius: 12,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  stepperValue: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.text,
    width: 60,
    textAlign: 'center',
  },
  segmentedControl: {
    flexDirection: 'row',
    backgroundColor: isDark ? colors.background : '#F8F1EB',
    borderRadius: 16,
    padding: 6,
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    borderRadius: 12,
  },
  segmentBtnActive: {
    backgroundColor: colors.surface,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  segmentText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.subtext,
  },
  segmentTextActive: {
    color: colors.accent,
    fontWeight: '800',
  },
});
=======
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { ChallengeConfig, ChallengeType, ChallengeDifficulty } from '../types';

interface ChallengeConfigModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (config: ChallengeConfig) => void;
  initialConfig: ChallengeConfig | null;
}

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

const CHALLENGE_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  math: 'calculator',
  shake: 'phone-portrait',
  photo: 'camera',
  jump: 'arrow-up',
  brush: 'water',
  pushup: 'barbell',
  color: 'color-palette',
  unscramble: 'text',
  riddle: 'help-circle',
  memory: 'grid',
  quiz: 'list',
};

const CONFIGURABLE_CHALLENGES = ['math', 'shake', 'unscramble', 'riddle', 'memory', 'quiz', 'jump', 'pushup'];

export const ChallengeConfigModal: React.FC<ChallengeConfigModalProps> = ({
  visible,
  onClose,
  onSave,
  initialConfig,
}) => {
  const { colors, isDark } = useTheme();
  const styles = getStyles(colors, isDark);

  const [numProblems, setNumProblems] = useState(1);
  const [difficulty, setDifficulty] = useState<ChallengeDifficulty>(1);

  // Sync state when modal opens
  useEffect(() => {
    if (visible && initialConfig) {
      setNumProblems(initialConfig.numProblems || 1);
      setDifficulty(initialConfig.difficulty || 1);
    }
  }, [visible, initialConfig]);

  if (!initialConfig) return null;

  const isConfigurable = CONFIGURABLE_CHALLENGES.includes(initialConfig.type);
  const iconName = CHALLENGE_ICONS[initialConfig.type] || 'flask';

  const handleSave = () => {
    if (isConfigurable) {
      onSave({
        ...initialConfig,
        numProblems,
        difficulty,
      });
    } else {
      // Allow overriding just numProblems for non-configurable challenges like Shake if the user wants?
      // Actually, per requested "all challenges", everything gets numProblems config now!
      onSave({
        ...initialConfig,
        numProblems,
        difficulty: 1, 
      });
    }
    onClose();
  };

  const adjustProblems = (amount: number) => {
    setNumProblems((prev) => {
      const next = prev + amount;
      if (next < 1) return 1;
      if (next > 10) return 10;
      return next;
    });
  };

  const getPreviewText = () => {
    switch (initialConfig.type) {
      case 'math':
        return difficulty === 1 ? '5 + 3 = ?' : difficulty === 2 ? '21 + 4 × 9 = ?' : '15 × (4 + 6) = ?';
      case 'unscramble':
        return difficulty === 1 ? 'd g o (dog)' : difficulty === 2 ? 'l w e a t h (wealth)' : 'c a n s d e l p a (landscape)';
      case 'color':
        return 'Find the color Red';
      case 'riddle':
        return difficulty === 1 ? 'What has keys but no locks?' : difficulty === 2 ? 'I speak without a mouth.' : 'I am not alive, but I grow.';
      case 'memory':
        return difficulty === 1 ? 'Memorise 4 digits' : difficulty === 2 ? 'Memorise 5 digits' : 'Memorise 6 digits';
      case 'quiz':
        return difficulty === 1 ? 'Which is a primary color?' : difficulty === 2 ? 'What is the sum of angles in a triangle?' : 'Who wrote the Odyssey?';
      case 'jump':
        return difficulty === 1 ? 'Jump up 10 times' : difficulty === 2 ? 'Jump up 20 times' : 'Jump up 30 times';
      case 'pushup':
        return difficulty === 1 ? 'Do 10 push-ups' : difficulty === 2 ? 'Do 20 push-ups' : 'Do 30 push-ups';
      case 'shake':
        return difficulty === 1 ? 'Shake 10 times' : difficulty === 2 ? 'Shake 15 times' : 'Shake 20 times';
      default:
        // E.g. shake, brush, photo
        return `Complete ${CHALLENGE_LABELS[initialConfig.type]} mission`;
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="chevron-down" size={28} color={colors.text} />
            </TouchableOpacity>
            <Text style={styles.title}>{CHALLENGE_LABELS[initialConfig.type]} Mission</Text>
            <TouchableOpacity onPress={handleSave}>
              <Text style={styles.saveButtonText}>Save</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollArea} showsVerticalScrollIndicator={false}>
            
            {/* Preview Card */}
            <View style={styles.card}>
              <View style={styles.previewHeaderRow}>
                <Ionicons name={iconName} size={20} color={colors.accent} />
                <Text style={styles.previewLabel}>LIVE PREVIEW</Text>
              </View>
              <View style={styles.previewContentContainer}>
                <Text style={styles.previewContentText}>{getPreviewText()}</Text>
              </View>
            </View>

            {/* Config Card: Number of Problems (Applies to ALL challenges) */}
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Number of Rounds</Text>
              <Text style={styles.sectionSub}>How many times to repeat this challenge</Text>
              
              <View style={styles.stepperContainer}>
                <TouchableOpacity 
                   onPress={() => adjustProblems(-1)} 
                   style={[styles.stepperBtn, numProblems <= 1 && { opacity: 0.3 }]}
                   disabled={numProblems <= 1}
                >
                  <Ionicons name="remove" size={28} color={colors.text} />
                </TouchableOpacity>
                
                <Text style={styles.stepperValue}>{numProblems}</Text>
                
                <TouchableOpacity 
                   onPress={() => adjustProblems(1)} 
                   style={[styles.stepperBtn, numProblems >= 10 && { opacity: 0.3 }]}
                   disabled={numProblems >= 10}
                >
                  <Ionicons name="add" size={28} color={colors.text} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Config Card: Difficulty (Only if configurable) */}
            {isConfigurable && (
              <View style={styles.card}>
                <Text style={styles.sectionTitle}>Difficulty Level</Text>
                <Text style={styles.sectionSub}>Adjust the complexity of the puzzle</Text>
                
                <View style={styles.segmentedControl}>
                  {(['1', '2', '3'] as const).map((levelStr) => {
                    const level = parseInt(levelStr) as ChallengeDifficulty;
                    const isActive = difficulty === level;
                    const label = level === 1 ? 'Easy' : level === 2 ? 'Normal' : 'Hard';
                    
                    return (
                      <TouchableOpacity
                        key={level}
                        style={[
                          styles.segmentBtn,
                          isActive && styles.segmentBtnActive
                        ]}
                        onPress={() => setDifficulty(level)}
                        activeOpacity={0.7}
                      >
                        <Text style={[
                          styles.segmentText,
                          isActive && styles.segmentTextActive
                        ]}>{label}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            )}

            {!isConfigurable && (
              <View style={styles.card}>
                <Text style={[styles.sectionSub, {marginBottom: 0, textAlign: 'center'}]}>
                  Difficulty settings are not available for this challenge type.
                </Text>
              </View>
            )}

          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const getStyles = (colors: any, isDark: boolean) => StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: isDark ? 'rgba(0,0,0,0.8)' : 'rgba(52,37,33,0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    height: '75%',
    backgroundColor: colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    marginBottom: 16,
  },
  closeBtn: {
    padding: 4,
    marginLeft: -4,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
  },
  saveButtonText: {
    fontSize: 18,
    color: colors.accent,
    fontWeight: 'bold',
    padding: 4,
    marginRight: -4,
  },
  scrollArea: {
    flex: 1,
    paddingHorizontal: 24,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    padding: 24,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  previewHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    gap: 8,
  },
  previewLabel: {
    fontSize: 12,
    color: colors.subtext,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  previewContentContainer: {
    backgroundColor: isDark ? colors.background : '#F8F1EB',
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 100,
  },
  previewContentText: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.text,
    textAlign: 'center',
  },
  sectionTitle: { 
    fontSize: 18, 
    fontWeight: '800', 
    color: colors.text, 
    marginBottom: 6 
  },
  sectionSub: { 
    fontSize: 13, 
    color: colors.subtext, 
    marginBottom: 24
  },
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: isDark ? colors.background : '#F8F1EB',
    borderRadius: 16,
    padding: 8,
  },
  stepperBtn: {
    width: 50,
    height: 50,
    borderRadius: 12,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  stepperValue: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.text,
    width: 60,
    textAlign: 'center',
  },
  segmentedControl: {
    flexDirection: 'row',
    backgroundColor: isDark ? colors.background : '#F8F1EB',
    borderRadius: 16,
    padding: 6,
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    borderRadius: 12,
  },
  segmentBtnActive: {
    backgroundColor: colors.surface,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  segmentText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.subtext,
  },
  segmentTextActive: {
    color: colors.accent,
    fontWeight: '800',
  },
});
>>>>>>> origin/main
