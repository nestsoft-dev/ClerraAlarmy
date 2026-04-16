import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
  Alert,
  Image,
  Animated,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { useTheme } from '../../context/ThemeContext';
import { useOnboarding } from '../../context/OnboardingContext';
import { useAlarm } from '../../context/AlarmContext';
import { Storage } from '../../utils/storage';
import { Ionicons } from '@expo/vector-icons';
import * as Notifications from 'expo-notifications';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

type Props = NativeStackScreenProps<RootStackParamList, 'OnboardingPaywall'>;

type SubscriptionPlan = 'weekly' | 'yearly';

const REVIEWS = [
  { id: '1', name: 'James T.', text: 'Finally a wake up app that actually works. The push-up challenge is brutal but effective!', rating: 5 },
  { id: '2', name: 'Sarah K.', text: 'Love the cinematic wallpapers. Makes waking up feel like a movie.', rating: 5 },
  { id: '3', name: 'Mike R.', text: 'The math problems really wake my brain up. Best $50 I ever spent.', rating: 5 },
  { id: '4', name: 'Elena G.', text: 'Never slept through an alarm since I got Clerra. The volume enforcement is no joke.', rating: 5 },
  { id: '5', name: 'David L.', text: 'Highest quality alarm app on the store. Worth every penny.', rating: 5 },
  { id: '6', name: 'Chloe M.', text: 'The color matching challenge is so creative! 10/10 design.', rating: 5 },
  { id: '7', name: 'Robert H.', text: 'Strict mode saved my career. No more oversleeping.', rating: 5 },
  { id: '8', name: 'Jessica B.', text: 'Clean, beautiful, and impossible to snooze.', rating: 5 },
  { id: '9', name: 'Thomas W.', text: 'The weekly streak feature keeps me motivated.', rating: 5 },
  { id: '10', name: 'Anna P.', text: 'Genuinely premium experience. The audio quality is incredible.', rating: 5 },
];

const ReviewsSection = () => {
  const { colors, isDark } = useTheme();
  // Double the list for seamless loop
  const doubledReviews = [...REVIEWS, ...REVIEWS];
  const scrollX = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    const animation = Animated.loop(
      Animated.timing(scrollX, {
        toValue: -296 * REVIEWS.length,
        duration: 40000,
        easing: (t) => t, // Linear
        useNativeDriver: true,
      })
    );
    animation.start();
    return () => animation.stop();
  }, [scrollX]);

  return (
    <View style={styles.reviewsWrapper}>
      <Animated.View style={[styles.reviewsTrack, { transform: [{ translateX: scrollX }] }]}>
        {doubledReviews.map((rev, idx) => (
          <View key={`${rev.id}-${idx}`} style={[styles.reviewCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.reviewHeader}>
              <View style={styles.stars}>
                {[...Array(5)].map((_, i) => (
                  <Ionicons key={i} name="star" size={12} color="#FF7F62" />
                ))}
              </View>
              <Text style={[styles.reviewName, { color: colors.text }]}>{rev.name}</Text>
            </View>
            <Text style={[styles.reviewText, { color: colors.subtext }]} numberOfLines={3}>{rev.text}</Text>
          </View>
        ))}
      </Animated.View>
    </View>
  );
};

export const OnboardingPaywallScreen: React.FC<Props> = ({ navigation }) => {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const { buildAlarm } = useOnboarding();
  const { addAlarm } = useAlarm();
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan>('yearly');
  const [loading, setLoading] = useState(false);

  const handleStartTrial = async () => {
    setLoading(true);
    try {
      // 0. Request Permissions (Crucial for alarms)
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permissions Required',
          'Clerra needs notification permissions to wake you up reliably.',
          [{ text: 'OK' }]
        );
      }

      // 1. Logically "Subscribe" (Mock)
      const settings = await Storage.getSettings();
      await Storage.updateSettings({ 
        ...settings, 
        isPremium: true,
        subscriptionPlan: selectedPlan 
      });

      // 2. Build and save the first alarm
      const newAlarm = buildAlarm();
      await addAlarm(newAlarm);

      // 3. Mark onboarding as complete
      await Storage.setHasCompletedOnboarding(true);

      // 4. Navigate to Home
      navigation.reset({
        index: 0,
        routes: [{ name: 'Home' }],
      });
    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };



  const PlanOption = ({ 
    type, 
    title, 
    price, 
    period, 
    badge 
  }: { 
    type: SubscriptionPlan; 
    title: string; 
    price: string; 
    period: string;
    badge?: string;
  }) => {
    const isSelected = selectedPlan === type;
    return (
      <TouchableOpacity
        style={[
          styles.planCard,
          { 
            backgroundColor: colors.surface,
            borderColor: isSelected ? colors.accent : colors.border,
          }
        ]}
        onPress={() => setSelectedPlan(type)}
        activeOpacity={0.8}
      >
        <View style={styles.planInfo}>
          <View style={styles.planTextContainer}>
            <Text style={[styles.planTitle, { color: colors.text }]}>{title}</Text>
            <Text style={[styles.planPrice, { color: colors.subtext }]}>
              <Text style={{ fontWeight: '700', color: colors.text }}>{price}</Text> / {period}
            </Text>
          </View>
          {badge && (
            <View style={[styles.badge, { backgroundColor: colors.accent }]}>
              <Text style={styles.badgeText}>{badge}</Text>
            </View>
          )}
        </View>
        <View style={[
          styles.radio, 
          { borderColor: isSelected ? colors.accent : colors.subtext }
        ]}>
          {isSelected && <View style={[styles.radioFill, { backgroundColor: colors.accent }]} />}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView 
        contentContainerStyle={{ paddingTop: insets.top + 6, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.brandContainer}>
            <Text style={[styles.superTitle, { color: colors.text }]}>CLERRAALARM</Text>
            <View style={styles.proBadge}>
              <Text style={styles.proBadgeText}>PRO</Text>
            </View>
          </View>
          <Text style={[styles.title, { color: colors.text }]}>
            Master your morning.{'\n'}Master your life.
          </Text>
        </View>

        {/* Benefits */}
        <View style={styles.benefits}>
          <Benefit icon="flame" text="Unlimited adaptive missions" />
          <Benefit icon="fitness" text="Work out to dismiss alarm" />
          <Benefit icon="volume-high" text="Hardcore volume enforcement" />
          <Benefit icon="musical-notes" text="Full wake-up sound library" />
          <Benefit icon="stats-chart" text="Advanced discipline analytics" />
        </View>

        {/* Pricing */}
        <View style={styles.pricingContainer}>
          <PlanOption 
            type="yearly"
            title="Yearly Access"
            price="$0.69"
            period="week"
            badge="SAVE 76%"
          />

          <PlanOption 
            type="weekly"
            title="Weekly Access"
            price="$2.99"
            period="week"
          />
        </View>

        {/* Trial Note */}
        <View style={styles.trialNote}>
          <Ionicons name="shield-checkmark" size={16} color={colors.subtext} style={{ marginRight: 6 }} />
          <Text style={[styles.trialNoteText, { color: colors.subtext }]}>
            {selectedPlan === 'yearly' ? '3 days free, then $36.99/year. Cancel anytime.' : '$2.99/week. Cancel anytime.'}
          </Text>
        </View>

        {/* Dynamic Reviews Section */}
        <ReviewsSection />


      </ScrollView>

      {/* Footer Button */}
      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom + 16, 56) }]}>
        <TouchableOpacity
          style={[styles.mainButton, { backgroundColor: colors.accent }]}
          onPress={handleStartTrial}
          disabled={loading}
          activeOpacity={0.9}
        >
          {loading ? (
            <Text style={styles.mainButtonText}>Processing...</Text>
          ) : (
            <Text style={styles.mainButtonText}>
              {selectedPlan === 'yearly' ? 'Start 3-Day Free Trial' : 'Continue'}
            </Text>
          )}
        </TouchableOpacity>

        <View style={styles.legalLinks}>
          <TouchableOpacity><Text style={styles.legalText}>Restore</Text></TouchableOpacity>
          <Text style={styles.legalDot}>•</Text>
          <TouchableOpacity><Text style={styles.legalText}>Terms of Use</Text></TouchableOpacity>
          <Text style={styles.legalDot}>•</Text>
          <TouchableOpacity><Text style={styles.legalText}>Privacy Policy</Text></TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const Benefit = ({ icon, text }: { icon: keyof typeof Ionicons.glyphMap; text: string }) => {
  const { colors } = useTheme();
  return (
    <View style={styles.benefitRow}>
      <View style={[styles.benefitIconBox, { backgroundColor: 'rgba(255,127,98,0.1)' }]}>
        <Ionicons name={icon} size={18} color="#FF7F62" />
      </View>
      <Text style={[styles.benefitText, { color: colors.text }]}>{text}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: 24,
    marginTop: 40,
    marginBottom: 32,
    alignItems: 'center',
  },
  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  superTitle: {
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  proBadge: {
    backgroundColor: '#FF7F62',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  proBadgeText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: -1,
    textAlign: 'center',
    lineHeight: 38,
    marginBottom: 8,
  },
  subTitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    opacity: 0.8,
  },
  benefits: {
    paddingHorizontal: 32,
    marginBottom: 28,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  benefitIconBox: {
    width: 32,
    height: 32,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  benefitText: {
    fontSize: 15,
    fontWeight: '600',
  },
  pricingContainer: {
    paddingHorizontal: 24,
    marginBottom: 12,
  },
  planCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderRadius: 20,
    borderWidth: 2,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
  },
  planInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  planTextContainer: {
    flex: 1,
  },
  planTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 2,
  },
  planPrice: {
    fontSize: 14,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    marginLeft: 8,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '900',
  },
  radio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  radioFill: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  trialNote: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  trialNoteText: {
    fontSize: 12,
    textAlign: 'center',
    fontWeight: '500',
  },
  footer: {
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  mainButton: {
    height: 64,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FF7F62',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  mainButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  legalLinks: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    gap: 8,
  },
  legalText: {
    fontSize: 11,
    color: '#A09088',
    fontWeight: '600',
  },
  legalDot: {
    fontSize: 11,
    color: '#A09088',
  },
  authSection: {
    marginTop: 32,
    marginBottom: 20,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 40,
    marginBottom: 12,
  },
  divider: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    fontSize: 10,
    fontWeight: '800',
    marginHorizontal: 12,
    letterSpacing: 1,
  },
  reviewsWrapper: {
    marginTop: 32,
    marginBottom: 20,
    overflow: 'hidden',
  },
  reviewsTrack: {
    flexDirection: 'row',
    gap: 16,
    paddingHorizontal: 24,
  },
  reviewCard: {
    width: 280,
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 8,
    elevation: 2,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  stars: {
    flexDirection: 'row',
    gap: 2,
  },
  reviewName: {
    fontSize: 13,
    fontWeight: '800',
  },
  reviewText: {
    fontSize: 13,
    lineHeight: 18,
    fontStyle: 'italic',
  },
});
