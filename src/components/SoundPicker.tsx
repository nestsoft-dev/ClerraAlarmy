import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, Modal } from 'react-native';
import { Audio } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import { ALARM_SOUNDS, SOUND_ASSETS, SOUND_META, CATEGORIES } from '../constants/sounds';
import { useTheme } from '../context/ThemeContext';
import { Animated } from 'react-native';

interface SoundPickerProps {
  selectedId: string;
  onSelect: (id: string) => void;
}

/* ── Animated equalizer bars (Shared with Onboarding) ─────────────────── */
const EqBars: React.FC<{ color: string; playing: boolean }> = ({ color, playing }) => {
  const bars = [useRef(new Animated.Value(0.3)).current,
                useRef(new Animated.Value(0.6)).current,
                useRef(new Animated.Value(1.0)).current];

  React.useEffect(() => {
    if (playing) {
      const anims = bars.map((bar, i) =>
        Animated.loop(
          Animated.sequence([
            Animated.timing(bar, { toValue: 0.2 + Math.random() * 0.8, duration: 200 + i * 80, useNativeDriver: true }),
            Animated.timing(bar, { toValue: 0.4 + Math.random() * 0.6, duration: 200 + i * 80, useNativeDriver: true }),
          ])
        )
      );
      anims.forEach(a => a.start());
      return () => anims.forEach(a => a.stop());
    } else {
      bars.forEach(b => b.setValue(0.4));
    }
  }, [playing]);

  return (
    <View style={eqStyles.wrap}>
      {bars.map((bar, i) => (
        <Animated.View
          key={i}
          style={[eqStyles.bar, { backgroundColor: color, transform: [{ scaleY: bar }] }]}
        />
      ))}
    </View>
  );
};

const eqStyles = StyleSheet.create({
  wrap: { flexDirection: 'row', alignItems: 'center', gap: 3, height: 18 },
  bar:  { width: 3, height: 16, borderRadius: 2 },
});

export const SoundPicker: React.FC<SoundPickerProps> = ({ selectedId, onSelect }) => {
  const { colors, isDark } = useTheme();
  const styles = getStyles(colors, isDark);

  const [previewingId, setPreviewingId] = useState<string | null>(null);
  const soundRef = useRef<Audio.Sound | null>(null);

  const stopPreview = async () => {
    if (soundRef.current) {
      try {
        await soundRef.current.stopAsync();
        await soundRef.current.unloadAsync();
      } catch {}
      soundRef.current = null;
    }
    setPreviewingId(null);
  };

  const previewSound = async (id: string) => {
    if (previewingId === id) {
      await stopPreview();
      return;
    }
    await stopPreview();
    setPreviewingId(id);
    try {
      // Audio mode configured globally in App.tsx
      const asset = SOUND_ASSETS[id];
      if (!asset) return;
      const { sound } = await Audio.Sound.createAsync(asset, { volume: 0.8 });
      soundRef.current = sound;
      await sound.playAsync();
      setTimeout(async () => {
        if (soundRef.current) await stopPreview();
      }, 4000);
    } catch {
      setPreviewingId(null);
    }
  };

  const handleSelect = async (id: string) => {
    await stopPreview();
    onSelect(id);
  };

  const [isOpen, setIsOpen] = useState(false);
  const selectedSound = ALARM_SOUNDS.find(s => s.id === selectedId) || ALARM_SOUNDS[0];

  const groupedSounds = CATEGORIES.map(cat => ({
    category: cat,
    sounds: ALARM_SOUNDS.filter(s => SOUND_META[s.id]?.category === cat),
  }));

  return (
    <View>
      <Text style={styles.sectionTitle}>Alarm Sound</Text>
      <Text style={styles.sectionSub}>Choose the tone that wakes you up</Text>

      <TouchableOpacity
        style={styles.dropdownHeader}
        onPress={() => setIsOpen(!isOpen)}
        activeOpacity={0.75}
      >
        <View style={styles.dropdownHeaderLeft}>
          <Ionicons name="musical-notes" size={24} color="#FF7F62" />
          <View>
            <Text style={styles.dropdownHeaderLabel}>{selectedSound.name}</Text>
            <Text style={styles.dropdownHeaderDesc}>Tap to expand sound list</Text>
          </View>
        </View>
        <Ionicons name={isOpen ? 'chevron-up' : 'chevron-down'} size={24} color={colors.subtext} />
      </TouchableOpacity>

      <Modal
        visible={isOpen}
        animationType="slide"
        transparent={true}
        onRequestClose={() => {
          stopPreview();
          setIsOpen(false);
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHandle} />
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Choose Alarm Sound</Text>
              <TouchableOpacity
                onPress={() => {
                  stopPreview();
                  setIsOpen(false);
                }}
                style={styles.modalCloseBtn}
              >
                <Ionicons name="close" size={24} color={colors.subtext} />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalList} contentContainerStyle={styles.modalListContent} showsVerticalScrollIndicator={false}>
              {groupedSounds.map(({ category, sounds }) => (
                <View key={category} style={styles.section}>
                  <Text style={styles.categoryLabel}>{category}</Text>
                  {sounds.map(sound => {
                    const isSelected = sound.id === selectedId;
                    const isPreviewing = sound.id === previewingId;
                    const meta = SOUND_META[sound.id];

                    return (
                      <TouchableOpacity
                        key={sound.id}
                        style={[
                          styles.dropdownItem,
                          isSelected && styles.dropdownItemActive
                        ]}
                        onPress={() => previewSound(sound.id)}
                        activeOpacity={0.7}
                      >
                        {/* Emoji */}
                        <Text style={styles.emoji}>{meta?.emoji ?? '🔔'}</Text>

                        {/* Text */}
                        <View style={styles.rowText}>
                          <Text style={[styles.dropdownItemLabel, isSelected && styles.dropdownItemLabelActive]}>
                            {sound.name}
                          </Text>
                          <Text style={styles.dropdownItemDesc} numberOfLines={1}>
                            {meta?.desc ?? ''}
                          </Text>
                        </View>

                        {/* Right Indicator */}
                        <View style={styles.rowRight}>
                          {isPreviewing ? (
                            <EqBars color={colors.accent} playing />
                          ) : isSelected ? (
                            <Ionicons name="checkmark-circle" size={20} color={colors.accent} />
                          ) : (
                            <Ionicons name="play-circle-outline" size={20} color={colors.subtext} />
                          )}
                        </View>
                        
                        {/* Hidden Select Overlay (Tap name to select) */}
                        <TouchableOpacity
                          style={styles.selectOverlay}
                          onPress={() => {
                            handleSelect(sound.id);
                            setIsOpen(false);
                          }}
                        />
                      </TouchableOpacity>
                    );
                  })}
                </View>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const getStyles = (colors: any, isDark: boolean) => StyleSheet.create({
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 4,
  },
  sectionSub: {
    fontSize: 13,
    color: colors.subtext,
    marginBottom: 16,
  },
  dropdownHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: isDark ? colors.surface : '#FEF4EC',
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: isDark ? colors.border : '#F4E7DF',
  },
  dropdownHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  dropdownHeaderLabel: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.text,
  },
  dropdownHeaderDesc: {
    fontSize: 13,
    color: '#FF7F62',
    fontWeight: '600',
  },
  section: {
    marginBottom: 24,
  },
  categoryLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.subtext,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: 10,
    marginLeft: 4,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: 16,
    marginBottom: 6,
    gap: 12,
    position: 'relative',
  },
  dropdownItemActive: {
    backgroundColor: isDark ? 'rgba(255,127,98,0.12)' : '#FFF5F2',
  },
  emoji: {
    fontSize: 22,
    width: 32,
    textAlign: 'center',
  },
  rowText: {
    flex: 1,
  },
  dropdownItemLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 1,
  },
  dropdownItemLabelActive: {
    color: colors.accent,
  },
  dropdownItemDesc: {
    fontSize: 12,
    color: colors.subtext,
    fontWeight: '400',
  },
  rowRight: {
    width: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectOverlay: {
    position: 'absolute',
    top: 0,
    left: 44, // Don't cover emoji
    right: 44, // Don't cover play button
    bottom: 0,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingTop: 8,
    maxHeight: '85%',
  },
  modalHandle: {
    width: 38,
    height: 4,
    backgroundColor: isDark ? colors.border : 'rgba(46,30,26,0.15)',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: colors.text,
    letterSpacing: -0.5,
  },
  modalCloseBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: isDark ? colors.border : 'rgba(46,30,26,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalList: {
    paddingHorizontal: 16,
  },
  modalListContent: {
    paddingVertical: 12,
    paddingBottom: 60,
  },
});
