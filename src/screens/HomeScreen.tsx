<<<<<<< HEAD
import React, { useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, StatusBar, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { useAlarm } from '../context/AlarmContext';
import { useTheme } from '../context/ThemeContext';
import { AlarmItem } from '../components/AlarmItem';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSettings } from '../context/SettingsContext';
import { Platform, Linking } from 'react-native';

type RootStackParamList = {
  Home: undefined;
  CreateAlarm: { alarm?: any };
  AlarmRing: { alarmId: string };
  Settings: undefined;
  Scorecard: undefined;
};

export const HomeScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { colors, isDark } = useTheme();
  const { stats, alarms, toggleAlarm, deleteAlarm, refreshStats } = useAlarm();
  const { settings, updateSettings } = useSettings();
  
  const styles = getStyles(colors, isDark);

  React.useEffect(() => {
    if (stats.totalCompleted === 2 && !settings.hasPromptedForReview) {
      Alert.alert(
        'Enjoying ClerraAlarm?',
        "You've already conquered 2 mornings! Would you mind rating us on the App Store?",
        [
          { 
            text: 'Maybe Later', 
            style: 'cancel',
            onPress: () => updateSettings({ hasPromptedForReview: true })
          },
          { 
            text: 'Rate Us', 
            onPress: () => {
              const APP_STORE_ID = 'YOUR_APP_ID';
              const GOOGLE_PLAY_ID = 'com.clerra.alarm';
              const url = Platform.select({
                ios: `itms-apps://itunes.apple.com/app/id${APP_STORE_ID}?action=write-review`,
                android: `market://details?id=${GOOGLE_PLAY_ID}`,
              });
              if (url) Linking.openURL(url);
              updateSettings({ hasPromptedForReview: true });
            }
          }
        ]
      );
    }
  }, [stats.totalCompleted, settings.hasPromptedForReview]);

  const handleDelete = (id: string) => {
    Alert.alert(
      'Delete Alarm',
      'Are you sure you want to delete this alarm?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => deleteAlarm(id) },
      ]
    );
  };

  // ─── Dynamic Header Logic ────────────────────────────────────────────────
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'Conquer Today.';
    if (hour >= 12 && hour < 17) return 'Good Afternoon.';
    return 'Ready for Tomorrow.';
  };

  const getSubtext = () => {
    const activeAlarms = alarms.filter(a => a.enabled);
    if (activeAlarms.length === 0) return 'No alarms set. Sleep in.';
    
    const count = activeAlarms.length;
    const plural = count === 1 ? 'alarm' : 'alarms';
    
    const sorted = [...activeAlarms].sort((a, b) => a.time.localeCompare(b.time));
    const nextUp = sorted[0].time;
    
    return `${count} ${plural} armed. Next up: ${nextUp}.`;
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <View style={styles.container}>
        
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>{getGreeting()}</Text>
          <Text style={styles.subtext}>{getSubtext()}</Text>
        </View>

        {/* Alarms List */}
        <ScrollView style={styles.list} showsVerticalScrollIndicator={false} contentContainerStyle={styles.listContent}>
          {alarms.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="alarm-outline" size={64} color={colors.accent} style={styles.emptyIcon} />
              <Text style={styles.emptyText}>No alarms yet</Text>
              <Text style={styles.emptySubtext}>Tap the plus to set an alarm</Text>
            </View>
          ) : (
            alarms
              .sort((a, b) => {
                // Active alarms first; within each group sort by time
                if (a.enabled !== b.enabled) return a.enabled ? -1 : 1;
                return a.time.localeCompare(b.time);
              })
              .map(alarm => (
                <AlarmItem
                  key={alarm.id}
                  alarm={alarm}
                  onToggle={toggleAlarm}
                  onPress={(a) => navigation.navigate('CreateAlarm', { alarm: a })}
                  onDelete={handleDelete}
                />
              ))
          )}
        </ScrollView>

        {/* Fade Out Overlay */}
        <LinearGradient
          colors={[isDark ? 'rgba(18,18,18,0)' : 'rgba(254, 244, 236, 0)', colors.background]}
          style={styles.fadeOverlay}
          pointerEvents="none"
        />

        {/* Floating Controls Area */}
        <View style={styles.bottomControls}>
          {/* Bottom Dock */}
          <View style={[styles.dock, { backgroundColor: isDark ? colors.surface : '#1C1C1E' }]}>
            <TouchableOpacity 
              style={styles.dockSideBtn}
              onPress={() => navigation.navigate('Scorecard')}
              activeOpacity={0.7}
            >
              <View style={[styles.dockSideIconBg, styles.profileBg, { backgroundColor: isDark ? colors.border : '#FFF' }]}>
                <Ionicons name="flame" size={20} color={isDark ? colors.text : '#1A1A1A'} />
              </View>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.micBtn, { backgroundColor: colors.accent, shadowColor: colors.accent }]}
              onPress={() => navigation.navigate('CreateAlarm')}
              activeOpacity={0.8}
            >
              <Ionicons name="add" size={34} color="#FFF" />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.dockSideBtn}
              onPress={() => navigation.navigate('Settings')}
            >
              <View style={[styles.dockSideIconBg, styles.settingsBg, { backgroundColor: isDark ? colors.border : '#FFF' }]}>
                <MaterialCommunityIcons name="hexagon-outline" size={24} color={isDark ? colors.text : '#1A1A1A'} />
              </View>
            </TouchableOpacity>
          </View>
        </View>
        
      </View>
    </SafeAreaView>
  );
};

const getStyles = (colors: any, isDark: boolean) => StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    backgroundColor: colors.background,
  },
  header: {
    marginTop: 24,
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    color: colors.text,
    letterSpacing: -1,
    marginBottom: 6,
  },
  subtext: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.subtext,
    letterSpacing: 0.2,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 150, // Space for dock
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: 80,
  },
  emptyIcon: {
    marginBottom: 20,
    opacity: 0.9,
  },
  emptyText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 16,
    color: colors.subtext,
  },
  
  // Floating Controls
  bottomControls: {
    position: 'absolute',
    bottom: 30,
    left: 24,
    right: 24,
    alignItems: 'center',
  },
  
  // Dock
  dock: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1C1C1E',
    borderRadius: 50,
    height: 80,
    paddingHorizontal: 20,
    gap: 15,
    justifyContent: 'center',
  },
  dockSideBtn: {
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dockSideIconBg: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileBg: {},
  settingsBg: {},
  micBtn: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#FF7F62',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FF7F62',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  fadeOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 180,
  }
=======
import React, { useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, StatusBar, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { useAlarm } from '../context/AlarmContext';
import { useTheme } from '../context/ThemeContext';
import { AlarmItem } from '../components/AlarmItem';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSettings } from '../context/SettingsContext';
import { Platform, Linking } from 'react-native';

type RootStackParamList = {
  Home: undefined;
  CreateAlarm: { alarm?: any };
  AlarmRing: { alarmId: string };
  Settings: undefined;
  Scorecard: undefined;
};

export const HomeScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { colors, isDark } = useTheme();
  const { stats, alarms, toggleAlarm, deleteAlarm, refreshStats } = useAlarm();
  const { settings, updateSettings } = useSettings();
  
  const styles = getStyles(colors, isDark);

  React.useEffect(() => {
    if (stats.totalCompleted === 2 && !settings.hasPromptedForReview) {
      Alert.alert(
        'Enjoying ClerraAlarm?',
        "You've already conquered 2 mornings! Would you mind rating us on the App Store?",
        [
          { 
            text: 'Maybe Later', 
            style: 'cancel',
            onPress: () => updateSettings({ hasPromptedForReview: true })
          },
          { 
            text: 'Rate Us', 
            onPress: () => {
              const APP_STORE_ID = 'YOUR_APP_ID';
              const GOOGLE_PLAY_ID = 'com.clerra.alarm';
              const url = Platform.select({
                ios: `itms-apps://itunes.apple.com/app/id${APP_STORE_ID}?action=write-review`,
                android: `market://details?id=${GOOGLE_PLAY_ID}`,
              });
              if (url) Linking.openURL(url);
              updateSettings({ hasPromptedForReview: true });
            }
          }
        ]
      );
    }
  }, [stats.totalCompleted, settings.hasPromptedForReview]);

  const handleDelete = (id: string) => {
    Alert.alert(
      'Delete Alarm',
      'Are you sure you want to delete this alarm?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => deleteAlarm(id) },
      ]
    );
  };

  // ─── Dynamic Header Logic ────────────────────────────────────────────────
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'Conquer Today.';
    if (hour >= 12 && hour < 17) return 'Good Afternoon.';
    return 'Ready for Tomorrow.';
  };

  const getSubtext = () => {
    const activeAlarms = alarms.filter(a => a.enabled);
    if (activeAlarms.length === 0) return 'No alarms set. Sleep in.';
    
    const count = activeAlarms.length;
    const plural = count === 1 ? 'alarm' : 'alarms';
    
    const sorted = [...activeAlarms].sort((a, b) => a.time.localeCompare(b.time));
    const nextUp = sorted[0].time;
    
    return `${count} ${plural} armed. Next up: ${nextUp}.`;
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <View style={styles.container}>
        
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>{getGreeting()}</Text>
          <Text style={styles.subtext}>{getSubtext()}</Text>
        </View>

        {/* Alarms List */}
        <ScrollView style={styles.list} showsVerticalScrollIndicator={false} contentContainerStyle={styles.listContent}>
          {alarms.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="alarm-outline" size={64} color={colors.accent} style={styles.emptyIcon} />
              <Text style={styles.emptyText}>No alarms yet</Text>
              <Text style={styles.emptySubtext}>Tap the plus to set an alarm</Text>
            </View>
          ) : (
            alarms
              .sort((a, b) => {
                // Active alarms first; within each group sort by time
                if (a.enabled !== b.enabled) return a.enabled ? -1 : 1;
                return a.time.localeCompare(b.time);
              })
              .map(alarm => (
                <AlarmItem
                  key={alarm.id}
                  alarm={alarm}
                  onToggle={toggleAlarm}
                  onPress={(a) => navigation.navigate('CreateAlarm', { alarm: a })}
                  onDelete={handleDelete}
                />
              ))
          )}
        </ScrollView>

        {/* Fade Out Overlay */}
        <LinearGradient
          colors={[isDark ? 'rgba(18,18,18,0)' : 'rgba(254, 244, 236, 0)', colors.background]}
          style={styles.fadeOverlay}
          pointerEvents="none"
        />

        {/* Floating Controls Area */}
        <View style={styles.bottomControls}>
          {/* Bottom Dock */}
          <View style={[styles.dock, { backgroundColor: isDark ? colors.surface : '#1C1C1E' }]}>
            <TouchableOpacity 
              style={styles.dockSideBtn}
              onPress={() => navigation.navigate('Scorecard')}
              activeOpacity={0.7}
            >
              <View style={[styles.dockSideIconBg, styles.profileBg, { backgroundColor: isDark ? colors.border : '#FFF' }]}>
                <Ionicons name="flame" size={20} color={isDark ? colors.text : '#1A1A1A'} />
              </View>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.micBtn, { backgroundColor: colors.accent, shadowColor: colors.accent }]}
              onPress={() => navigation.navigate('CreateAlarm')}
              activeOpacity={0.8}
            >
              <Ionicons name="add" size={34} color="#FFF" />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.dockSideBtn}
              onPress={() => navigation.navigate('Settings')}
            >
              <View style={[styles.dockSideIconBg, styles.settingsBg, { backgroundColor: isDark ? colors.border : '#FFF' }]}>
                <MaterialCommunityIcons name="hexagon-outline" size={24} color={isDark ? colors.text : '#1A1A1A'} />
              </View>
            </TouchableOpacity>
          </View>
        </View>
        
      </View>
    </SafeAreaView>
  );
};

const getStyles = (colors: any, isDark: boolean) => StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    backgroundColor: colors.background,
  },
  header: {
    marginTop: 24,
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    color: colors.text,
    letterSpacing: -1,
    marginBottom: 6,
  },
  subtext: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.subtext,
    letterSpacing: 0.2,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 150, // Space for dock
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: 80,
  },
  emptyIcon: {
    marginBottom: 20,
    opacity: 0.9,
  },
  emptyText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 16,
    color: colors.subtext,
  },
  
  // Floating Controls
  bottomControls: {
    position: 'absolute',
    bottom: 30,
    left: 24,
    right: 24,
    alignItems: 'center',
  },
  
  // Dock
  dock: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1C1C1E',
    borderRadius: 50,
    height: 80,
    paddingHorizontal: 20,
    gap: 15,
    justifyContent: 'center',
  },
  dockSideBtn: {
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dockSideIconBg: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileBg: {},
  settingsBg: {},
  micBtn: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#FF7F62',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FF7F62',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  fadeOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 180,
  }
>>>>>>> origin/main
});