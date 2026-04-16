<<<<<<< HEAD
import React, { useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Switch, Animated as RNAnimated } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { Alarm, ChallengeType } from '../types';
import { ALARM_SOUNDS } from '../constants/sounds';

interface AlarmItemProps {
  alarm: Alarm;
  onToggle: (id: string) => void;
  onPress: (alarm: Alarm) => void;
  onDelete: (id: string) => void;
}

const ORDERED_DAYS = [
  { label: 'M', value: 1 },
  { label: 'T', value: 2 },
  { label: 'W', value: 3 },
  { label: 'T', value: 4 },
  { label: 'F', value: 5 },
  { label: 'S', value: 6 },
  { label: 'S', value: 0 },
];

const CHALLENGE_META: Record<ChallengeType, { icon: keyof typeof Ionicons.glyphMap; label: string }> = {
  math:    { icon: 'calculator', label: 'Math' },
  shake:   { icon: 'phone-portrait', label: 'Shake' },
  photo:   { icon: 'camera', label: 'Photo' },
  jump:    { icon: 'arrow-up', label: 'Jump' },
  brush:   { icon: 'water', label: 'Brush' },
  pushup:  { icon: 'barbell', label: 'Push-Up' },
  color:   { icon: 'color-palette', label: 'Color' },
  unscramble:  { icon: 'text', label: 'Unscramble' },
  riddle:  { icon: 'help-circle', label: 'Riddle' },
  memory:  { icon: 'grid', label: 'Memory' },
};

export const AlarmItem: React.FC<AlarmItemProps> = ({ alarm, onToggle, onPress, onDelete }) => {
  const { colors, isDark } = useTheme();
  const styles = getStyles(colors, isDark);
  const swipeableRef = useRef<Swipeable>(null);

  const formatTimeParts = (time: string) => {
    const [hours, minutes] = time.split(':');
    const h = parseInt(hours, 10);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 || 12;
    return { main: `${h12}:${minutes}`, period: ampm };
  };

  const { main, period } = formatTimeParts(alarm.time);

  const getTimeIcon = (): keyof typeof Ionicons.glyphMap => {
    const h = parseInt(alarm.time.split(':')[0], 10);
    if (h >= 5 && h < 10) return 'partly-sunny';
    if (h >= 10 && h < 17) return 'cafe';
    if (h >= 17 && h < 21) return 'moon';
    return 'moon';
  };


  const getLabel = () => {
    if (alarm.label) return alarm.label;
    const h = parseInt(alarm.time.split(':')[0], 10);
    if (h >= 5 && h < 10) return 'Wake Up!';
    if (h >= 10 && h < 17) return 'Work Prep';
    if (h >= 17 && h < 21) return 'Evening Routine';
    return 'Weekend Sleep In';
  };

  const getSoundName = () => {
    const sound = ALARM_SOUNDS.find(s => s.id === alarm.soundId);
    return sound ? sound.name : 'Alarm Clock';
  };

  const getChallengeInfo = (): { icon: keyof typeof Ionicons.glyphMap, label: string } | null => {
    // Multi-challenge
    if (alarm.challengeConfigs && alarm.challengeConfigs.length > 1) {
      return { icon: 'shuffle', label: `${alarm.challengeConfigs.length} Challenges` };
    }
    if (alarm.challengeTypes && alarm.challengeTypes.length > 1) {
      return { icon: 'shuffle', label: `${alarm.challengeTypes.length} Challenges` };
    }
    // Single (new or legacy)
    const type = alarm.challengeConfigs?.[0]?.type ?? alarm.challengeTypes?.[0] ?? alarm.challengeType;
    if (type) return CHALLENGE_META[type] || null;
    return alarm.disciplineMode ? { icon: 'shuffle', label: 'Auto' } : null;
  };

  const renderRightActions = (
    progress: RNAnimated.AnimatedInterpolation<number>,
    dragX: RNAnimated.AnimatedInterpolation<number>
  ) => {
    return (
      <View style={styles.rightActionsContainer}>
        <TouchableOpacity
          style={[styles.actionButton, styles.cancelAction]}
          onPress={() => swipeableRef.current?.close()}
          activeOpacity={0.6}
        >
          <Ionicons name="close-outline" size={24} color="#5A5A5C" />
          <Text style={styles.cancelActionText}>Cancel</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.deleteAction]}
          onPress={() => {
            swipeableRef.current?.close();
            onDelete(alarm.id);
          }}
          activeOpacity={0.6}
        >
          <Ionicons name="trash-outline" size={24} color="#FFF" />
          <Text style={styles.deleteActionText}>Delete</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const challengeInfo = getChallengeInfo();

  return (
    <Swipeable
      ref={swipeableRef}
      renderRightActions={renderRightActions}
      friction={1.2}
      rightThreshold={120}
      overshootRight={false}
    >
      <TouchableOpacity
        style={[styles.card, !alarm.enabled && styles.cardDisabled]}
        onPress={() => onPress(alarm)}
        activeOpacity={0.8}
      >
        <View style={styles.mainContainer}>
          {/* Left Section */}
          <View style={styles.leftSection}>
            <View style={styles.timeRow}>
              <Text style={[styles.timeNumber, { color: colors.text }, !alarm.enabled && styles.textDisabled]}>
                {main}
              </Text>
              <Text style={[styles.timePeriod, { color: colors.text }, !alarm.enabled && styles.textDisabled]}>
                {period}
              </Text>
            </View>

            <Text style={[styles.alarmLabel, { color: colors.text }, !alarm.enabled && styles.textDisabled]}>
              {getLabel()}
            </Text>

            {/* Info badges row */}
            <View style={styles.badgeRow}>
              {/* Sound badge */}
              <View style={[styles.badge, { backgroundColor: colors.background, borderColor: colors.border }]}>
                <Text style={[styles.badgeText, { color: colors.subtext }]} numberOfLines={1}>{getSoundName()}</Text>
              </View>

              {/* Challenge badge */}
              {challengeInfo && (
                <View style={[styles.badge, { backgroundColor: isDark ? colors.surfaceHighlight : '#FFF5F2', borderColor: isDark ? colors.border : '#FFD6CC' }]}>
                  <Ionicons name={challengeInfo.icon} size={12} color={colors.accent} style={{ marginRight: 4 }} />
                  <Text style={[styles.challengeBadgeText, { color: colors.accent }]}>{challengeInfo.label}</Text>
                </View>
              )}
            </View>

            {/* Repeat days */}
            <View style={styles.daysRow}>
              {ORDERED_DAYS.map((day, idx) => {
                const isActive = alarm.repeatDays.includes(day.value);
                return (
                    <View
                    key={idx}
                    style={[
                      styles.dayBubble,
                      isActive ? { backgroundColor: colors.accent } : { backgroundColor: isDark ? colors.background : '#F4E7DF' },
                    ]}
                  >
                    <Text
                      style={[
                        styles.dayText,
                        isActive ? styles.dayTextActive : { color: colors.subtext },
                      ]}
                    >
                      {day.label}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>

          {/* Right Section */}
          <View style={styles.rightSection}>
            <Switch
              value={!!alarm.enabled}
              onValueChange={() => onToggle(alarm.id)}
              trackColor={{ false: isDark ? '#444' : '#767577', true: colors.accent }}
              ios_backgroundColor={isDark ? '#444' : '#767577'}
              thumbColor={'#FFFFFF'}
              style={styles.switchControl}
            />
            <View style={styles.iconContainer}>
              <Ionicons name={getTimeIcon()} size={28} color={colors.subtext} />
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </Swipeable>
  );
};

const getStyles = (colors: any, isDark: boolean) => StyleSheet.create({
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
  cardDisabled: {
    opacity: 0.45,
  },
  mainContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  leftSection: {
    flex: 1,
    paddingRight: 10,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 4,
  },
  timeNumber: {
    fontSize: 48,
    fontWeight: '900',
    color: colors.text,
    letterSpacing: -1.5,
  },
  timePeriod: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginLeft: 4,
    marginBottom: 8,
  },
  textDisabled: {
    color: colors.subtext,
  },
  alarmLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 10,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 14,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: isDark ? colors.background : '#FEF4EC',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: isDark ? colors.border : '#F4E7DF',
    maxWidth: 120,
  },
  badgeText: {
    fontSize: 11,
    color: colors.subtext,
    fontWeight: '600',
  },
  challengeBadge: {
    backgroundColor: isDark ? 'rgba(255,127,98,0.12)' : '#FFF5F2',
    borderColor: isDark ? colors.border : '#FFD6CC',
  },
  challengeBadgeText: {
    fontSize: 11,
    color: colors.accent,
    fontWeight: '700',
  },
  daysRow: {
    flexDirection: 'row',
    gap: 6,
  },
  dayBubble: {
    width: 26,
    height: 26,
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayBubbleActive: { backgroundColor: colors.accent },
  dayBubbleInactive: { backgroundColor: isDark ? colors.background : '#F4E7DF' },
  dayText: { fontSize: 11, fontWeight: '700' },
  dayTextActive: { color: '#FFFFFF' },
  dayTextInactive: { color: colors.subtext },
  rightSection: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  switchControl: {
    transform: [{ scaleX: 1.1 }, { scaleY: 1.1 }],
  },
  iconContainer: {
    width: 45,
    height: 45,
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    paddingBottom: 4,
  },
  rightActionsContainer: {
    flexDirection: 'row',
    width: 170,
    height: '100%',
    paddingBottom: 16,
    paddingLeft: 10,
  },
  actionButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 24,
    height: '100%',
    marginLeft: 10,
  },
  cancelAction: { backgroundColor: isDark ? colors.surfaceHighlight : '#E5E5EA' },
  deleteAction: { backgroundColor: '#FF4B4B' },
  cancelActionText: { color: isDark ? colors.subtext : '#5A5A5C', fontWeight: '700', fontSize: 11, marginTop: 4 },
  deleteActionText: { color: '#FFF', fontWeight: '700', fontSize: 11, marginTop: 4 },
=======
import React, { useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Switch, Animated as RNAnimated } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { Alarm, ChallengeType } from '../types';
import { ALARM_SOUNDS } from '../constants/sounds';

interface AlarmItemProps {
  alarm: Alarm;
  onToggle: (id: string) => void;
  onPress: (alarm: Alarm) => void;
  onDelete: (id: string) => void;
}

const ORDERED_DAYS = [
  { label: 'M', value: 1 },
  { label: 'T', value: 2 },
  { label: 'W', value: 3 },
  { label: 'T', value: 4 },
  { label: 'F', value: 5 },
  { label: 'S', value: 6 },
  { label: 'S', value: 0 },
];

const CHALLENGE_META: Record<ChallengeType, { icon: keyof typeof Ionicons.glyphMap; label: string }> = {
  math:    { icon: 'calculator', label: 'Math' },
  shake:   { icon: 'phone-portrait', label: 'Shake' },
  photo:   { icon: 'camera', label: 'Photo' },
  jump:    { icon: 'arrow-up', label: 'Jump' },
  brush:   { icon: 'water', label: 'Brush' },
  pushup:  { icon: 'barbell', label: 'Push-Up' },
  color:   { icon: 'color-palette', label: 'Color' },
  unscramble:  { icon: 'text', label: 'Unscramble' },
  riddle:  { icon: 'help-circle', label: 'Riddle' },
  memory:  { icon: 'grid', label: 'Memory' },
};

export const AlarmItem: React.FC<AlarmItemProps> = ({ alarm, onToggle, onPress, onDelete }) => {
  const { colors, isDark } = useTheme();
  const styles = getStyles(colors, isDark);
  const swipeableRef = useRef<Swipeable>(null);

  const formatTimeParts = (time: string) => {
    const [hours, minutes] = time.split(':');
    const h = parseInt(hours, 10);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 || 12;
    return { main: `${h12}:${minutes}`, period: ampm };
  };

  const { main, period } = formatTimeParts(alarm.time);

  const getTimeIcon = (): keyof typeof Ionicons.glyphMap => {
    const h = parseInt(alarm.time.split(':')[0], 10);
    if (h >= 5 && h < 10) return 'partly-sunny';
    if (h >= 10 && h < 17) return 'cafe';
    if (h >= 17 && h < 21) return 'moon';
    return 'moon';
  };


  const getLabel = () => {
    if (alarm.label) return alarm.label;
    const h = parseInt(alarm.time.split(':')[0], 10);
    if (h >= 5 && h < 10) return 'Wake Up!';
    if (h >= 10 && h < 17) return 'Work Prep';
    if (h >= 17 && h < 21) return 'Evening Routine';
    return 'Weekend Sleep In';
  };

  const getSoundName = () => {
    const sound = ALARM_SOUNDS.find(s => s.id === alarm.soundId);
    return sound ? sound.name : 'Alarm Clock';
  };

  const getChallengeInfo = (): { icon: keyof typeof Ionicons.glyphMap, label: string } | null => {
    // Multi-challenge
    if (alarm.challengeConfigs && alarm.challengeConfigs.length > 1) {
      return { icon: 'shuffle', label: `${alarm.challengeConfigs.length} Challenges` };
    }
    if (alarm.challengeTypes && alarm.challengeTypes.length > 1) {
      return { icon: 'shuffle', label: `${alarm.challengeTypes.length} Challenges` };
    }
    // Single (new or legacy)
    const type = alarm.challengeConfigs?.[0]?.type ?? alarm.challengeTypes?.[0] ?? alarm.challengeType;
    if (type) return CHALLENGE_META[type] || null;
    return alarm.disciplineMode ? { icon: 'shuffle', label: 'Auto' } : null;
  };

  const renderRightActions = (
    progress: RNAnimated.AnimatedInterpolation<number>,
    dragX: RNAnimated.AnimatedInterpolation<number>
  ) => {
    return (
      <View style={styles.rightActionsContainer}>
        <TouchableOpacity
          style={[styles.actionButton, styles.cancelAction]}
          onPress={() => swipeableRef.current?.close()}
          activeOpacity={0.6}
        >
          <Ionicons name="close-outline" size={24} color="#5A5A5C" />
          <Text style={styles.cancelActionText}>Cancel</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.deleteAction]}
          onPress={() => {
            swipeableRef.current?.close();
            onDelete(alarm.id);
          }}
          activeOpacity={0.6}
        >
          <Ionicons name="trash-outline" size={24} color="#FFF" />
          <Text style={styles.deleteActionText}>Delete</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const challengeInfo = getChallengeInfo();

  return (
    <Swipeable
      ref={swipeableRef}
      renderRightActions={renderRightActions}
      friction={1.2}
      rightThreshold={120}
      overshootRight={false}
    >
      <TouchableOpacity
        style={[styles.card, !alarm.enabled && styles.cardDisabled]}
        onPress={() => onPress(alarm)}
        activeOpacity={0.8}
      >
        <View style={styles.mainContainer}>
          {/* Left Section */}
          <View style={styles.leftSection}>
            <View style={styles.timeRow}>
              <Text style={[styles.timeNumber, { color: colors.text }, !alarm.enabled && styles.textDisabled]}>
                {main}
              </Text>
              <Text style={[styles.timePeriod, { color: colors.text }, !alarm.enabled && styles.textDisabled]}>
                {period}
              </Text>
            </View>

            <Text style={[styles.alarmLabel, { color: colors.text }, !alarm.enabled && styles.textDisabled]}>
              {getLabel()}
            </Text>

            {/* Info badges row */}
            <View style={styles.badgeRow}>
              {/* Sound badge */}
              <View style={[styles.badge, { backgroundColor: colors.background, borderColor: colors.border }]}>
                <Text style={[styles.badgeText, { color: colors.subtext }]} numberOfLines={1}>{getSoundName()}</Text>
              </View>

              {/* Challenge badge */}
              {challengeInfo && (
                <View style={[styles.badge, { backgroundColor: isDark ? colors.surfaceHighlight : '#FFF5F2', borderColor: isDark ? colors.border : '#FFD6CC' }]}>
                  <Ionicons name={challengeInfo.icon} size={12} color={colors.accent} style={{ marginRight: 4 }} />
                  <Text style={[styles.challengeBadgeText, { color: colors.accent }]}>{challengeInfo.label}</Text>
                </View>
              )}
            </View>

            {/* Repeat days */}
            <View style={styles.daysRow}>
              {ORDERED_DAYS.map((day, idx) => {
                const isActive = alarm.repeatDays.includes(day.value);
                return (
                    <View
                    key={idx}
                    style={[
                      styles.dayBubble,
                      isActive ? { backgroundColor: colors.accent } : { backgroundColor: isDark ? colors.background : '#F4E7DF' },
                    ]}
                  >
                    <Text
                      style={[
                        styles.dayText,
                        isActive ? styles.dayTextActive : { color: colors.subtext },
                      ]}
                    >
                      {day.label}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>

          {/* Right Section */}
          <View style={styles.rightSection}>
            <Switch
              value={!!alarm.enabled}
              onValueChange={() => onToggle(alarm.id)}
              trackColor={{ false: isDark ? '#444' : '#767577', true: colors.accent }}
              ios_backgroundColor={isDark ? '#444' : '#767577'}
              thumbColor={'#FFFFFF'}
              style={styles.switchControl}
            />
            <View style={styles.iconContainer}>
              <Ionicons name={getTimeIcon()} size={28} color={colors.subtext} />
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </Swipeable>
  );
};

const getStyles = (colors: any, isDark: boolean) => StyleSheet.create({
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
  cardDisabled: {
    opacity: 0.45,
  },
  mainContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  leftSection: {
    flex: 1,
    paddingRight: 10,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 4,
  },
  timeNumber: {
    fontSize: 48,
    fontWeight: '900',
    color: colors.text,
    letterSpacing: -1.5,
  },
  timePeriod: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginLeft: 4,
    marginBottom: 8,
  },
  textDisabled: {
    color: colors.subtext,
  },
  alarmLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 10,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 14,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: isDark ? colors.background : '#FEF4EC',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: isDark ? colors.border : '#F4E7DF',
    maxWidth: 120,
  },
  badgeText: {
    fontSize: 11,
    color: colors.subtext,
    fontWeight: '600',
  },
  challengeBadge: {
    backgroundColor: isDark ? 'rgba(255,127,98,0.12)' : '#FFF5F2',
    borderColor: isDark ? colors.border : '#FFD6CC',
  },
  challengeBadgeText: {
    fontSize: 11,
    color: colors.accent,
    fontWeight: '700',
  },
  daysRow: {
    flexDirection: 'row',
    gap: 6,
  },
  dayBubble: {
    width: 26,
    height: 26,
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayBubbleActive: { backgroundColor: colors.accent },
  dayBubbleInactive: { backgroundColor: isDark ? colors.background : '#F4E7DF' },
  dayText: { fontSize: 11, fontWeight: '700' },
  dayTextActive: { color: '#FFFFFF' },
  dayTextInactive: { color: colors.subtext },
  rightSection: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  switchControl: {
    transform: [{ scaleX: 1.1 }, { scaleY: 1.1 }],
  },
  iconContainer: {
    width: 45,
    height: 45,
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    paddingBottom: 4,
  },
  rightActionsContainer: {
    flexDirection: 'row',
    width: 170,
    height: '100%',
    paddingBottom: 16,
    paddingLeft: 10,
  },
  actionButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 24,
    height: '100%',
    marginLeft: 10,
  },
  cancelAction: { backgroundColor: isDark ? colors.surfaceHighlight : '#E5E5EA' },
  deleteAction: { backgroundColor: '#FF4B4B' },
  cancelActionText: { color: isDark ? colors.subtext : '#5A5A5C', fontWeight: '700', fontSize: 11, marginTop: 4 },
  deleteActionText: { color: '#FFF', fontWeight: '700', fontSize: 11, marginTop: 4 },
>>>>>>> origin/main
});