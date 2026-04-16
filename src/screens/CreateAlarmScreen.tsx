import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView,
  Alert, Platform, TextInput, Modal
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useAlarm } from '../context/AlarmContext';
import { useTheme } from '../context/ThemeContext';
import { SoundPicker } from '../components/SoundPicker';
import { BackgroundPicker } from '../components/BackgroundPicker';
import { ChallengeConfigModal } from '../components/ChallengeConfigModal';
import { useSettings } from '../context/SettingsContext';
import { Alarm, ChallengeType, ChallengeConfig } from '../types';
import { Ionicons } from '@expo/vector-icons';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { DEFAULT_SOUND_ID } from '../constants/sounds';
import { generateId } from '../utils/storage';
import { cancelAlarmNotifications, scheduleAlarmNotifications } from '../utils/notificationScheduler';

type RootStackParamList = {
  Home: undefined;
  CreateAlarm: { alarm?: Alarm };
};

const ORDERED_DAYS = [
  { label: 'M', value: 1 },
  { label: 'T', value: 2 },
  { label: 'W', value: 3 },
  { label: 'T', value: 4 },
  { label: 'F', value: 5 },
  { label: 'S', value: 6 },
  { label: 'S', value: 0 },
];

interface ChallengeOption {
  type: ChallengeType;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  description: string;
}

const CHALLENGE_OPTIONS: ChallengeOption[] = [
  { type: 'math',    label: 'Math',      icon: 'calculator', description: 'Solve equations' },
  { type: 'shake',   label: 'Shake',     icon: 'phone-portrait', description: 'Shake your phone' },
  { type: 'photo',   label: 'Photo',     icon: 'camera', description: 'Take a photo' },
  { type: 'jump',    label: 'Jump',      icon: 'arrow-up', description: 'Jump up & down' },
  { type: 'brush',   label: 'Brush Teeth',icon: 'water',      description: 'Snap yourself brushing' },
  { type: 'pushup',  label: 'Push-Up',        icon: 'barbell',       description: 'Do push-ups' },
  { type: 'color',   label: 'Find Color',      icon: 'color-palette', description: 'Find a specific color' },
  { type: 'unscramble', label: 'Unscramble',      icon: 'text',          description: 'Unscramble the word' },
  { type: 'riddle',  label: 'Riddle',          icon: 'help-circle',   description: 'Answer the riddle' },
  { type: 'memory',  label: 'Memory',          icon: 'grid',          description: 'Repeat the sequence' },
  { type: 'quiz',    label: 'Quiz',            icon: 'list',          description: 'Multiple choice trivia' },
];

export const CreateAlarmScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'CreateAlarm'>>();
  const { addAlarm, updateAlarm } = useAlarm();
  const { colors, isDark } = useTheme();
  const { settings } = useSettings();
  
  const styles = getStyles(colors, isDark);
  const existingAlarm = route.params?.alarm;
  const isEditing = !!existingAlarm;

  const [time, setTime] = useState(
    existingAlarm ? new Date(`2000-01-01T${existingAlarm.time}`) : new Date()
  );
  const [repeatDays, setRepeatDays] = useState<number[]>(existingAlarm?.repeatDays || []);
  const [disciplineMode, setDisciplineMode] = useState(existingAlarm?.disciplineMode ?? true);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [selectedSoundId, setSelectedSoundId] = useState<string>(
    existingAlarm?.soundId ?? settings.defaultSoundId
  );
  const [selectedBgId, setSelectedBgId] = useState<string | undefined>(existingAlarm?.backgroundId);
  const [selectedBgUri, setSelectedBgUri] = useState<string | undefined>(existingAlarm?.backgroundUri);

  // Resolve initial selected challenges: prefer challengeConfigs, then fallback
  const initialChallenges = (): ChallengeConfig[] => {
    if (existingAlarm?.challengeConfigs?.length) return existingAlarm.challengeConfigs;
    if (existingAlarm?.challengeTypes?.length) {
      return existingAlarm.challengeTypes.map(type => ({
        id: generateId(),
        type,
        numProblems: 1,
        difficulty: 1,
      }));
    }
    if (existingAlarm?.challengeType) {
      return [{ id: generateId(), type: existingAlarm.challengeType, numProblems: 1, difficulty: 1 }];
    }
    return [{ id: generateId(), type: 'math', numProblems: 1, difficulty: 1 }];
  };

  const [selectedChallenges, setSelectedChallenges] = useState<ChallengeConfig[]>(initialChallenges());
  const [label, setLabel] = useState<string>(
    existingAlarm?.label || (isEditing ? 'Edit Alarm' : 'New Alarm')
  );
  const [isChallengeModalOpen, setIsChallengeModalOpen] = useState(false);
  const [activeConfigSlot, setActiveConfigSlot] = useState<ChallengeConfig | null>(null);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);

  const isNavigatingAwayRef = useRef(false);
  const initialTimeRef = useRef(time.getTime());

  const hasUnsavedChanges = useCallback(() => {
    if (isNavigatingAwayRef.current) return false;
    const timeString = time.toLocaleTimeString('en-US', {
      hour12: false, hour: '2-digit', minute: '2-digit',
    });
    const defaultChallenges = ['math'];
    if (existingAlarm) {
      if (timeString !== existingAlarm.time) return true;
      if (JSON.stringify(repeatDays.sort()) !== JSON.stringify([...(existingAlarm.repeatDays || [])].sort())) return true;
      if (disciplineMode !== (existingAlarm.disciplineMode ?? true)) return true;
      if (selectedSoundId !== (existingAlarm.soundId ?? DEFAULT_SOUND_ID)) return true;
      if (selectedBgId !== existingAlarm.backgroundId) return true;
      if (selectedBgUri !== existingAlarm.backgroundUri) return true;
      if (selectedChallenges.length !== initialChallenges().length) return true;
      if (label !== (existingAlarm.label || (isEditing ? 'Edit Alarm' : 'New Alarm'))) return true;
      return false;
    } else {
      if (time.getTime() !== initialTimeRef.current) return true;
      if (repeatDays.length > 0) return true;
      if (disciplineMode !== true) return true;
      if (selectedSoundId !== DEFAULT_SOUND_ID) return true;
      if (selectedChallenges.length !== defaultChallenges.length) return true;
      if (label !== 'New Alarm') return true;
      return false;
    }
  }, [time, existingAlarm, repeatDays, disciplineMode, selectedSoundId, selectedChallenges, label, isEditing]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', (e) => {
      if (!hasUnsavedChanges()) {
        return;
      }
      e.preventDefault();
      Alert.alert(
        'Discard changes?',
        'You have unsaved edits. Are you sure you want to discard them?',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Discard', 
            style: 'destructive', 
            onPress: () => {
              isNavigatingAwayRef.current = true;
              navigation.dispatch(e.data.action);
            }
          },
        ]
      );
    });
    return unsubscribe;
  }, [navigation, hasUnsavedChanges]);

  const handleClose = () => {
    navigation.goBack();
  };

  const toggleDay = (day: number) => {
    if (repeatDays.includes(day)) {
      setRepeatDays(repeatDays.filter(d => d !== day));
    } else {
      setRepeatDays([...repeatDays, day].sort());
    }
  };

  const selectPreset = (type: 'weekdays' | 'weekend' | 'everyday') => {
    let newDays: number[] = [];
    if (type === 'weekdays') newDays = [1, 2, 3, 4, 5];
    else if (type === 'weekend') newDays = [0, 6];
    else if (type === 'everyday') newDays = [0, 1, 2, 3, 4, 5, 6];
    
    // If it's already exactly the same, clear it (toggle behavior)
    const currentSorted = [...repeatDays].sort().join(',');
    const newSorted = [...newDays].sort().join(',');
    
    if (currentSorted === newSorted) {
      setRepeatDays([]);
    } else {
      setRepeatDays(newDays);
    }
  };

  const doSave = async () => {
    const timeString = time.toLocaleTimeString('en-US', {
      hour12: false, hour: '2-digit', minute: '2-digit',
    });

    // Pre-generate ID so notifications embed the real alarm ID
    const resolvedAlarmId = isEditing ? existingAlarm.id : generateId();

    const builtAlarm: Alarm = {
      id: resolvedAlarmId,
      createdAt: isEditing ? existingAlarm.createdAt : Date.now(),
      time: timeString,
      enabled: true,
      repeatDays,
      disciplineMode,
      soundId: selectedSoundId,
      backgroundId: selectedBgId,
      backgroundUri: selectedBgUri,
      challengeConfigs: selectedChallenges,
      challengeTypes: selectedChallenges.map(c => c.type),
      challengeType: selectedChallenges[0]?.type, // keep legacy field for backwards compat
      volume: 1.0,
      label,
    };

    // Cancel old notifications before re-scheduling
    if (isEditing && existingAlarm.notificationIds?.length) {
      await cancelAlarmNotifications(existingAlarm);
    }

    const notificationIds = await scheduleAlarmNotifications(builtAlarm);
    const finalAlarm = { ...builtAlarm, notificationIds };

    if (isEditing) {
      await updateAlarm(finalAlarm);
    } else {
      await addAlarm(finalAlarm);
    }

    isNavigatingAwayRef.current = true;
    navigation.goBack();
  };

  const handleSave = () => {
    // If no repeat days, warn user this is a one-time alarm
    if (repeatDays.length === 0) {
      const timeString = time.toLocaleTimeString('en-US', {
        hour: 'numeric', minute: '2-digit', hour12: true,
      });
      const now = new Date();
      const target = new Date();
      const [h, m] = [time.getHours(), time.getMinutes()];
      target.setHours(h, m, 0, 0);
      const ringDay = target <= now ? 'tomorrow' : 'today';
      Alert.alert(
        'One-Time Alarm',
        `This alarm will ring once ${ringDay} at ${timeString} and then turn itself off. Continue?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Save', onPress: doSave },
        ]
      );
    } else {
      doSave();
    }
  };

  const formatTimeParts = (date: Date) => {
    const timeStr = date.toLocaleTimeString('en-US', {
      hour: 'numeric', minute: '2-digit', hour12: true,
    });
    const [main, period] = timeStr.split(' ');
    return { main, period };
  };

  const { main, period } = formatTimeParts(time);

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleClose} style={styles.closeBtn}>
            <Ionicons name="chevron-back" size={28} color={colors.text} style={{ marginLeft: -4 }} />
          </TouchableOpacity>
          <View style={styles.titleContainer}>
            <TextInput
              style={styles.titleInput}
              value={label}
              onChangeText={setLabel}
              placeholder="Alarm Name"
              placeholderTextColor={colors.subtext}
              maxLength={20}
              selectTextOnFocus
            />
            <Ionicons name="pencil" size={16} color="#FF7F62" style={styles.editIcon} />
          </View>
          <TouchableOpacity onPress={handleSave}>
            <Text style={styles.saveButton}>Save</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Time Picker */}
          <View style={[styles.card, styles.timeCard]}>
            <TouchableOpacity
              style={styles.timeContainer}
              onPress={() => setShowTimePicker(true)}
            >
              <Text style={styles.timeText}>{main}</Text>
              <Text style={styles.timePeriod}>{period}</Text>
              <Ionicons
                name="chevron-down"
                size={20}
                color={colors.subtext}
                style={styles.timeChevron}
              />
            </TouchableOpacity>

            {showTimePicker && (
              <View style={styles.timePickerWrapper}>
                <DateTimePicker
                  value={time}
                  mode="time"
                  display="spinner"
                  onChange={(event, selectedDate) => {
                    setShowTimePicker(Platform.OS === 'ios');
                    if (selectedDate) setTime(selectedDate);
                  }}
                  style={styles.timePicker}
                  textColor={isDark ? '#FFFFFF' : '#2E1E1A'}
                />
              </View>
            )}
          </View>

          {/* Repeat Days */}
          <View style={styles.card}>
            <View style={styles.repeatHeader}>
              <Text style={styles.sectionTitle}>Repeat Days</Text>
              {repeatDays.length === 0 && (
                <View style={styles.onceTag}>
                  <Ionicons name="time-outline" size={12} color="#FF7F62" />
                  <Text style={styles.onceTagText}>Rings Once</Text>
                </View>
              )}
            </View>
            <View style={styles.daysContainer}>
              {ORDERED_DAYS.map((day, index) => {
                const isActive = repeatDays.includes(day.value);
                return (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.dayBubble,
                      isActive ? styles.dayBubbleActive : styles.dayBubbleInactive,
                    ]}
                    onPress={() => toggleDay(day.value)}
                  >
                    <Text
                      style={[
                        styles.dayText,
                        isActive ? styles.dayTextActive : styles.dayTextInactive,
                      ]}
                    >
                      {day.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={styles.presetsContainer}>
              {['Weekdays', 'Weekend', 'Everyday'].map((label) => {
                const type = label.toLowerCase() as 'weekdays' | 'weekend' | 'everyday';
                const days = type === 'weekdays' ? [1,2,3,4,5] : type === 'weekend' ? [0,6] : [0,1,2,3,4,5,6];
                const isActive = JSON.stringify([...repeatDays].sort()) === JSON.stringify(days.sort());
                
                return (
                  <TouchableOpacity
                    key={type}
                    onPress={() => selectPreset(type)}
                    style={[
                      styles.presetBadge,
                      isActive && styles.presetBadgeActive
                    ]}
                  >
                    <Text style={[
                      styles.presetText,
                      isActive && styles.presetTextActive
                    ]}>
                      {label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Sound Picker */}
          <View style={styles.card}>
            <SoundPicker
              selectedId={selectedSoundId}
              onSelect={setSelectedSoundId}
            />
          </View>

          {/* Background Picker */}
          <View style={styles.card}>
            <BackgroundPicker
              selectedId={selectedBgId}
              selectedUri={selectedBgUri}
              onChange={(id, uri) => {
                setSelectedBgId(id);
                setSelectedBgUri(uri);
              }}
            />
          </View>

          {/* Challenge Type Selector (Slots) */}
          <View style={[styles.card, { paddingHorizontal: 0, paddingBottom: 24 }]}>
            <View style={styles.missionHeader}>
              <Text style={styles.sectionTitle}>Challenges</Text>
              <Text style={styles.missionCount}>{selectedChallenges.length}/5</Text>
            </View>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false} 
              contentContainerStyle={styles.slotsContainer}
            >
              {Array.from({ length: 5 }).map((_, idx) => {
                const slotConfig = selectedChallenges[idx];
                const challengeType = slotConfig?.type;
                
                if (challengeType) {
                  const opt = CHALLENGE_OPTIONS.find(o => o.type === challengeType)!;
                  return (
                    <TouchableOpacity 
                      key={`slot-${idx}`} 
                      style={styles.missionSlotActive} 
                      activeOpacity={0.7}
                      onPress={() => {
                        setActiveConfigSlot(slotConfig);
                        setIsConfigModalOpen(true);
                      }}
                    >
                      <Ionicons name={opt.icon} size={32} color="#FF7F62" />
                      {/* Subscript indicator if numProblems > 1 */}
                      {(slotConfig.numProblems && slotConfig.numProblems > 1) && (
                        <View style={{ position: 'absolute', bottom: 2, right: 4 }}>
                          <Text style={{ fontSize: 10, fontWeight: '900', color: '#FF7F62' }}>x{slotConfig.numProblems}</Text>
                        </View>
                      )}
                      <TouchableOpacity 
                        style={styles.slotRemoveBadge}
                        activeOpacity={0.8}
                        hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
                        onPress={() => {
                          if (selectedChallenges.length > 1) {
                            const newList = [...selectedChallenges];
                            newList.splice(idx, 1);
                            setSelectedChallenges(newList);
                          } else {
                            Alert.alert('Required', 'You must have at least one challenge.');
                          }
                        }}
                      >
                        <Ionicons name="close" size={10} color="#FFF" />
                      </TouchableOpacity>
                    </TouchableOpacity>
                  );
                } 
                
                if (idx === selectedChallenges.length) {
                  return (
                    <TouchableOpacity 
                      key={`slot-${idx}`} 
                      style={styles.missionSlotNext} 
                      activeOpacity={0.7}
                      onPress={() => setIsChallengeModalOpen(true)}
                    >
                      <Ionicons name="add" size={32} color={colors.subtext} />
                    </TouchableOpacity>
                  );
                }
                
                return (
                  <View key={`slot-${idx}`} style={styles.missionSlotEmpty}>
                    <Ionicons name="add" size={32} color={isDark ? colors.border : 'rgba(160,144,136,0.2)'} />
                  </View>
                );
              })}
            </ScrollView>
          </View>
        </ScrollView>
        {/* Challenge Selection Modal */}
        <Modal 
          visible={isChallengeModalOpen} 
          animationType="slide" 
          transparent={true} 
          onRequestClose={() => setIsChallengeModalOpen(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Choose a Challenge</Text>
                <TouchableOpacity onPress={() => setIsChallengeModalOpen(false)} style={styles.modalCloseBtn}>
                  <Ionicons name="close" size={24} color={colors.subtext} />
                </TouchableOpacity>
              </View>
              <ScrollView style={styles.modalList} contentContainerStyle={styles.modalListContent}>
                {CHALLENGE_OPTIONS.map(opt => (
                  <TouchableOpacity
                    key={opt.type}
                    style={styles.dropdownItem}
                    onPress={() => {
                      if (selectedChallenges.length < 5) {
                        const newConfig = {
                          id: generateId(),
                          type: opt.type,
                          numProblems: 1,
                          difficulty: 1 as 1|2|3,
                        };
                        setSelectedChallenges([...selectedChallenges, newConfig]);
                        setIsChallengeModalOpen(false);
                        
                        // Small delay then pop up the config modal immediately
                        setTimeout(() => {
                           setActiveConfigSlot(newConfig);
                           setIsConfigModalOpen(true);
                        }, 400);
                      }
                    }}
                    activeOpacity={0.75}
                  >
                    <Ionicons 
                      name={opt.icon} 
                      size={24} 
                      color="#FF7F62" 
                      style={styles.dropdownItemIcon} 
                    />
                    <View style={{flex: 1}}>
                      <Text style={styles.dropdownItemLabel}>{opt.label}</Text>
                      <Text style={styles.dropdownItemDesc}>{opt.description}</Text>
                    </View>
                    <Ionicons name="add-circle-outline" size={28} color="#FF7F62" />
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        </Modal>

        {/* Configuration Modal */}
        <ChallengeConfigModal
          visible={isConfigModalOpen}
          initialConfig={activeConfigSlot}
          onClose={() => setIsConfigModalOpen(false)}
          onSave={(updatedConfig) => {
             setSelectedChallenges(prev => 
               prev.map(c => c.id === updatedConfig.id ? updatedConfig : c)
             );
          }}
        />
      </View>
    </SafeAreaView>
  );
};

const getStyles = (colors: any, isDark: boolean) => StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 10,
    paddingBottom: 20,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    flex: 1,
    paddingHorizontal: 10,
  },
  titleInput: { 
    fontSize: 20, 
    fontWeight: '800', 
    color: colors.text,
    padding: 0,
    textAlign: 'center',
  },
  closeBtn: {
    padding: 4,
  },
  editIcon: {
    marginTop: 2,
  },
  saveButton: { fontSize: 18, color: colors.accent, fontWeight: 'bold', padding: 4 },
  content: { flex: 1 },
  scrollContent: { paddingHorizontal: 24, paddingBottom: 60 },
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
  timeCard: { alignItems: 'center' },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
  },
  timeText: { fontSize: 64, fontWeight: '900', color: colors.text, letterSpacing: -2 },
  timePeriod: { fontSize: 24, fontWeight: '600', color: colors.text, marginLeft: 8 },
  timeChevron: { marginLeft: 8, alignSelf: 'center' },
  timePickerWrapper: {
    width: '100%',
    alignItems: 'center',
    marginTop: 20,
  },
  timePicker: { width: '100%' },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: colors.text, marginBottom: 6 },
  sectionSub: { fontSize: 13, color: colors.subtext, marginBottom: 16 },
  daysContainer: { flexDirection: 'row', justifyContent: 'space-between' },
  dayBubble: {
    width: 36, height: 36, borderRadius: 18,
    justifyContent: 'center', alignItems: 'center',
  },
  dayBubbleActive: { backgroundColor: colors.accent },
  dayBubbleInactive: { backgroundColor: isDark ? colors.background : '#F4E7DF' },
  dayText: { fontSize: 14, fontWeight: '700' },
  dayTextActive: { color: '#FFFFFF' },
  dayTextInactive: { color: colors.subtext },

  repeatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  onceTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,127,98,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,127,98,0.3)',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  onceTagText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FF7F62',
  },
  presetsContainer: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 16,
    justifyContent: 'center',
  },
  presetBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    backgroundColor: isDark ? colors.surfaceHighlight : '#F4E7DF',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  presetBadgeActive: {
    backgroundColor: colors.accent + '20',
    borderColor: colors.accent,
  },
  presetText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.subtext,
  },
  presetTextActive: {
    color: colors.accent,
  },

  dropdownHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: isDark ? colors.surfaceHighlight : '#FEF4EC',
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: isDark ? colors.border : '#F4E7DF',
  },
  dropdownHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  dropdownHeaderLabel: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.text,
  },
  dropdownHeaderDesc: {
    fontSize: 13,
    color: colors.accent,
    fontWeight: '600',
  },
  dropdownListContainer: {
    marginTop: 10,
    backgroundColor: isDark ? colors.surfaceHighlight : '#FEF4EC',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: isDark ? colors.border : '#F4E7DF',
    overflow: 'hidden',
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: isDark ? colors.border : 'rgba(244, 231, 223, 0.5)',
  },
  dropdownItemActive: {
    backgroundColor: isDark ? colors.surface : '#FFF5F2',
  },
  dropdownItemIcon: {
    marginRight: 12,
  },
  dropdownItemLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },
  dropdownItemLabelActive: {
    color: colors.accent,
  },
  dropdownItemDesc: {
    fontSize: 12,
    color: colors.subtext,
    marginTop: 2,
  },
  dropdownItemDescActive: {
    color: isDark ? colors.accent : 'rgba(255,127,98,0.7)',
  },
  colorSetup: {
    marginTop: 16,
    backgroundColor: isDark ? colors.surfaceHighlight : '#FEF4EC',
    borderRadius: 16,
    padding: 16,
  },

  // Switch
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  switchTextContainer: { flex: 1, paddingRight: 20 },
  switchLabel: { fontSize: 18, color: colors.text, fontWeight: '800' },
  switchSublabel: { fontSize: 14, color: colors.subtext, marginTop: 6 },
  switchControl: { transform: [{ scaleX: 1.1 }, { scaleY: 1.1 }] },

  // Mission Slots UI
  missionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  missionCount: {
    fontSize: 14,
    color: '#A09088',
    fontWeight: '700',
  },
  slotsContainer: {
    paddingHorizontal: 20,
    gap: 12,
    paddingTop: 8,
    paddingBottom: 8,
  },
  missionSlotActive: {
    width: 68,
    height: 68,
    borderRadius: 16,
    backgroundColor: isDark ? colors.surfaceHighlight : '#FFE5DD',
    borderWidth: 2,
    borderColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'visible',
  },
  missionSlotNext: {
    width: 68,
    height: 68,
    borderRadius: 16,
    backgroundColor: isDark ? 'transparent' : 'rgba(255,127,98,0.05)',
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  missionSlotEmpty: {
    width: 68,
    height: 68,
    borderRadius: 16,
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: isDark ? '#333' : '#F4E7DF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  slotRemoveBadge: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.text,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.surface,
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: isDark ? 'rgba(0,0,0,0.8)' : 'rgba(52,37,33,0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 8,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
  },
  modalCloseBtn: {
    padding: 4,
  },
  modalList: {
    paddingHorizontal: 12,
  },
  modalListContent: {
    paddingVertical: 12,
    paddingBottom: 40,
  },
});