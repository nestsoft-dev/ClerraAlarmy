import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Image } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { useTheme } from '../../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';

type Props = NativeStackScreenProps<RootStackParamList, 'OnboardingWelcome'>;

const STATS: { icon: keyof typeof Ionicons.glyphMap; value: string; sub: string }[] = [
  { icon: 'flash',        value: '100K+', sub: 'Wake-ups' },
  { icon: 'trophy',       value: '94%',   sub: 'Success rate' },
  { icon: 'flame',        value: '10+',   sub: 'Challenges' },
];

export const OnboardingWelcomeScreen: React.FC<Props> = ({ navigation }) => {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  const badgeOpacity    = useRef(new Animated.Value(0)).current;
  const titleTranslate  = useRef(new Animated.Value(40)).current;
  const titleOpacity    = useRef(new Animated.Value(0)).current;
  const bodyOpacity     = useRef(new Animated.Value(0)).current;
  const statsTranslate  = useRef(new Animated.Value(30)).current;
  const statsOpacity    = useRef(new Animated.Value(0)).current;
  const footerTranslate = useRef(new Animated.Value(60)).current;
  const footerOpacity   = useRef(new Animated.Value(0)).current;
  
  console.log('DEBUG: OnboardingWelcomeScreen Rendering');

  useEffect(() => {
    console.log('DEBUG: OnboardingWelcomeScreen Mounted');
    Animated.sequence([
      Animated.timing(badgeOpacity,    { toValue: 1, duration: 500, delay: 200, useNativeDriver: true }),
      Animated.parallel([
        Animated.timing(titleOpacity,   { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.timing(titleTranslate, { toValue: 0, duration: 600, useNativeDriver: true }),
      ]),
      Animated.timing(bodyOpacity,     { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.parallel([
        Animated.timing(statsOpacity,   { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.timing(statsTranslate, { toValue: 0, duration: 400, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(footerOpacity,   { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.timing(footerTranslate, { toValue: 0, duration: 400, useNativeDriver: true }),
      ]),
    ]).start();
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>

      <View style={styles.content}>
        {/* Logo */}
        <Animated.View style={[styles.logoContainer, { opacity: badgeOpacity }]}>
          <Image 
            source={require('../../../assets/ClerraAlarm Light1.png')} 
            style={styles.logo}
            resizeMode="contain" 
          />
        </Animated.View>

        {/* Title */}
        <Animated.Text
          style={[
            styles.title,
            { color: colors.text, opacity: titleOpacity, transform: [{ translateY: titleTranslate }] },
          ]}
        >
          Wake Up.{'\n'}Every{'\n'}Single Day.
        </Animated.Text>

        {/* Body */}
        <Animated.Text style={[styles.body, { color: colors.subtext, opacity: bodyOpacity }]}>
          ClerraAlarm users wake up{' '}
          <Text style={{ color: colors.accent, fontWeight: '700' }}>15 minutes faster</Text>
          {' '}on average. No snooze loops. Just action.
        </Animated.Text>

        {/* Stats */}
        <Animated.View style={[styles.statsRow, { opacity: statsOpacity, transform: [{ translateY: statsTranslate }] }]}>
          {STATS.map((stat, i) => (
            <View key={i} style={[styles.statCard, { backgroundColor: colors.surface }]}>
              <Ionicons name={stat.icon} size={22} color={colors.accent} />
              <Text style={[styles.statValue, { color: colors.text }]}>{stat.value}</Text>
              <Text style={[styles.statSub, { color: colors.subtext }]}>{stat.sub}</Text>
            </View>
          ))}
        </Animated.View>
      </View>

      <Animated.View
        style={[styles.footer, { opacity: footerOpacity, transform: [{ translateY: footerTranslate }] }]}
      >
        <TouchableOpacity
          style={[styles.button, { backgroundColor: colors.accent }]}
          onPress={() => navigation.navigate('OnboardingQuestions')}
          activeOpacity={0.85}
        >
          <Text style={styles.buttonText}>Get Started</Text>
          <Ionicons name="arrow-forward" size={20} color="#FFFFFF" style={{ marginLeft: 8 }} />
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, paddingHorizontal: 28, paddingTop: 48, justifyContent: 'center' },
  logoContainer: {
    alignSelf: 'center',
    marginBottom: 32,
  },
  logo: {
    width: 100,
    height: 100,
  },
  title: {
    fontSize: 56,
    fontWeight: '900',
    lineHeight: 60,
    marginBottom: 28,
    letterSpacing: -1.5,
    textAlign: 'center',
  },
  body: {
    fontSize: 17,
    lineHeight: 26,
    marginBottom: 40,
    fontWeight: '400',
    textAlign: 'center',
  },
  statsRow: { flexDirection: 'row', gap: 12 },
  statCard: {
    flex: 1,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    gap: 6,
  },
  statValue: { fontSize: 18, fontWeight: '800', letterSpacing: -0.5 },
  statSub: { fontSize: 11, fontWeight: '500', textAlign: 'center' },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 56,
  },
  button: {
    height: 60,
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: { fontSize: 18, fontWeight: '800', color: '#FFFFFF', letterSpacing: -0.3 },
});
