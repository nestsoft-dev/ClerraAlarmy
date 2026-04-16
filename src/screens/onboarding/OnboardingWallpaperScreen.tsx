import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions, NativeSyntheticEvent, NativeScrollEvent } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { useTheme } from '../../context/ThemeContext';
import { ProgressBar } from '../../components/onboarding/ProgressBar';
import { useOnboarding } from '../../context/OnboardingContext';
import { BUILT_IN_BACKGROUNDS } from '../../constants/backgrounds';
import { VideoView, useVideoPlayer } from 'expo-video';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type Props = NativeStackScreenProps<RootStackParamList, 'OnboardingWallpaper'>;

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.42;
const CARD_HEIGHT = CARD_WIDTH * 1.75;

// ─── Managed Video Component ──────────────────────────────────────────────
const OnboardingVideo: React.FC<{ source: any; isSelected: boolean }> = ({ source, isSelected }) => {
  const player = useVideoPlayer(source, p => {
    p.loop = true;
    p.muted = true;
    p.play();
  });

  return (
    <VideoView
      player={player}
      style={[StyleSheet.absoluteFillObject, { transform: [{ scale: 1.15 }] }]}
      contentFit="cover"
      nativeControls={false}
    />
  );
};

export const OnboardingWallpaperScreen: React.FC<Props> = ({ navigation }) => {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const { state, updateState } = useOnboarding();
  const [selectedTab, setSelectedTab] = useState<'video' | 'color'>('video');
  const [activeIndex, setActiveIndex] = useState(0);

  const filteredBackgrounds = BUILT_IN_BACKGROUNDS.filter(bg => bg.type === selectedTab);

  const handleTabChange = (tab: 'video' | 'color') => {
    setSelectedTab(tab);
    setActiveIndex(0);
    // Use setTimeout to ensure the ScrollView has rendered before resetting scroll
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ x: 0, animated: false });
    }
  };

  const scrollRef = React.useRef<ScrollView>(null);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const slideSize = CARD_WIDTH + 16;
    const index = Math.round(event.nativeEvent.contentOffset.x / slideSize);
    setActiveIndex(index);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <ProgressBar progress={4 / 7} />

      <View style={styles.inner}>
        <Text style={[styles.title, { color: colors.text }]}>
          Choose your wake-up vibe
        </Text>
        <Text style={[styles.sub, { color: colors.subtext }]}>
          The first thing you see when the alarm goes off.
        </Text>
      </View>

      {/* Swipe Hint */}
      <View style={styles.swipeHintContainer}>
        <Text style={[styles.swipeHint, { color: colors.subtext }]}>
          Swipe for more <Ionicons name="arrow-forward" size={12} color={colors.subtext} />
        </Text>
      </View>

      {/* Tab Switcher */}
      <View style={styles.tabContainer}>
        <View style={[styles.tabBar, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)' }]}>
          <TouchableOpacity 
            style={[styles.tabItem, selectedTab === 'video' && { backgroundColor: isDark ? colors.surfaceHighlight : '#FFFFFF' }]}
            onPress={() => handleTabChange('video')}
          >
            <Text style={[styles.tabText, { color: selectedTab === 'video' ? colors.accent : colors.subtext }]}>Vibes</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tabItem, selectedTab === 'color' && { backgroundColor: isDark ? colors.surfaceHighlight : '#FFFFFF' }]}
            onPress={() => handleTabChange('color')}
          >
            <Text style={[styles.tabText, { color: selectedTab === 'color' ? colors.accent : colors.subtext }]}>Colors</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Carousel */}
      <View style={styles.carouselWrapper}>
        <ScrollView
          ref={scrollRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          snapToInterval={CARD_WIDTH + 16}
          decelerationRate="fast"
          pagingEnabled={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
        >
          {filteredBackgrounds.map(bg => {
            const isSelected = state.backgroundId === bg.id;
            return (
              <TouchableOpacity
                key={bg.id}
                onPress={() => updateState({ backgroundId: bg.id })}
                activeOpacity={0.85}
                style={[
                  styles.card,
                  { borderColor: isSelected ? colors.accent : 'transparent' },
                ]}
              >
                {bg.type === 'video' ? (
                  <OnboardingVideo source={bg.source} isSelected={isSelected} />
                ) : (
                  <View style={[styles.video, { backgroundColor: bg.color }]} />
                )}
                {/* Selected indicator */}
                {isSelected && (
                  <View style={[styles.selectedBadge, { backgroundColor: colors.accent }]}>
                    <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Pagination Dots */}
      <View style={styles.pagination}>
        {filteredBackgrounds.map((_, index) => (
          <View
            key={index}
            style={[
              styles.dot,
              { 
                backgroundColor: index === activeIndex ? colors.accent : (isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)'),
                width: index === activeIndex ? 20 : 8,
              }
            ]}
          />
        ))}
      </View>

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom + 16, 56) }]}>
        <TouchableOpacity
          style={[
            styles.button,
            { backgroundColor: state.backgroundId ? colors.accent : colors.surface }
          ]}
          onPress={() => navigation.navigate('OnboardingSound')}
          disabled={!state.backgroundId}
          activeOpacity={0.85}
        >
          <Text style={[styles.buttonText, { color: state.backgroundId ? '#FFFFFF' : colors.subtext }]}>Next</Text>
          <Ionicons name="arrow-forward" size={20} color={state.backgroundId ? '#FFFFFF' : colors.subtext} style={{ marginLeft: 8 }} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  inner: { paddingHorizontal: 24, paddingTop: 50, paddingBottom: 16 },
  title: { fontSize: 34, fontWeight: '800', lineHeight: 40, marginBottom: 10, letterSpacing: -0.8, textAlign: 'center' },
  sub: { fontSize: 15, fontWeight: '400', textAlign: 'center' },
  swipeHintContainer: { alignItems: 'center', marginBottom: 10 },
  swipeHint: { fontSize: 13, fontWeight: '600', letterSpacing: 0.5, textTransform: 'uppercase' },
  carouselWrapper: { flex: 1 },
  scrollContent: {
    paddingHorizontal: 24,
    gap: 16,
    alignItems: 'center',
  },
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 20,
    borderWidth: 3,
    overflow: 'hidden',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
  },
  video: { width: '100%', height: '100%' },
  cardOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingVertical: 10,
    paddingHorizontal: 10,
  },
  cardName: { color: '#FFFFFF', fontSize: 12, fontWeight: '700' },
  selectedBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    marginVertical: 20,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  footer: { paddingHorizontal: 24 },
  tabContainer: {
    paddingHorizontal: 24,
    marginBottom: 20,
    alignItems: 'center',
  },
  tabBar: {
    flexDirection: 'row',
    padding: 4,
    borderRadius: 12,
    width: '100%',
    maxWidth: 280,
  },
  tabItem: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.2,
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
