import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform, Linking, Switch, Alert, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, ThemeMode } from '../context/ThemeContext';
import { useSettings } from '../context/SettingsContext';
import { RootStackParamList } from '../navigation/AppNavigator';
import { Storage } from '../utils/storage';
import { ALARM_SOUNDS } from '../constants/sounds';
import { LinearGradient } from 'expo-linear-gradient';

export const SettingsScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { colors, isDark, mode, setMode } = useTheme();
  const { settings, updateSettings } = useSettings();
  
  const styles = getStyles(colors, isDark);

  const APPEARANCE_OPTIONS: { label: string; value: ThemeMode; icon: keyof typeof Ionicons.glyphMap }[] = [
    { label: 'Light', value: 'light', icon: 'sunny' },
    { label: 'Dark',  value: 'dark',  icon: 'moon' },
    { label: 'Auto',  value: 'system', icon: 'phone-portrait' },
  ];

  const SettingsItem = ({ 
    icon, 
    title, 
    value, 
    onPress, 
    isDestructive,
    hasSwitch,
    switchValue,
    onSwitchChange,
  }: { 
    icon: keyof typeof Ionicons.glyphMap; 
    title: string; 
    value?: string; 
    onPress?: () => void;
    isDestructive?: boolean;
    hasSwitch?: boolean;
    switchValue?: boolean;
    onSwitchChange?: (val: boolean) => void;
  }) => (
    <TouchableOpacity 
      style={styles.settingItem} 
      onPress={hasSwitch ? undefined : onPress}
      activeOpacity={hasSwitch ? 1 : 0.7}
      disabled={hasSwitch}
    >
      <View style={styles.settingLeft}>
        <View style={[styles.iconBox, isDestructive && styles.iconBoxDestructive]}>
          <Ionicons name={icon} size={20} color={isDestructive ? colors.danger : colors.text} />
        </View>
        <Text style={[styles.settingTitle, isDestructive && styles.destructiveText]}>
          {title}
        </Text>
      </View>
      <View style={styles.settingRight}>
        {hasSwitch ? (
          <Switch 
            value={switchValue} 
            onValueChange={onSwitchChange}
            trackColor={{ false: colors.border, true: colors.accent }}
            thumbColor={Platform.OS === 'ios' ? undefined : '#FFFFFF'}
          />
        ) : (
          <>
            {value && <Text style={styles.settingValue}>{value}</Text>}
            <Ionicons name="chevron-forward" size={20} color={colors.subtext} />
          </>
        )}
      </View>
    </TouchableOpacity>
  );



  const showGracePeriodPicker = () => {
    Alert.alert(
      'Grace Period',
      'Seconds before alarm sound and discipline kick in.',
      [
        { text: '0 Sec (Instant)', onPress: () => updateSettings({ gracePeriod: 0 }) },
        { text: '5 Sec', onPress: () => updateSettings({ gracePeriod: 5 }) },
        { text: '10 Sec', onPress: () => updateSettings({ gracePeriod: 10 }) },
        { text: '15 Sec', onPress: () => updateSettings({ gracePeriod: 15 }) },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const showPreAlarmPicker = () => {
    Alert.alert(
      'Pre-Alarm Reminder',
      'When should we notify you before the alarm rings?',
      [
        { text: 'None', onPress: () => updateSettings({ preAlarmReminder: 0 }) },
        { text: '5 Minutes Before', onPress: () => updateSettings({ preAlarmReminder: 5 }) },
        { text: '10 Minutes Before', onPress: () => updateSettings({ preAlarmReminder: 10 }) },
        { text: '15 Minutes Before', onPress: () => updateSettings({ preAlarmReminder: 15 }) },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const showSoundPicker = () => {
    Alert.alert(
      'Default Sound',
      'Pick the default tone for new alarms.',
      [
        ...ALARM_SOUNDS.slice(0, 5).map(s => ({
          text: s.name,
          onPress: () => updateSettings({ defaultSoundId: s.id })
        })),
        { text: 'More in Alarm Creator', style: 'cancel' },
      ]
    );
  };

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure? This will clear all local data from this device.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Sign Out', 
          style: 'destructive', 
          onPress: async () => {
            await Storage.clearAllData();
            navigation.reset({ index: 0, routes: [{ name: 'OnboardingWelcome' }] });
          } 
        },
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account?',
      'This action is permanent. All your alarms, history, and Pro settings will be permanently removed. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete Permanently', 
          style: 'destructive', 
          onPress: async () => {
            await Storage.clearAllData();
            navigation.reset({ index: 0, routes: [{ name: 'OnboardingWelcome' }] });
          } 
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
          activeOpacity={0.8}
        >
          <Ionicons name="chevron-back" size={28} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.titleContainer}>
          <Text style={styles.headerTitle}>Settings</Text>
          <View style={styles.proBadge}>
            <Text style={styles.proBadgeText}>PRO</Text>
          </View>
        </View>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.scrollContent}>
        
        {/* ── Special Offer ────────────────────────────────────────── */}
        <TouchableOpacity 
          style={styles.promoCard} 
          onPress={() => navigation.navigate('SpecialOffer')}
          activeOpacity={0.9}
        >
          <LinearGradient
            colors={['#FF7F27', '#FF9F43']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.promoGradient}
          >
            <View style={styles.promoLeft}>
              <View style={styles.promoBadge}>
                <Text style={styles.promoBadgeText}>LIMITED TIME</Text>
              </View>
              <Text style={styles.promoTitle}>Mega Deal — 76% OFF</Text>
              <Text style={styles.promoSub}>Only $0.69/week (billed yearly)</Text>
            </View>
            <Ionicons name="gift" size={42} color="rgba(255,255,255,0.4)" style={styles.promoIcon} />
            <Ionicons name="chevron-forward" size={24} color="#FFFFFF" />
          </LinearGradient>
        </TouchableOpacity>

        {/* ── Appearance ─────────────────────────────────────────── */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>APPEARANCE</Text>
          <View style={[styles.card, { padding: 20 }]}>
            <View style={styles.segmentedControl}>
              {APPEARANCE_OPTIONS.map(opt => {
                const isActive = mode === opt.value;
                return (
                  <TouchableOpacity
                    key={opt.value}
                    style={[styles.segmentBtn, isActive && styles.segmentBtnActive]}
                    onPress={() => setMode(opt.value)}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name={opt.icon}
                      size={16}
                      color={isActive ? '#FFFFFF' : colors.subtext}
                      style={{ marginBottom: 4 }}
                    />
                    <Text style={[styles.segmentLabel, isActive && styles.segmentLabelActive]}>
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionHeader}>DISCIPLINE ENGINE</Text>
          <View style={styles.card}>
            <SettingsItem 
              icon="lock-closed" 
              title="Strict Mode" 
              hasSwitch 
              switchValue={settings.strictMode}
              onSwitchChange={(val) => updateSettings({ strictMode: val })}
            />
            <View style={styles.divider} />
            <SettingsItem 
              icon="flame" 
              title="Adaptive Difficulty" 
              hasSwitch
              switchValue={settings.adaptiveDifficulty}
              onSwitchChange={(val) => updateSettings({ adaptiveDifficulty: val })}
            />

          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionHeader}>ALARM BEHAVIOR</Text>
          <View style={styles.card}>
            <SettingsItem 
              icon="volume-high" 
              title="Max Volume Override" 
              hasSwitch
              switchValue={settings.maxVolumeOverride}
              onSwitchChange={(val) => updateSettings({ maxVolumeOverride: val })}
            />
            <View style={styles.divider} />
            <SettingsItem 
              icon="timer" 
              title="Grace Period" 
              value={`${settings.gracePeriod} Sec`} 
              onPress={showGracePeriodPicker}
            />
            <View style={styles.divider} />
            <SettingsItem 
              icon="notifications" 
              title="Pre-Alarm Reminder" 
              value={settings.preAlarmReminder === 0 ? 'None' : `${settings.preAlarmReminder} Min`} 
              onPress={showPreAlarmPicker}
            />
            <View style={styles.divider} />
            <SettingsItem 
              icon="musical-notes" 
              title="Default Sound" 
              value={ALARM_SOUNDS.find(s => s.id === settings.defaultSoundId)?.name || 'Radar'} 
              onPress={showSoundPicker}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionHeader}>SUPPORT & LEGAL</Text>
          <View style={styles.card}>
            <SettingsItem 
              icon="star-outline" 
              title="Rate ClerraAlarm" 
              onPress={() => {
                const APP_STORE_ID = 'YOUR_APP_ID';
                const GOOGLE_PLAY_ID = 'com.clerra.alarm';
                const url = Platform.select({
                  ios: `itms-apps://itunes.apple.com/app/id${APP_STORE_ID}?action=write-review`,
                  android: `market://details?id=${GOOGLE_PLAY_ID}`,
                });
                if (url) Linking.openURL(url);
              }} 
            />
            <View style={styles.divider} />
            <SettingsItem icon="help-buoy" title="Help Center" onPress={() => Linking.openURL('https://clerrahq.com/help')} />
            <View style={styles.divider} />
            <SettingsItem icon="document-text" title="Terms of Service" onPress={() => Linking.openURL('https://clerrahq.com/terms')} />
            <View style={styles.divider} />
            <SettingsItem icon="shield-checkmark" title="Privacy Policy" onPress={() => Linking.openURL('https://clerrahq.com/privacy')} />
          </View>
        </View>



        <View style={styles.section}>
          <Text style={styles.sectionHeader}>ACCOUNT MANAGEMENT</Text>
          <View style={styles.card}>
            <SettingsItem 
              icon="log-out-outline" 
              title="Sign Out" 
              onPress={handleSignOut} 
            />
            <View style={styles.divider} />
            <SettingsItem 
              icon="trash-outline" 
              title="Delete Account" 
              isDestructive
              onPress={handleDeleteAccount} 
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionHeader}>DEVELOPER TOOLS</Text>
          <View style={styles.card}>
            <SettingsItem 
              icon="star" 
              title="Test Review Prompt" 
              onPress={() => {
                Alert.alert(
                  'Enjoying ClerraAlarm?',
                  "You've already conquered 2 mornings! Would you mind rating us on the App Store?",
                  [
                    { text: 'Maybe Later', style: 'cancel' },
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
                      }
                    }
                  ]
                );
              }}
            />
            <View style={styles.divider} />
            <SettingsItem 
              icon="color-wand" 
              title="Re-run Onboarding" 
              onPress={async () => {
                await Storage.setHasCompletedOnboarding(false);
                navigation.reset({
                  index: 0,
                  routes: [{ name: 'OnboardingWelcome' }],
                });
              }}
            />
          </View>
        </View>

        <Image 
          source={require('../../assets/ClerraAlarm Light1.png')} 
          style={styles.bottomLogo}
          resizeMode="contain" 
        />
        <Text style={styles.version}>ClerraAlarm v1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const getStyles = (colors: any, isDark: boolean) => StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  promoCard: {
    marginBottom: 24,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#FF7F27',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
  },
  promoGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingRight: 16,
  },
  promoLeft: {
    flex: 1,
  },
  promoBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  promoBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  promoTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 2,
  },
  promoSub: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 13,
    fontWeight: '500',
  },
  promoIcon: {
    position: 'absolute',
    right: 40,
    bottom: -10,
    transform: [{ rotate: '-15deg' }],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  proBadge: {
    backgroundColor: colors.accent,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  proBadgeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  backButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    letterSpacing: -0.5,
  },
  headerRight: {
    width: 44, // To balance the back button
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    paddingBottom: 60,
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.subtext,
    letterSpacing: 1,
    marginBottom: 8,
    marginLeft: 12,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    shadowColor: isDark ? '#000' : '#2E1E1A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: colors.surface,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: isDark ? colors.surfaceHighlight : '#F5EBE4',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconBoxDestructive: {
    backgroundColor: isDark ? 'rgba(255,69,58,0.1)' : '#FFEBEE',
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
  },
  destructiveText: {
    color: colors.danger,
  },
  settingRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  settingValue: {
    fontSize: 16,
    color: colors.subtext,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginLeft: 60, // Align with text
  },
  bottomLogo: {
    width: 40,
    height: 40,
    alignSelf: 'center',
    marginTop: 20,
    opacity: 0.6,
  },
  version: {
    textAlign: 'center',
    fontSize: 14,
    color: colors.subtext,
    marginTop: 8,
    fontWeight: '500',
  },
  // Appearance segmented control
  segmentedControl: {
    flexDirection: 'row',
    backgroundColor: isDark ? colors.background : '#F0E5DE',
    borderRadius: 16,
    padding: 4,
    gap: 4,
  },
  segmentBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 12,
  },
  segmentBtnActive: {
    backgroundColor: colors.accent,
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4,
  },
  segmentLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.subtext,
    letterSpacing: 0.3,
  },
  segmentLabelActive: {
    color: '#FFFFFF',
  },
  // Profile styles
  profileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 16,
  },
  profileImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  profileName: {
    fontSize: 16,
    fontWeight: '700',
  },
  profileEmail: {
    fontSize: 14,
  },
});
