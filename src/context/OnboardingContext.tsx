import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Alarm, ChallengeType, DayOfWeek } from '../types';
import { DEFAULT_SOUND_ID } from '../constants/sounds';

interface OnboardingState {
  time: string;
  repeatDays: DayOfWeek[];
  backgroundId: string;
  soundId: string;
  volume: number;
  challengeType: ChallengeType;
  challengeTypes: ChallengeType[];
  disciplineMode: boolean;
}

interface OnboardingContextType {
  state: OnboardingState;
  updateState: (updates: Partial<OnboardingState>) => void;
  resetState: () => void;
  buildAlarm: () => Omit<Alarm, 'id' | 'createdAt'>;
}

const defaultState: OnboardingState = {
  time: '07:00',
  repeatDays: [1, 2, 3, 4, 5],
  backgroundId: '', // Empty by default to force selection
  soundId: DEFAULT_SOUND_ID,
  volume: 1.0,
  challengeType: 'math',
  challengeTypes: ['math'],
  disciplineMode: true,
};

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export const OnboardingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<OnboardingState>(defaultState);

  const updateState = (updates: Partial<OnboardingState>) => {
    setState(prev => ({ ...prev, ...updates }));
  };

  const resetState = () => setState(defaultState);

  const buildAlarm = (): Omit<Alarm, 'id' | 'createdAt'> => {
    return {
      time: state.time,
      enabled: true,
      repeatDays: state.repeatDays,
      challengeType: state.challengeType,
      challengeTypes: state.challengeTypes,
      soundId: state.soundId,
      volume: state.volume,
      notificationIds: [],
      backgroundId: state.backgroundId,
      requireWakeUpCheck: true,
      disciplineMode: state.disciplineMode,
    };
  };

  return (
    <OnboardingContext.Provider value={{ state, updateState, resetState, buildAlarm }}>
      {children}
    </OnboardingContext.Provider>
  );
};

export const useOnboarding = () => {
  const context = useContext(OnboardingContext);
  if (!context) throw new Error('useOnboarding must be used within OnboardingProvider');
  return context;
};
