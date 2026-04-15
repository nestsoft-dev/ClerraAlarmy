import React, { useState, useRef, useMemo } from 'react';
import { View, Text, StyleSheet, Vibration, TouchableOpacity, ActivityIndicator } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { aiService } from '../services/aiService';

const COLORS = [
  { label: 'Red', hex: '#FF3B30' },
  { label: 'Blue', hex: '#007AFF' },
  { label: 'Green', hex: '#34C759' },
  { label: 'Yellow', hex: '#FFCC00' },
  { label: 'Orange', hex: '#FF9500' },
  { label: 'Purple', hex: '#AF52DE' },
];

interface ColorChallengeProps {
  onComplete: () => void;
  onFail: () => void;
}

export const ColorChallenge: React.FC<ColorChallengeProps> = ({ onComplete, onFail }) => {
  const { colors, isDark } = useTheme();
  const styles = getStyles(colors, isDark);
  const [permission, requestPermission] = useCameraPermissions();
  const [analyzing, setAnalyzing] = useState(false);
  const cameraRef = useRef<any>(null);

  // Pick a random color once when the component mounts
  const { label: targetColor, hex: targetHex } = useMemo(
    () => COLORS[Math.floor(Math.random() * COLORS.length)],
    []
  );

  const captureAndAnalyze = async () => {
    if (!cameraRef.current || analyzing) return;
    try {
      setAnalyzing(true);
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.1,
        base64: true,
      });

      if (!photo.base64) throw new Error('No image data');

      const isMatch = await aiService.verifyColorInImage(photo.base64, targetColor);

      if (isMatch) {
        Vibration.vibrate([0, 100, 50, 100]);
        setTimeout(() => onComplete(), 300);
      } else {
        Vibration.vibrate([0, 400]);
        onFail();
      }
    } catch (err) {
      console.log('AI Color failure:', err);
      Vibration.vibrate([0, 400]);
      onFail();
    } finally {
      setAnalyzing(false);
    }
  };

  if (!permission) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading…</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={[styles.topLabel, { color: 'rgba(46,30,26,0.35)' }]}>FIND COLOR</Text>
        <View style={styles.card}>
          <Ionicons name="camera" size={52} color="#FF7F62" style={styles.cardIcon} />
          <Text style={styles.cardTitle}>Camera Access Needed</Text>
          <Text style={styles.cardText}>Enable the camera to complete the Find Color challenge.</Text>
          <TouchableOpacity style={styles.primaryBtn} onPress={requestPermission}>
            <Text style={styles.primaryBtnText}>Enable Camera</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.wrapper}>
      <CameraView style={StyleSheet.absoluteFillObject} facing="back" ref={cameraRef} />

      <View style={styles.overlay}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerPill}>
            <Text style={styles.topLabel}>FIND COLOR</Text>
          </View>

          {/* Target color badge */}
          <View style={[styles.targetBadge, { backgroundColor: targetHex + '33', borderColor: targetHex + '88' }]}>
            <View style={[styles.colorDot, { backgroundColor: targetHex }]} />
            <Text style={[styles.targetLabel, { color: '#fff' }]}>Find something</Text>
            <Text style={[styles.targetColorName, { color: targetHex }]}>{targetColor}</Text>
          </View>
        </View>

        {/* Shutter */}
        <View style={styles.shutterArea}>
          <TouchableOpacity
            style={[styles.captureBtn, { borderColor: targetHex }, analyzing && styles.captureBtnDisabled]}
            onPress={captureAndAnalyze}
            disabled={analyzing}
          >
            {analyzing ? (
              <ActivityIndicator color={targetHex} size="large" />
            ) : (
              <View style={[styles.innerCircle, { backgroundColor: targetHex }]} />
            )}
          </TouchableOpacity>

          <View style={styles.hintPill}>
            <Text style={styles.hintText}>
              {analyzing ? 'Analyzing photo…' : 'Point camera and tap to verify'}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const getStyles = (colors: any, isDark: boolean) => StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: '#000' },
  overlay: {
    flex: 1,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 40,
    paddingBottom: 48,
    paddingHorizontal: 24,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingBottom: 20,
    backgroundColor: colors.background,
  },
  loadingText: { fontSize: 16, color: colors.subtext },

  header: { alignItems: 'center', width: '100%', gap: 16 },
  headerPill: {
    backgroundColor: 'rgba(0,0,0,0.55)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 24,
    alignItems: 'center',
  },
  topLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: 'rgba(255,255,255,0.9)',
    letterSpacing: 4,
  },
  targetBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 18,
    paddingVertical: 10,
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  colorDot: { width: 14, height: 14, borderRadius: 7 },
  targetLabel: { fontSize: 15, fontWeight: '600', color: 'rgba(255,255,255,0.75)' },
  targetColorName: { fontSize: 18, fontWeight: '900' },

  card: {
    backgroundColor: isDark ? colors.surface : 'rgba(46,30,26,0.04)',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: isDark ? colors.border : 'rgba(46,30,26,0.1)',
    padding: 28,
    alignItems: 'center',
    width: '100%',
    marginTop: 24,
  },
  cardIcon: { marginBottom: 14 },
  cardTitle: { fontSize: 22, fontWeight: '800', color: colors.text, marginBottom: 8, textAlign: 'center' },
  cardText: { fontSize: 15, color: colors.subtext, textAlign: 'center', lineHeight: 22, marginBottom: 24 },
  primaryBtn: {
    width: '100%',
    height: 52,
    backgroundColor: '#FF7F62',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },

  shutterArea: { alignItems: 'center', width: '100%' },
  captureBtn: {
    width: 84,
    height: 84,
    borderRadius: 42,
    borderWidth: 4,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.35)',
    marginBottom: 20,
  },
  captureBtnDisabled: { opacity: 0.5 },
  innerCircle: { width: 64, height: 64, borderRadius: 32 },
  hintPill: {
    backgroundColor: 'rgba(0,0,0,0.55)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  hintText: { fontSize: 14, color: '#FFFFFF', textAlign: 'center', fontWeight: '600' },
});
