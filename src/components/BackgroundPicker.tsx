<<<<<<< HEAD
import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Modal, ScrollView, Alert, Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { VideoView, useVideoPlayer } from 'expo-video';
import { BUILT_IN_BACKGROUNDS, AlarmBackground } from '../constants/backgrounds';
import { useTheme } from '../context/ThemeContext';

const MAX_VIDEO_MB = 50;
const MAX_VIDEO_BYTES = MAX_VIDEO_MB * 1024 * 1024;

const { width } = Dimensions.get('window');
const TILE_WIDTH = (width - 40 - 14) / 2;
const TILE_HEIGHT = TILE_WIDTH / 0.6;

interface BackgroundPickerProps {
  selectedId?: string;
  selectedUri?: string;
  onChange: (id?: string, uri?: string) => void;
}

// Mini preview tile with looping muted video
const VideoTile: React.FC<{ bg: AlarmBackground; isSelected: boolean; onPress: () => void }> = ({
  bg, isSelected, onPress,
}) => {
  // Enable playback for all tiles to create a dynamic, "alive" grid experience
  const player = useVideoPlayer(bg.source, p => {
    p.loop = true;
    p.muted = true;
    p.play();
  });

  return (
    <TouchableOpacity
      style={[styles.gridTile, isSelected && styles.gridTileActive]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <VideoView
        player={player}
        style={[StyleSheet.absoluteFillObject, { transform: [{ scale: 1.15 }] }]}
        contentFit="cover"
        nativeControls={false}
      />
      {isSelected && (
        <View style={styles.checkBadge}>
          <Ionicons name="checkmark" size={14} color="#FFF" />
        </View>
      )}
    </TouchableOpacity>
  );
};

// Mini preview tile with solid color
const ColorTile: React.FC<{ bg: AlarmBackground; isSelected: boolean; onPress: () => void }> = ({
  bg, isSelected, onPress,
}) => {
  return (
    <TouchableOpacity
      style={[styles.gridTile, { backgroundColor: bg.color }, isSelected && styles.gridTileActive]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {isSelected && (
        <View style={styles.checkBadge}>
          <Ionicons name="checkmark" size={14} color="#FFF" />
        </View>
      )}
    </TouchableOpacity>
  );
};

// Mini preview tile for "None/Default"
const DefaultTile: React.FC<{ isSelected: boolean; onPress: () => void; isDark: boolean; colors: any }> = ({
  isSelected, onPress, isDark, colors
}) => {
  return (
    <TouchableOpacity
      style={[styles.gridTile, { backgroundColor: isDark ? colors.surface : '#F4E7DF' }, isSelected && styles.gridTileActive]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 6 }}>
        <Ionicons name="ban-outline" size={28} color={isSelected ? '#FF7F62' : colors.subtext} />
        <Text style={{ color: isSelected ? '#FF7F62' : colors.subtext, fontSize: 11, fontWeight: '900', letterSpacing: 0.5 }}>
          DEFAULT
        </Text>
      </View>
      {isSelected && (
        <View style={styles.checkBadge}>
          <Ionicons name="checkmark" size={14} color="#FFF" />
        </View>
      )}
    </TouchableOpacity>
  );
};

// Header preview (collapsed state)
const HeaderPreview: React.FC<{ bg: AlarmBackground }> = ({ bg }) => {
  if (bg.type === 'color') {
    return (
      <View style={[styles.previewThumb, { backgroundColor: bg.color }]} />
    );
  }

  // Ensure this player is managed and played
  const player = useVideoPlayer(bg.source, p => {
    p.loop = true;
    p.muted = true;
    p.play();
  });

  return (
    <VideoView
      player={player}
      style={styles.previewThumb}
      contentFit="cover"
      nativeControls={false}
    />
  );
};

export const BackgroundPicker: React.FC<BackgroundPickerProps> = ({
  selectedId, selectedUri, onChange,
}) => {
  const { colors, isDark } = useTheme();
  const pickerStyles = getStyles(colors, isDark);

  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'video' | 'color'>('video');

  const selectedBuiltIn = BUILT_IN_BACKGROUNDS.find(b => b.id === selectedId);

  let currentLabel = 'Default Wallpaper';
  if (selectedUri) {
    currentLabel = 'Custom Video';
  } else if (selectedBuiltIn) {
    currentLabel = selectedBuiltIn.name;
  }

  const handlePickVideo = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'We need media library access to upload a video.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'videos',
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const uri = result.assets[0].uri;
      try {
        const info = await FileSystem.getInfoAsync(uri, { size: true });
        if (info.exists && (info as any).size > MAX_VIDEO_BYTES) {
          const sizeMB = (((info as any).size) / (1024 * 1024)).toFixed(1);
          Alert.alert(
            'Video too large',
            `Your video is ${sizeMB}MB. Please choose one under ${MAX_VIDEO_MB}MB for best performance.`,
            [{ text: 'OK' }]
          );
          return;
        }
      } catch {}
      onChange(undefined, uri);
      setIsOpen(false);
    }
  };

  const handleSelectBuiltIn = (id: string) => {
    onChange(id, undefined);
    setIsOpen(false);
  };

  const handleClear = () => {
    onChange(undefined, undefined);
    setIsOpen(false);
  };

  return (
    <View style={pickerStyles.container}>
      <Text style={pickerStyles.sectionTitle}>Screen Wallpaper</Text>
      <Text style={pickerStyles.sectionSub}>Choose a cinematic video or a calming natural color</Text>

      <TouchableOpacity
        style={pickerStyles.dropdownHeader}
        onPress={() => setIsOpen(true)}
        activeOpacity={0.75}
      >
        <View style={pickerStyles.dropdownHeaderLeft}>
          {selectedBuiltIn && !selectedUri ? (
            <HeaderPreview bg={selectedBuiltIn} />
          ) : (
            <View style={pickerStyles.previewThumbEmpty}>
              <Ionicons name="videocam-outline" size={22} color="#FF7F62" />
            </View>
          )}
          <View>
            <Text style={pickerStyles.dropdownHeaderLabel}>{currentLabel}</Text>
            <Text style={pickerStyles.dropdownHeaderDesc}>
              {selectedUri ? 'Custom video selected' : selectedBuiltIn ? 'Built-in wallpaper' : 'Tap to pick a wallpaper'}
            </Text>
          </View>
        </View>
        <Ionicons name="chevron-down" size={24} color={colors.subtext} />
      </TouchableOpacity>

      <Modal
        visible={isOpen}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsOpen(false)}
      >
        <View style={pickerStyles.modalOverlay}>
          <View style={pickerStyles.modalContent}>
            <View style={pickerStyles.modalHandle} />
            <View style={pickerStyles.modalHeader}>
              <Text style={pickerStyles.modalTitle}>Choose Wallpaper</Text>
              <TouchableOpacity onPress={() => setIsOpen(false)} style={pickerStyles.modalCloseBtn}>
                <Ionicons name="close" size={24} color={colors.subtext} />
              </TouchableOpacity>
            </View>

            {/* Category Tabs */}
            <View style={pickerStyles.tabBar}>
              <TouchableOpacity
                style={[pickerStyles.tab, activeTab === 'video' && pickerStyles.activeTab]}
                onPress={() => setActiveTab('video')}
              >
                <Ionicons name="videocam" size={18} color={activeTab === 'video' ? '#FFF' : colors.subtext} />
                <Text style={[pickerStyles.tabText, activeTab === 'video' && pickerStyles.activeTabText]}>
                  Cinematic
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[pickerStyles.tab, activeTab === 'color' && pickerStyles.activeTab]}
                onPress={() => setActiveTab('color')}
              >
                <Ionicons name="color-palette" size={18} color={activeTab === 'color' ? '#FFF' : colors.subtext} />
                <Text style={[pickerStyles.tabText, activeTab === 'color' && pickerStyles.activeTabText]}>
                  Natural
                </Text>
              </TouchableOpacity>
            </View>

            <ScrollView
              style={pickerStyles.modalScroll}
              contentContainerStyle={pickerStyles.modalScrollContent}
              showsVerticalScrollIndicator={false}
            >
              {/* Action row */}
              {activeTab === 'video' && (
                <>
                  <View style={pickerStyles.actionRow}>
                    <TouchableOpacity 
                      style={[
                        pickerStyles.actionBtn, 
                        selectedUri && { paddingRight: 8 } // More space for trash icon
                      ]} 
                      onPress={handlePickVideo}
                      activeOpacity={0.8}
                    >
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1, justifyContent: 'center' }}>
                        <Ionicons name="cloud-upload" size={20} color="#FFFFFF" />
                        <Text style={pickerStyles.actionBtnText}>
                          {selectedUri ? 'Replace Video' : 'Upload Video'}
                        </Text>
                      </View>
                      
                      {selectedUri && (
                        <TouchableOpacity 
                          style={pickerStyles.inlineClearBtn} 
                          onPress={(e) => {
                            e.stopPropagation(); // Don't trigger picker
                            handleClear();
                          }}
                        >
                          <Ionicons name="trash" size={18} color="#FF7F62" />
                        </TouchableOpacity>
                      )}
                    </TouchableOpacity>
                  </View>
                  <Text style={pickerStyles.uploadHint}>Max {MAX_VIDEO_MB}MB · MP4 recommended · Short loops work best</Text>
                </>
              )}

              {/* Grid */}
              <View style={pickerStyles.gridContainer}>
                {/* Always show Default/None tile first */}
                <DefaultTile 
                  colors={colors}
                  isDark={isDark}
                  isSelected={!selectedId && !selectedUri}
                  onPress={handleClear}
                />

                {BUILT_IN_BACKGROUNDS.filter(bg => bg.type === activeTab).map(bg => {
                  if (bg.type === 'color') {
                    return (
                      <ColorTile
                        key={bg.id}
                        bg={bg}
                        isSelected={selectedId === bg.id}
                        onPress={() => handleSelectBuiltIn(bg.id)}
                      />
                    );
                  }
                  return (
                    <VideoTile
                      key={bg.id}
                      bg={bg}
                      isSelected={selectedId === bg.id}
                      onPress={() => handleSelectBuiltIn(bg.id)}
                    />
                  );
                })}
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

// Static styles (not theme-dependent) — only used by VideoTile/HeaderPreview which are plain components
const styles = StyleSheet.create({
  previewThumb: {
    width: 44,
    height: 44,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#2E1E1A',
  },
  gridTile: {
    width: TILE_WIDTH,
    height: TILE_HEIGHT,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#2E1E1A',
    borderWidth: 3,
    borderColor: 'transparent',
  },
  gridTileActive: {
    borderColor: '#FF7F62',
  },
  checkBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FF7F62',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFF',
  },
});

const getStyles = (colors: any, isDark: boolean) => StyleSheet.create({
  container: {
    marginBottom: 4,
  },
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
  previewThumbEmpty: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: isDark ? 'rgba(255,127,98,0.15)' : '#FFE5DD',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dropdownHeaderLabel: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.text,
  },
  dropdownHeaderDesc: {
    fontSize: 12,
    color: '#FF7F62',
    fontWeight: '600',
    marginTop: 2,
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
  modalCloseBtn: { padding: 4 },
  modalScroll: { paddingHorizontal: 20 },
  modalScrollContent: {
    paddingVertical: 20,
    paddingBottom: 60,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between', // Changed for inline clear
    backgroundColor: '#FF7F62',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  inlineClearBtn: {
    backgroundColor: '#FFFFFF',
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionBtnText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '700',
  },
  gridSectionLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.subtext,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 14,
  },
  uploadHint: {
    fontSize: 12,
    color: colors.subtext,
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 20,
    marginTop: -8,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
  },
  // Tabs styling
  tabBar: {
    flexDirection: 'row',
    marginHorizontal: 20,
    backgroundColor: isDark ? colors.surface : '#F4E7DF',
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    gap: 8,
  },
  activeTab: {
    backgroundColor: '#FF7F62',
    shadowColor: '#FF7F62',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.subtext,
  },
  activeTabText: {
    color: '#FFF',
  },
});
=======
import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Modal, ScrollView, Alert, Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { VideoView, useVideoPlayer } from 'expo-video';
import { BUILT_IN_BACKGROUNDS, AlarmBackground } from '../constants/backgrounds';
import { useTheme } from '../context/ThemeContext';

const MAX_VIDEO_MB = 50;
const MAX_VIDEO_BYTES = MAX_VIDEO_MB * 1024 * 1024;

const { width } = Dimensions.get('window');
const TILE_WIDTH = (width - 40 - 14) / 2;
const TILE_HEIGHT = TILE_WIDTH / 0.6;

interface BackgroundPickerProps {
  selectedId?: string;
  selectedUri?: string;
  onChange: (id?: string, uri?: string) => void;
}

// Mini preview tile with looping muted video
const VideoTile: React.FC<{ bg: AlarmBackground; isSelected: boolean; onPress: () => void }> = ({
  bg, isSelected, onPress,
}) => {
  // Enable playback for all tiles to create a dynamic, "alive" grid experience
  const player = useVideoPlayer(bg.source, p => {
    p.loop = true;
    p.muted = true;
    p.play();
  });

  return (
    <TouchableOpacity
      style={[styles.gridTile, isSelected && styles.gridTileActive]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <VideoView
        player={player}
        style={[StyleSheet.absoluteFillObject, { transform: [{ scale: 1.15 }] }]}
        contentFit="cover"
        nativeControls={false}
      />
      {isSelected && (
        <View style={styles.checkBadge}>
          <Ionicons name="checkmark" size={14} color="#FFF" />
        </View>
      )}
    </TouchableOpacity>
  );
};

// Mini preview tile with solid color
const ColorTile: React.FC<{ bg: AlarmBackground; isSelected: boolean; onPress: () => void }> = ({
  bg, isSelected, onPress,
}) => {
  return (
    <TouchableOpacity
      style={[styles.gridTile, { backgroundColor: bg.color }, isSelected && styles.gridTileActive]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {isSelected && (
        <View style={styles.checkBadge}>
          <Ionicons name="checkmark" size={14} color="#FFF" />
        </View>
      )}
    </TouchableOpacity>
  );
};

// Mini preview tile for "None/Default"
const DefaultTile: React.FC<{ isSelected: boolean; onPress: () => void; isDark: boolean; colors: any }> = ({
  isSelected, onPress, isDark, colors
}) => {
  return (
    <TouchableOpacity
      style={[styles.gridTile, { backgroundColor: isDark ? colors.surface : '#F4E7DF' }, isSelected && styles.gridTileActive]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 6 }}>
        <Ionicons name="ban-outline" size={28} color={isSelected ? '#FF7F62' : colors.subtext} />
        <Text style={{ color: isSelected ? '#FF7F62' : colors.subtext, fontSize: 11, fontWeight: '900', letterSpacing: 0.5 }}>
          DEFAULT
        </Text>
      </View>
      {isSelected && (
        <View style={styles.checkBadge}>
          <Ionicons name="checkmark" size={14} color="#FFF" />
        </View>
      )}
    </TouchableOpacity>
  );
};

// Header preview (collapsed state)
const HeaderPreview: React.FC<{ bg: AlarmBackground }> = ({ bg }) => {
  if (bg.type === 'color') {
    return (
      <View style={[styles.previewThumb, { backgroundColor: bg.color }]} />
    );
  }

  // Ensure this player is managed and played
  const player = useVideoPlayer(bg.source, p => {
    p.loop = true;
    p.muted = true;
    p.play();
  });

  return (
    <VideoView
      player={player}
      style={styles.previewThumb}
      contentFit="cover"
      nativeControls={false}
    />
  );
};

export const BackgroundPicker: React.FC<BackgroundPickerProps> = ({
  selectedId, selectedUri, onChange,
}) => {
  const { colors, isDark } = useTheme();
  const pickerStyles = getStyles(colors, isDark);

  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'video' | 'color'>('video');

  const selectedBuiltIn = BUILT_IN_BACKGROUNDS.find(b => b.id === selectedId);

  let currentLabel = 'Default Wallpaper';
  if (selectedUri) {
    currentLabel = 'Custom Video';
  } else if (selectedBuiltIn) {
    currentLabel = selectedBuiltIn.name;
  }

  const handlePickVideo = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'We need media library access to upload a video.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'videos',
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const uri = result.assets[0].uri;
      try {
        const info = await FileSystem.getInfoAsync(uri, { size: true });
        if (info.exists && (info as any).size > MAX_VIDEO_BYTES) {
          const sizeMB = (((info as any).size) / (1024 * 1024)).toFixed(1);
          Alert.alert(
            'Video too large',
            `Your video is ${sizeMB}MB. Please choose one under ${MAX_VIDEO_MB}MB for best performance.`,
            [{ text: 'OK' }]
          );
          return;
        }
      } catch {}
      onChange(undefined, uri);
      setIsOpen(false);
    }
  };

  const handleSelectBuiltIn = (id: string) => {
    onChange(id, undefined);
    setIsOpen(false);
  };

  const handleClear = () => {
    onChange(undefined, undefined);
    setIsOpen(false);
  };

  return (
    <View style={pickerStyles.container}>
      <Text style={pickerStyles.sectionTitle}>Screen Wallpaper</Text>
      <Text style={pickerStyles.sectionSub}>Choose a cinematic video or a calming natural color</Text>

      <TouchableOpacity
        style={pickerStyles.dropdownHeader}
        onPress={() => setIsOpen(true)}
        activeOpacity={0.75}
      >
        <View style={pickerStyles.dropdownHeaderLeft}>
          {selectedBuiltIn && !selectedUri ? (
            <HeaderPreview bg={selectedBuiltIn} />
          ) : (
            <View style={pickerStyles.previewThumbEmpty}>
              <Ionicons name="videocam-outline" size={22} color="#FF7F62" />
            </View>
          )}
          <View>
            <Text style={pickerStyles.dropdownHeaderLabel}>{currentLabel}</Text>
            <Text style={pickerStyles.dropdownHeaderDesc}>
              {selectedUri ? 'Custom video selected' : selectedBuiltIn ? 'Built-in wallpaper' : 'Tap to pick a wallpaper'}
            </Text>
          </View>
        </View>
        <Ionicons name="chevron-down" size={24} color={colors.subtext} />
      </TouchableOpacity>

      <Modal
        visible={isOpen}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsOpen(false)}
      >
        <View style={pickerStyles.modalOverlay}>
          <View style={pickerStyles.modalContent}>
            <View style={pickerStyles.modalHandle} />
            <View style={pickerStyles.modalHeader}>
              <Text style={pickerStyles.modalTitle}>Choose Wallpaper</Text>
              <TouchableOpacity onPress={() => setIsOpen(false)} style={pickerStyles.modalCloseBtn}>
                <Ionicons name="close" size={24} color={colors.subtext} />
              </TouchableOpacity>
            </View>

            {/* Category Tabs */}
            <View style={pickerStyles.tabBar}>
              <TouchableOpacity
                style={[pickerStyles.tab, activeTab === 'video' && pickerStyles.activeTab]}
                onPress={() => setActiveTab('video')}
              >
                <Ionicons name="videocam" size={18} color={activeTab === 'video' ? '#FFF' : colors.subtext} />
                <Text style={[pickerStyles.tabText, activeTab === 'video' && pickerStyles.activeTabText]}>
                  Cinematic
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[pickerStyles.tab, activeTab === 'color' && pickerStyles.activeTab]}
                onPress={() => setActiveTab('color')}
              >
                <Ionicons name="color-palette" size={18} color={activeTab === 'color' ? '#FFF' : colors.subtext} />
                <Text style={[pickerStyles.tabText, activeTab === 'color' && pickerStyles.activeTabText]}>
                  Natural
                </Text>
              </TouchableOpacity>
            </View>

            <ScrollView
              style={pickerStyles.modalScroll}
              contentContainerStyle={pickerStyles.modalScrollContent}
              showsVerticalScrollIndicator={false}
            >
              {/* Action row */}
              {activeTab === 'video' && (
                <>
                  <View style={pickerStyles.actionRow}>
                    <TouchableOpacity 
                      style={[
                        pickerStyles.actionBtn, 
                        selectedUri && { paddingRight: 8 } // More space for trash icon
                      ]} 
                      onPress={handlePickVideo}
                      activeOpacity={0.8}
                    >
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1, justifyContent: 'center' }}>
                        <Ionicons name="cloud-upload" size={20} color="#FFFFFF" />
                        <Text style={pickerStyles.actionBtnText}>
                          {selectedUri ? 'Replace Video' : 'Upload Video'}
                        </Text>
                      </View>
                      
                      {selectedUri && (
                        <TouchableOpacity 
                          style={pickerStyles.inlineClearBtn} 
                          onPress={(e) => {
                            e.stopPropagation(); // Don't trigger picker
                            handleClear();
                          }}
                        >
                          <Ionicons name="trash" size={18} color="#FF7F62" />
                        </TouchableOpacity>
                      )}
                    </TouchableOpacity>
                  </View>
                  <Text style={pickerStyles.uploadHint}>Max {MAX_VIDEO_MB}MB · MP4 recommended · Short loops work best</Text>
                </>
              )}

              {/* Grid */}
              <View style={pickerStyles.gridContainer}>
                {/* Always show Default/None tile first */}
                <DefaultTile 
                  colors={colors}
                  isDark={isDark}
                  isSelected={!selectedId && !selectedUri}
                  onPress={handleClear}
                />

                {BUILT_IN_BACKGROUNDS.filter(bg => bg.type === activeTab).map(bg => {
                  if (bg.type === 'color') {
                    return (
                      <ColorTile
                        key={bg.id}
                        bg={bg}
                        isSelected={selectedId === bg.id}
                        onPress={() => handleSelectBuiltIn(bg.id)}
                      />
                    );
                  }
                  return (
                    <VideoTile
                      key={bg.id}
                      bg={bg}
                      isSelected={selectedId === bg.id}
                      onPress={() => handleSelectBuiltIn(bg.id)}
                    />
                  );
                })}
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

// Static styles (not theme-dependent) — only used by VideoTile/HeaderPreview which are plain components
const styles = StyleSheet.create({
  previewThumb: {
    width: 44,
    height: 44,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#2E1E1A',
  },
  gridTile: {
    width: TILE_WIDTH,
    height: TILE_HEIGHT,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#2E1E1A',
    borderWidth: 3,
    borderColor: 'transparent',
  },
  gridTileActive: {
    borderColor: '#FF7F62',
  },
  checkBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FF7F62',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFF',
  },
});

const getStyles = (colors: any, isDark: boolean) => StyleSheet.create({
  container: {
    marginBottom: 4,
  },
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
  previewThumbEmpty: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: isDark ? 'rgba(255,127,98,0.15)' : '#FFE5DD',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dropdownHeaderLabel: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.text,
  },
  dropdownHeaderDesc: {
    fontSize: 12,
    color: '#FF7F62',
    fontWeight: '600',
    marginTop: 2,
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
  modalCloseBtn: { padding: 4 },
  modalScroll: { paddingHorizontal: 20 },
  modalScrollContent: {
    paddingVertical: 20,
    paddingBottom: 60,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between', // Changed for inline clear
    backgroundColor: '#FF7F62',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  inlineClearBtn: {
    backgroundColor: '#FFFFFF',
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionBtnText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '700',
  },
  gridSectionLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.subtext,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 14,
  },
  uploadHint: {
    fontSize: 12,
    color: colors.subtext,
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 20,
    marginTop: -8,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
  },
  // Tabs styling
  tabBar: {
    flexDirection: 'row',
    marginHorizontal: 20,
    backgroundColor: isDark ? colors.surface : '#F4E7DF',
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    gap: 8,
  },
  activeTab: {
    backgroundColor: '#FF7F62',
    shadowColor: '#FF7F62',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.subtext,
  },
  activeTabText: {
    color: '#FFF',
  },
});
>>>>>>> origin/main
