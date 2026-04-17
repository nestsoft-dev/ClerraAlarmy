export type ChallengeType = 'math' | 'shake' | 'photo' | 'jump' | 'brush' | 'pushup' | 'color' | 'unscramble' | 'riddle' | 'memory' | 'quiz';
export type ChallengeDifficulty = 1 | 2 | 3;

export interface Challenge {
  type: ChallengeType;
  difficulty: ChallengeDifficulty;
}

export interface ChallengeConfig {
  id: string; // unique local ID to track slots
  type: ChallengeType;
  numProblems: number;
  difficulty: ChallengeDifficulty;
}

export interface AlarmSound {
  id: string;
  name: string;
  filename: string;
}

export interface Alarm {
  id: string;
  time: string;
  enabled: boolean;
  repeatDays: number[];
  voiceUri?: string;
  disciplineMode: boolean;
  label?: string;
  createdAt: number;
  soundId: string;               // which alarm sound to play
  backgroundId?: string;         // id of the selected built-in background
  backgroundUri?: string;        // uri of standard background image
  challengeType?: ChallengeType; // legacy: single challenge (kept for backwards compat)
  challengeTypes?: ChallengeType[]; // multi-challenge legacy (kept for backwards compat)
  challengeConfigs?: ChallengeConfig[]; // new configured challenges
  targetColor?: string;          // stored color for color challenge (e.g. 'Red')
  volume?: number;               // 0.0–1.0, default 1.0
  notificationIds?: string[];    // IDs of all scheduled notifications for this alarm
  requireWakeUpCheck?: boolean;  // force user through challenge before dismissal
}

export interface AlarmLog {
  id: string;
  alarmId: string;
  date: string;
  completed: boolean;
  challengeType?: ChallengeType;
  challengeDifficulty?: ChallengeDifficulty;
  durationMs?: number;
  failedAt?: number;
}

export interface Reflection {
  id: string;
  alarmId: string;
  date: string;
  message: string;
  createdAt: number;
}

export interface UserStats {
  currentStreak: number;
  longestStreak: number;
  totalAlarms: number;
  totalCompleted: number;
  totalFailed: number;
  lastAlarmDate?: string;
}

export interface AppSettings {
  strictMode: boolean;
  adaptiveDifficulty: boolean;
  gracePeriod: number; // 0, 5, 10, 15 (seconds)
  defaultSoundId: string;
  isPremium: boolean;
  subscriptionPlan?: 'weekly' | 'yearly';
  preAlarmReminder: number; // 0 (None), 5, 10, 15 (minutes)
  hasPromptedForReview: boolean;
}