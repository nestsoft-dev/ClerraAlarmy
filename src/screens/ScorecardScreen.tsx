import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useAlarm } from '../context/AlarmContext';
import { RootStackParamList } from '../navigation/AppNavigator';
import { LinearGradient } from 'expo-linear-gradient';
import { Storage } from '../utils/storage';
import { AlarmLog } from '../types';

const { width } = Dimensions.get('window');

export const ScorecardScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { colors, isDark } = useTheme();
  const { stats } = useAlarm();
  const [logs, setLogs] = useState<AlarmLog[]>([]);
  const styles = getStyles(colors, isDark);

  useEffect(() => {
    const fetchLogs = async () => {
      const allLogs = await Storage.getLogs();
      setLogs(allLogs);
    };
    fetchLogs();
  }, []);

  const timeGainedMins = stats.totalCompleted * 15;
  const timeGainedHours = (timeGainedMins / 60).toFixed(1);

  const getDisciplineRank = () => {
    if (stats.currentStreak >= 30) return 'Eternal Awakened';
    if (stats.currentStreak >= 14) return 'Morning Master';
    if (stats.currentStreak >= 7) return 'Discipline Warrior';
    if (stats.currentStreak >= 3) return 'Early Bird';
    return 'The Recruit';
  };

  const getChallengeStats = () => {
    if (!logs.length) return { mostUsed: '—', record: '—' };
    
    const counts: Record<string, number> = {};
    const records: Record<string, number> = {};

    logs.forEach(log => {
      if (log.completed && log.challengeType) {
        counts[log.challengeType] = (counts[log.challengeType] || 0) + 1;
        if (log.durationMs) {
          if (!records[log.challengeType] || log.durationMs < records[log.challengeType]) {
            records[log.challengeType] = log.durationMs;
          }
        }
      }
    });

    let mostUsedType = '';
    let maxCount = 0;
    Object.entries(counts).forEach(([type, count]) => {
      if (count > maxCount) {
        maxCount = count;
        mostUsedType = type;
      }
    });

    const CHALLENGE_NAMES: Record<string, string> = {
      math: 'Math', shake: 'Shake', photo: 'Photo', jump: 'Jump', 
      brush: 'Brush', pushup: 'Pushup', color: 'Color', unscramble: 'Words',
      riddle: 'Riddle', memory: 'Memory', quiz: 'Quiz'
    };

    const mostUsed = CHALLENGE_NAMES[mostUsedType] || '—';
    const recordMs = records[mostUsedType];
    const record = recordMs ? `${(recordMs / 1000).toFixed(1)}s` : '—';

    return { mostUsed, record };
  };

  const { mostUsed, record } = getChallengeStats();

  const getRankIcon = (rank: string) => {
    switch (rank) {
      case 'Eternal Awakened': return 'flare';           // Radiance/Transcendence
      case 'Morning Master': return 'crown-outline';     // Royalty of Routine
      case 'Discipline Warrior': return 'shield-star-outline'; // Battle Tested
      case 'Early Bird': return 'weather-sunset-up';     // Dominating the Dawn
      default: return 'sprout';                          // Rising Growth (Recruit)
    }
  };

  const getNextRankInfo = () => {
    const streak = stats.currentStreak;
    let nextMilestone = 0;
    let rankName = '';
    
    if (streak < 3) { nextMilestone = 3; rankName = 'Early Bird'; }
    else if (streak < 7) { nextMilestone = 7; rankName = 'Discipline Warrior'; }
    else if (streak < 14) { nextMilestone = 14; rankName = 'Morning Master'; }
    else if (streak < 30) { nextMilestone = 30; rankName = 'Eternal Awakened'; }
    else { return null; }

    const prevMilestone = streak < 3 ? 0 : streak < 7 ? 3 : streak < 14 ? 7 : 14;
    const progress = (streak - prevMilestone) / (nextMilestone - prevMilestone);
    const daysLeft = nextMilestone - streak;

    return { nextMilestone, rankName, progress, daysLeft };
  };

  const rankInfo = getNextRankInfo();

  const getLast30Days = () => {
    const dates = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      dates.push(d.toISOString().split('T')[0]);
    }
    return dates;
  };

  const last30Days = getLast30Days();
  const logMap = logs.reduce((acc, log) => {
    acc[log.date] = log.completed;
    return acc;
  }, {} as Record<string, boolean>);

  const StatCard = ({ icon, label, value, color }: { icon: any, label: string, value: string | number, color: string }) => (
    <View style={styles.statCard}>
      <View style={[styles.statIconBox, { backgroundColor: color + '20' }]}>
        <Ionicons name={icon} size={20} color={color} />
      </View>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-back" size={28} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>The Scorecard</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView 
        style={styles.container} 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Streak Hero */}
        <View style={styles.heroSection}>
          <LinearGradient
            colors={isDark ? ['#1C1C1E', '#2C2C2E'] : ['#FFFFFF', '#F9F9F9']}
            style={styles.streakCircle}
          >
            <Ionicons name="flame" size={56} color={colors.accent} />
            <Text style={styles.streakNumber}>{stats.currentStreak}</Text>
            <Text style={styles.streakLabel}>Day Streak</Text>
          </LinearGradient>
          
          {/* Rank HUD */}
          <View style={styles.rankHud}>
            <View style={styles.rankHeader}>
              <View style={styles.rankIconContainer}>
                <MaterialCommunityIcons 
                  name={getRankIcon(getDisciplineRank()) as any} 
                  size={20} 
                  color="#FF7F62" 
                />
              </View>
              <Text style={styles.rankLabel}>{getDisciplineRank()}</Text>
            </View>

            {rankInfo && (
              <View style={styles.progressionArea}>
                <View style={styles.progressBarBg}>
                  <Animated.View 
                    style={[
                      styles.progressBarFill, 
                      { width: `${rankInfo.progress * 100}%` }
                    ]} 
                  />
                </View>
                <View style={styles.progressionFooter}>
                  <Text style={styles.progressionText}>
                    {rankInfo.daysLeft} {rankInfo.daysLeft === 1 ? 'day' : 'days'} until {rankInfo.rankName}
                  </Text>
                  <Text style={styles.milestoneText}>{rankInfo.nextMilestone}d</Text>
                </View>
              </View>
            )}
          </View>
        </View>

        {/* Consistency Heatmap */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Consistency Intensity</Text>
            <Text style={styles.sectionSub}>Last 30 Days</Text>
          </View>
          <View style={styles.heatmapGrid}>
            {last30Days.map((date, index) => {
              const status = logMap[date];
              let bgColor = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)';
              if (status === true) bgColor = colors.accent;
              if (status === false) bgColor = colors.danger;
              
              return (
                <View 
                  key={date} 
                  style={[
                    styles.heatmapSquare, 
                    { backgroundColor: bgColor },
                    index === 29 && styles.todaySquare
                  ]} 
                />
              );
            })}
          </View>
          <View style={styles.heatmapLegend}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: colors.accent }]}/><Text style={styles.legendText}>Victory</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: colors.danger }]}/><Text style={styles.legendText}>Defeat</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }]} /><Text style={styles.legendText}>Neutral</Text>
            </View>
          </View>
        </View>

        {/* Analytics Hub */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Performance Analytics</Text>
          <View style={styles.statsGrid}>
            <StatCard 
              icon="trophy-outline" 
              label="Longest Streak" 
              value={`${stats.longestStreak} Days`} 
              color="#FFB800"
            />
            <StatCard 
              icon="checkmark-circle-outline" 
              label="Total Wake-ups" 
              value={stats.totalCompleted} 
              color="#4CD964"
            />
            <StatCard 
              icon="time-outline" 
              label="Time Gained" 
              value={`${timeGainedHours} hrs`} 
              color={colors.accent}
            />
            <StatCard 
              icon="flash-outline" 
              label="Challenges" 
              value={stats.totalCompleted * 2} // Estimate 2 per alarm
              color="#5856D6"
            />
            <StatCard 
              icon="star-outline" 
              label="Favorite" 
              value={mostUsed} 
              color="#FF2D55"
            />
            <StatCard 
              icon="timer-outline" 
              label="Speed Record" 
              value={record} 
              color="#007AFF"
            />
          </View>
        </View>

        {/* Motivation Card */}
        <View style={styles.motivationCard}>
          <View style={styles.motivationIcon}>
            <MaterialCommunityIcons name="clock-fast" size={32} color="#FFF" />
          </View>
          <View style={styles.motivationContent}>
            <Text style={styles.motivationTitle}>Velocity of Life</Text>
            <Text style={styles.motivationSub}>
              By waking up instantly, you've gained {timeGainedHours} hours of deep life. 
              Keep the fire burning.
            </Text>
          </View>
        </View>

        <Text style={styles.footerNote}>
          Your discipline is your signature. Every morning is a new line in your story.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const getStyles = (colors: any, isDark: boolean) => StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: -0.5,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  heroSection: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
  },
  streakCircle: {
    width: width * 0.5,
    height: width * 0.5,
    borderRadius: width * 0.25,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: isDark ? 0.3 : 0.08,
    shadowRadius: 20,
    elevation: 10,
    borderWidth: 1,
    borderColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
  },
  streakNumber: {
    fontSize: 56,
    fontWeight: '900',
    color: colors.text,
    marginTop: -4,
  },
  streakLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.subtext,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  rankLabel: {
    fontSize: 14,
    fontWeight: '900',
    color: '#FF7F62',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  rankHud: {
    marginTop: 10,
    width: '100%',
    backgroundColor: isDark ? 'rgba(255,127,98,0.05)' : 'rgba(255,127,98,0.03)',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: isDark ? 'rgba(255,127,98,0.1)' : 'rgba(255,127,98,0.08)',
  },
  rankHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 20,
  },
  rankIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: isDark ? 'rgba(255,127,98,0.15)' : '#FFE5DD',
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressionArea: {
    width: '100%',
  },
  progressBarBg: {
    width: '100%',
    height: 10,
    backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
    borderRadius: 5,
    overflow: 'hidden',
    marginBottom: 10,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#FF7F62',
    borderRadius: 5,
  },
  progressionFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressionText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.subtext,
    letterSpacing: 0.2,
  },
  milestoneText: {
    fontSize: 11,
    fontWeight: '900',
    color: colors.accent,
    opacity: 0.8,
  },
  rankBadge: {
    marginTop: 24,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  rankText: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 16, // Added spacing
  },
  sectionSub: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.subtext,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  heatmapGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    backgroundColor: colors.surface,
    padding: 20,
    borderRadius: 24,
    justifyContent: 'center',
  },
  heatmapSquare: {
    width: (width - 48 - 40 - 64) / 10, // 10 columns
    height: (width - 48 - 40 - 64) / 10,
    borderRadius: 4,
  },
  todaySquare: {
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  heatmapLegend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginTop: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.subtext,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    width: (width - 60) / 2,
    backgroundColor: colors.surface,
    borderRadius: 24,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },
  statIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statLabel: {
    fontSize: 12,
    color: colors.subtext,
    fontWeight: '600',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
  },
  motivationCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 24,
    padding: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  motivationIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  motivationContent: {
    flex: 1,
  },
  motivationTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFF',
    marginBottom: 4,
  },
  motivationSub: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.6)',
    lineHeight: 18,
    fontWeight: '500',
  },
  footerNote: {
    marginTop: 40,
    textAlign: 'center',
    fontSize: 13,
    color: colors.subtext,
    lineHeight: 20,
    paddingHorizontal: 20,
    fontStyle: 'italic',
  }
});
