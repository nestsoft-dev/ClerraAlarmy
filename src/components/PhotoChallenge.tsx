import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Vibration, ActivityIndicator, Animated, Dimensions,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { ChallengeDifficulty } from '../types';
import { useTheme } from '../context/ThemeContext';
import { aiService } from '../services/aiService';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const VIEWFINDER_SIZE = SCREEN_WIDTH - 64;

interface PhotoChallengeProps {
  difficulty: ChallengeDifficulty;
  onComplete: () => void;
  onFail: () => void;
}

const CHALLENGES = [
  { text: "Photo: Sofa", icon: 'home-outline' as const },
  { text: "Photo: Chair", icon: 'home-outline' as const },
  { text: "Photo: Table", icon: 'home-outline' as const },
  { text: "Photo: Television", icon: 'home-outline' as const },
  { text: "Photo: Remote control", icon: 'home-outline' as const },
  { text: "Photo: Fan", icon: 'home-outline' as const },
  { text: "Photo: Air conditioner", icon: 'home-outline' as const },
  { text: "Photo: Carpet", icon: 'home-outline' as const },
  { text: "Photo: Curtain", icon: 'home-outline' as const },
  { text: "Photo: Clock", icon: 'home-outline' as const },
  { text: "Photo: Lamp", icon: 'home-outline' as const },
  { text: "Photo: Shelf", icon: 'home-outline' as const },
  { text: "Photo: Cabinet", icon: 'home-outline' as const },
  { text: "Photo: Mirror", icon: 'home-outline' as const },
  { text: "Photo: Picture frame", icon: 'home-outline' as const },
  { text: "Photo: Vase", icon: 'home-outline' as const },
  { text: "Photo: Door", icon: 'home-outline' as const },
  { text: "Photo: Window", icon: 'home-outline' as const },
  { text: "Photo: Light bulb", icon: 'home-outline' as const },
  { text: "Photo: Switch", icon: 'home-outline' as const },
  { text: "Photo: Extension cord", icon: 'home-outline' as const },
  { text: "Photo: Charger", icon: 'home-outline' as const },
  { text: "Photo: Power bank", icon: 'home-outline' as const },
  { text: "Photo: Router", icon: 'home-outline' as const },
  { text: "Photo: Speaker", icon: 'home-outline' as const },
  { text: "Photo: Refrigerator", icon: 'restaurant-outline' as const },
  { text: "Photo: Freezer", icon: 'restaurant-outline' as const },
  { text: "Photo: Microwave", icon: 'restaurant-outline' as const },
  { text: "Photo: Oven", icon: 'restaurant-outline' as const },
  { text: "Photo: Stove", icon: 'restaurant-outline' as const },
  { text: "Photo: Kettle", icon: 'restaurant-outline' as const },
  { text: "Photo: Blender", icon: 'restaurant-outline' as const },
  { text: "Photo: Toaster", icon: 'restaurant-outline' as const },
  { text: "Photo: Pot", icon: 'restaurant-outline' as const },
  { text: "Photo: Frying pan", icon: 'restaurant-outline' as const },
  { text: "Photo: Plate", icon: 'restaurant-outline' as const },
  { text: "Photo: Bowl", icon: 'restaurant-outline' as const },
  { text: "Photo: Cup", icon: 'restaurant-outline' as const },
  { text: "Photo: Mug", icon: 'restaurant-outline' as const },
  { text: "Photo: Spoon", icon: 'restaurant-outline' as const },
  { text: "Photo: Fork", icon: 'restaurant-outline' as const },
  { text: "Photo: Knife", icon: 'restaurant-outline' as const },
  { text: "Photo: Cutting board", icon: 'restaurant-outline' as const },
  { text: "Photo: Bottle", icon: 'restaurant-outline' as const },
  { text: "Photo: Can opener", icon: 'restaurant-outline' as const },
  { text: "Photo: Dish rack", icon: 'restaurant-outline' as const },
  { text: "Photo: Sponge", icon: 'restaurant-outline' as const },
  { text: "Photo: Dish soap", icon: 'restaurant-outline' as const },
  { text: "Photo: Food container", icon: 'restaurant-outline' as const },
  { text: "Photo: Trash bin", icon: 'restaurant-outline' as const },
  { text: "Photo: Bed", icon: 'bed-outline' as const },
  { text: "Photo: Mattress", icon: 'bed-outline' as const },
  { text: "Photo: Pillow", icon: 'bed-outline' as const },
  { text: "Photo: Bedsheet", icon: 'bed-outline' as const },
  { text: "Photo: Blanket", icon: 'bed-outline' as const },
  { text: "Photo: Wardrobe", icon: 'bed-outline' as const },
  { text: "Photo: Hanger", icon: 'bed-outline' as const },
  { text: "Photo: Dresser", icon: 'bed-outline' as const },
  { text: "Photo: Nightstand", icon: 'bed-outline' as const },
  { text: "Photo: Alarm clock", icon: 'bed-outline' as const },
  { text: "Photo: Laundry basket", icon: 'bed-outline' as const },
  { text: "Photo: Iron", icon: 'bed-outline' as const },
  { text: "Photo: Ironing board", icon: 'bed-outline' as const },
  { text: "Photo: Backpack", icon: 'bed-outline' as const },
  { text: "Photo: Suitcase", icon: 'bed-outline' as const },
  { text: "Photo: Shoe rack", icon: 'bed-outline' as const },
  { text: "Photo: Slippers", icon: 'bed-outline' as const },
  { text: "Photo: Fan", icon: 'bed-outline' as const },
  { text: "Photo: Extension lamp", icon: 'bed-outline' as const },
  { text: "Photo: Phone", icon: 'bed-outline' as const },
  { text: "Photo: Toilet", icon: 'water-outline' as const },
  { text: "Photo: Sink", icon: 'water-outline' as const },
  { text: "Photo: Shower", icon: 'water-outline' as const },
  { text: "Photo: Bathtub", icon: 'water-outline' as const },
  { text: "Photo: Towel", icon: 'water-outline' as const },
  { text: "Photo: Toothbrush", icon: 'water-outline' as const },
  { text: "Photo: Toothpaste", icon: 'water-outline' as const },
  { text: "Photo: Soap", icon: 'water-outline' as const },
  { text: "Photo: Shampoo", icon: 'water-outline' as const },
  { text: "Photo: Conditioner", icon: 'water-outline' as const },
  { text: "Photo: Bucket", icon: 'water-outline' as const },
  { text: "Photo: Mop", icon: 'water-outline' as const },
  { text: "Photo: Toilet paper", icon: 'water-outline' as const },
  { text: "Photo: Mirror", icon: 'water-outline' as const },
  { text: "Photo: Razor", icon: 'water-outline' as const },
  { text: "Photo: Broom", icon: 'construct-outline' as const },
  { text: "Photo: Dustpan", icon: 'construct-outline' as const },
  { text: "Photo: Mop bucket", icon: 'construct-outline' as const },
  { text: "Photo: Vacuum cleaner", icon: 'construct-outline' as const },
  { text: "Photo: Cleaning cloth", icon: 'construct-outline' as const },
  { text: "Photo: Detergent", icon: 'construct-outline' as const },
  { text: "Photo: Bleach", icon: 'construct-outline' as const },
  { text: "Photo: Air freshener", icon: 'construct-outline' as const },
  { text: "Photo: Trash bag", icon: 'construct-outline' as const },
  { text: "Photo: Storage box", icon: 'construct-outline' as const },
  { text: "Photo: Toolbox", icon: 'construct-outline' as const },
  { text: "Photo: Hammer", icon: 'construct-outline' as const },
  { text: "Photo: Screwdriver", icon: 'construct-outline' as const },
  { text: "Photo: Nails", icon: 'construct-outline' as const },
  { text: "Photo: Tape", icon: 'construct-outline' as const },
];

const estimateBrightness = (base64: string): number => {
  const sample = base64.slice(0, 4000);
  let sum = 0;
  for (let i = 0; i < sample.length; i += 4) sum += sample.charCodeAt(i);
  return Math.min(255, ((sum / (sample.length / 4)) / 127) * 255);
};

export const PhotoChallenge: React.FC<PhotoChallengeProps> = ({ difficulty, onComplete, onFail }) => {
  const { colors, isDark } = useTheme();
  const styles = getStyles(colors, isDark);
  const [permission, requestPermission] = useCameraPermissions();
  const [challenge] = useState(() => CHALLENGES[Math.floor(Math.random() * CHALLENGES.length)]);
  const [validating, setValidating] = useState(false);
  const [feedback, setFeedback] = useState<{ text: string; ok: boolean } | null>(null);
  const cameraRef = useRef<CameraView>(null);

  const titleAnim = useRef(new Animated.Value(0)).current;
  const viewfinderAnim = useRef(new Animated.Value(0)).current;
  const buttonsAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.stagger(120, [
      Animated.spring(titleAnim, { toValue: 1, tension: 60, friction: 12, useNativeDriver: true }),
      Animated.spring(viewfinderAnim, { toValue: 1, tension: 55, friction: 12, useNativeDriver: true }),
      Animated.spring(buttonsAnim, { toValue: 1, tension: 55, friction: 12, useNativeDriver: true }),
    ]).start();

    // Subtle pulse on shutter ring
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.08, duration: 900, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 900, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const handleCapture = async () => {
    if (!cameraRef.current || validating) return;
    setValidating(true);
    setFeedback(null);
    try {
      const photo = await cameraRef.current.takePictureAsync({ base64: true, quality: 0.3 });
      if (!photo) {
        setFeedback({ text: 'Could not capture. Try again.', ok: false });
        setValidating(false);
        return;
      }
      const brightness = photo.base64 ? estimateBrightness(photo.base64) : 100;
      if (brightness < 35) {
        Vibration.vibrate(300);
        setFeedback({ text: 'Too dark — point at a lit area', ok: false });
        setValidating(false);
        setTimeout(() => setFeedback(null), 2000);
        return;
      }
      
      const isMatch = await aiService.verifyObjectInImage(photo.base64, challenge.text);
      if (isMatch) {
        Vibration.vibrate([0, 60, 40, 80]);
        setFeedback({ text: 'Done!', ok: true });
        setTimeout(() => onComplete(), 700);
      } else {
        Vibration.vibrate(400);
        setFeedback({ text: `Doesn't match. Try again.`, ok: false });
        setValidating(false);
        setTimeout(() => setFeedback(null), 2500);
      }
    } catch {
      setFeedback({ text: 'Error. Try again.', ok: false });
      setValidating(false);
      setTimeout(() => setFeedback(null), 2500);
    }
  };

  // No permission state
  if (!permission) {
    return (
      <View style={styles.container}>
        <ActivityIndicator color={colors.accent} />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <View style={styles.permissionBlock}>
          <Ionicons name="camera" size={48} color={colors.accent} />
          <Text style={styles.permissionTitle}>Camera Access Needed</Text>
          <TouchableOpacity style={styles.primaryBtn} onPress={requestPermission} activeOpacity={0.8}>
            <Text style={styles.primaryBtnText}>Allow Camera</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.skipBtn} onPress={onFail}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>

      {/* Challenge Title */}
      <Animated.View style={[styles.titleBlock, {
        opacity: titleAnim,
        transform: [{ translateY: titleAnim.interpolate({ inputRange: [0, 1], outputRange: [-16, 0] }) }]
      }]}>
        <Text style={styles.challengeTitle}>{challenge.text}</Text>
      </Animated.View>

      {/* Live Viewfinder */}
      <Animated.View style={[styles.viewfinderWrapper, {
        opacity: viewfinderAnim,
        transform: [{ scale: viewfinderAnim.interpolate({ inputRange: [0, 1], outputRange: [0.94, 1] }) }]
      }]}>
        <CameraView style={styles.camera} ref={cameraRef} />

        <View style={[styles.corner, styles.cornerTL]} />
        <View style={[styles.corner, styles.cornerTR]} />
        <View style={[styles.corner, styles.cornerBL]} />
        <View style={[styles.corner, styles.cornerBR]} />

        {/* Feedback overlay */}
        {feedback && (
          <View style={[styles.feedbackOverlay, feedback.ok ? styles.feedbackOk : styles.feedbackErr]}>
            <Ionicons name={feedback.ok ? 'checkmark-circle' : 'alert-circle'} size={32} color="#FFF" />
            <Text style={styles.feedbackText}>{feedback.text}</Text>
          </View>
        )}

        {/* Shutter Button underneath the camera but inside viewfinder */}
        <Animated.View style={[styles.shutterContainer, {
          opacity: buttonsAnim,
          transform: [{ translateY: buttonsAnim.interpolate({ inputRange: [0, 1], outputRange: [16, 0] }) }]
        }]}>
          <TouchableOpacity style={styles.shutterBtn} onPress={handleCapture} activeOpacity={0.8} disabled={validating}>
            {validating ? (
              <ActivityIndicator color={colors.accent} />
            ) : (
              <View style={styles.shutterInner} />
            )}
          </TouchableOpacity>
        </Animated.View>

      </Animated.View>

    </View>
  );
};

const getStyles = (colors: any, isDark: boolean) => StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    backgroundColor: colors.background,
  },

  // Permission
  permissionBlock: {
    alignItems: 'center',
    gap: 20,
    marginBottom: 32,
  },
  permissionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.text,
    textAlign: 'center',
  },

  // Title
  titleBlock: {
    marginBottom: 28,
    paddingHorizontal: 8,
  },
  challengeTitle: {
    fontSize: 26,
    fontWeight: '900',
    color: colors.text,
    textAlign: 'center',
    lineHeight: 33,
    letterSpacing: -0.5,
  },

  // Viewfinder
  viewfinderWrapper: {
    width: VIEWFINDER_SIZE,
    height: VIEWFINDER_SIZE * 1.35,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: isDark ? '#1A1A1A' : '#E8D8CC',
    marginBottom: 32,
    position: 'relative',
  },
  camera: {
    flex: 1,
  },
  // Corner brackets
  corner: {
    position: 'absolute',
    width: 26,
    height: 26,
    borderColor: isDark ? colors.accent : '#2E1E1A',
    borderWidth: 0,
  },
  cornerTL: {
    top: 12, left: 12,
    borderTopWidth: 2.5, borderLeftWidth: 2.5,
    borderTopLeftRadius: 6,
  },
  cornerTR: {
    top: 12, right: 12,
    borderTopWidth: 2.5, borderRightWidth: 2.5,
    borderTopRightRadius: 6,
  },
  cornerBL: {
    bottom: 12, left: 12,
    borderBottomWidth: 2.5, borderLeftWidth: 2.5,
    borderBottomLeftRadius: 6,
  },
  cornerBR: {
    bottom: 12, right: 12,
    borderBottomWidth: 2.5, borderRightWidth: 2.5,
    borderBottomRightRadius: 6,
  },

  // Feedback overlay
  feedbackOverlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
  },
  feedbackOk: { backgroundColor: 'rgba(52,199,89,0.75)' },
  feedbackErr: { backgroundColor: 'rgba(255,59,48,0.65)' },
  feedbackText: {
    fontSize: 17,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  // Shutter
  shutterContainer: {
    position: 'absolute',
    bottom: 24,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  shutterBtn: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  shutterInner: {
    width: 54,
    height: 54,
    borderRadius: 27,
    borderWidth: 2,
    borderColor: isDark ? '#1A1A1A' : '#2E1E1A',
    backgroundColor: '#FFFFFF',
  },
  primaryBtn: {
    width: '100%',
    height: 58,
    backgroundColor: colors.accent,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.45,
    shadowRadius: 18,
    elevation: 10,
  },
  primaryBtnText: {
    fontSize: 17,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
  skipBtn: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  skipText: {
    color: isDark ? colors.subtext : 'rgba(46,30,26,0.3)',
    fontSize: 15,
    fontWeight: '600',
  },
});