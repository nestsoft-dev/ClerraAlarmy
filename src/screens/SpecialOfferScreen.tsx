import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
  Platform,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useTheme } from '../context/ThemeContext';
import { useSettings } from '../context/SettingsContext';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type Props = NativeStackScreenProps<RootStackParamList, 'SpecialOffer'>;

const { width } = Dimensions.get('window');

export const SpecialOfferScreen: React.FC<Props> = ({ navigation }) => {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const { updateSettings } = useSettings();

  const handleClaim = async () => {
    await updateSettings({ isPremium: true });
    navigation.goBack();
  };

  return (
    <View style={[styles.container, { backgroundColor: '#FFFFFF' }]}>
      {/* Close Button */}
      <TouchableOpacity 
        style={[styles.closeBtn, { top: insets.top + 10 }]} 
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="close" size={28} color="#000000" />
      </TouchableOpacity>

      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.oneTimeOffer}>One-time Offer</Text>
          <Text style={styles.discountText}>
            76% OFF
          </Text>
          <Text style={styles.subtext}>
            This offer won't be there once{'\n'}you close it!
          </Text>
        </View>

        {/* Orange Speech Bubble Card */}
        <View style={styles.bubbleContainer}>
          <View style={styles.bubble}>
            <Text style={styles.bubblePrice}>
              Only <Text style={{ fontWeight: '900' }}>$0.69/week</Text>
            </Text>
            <Text style={styles.bubbleContext}>*Lowest price ever</Text>
          </View>
          <View style={styles.bubbleTriangle} />
        </View>

        {/* Center Image */}
        <View style={styles.imageContainer}>
          <Image
            source={require('../../assets/special_offer_gift.png')}
            style={styles.giftImage}
            resizeMode="contain"
          />
        </View>
      </View>

      {/* Footer Actions */}
      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom + 16, 40) }]}>
        <TouchableOpacity 
          style={styles.claimButton} 
          onPress={handleClaim}
          activeOpacity={0.9}
        >
          <Text style={styles.claimButtonText}>Claim Your One Time Offer</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.noThanks} 
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.noThanksText}>No Thanks</Text>
        </TouchableOpacity>

        <Text style={styles.billingNote}>billed yearly at $36.99 per year</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  closeBtn: {
    position: 'absolute',
    right: 24,
    zIndex: 10,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 80,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  oneTimeOffer: {
    fontSize: 24,
    fontWeight: '900',
    color: '#000000',
    marginBottom: 8,
  },
  discountText: {
    fontSize: 56,
    fontWeight: '900',
    color: '#000000',
    letterSpacing: -1.5,
    marginBottom: 10,
  },
  subtext: {
    fontSize: 18,
    textAlign: 'center',
    color: '#000000',
    fontWeight: '500',
    lineHeight: 24,
  },
  bubbleContainer: {
    alignItems: 'center',
    marginVertical: 10,
    zIndex: 2,
  },
  bubble: {
    backgroundColor: '#FF7F27', // Bright Orange
    paddingHorizontal: 30,
    paddingVertical: 18,
    borderRadius: 24,
    alignItems: 'center',
    shadowColor: '#FF7F27',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 8,
  },
  bubblePrice: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '600',
  },
  bubbleContext: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    marginTop: 4,
    opacity: 0.9,
  },
  bubbleTriangle: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 12,
    borderRightWidth: 12,
    borderTopWidth: 12,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#FF7F27',
    marginTop: -1,
  },
  imageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -20,
  },
  giftImage: {
    width: width * 0.75,
    height: width * 0.75,
  },
  footer: {
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  claimButton: {
    backgroundColor: '#000000',
    width: '100%',
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  claimButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
  },
  noThanks: {
    paddingVertical: 10,
  },
  noThanksText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000000',
    textDecorationLine: 'underline',
  },
  billingNote: {
    fontSize: 12,
    color: '#A0A0A0',
    marginTop: 12,
    fontWeight: '500',
  },
});
