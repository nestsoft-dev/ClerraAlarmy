export interface AlarmBackground {
  id: string;
  name: string;
  type: 'video' | 'color';
  source?: any;     // require() result (for video)
  thumbnail?: any;  // used for video thumbnail
  color?: string;   // hex code (for color type)
}

export const BUILT_IN_BACKGROUNDS: AlarmBackground[] = [
  // Videos
  { id: 'wp_1',  name: 'Vibe 1',  type: 'video', source: require('../../assets/Wallpaper/1.mp4'),  thumbnail: require('../../assets/Wallpaper/1.mp4') },
  { id: 'wp_2',  name: 'Vibe 2',  type: 'video', source: require('../../assets/Wallpaper/2.mp4'),  thumbnail: require('../../assets/Wallpaper/2.mp4') },
  { id: 'wp_3',  name: 'Vibe 3',  type: 'video', source: require('../../assets/Wallpaper/3.mp4'),  thumbnail: require('../../assets/Wallpaper/3.mp4') },
  { id: 'wp_4',  name: 'Vibe 4',  type: 'video', source: require('../../assets/Wallpaper/4.mp4'),  thumbnail: require('../../assets/Wallpaper/4.mp4') },
  { id: 'wp_5',  name: 'Vibe 5',  type: 'video', source: require('../../assets/Wallpaper/5.mp4'),  thumbnail: require('../../assets/Wallpaper/5.mp4') },
  { id: 'wp_6',  name: 'Vibe 6',  type: 'video', source: require('../../assets/Wallpaper/6.mp4'),  thumbnail: require('../../assets/Wallpaper/6.mp4') },
  { id: 'wp_7',  name: 'Vibe 7',  type: 'video', source: require('../../assets/Wallpaper/7.mp4'),  thumbnail: require('../../assets/Wallpaper/7.mp4') },
  { id: 'wp_8',  name: 'Vibe 8',  type: 'video', source: require('../../assets/Wallpaper/8.mp4'),  thumbnail: require('../../assets/Wallpaper/8.mp4') },
  { id: 'wp_9',  name: 'Vibe 9',  type: 'video', source: require('../../assets/Wallpaper/9.mp4'),  thumbnail: require('../../assets/Wallpaper/9.mp4') },
  { id: 'wp_10', name: 'Vibe 10', type: 'video', source: require('../../assets/Wallpaper/10.mp4'), thumbnail: require('../../assets/Wallpaper/10.mp4') },
  
  // Natural Colors
  { id: 'clr_sage',      name: 'Sage',       type: 'color', color: '#9BAE96' },
  { id: 'clr_sand',      name: 'Sand',       type: 'color', color: '#D9C5B2' },
  { id: 'clr_terracotta', name: 'Terracotta', type: 'color', color: '#CD8D7B' },
  { id: 'clr_teal',      name: 'Deep Teal',  type: 'color', color: '#2D5D62' },
  { id: 'clr_slate',     name: 'Slate Blue', type: 'color', color: '#6F7D8C' },
  { id: 'clr_clay',      name: 'Clay Red',   type: 'color', color: '#A66C52' },
  { id: 'clr_moss',      name: 'Moss Green', type: 'color', color: '#6B705C' },
  { id: 'clr_rose',      name: 'Dusty Rose', type: 'color', color: '#B79492' },
  { id: 'clr_ochre',     name: 'Golden Ochre',type: 'color', color: '#BC8A5F' },
  { id: 'clr_charcoal',  name: 'Charcoal',   type: 'color', color: '#353535' },
];
