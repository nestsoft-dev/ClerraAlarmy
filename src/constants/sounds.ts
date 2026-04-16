import { AlarmSound } from '../types';

export const ALARM_SOUNDS: AlarmSound[] = [
  { id: 'alarm_clock',     name: 'Alarm Clock',     filename: 'alarm_clock.wav' },
  { id: 'air_raid',        name: 'Air Raid',         filename: 'air_raid.wav' },
  { id: 'beep',            name: 'Beep',             filename: 'beep.wav' },
  { id: 'alert',           name: 'Alert',            filename: 'freesound_community_alert_33762.wav' },
  { id: 'siren',           name: 'Siren',            filename: 'freesound_community_siren_alert_96052.wav' },
  { id: 'wind_up_clock',   name: 'Wind-Up Clock',   filename: 'freesound_community_wind_up_clock_alarm_bell_64219.wav' },
  { id: 'eas_alarm',       name: 'EAS Alert',        filename: 'jeremayjimenez_taiwan_eas_alarm_501825.wav' },
  { id: 'aggressive',      name: 'Aggressive',       filename: 'reminder_aggressive.wav' },
  { id: 'classic',         name: 'Classic',          filename: 'reminder_classic.wav' },
  { id: 'peaceful',        name: 'Peaceful',         filename: 'reminder_peaceful.wav' },
  { id: 'viral',           name: 'Viral',            filename: 'reminder_viral.wav' },
  { id: 'christmas_bells', name: 'Christmas Bells',  filename: 'soundreality_christmas_ringing_bells_ringtone_456343.wav' },
  { id: 'old_telephone',   name: 'Old Telephone',    filename: 'u_xg7ssi08yr_old_telephone_ringing_362034.wav' },
  { id: 'community_alarm', name: 'Community Alarm', filename: 'freesound_community-alarm-106447.mp3' },
  { id: 'zambia_eas',      name: 'Zambia EAS',      filename: 'jeremayjimenez-zambia-eas-alarm-loud-249126.mp3' },
  { id: 'emergency_siren', name: 'Emergency Siren', filename: 'koiroylers-emergency-siren-351963.mp3' },
  { id: 'mixkit_alert',    name: 'Mixkit Alert',    filename: 'mixkit-alert-alarm-1005.wav' },
  { id: 'facility_alarm',  name: 'Facility Alarm',  filename: 'mixkit-facility-alarm-sound-999.wav' },
  { id: 'hall_alert',      name: 'Hall Alert',      filename: 'mixkit-sound-alert-in-hall-1006.wav' },
  { id: 'loud_ahh',        name: 'Super Loud Ahh',  filename: 'the_cutie_pie-super-loud-ahh-alarm-165805.mp3' },
];

export const CATEGORIES = ['Classic', 'Calm', 'Intense', 'Extreme'];

export const SOUND_META: Record<string, { emoji: string; desc: string; category: string }> = {
  alarm_clock:     { emoji: '⏰', desc: 'The classic wake-up jolt',       category: 'Classic' },
  wind_up_clock:   { emoji: '🕰️', desc: 'Vintage mechanical bell',        category: 'Classic' },
  old_telephone:   { emoji: '☎️', desc: 'Retro telephone ring',           category: 'Classic' },
  classic:         { emoji: '🔔', desc: 'Timeless and effective',          category: 'Classic' },
  beep:            { emoji: '📟', desc: 'Sharp digital beep',              category: 'Classic' },
  peaceful:        { emoji: '🌅', desc: 'A gentle, calm rise',             category: 'Calm' },
  viral:           { emoji: '✨', desc: 'Trending wake-up tone',           category: 'Calm' },
  christmas_bells: { emoji: '🎄', desc: 'Festive ringing bells',           category: 'Calm' },
  mixkit_alert:    { emoji: '🔕', desc: 'Subtle alert tone',              category: 'Calm' },
  hall_alert:      { emoji: '🏛️', desc: 'Ambient hall alert',             category: 'Calm' },
  air_raid:        { emoji: '🚨', desc: 'No chance of sleeping through',   category: 'Intense' },
  alert:           { emoji: '⚡', desc: 'Sharp emergency alert',           category: 'Intense' },
  siren:           { emoji: '🚒', desc: 'Full emergency siren',            category: 'Intense' },
  aggressive:      { emoji: '💥', desc: 'Maximum aggression',              category: 'Intense' },
  facility_alarm:  { emoji: '🏭', desc: 'Industrial facility alarm',       category: 'Intense' },
  emergency_siren: { emoji: '🛑', desc: 'Nuclear-grade alarm',             category: 'Extreme' },
  community_alarm: { emoji: '📢', desc: 'Community broadcast alert',       category: 'Extreme' },
  eas_alarm:       { emoji: '📡', desc: 'Taiwan emergency alert',          category: 'Extreme' },
  zambia_eas:      { emoji: '🌍', desc: 'Zambia EAS — ultra loud',         category: 'Extreme' },
  loud_ahh:        { emoji: '😱', desc: 'Super loud screaming alarm',      category: 'Extreme' },
};

export const DEFAULT_SOUND_ID = 'alarm_clock';

/**
 * Sound asset map — all requires must be static for Metro bundler.
 * Each key matches an AlarmSound.id.
 */
export const SOUND_ASSETS: Record<string, any> = {
  alarm_clock:     require('../../assets/sounds/alarm_clock.wav'),
  air_raid:        require('../../assets/sounds/air_raid.wav'),
  beep:            require('../../assets/sounds/beep.wav'),
  alert:           require('../../assets/sounds/freesound_community_alert_33762.wav'),
  siren:           require('../../assets/sounds/freesound_community_siren_alert_96052.wav'),
  wind_up_clock:   require('../../assets/sounds/freesound_community_wind_up_clock_alarm_bell_64219.wav'),
  eas_alarm:       require('../../assets/sounds/jeremayjimenez_taiwan_eas_alarm_501825.wav'),
  aggressive:      require('../../assets/sounds/reminder_aggressive.wav'),
  classic:         require('../../assets/sounds/reminder_classic.wav'),
  peaceful:        require('../../assets/sounds/reminder_peaceful.wav'),
  viral:           require('../../assets/sounds/reminder_viral.wav'),
  christmas_bells: require('../../assets/sounds/soundreality_christmas_ringing_bells_ringtone_456343.wav'),
  old_telephone:   require('../../assets/sounds/u_xg7ssi08yr_old_telephone_ringing_362034.wav'),
  community_alarm: require('../../assets/sounds/freesound_community-alarm-106447.mp3'),
  zambia_eas:      require('../../assets/sounds/jeremayjimenez-zambia-eas-alarm-loud-249126.mp3'),
  emergency_siren: require('../../assets/sounds/koiroylers-emergency-siren-351963.mp3'),
  mixkit_alert:    require('../../assets/sounds/mixkit-alert-alarm-1005.wav'),
  facility_alarm:  require('../../assets/sounds/mixkit-facility-alarm-sound-999.wav'),
  hall_alert:      require('../../assets/sounds/mixkit-sound-alert-in-hall-1006.wav'),
  loud_ahh:        require('../../assets/sounds/the_cutie_pie-super-loud-ahh-alarm-165805.mp3'),
};
