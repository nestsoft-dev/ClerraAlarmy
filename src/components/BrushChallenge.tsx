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

interface BrushChallengeProps {
  difficulty: ChallengeDifficulty;
  onComplete: () => void;
  onFail: () => void;
}

const estimateBrightness = (base64: string): number => {
  const sample = base64.slice(0, 4000);
  let sum = 0;
  for (let i = 0; i < sample.length; i += 4) sum += sample.charCodeAt(i);
  return Math.min(255, ((sum / (sample.length / 4)) / 127) * 255);
};

export const BrushChallenge: React.FC<BrushChallengeProps> = ({ difficulty, onComplete, onFail }) => {
  const { colors, isDark } = useTheme();
  const styles = getStyles(colors, isDark);
  const [permission, requestPermission] = useCameraPermissions();
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
      
      const isMatch = await aiService.verifyObjectInImage(photo.base64, 'person brushing teeth with a toothbrush');
      if (isMatch) {
        Vibration.vibrate([0, 60, 40, 80]);
        setFeedback({ text: 'Verified!', ok: true });
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
        <ActivityIndicator color="#FF7F62" />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <View style={styles.permissionBlock}>
          <Ionicons name="camera" size={48} color="#FF7F62" />
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
        <Text style={styles.challengeTitle}>Brush Teeth</Text>
        <Text style={styles.challengeSubtitle}>Snap a photo of you brushing</Text>
      </Animated.View>

      {/* Live Viewfinder */}
      <Animated.View style={[styles.viewfinderWrapper, {
        opacity: viewfinderAnim,
        transform: [{ scale: viewfinderAnim.interpolate({ inputRange: [0, 1], outputRange: [0.94, 1] }) }]
      }]}>
        <CameraView style={styles.camera} ref={cameraRef} facing="front" />

        {/* Corner brackets */}
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
        <View style={styles.shutterContainer}>
          <TouchableOpacity style={styles.shutterBtn} onPress={handleCapture} activeOpacity={0.8} disabled={validating}>
            {validating ? (
              <ActivityIndicator color="#FF7F62" />
            ) : (
              <View style={styles.shutterInner} />
            )}
          </TouchableOpacity>
        </View>

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
    alignItems: 'center',
  },
  challengeTitle: {
    fontSize: 26,
    fontWeight: '900',
    color: colors.text,
    textAlign: 'center',
    lineHeight: 33,
    letterSpacing: -0.5,
  },
  challengeSubtitle: {
    fontSize: 16,
    color: colors.subtext,
    marginTop: 4,
    fontWeight: '600',
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
    backgroundColor: '#FF7F62',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FF7F62',
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
