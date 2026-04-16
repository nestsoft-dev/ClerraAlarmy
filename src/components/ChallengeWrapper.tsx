import React from 'react';
import { Challenge } from '../types';
import { MathChallenge } from './MathChallenge';
import { ShakeChallenge } from './ShakeChallenge';
import { PhotoChallenge } from './PhotoChallenge';
import { JumpChallenge } from './JumpChallenge';
import { BrushChallenge } from './BrushChallenge';
import { PushupChallenge } from './PushupChallenge';
import { ColorChallenge } from './ColorChallenge';
import { UnscrambleChallenge } from './UnscrambleChallenge';
import { RiddleChallenge } from './RiddleChallenge';
import { MemoryChallenge } from './MemoryChallenge';
import { QuizChallenge } from './QuizChallenge';

interface ChallengeWrapperProps {
  challenge: Challenge;
  onComplete: () => void;
  onFail: () => void;
}

export const ChallengeWrapper: React.FC<ChallengeWrapperProps> = ({
  challenge,
  onComplete,
  onFail,
}) => {
  switch (challenge.type) {
    case 'math':
      return <MathChallenge difficulty={challenge.difficulty} onComplete={onComplete} onFail={onFail} />;
    case 'shake':
      return <ShakeChallenge difficulty={challenge.difficulty} onComplete={onComplete} onFail={onFail} />;
    case 'photo':
      return <PhotoChallenge difficulty={challenge.difficulty} onComplete={onComplete} onFail={onFail} />;
    case 'jump':
      return <JumpChallenge difficulty={challenge.difficulty} onComplete={onComplete} onFail={onFail} />;
    case 'brush':
      return <BrushChallenge difficulty={challenge.difficulty} onComplete={onComplete} onFail={onFail} />;
    case 'pushup':
      return <PushupChallenge difficulty={challenge.difficulty} onComplete={onComplete} onFail={onFail} />;
    case 'color':
      return <ColorChallenge onComplete={onComplete} onFail={onFail} />;
    case 'unscramble':
      return <UnscrambleChallenge difficulty={challenge.difficulty} onComplete={onComplete} onFail={onFail} />;
    case 'riddle':
      return <RiddleChallenge difficulty={challenge.difficulty} onComplete={onComplete} onFail={onFail} />;
    case 'memory':
      return <MemoryChallenge difficulty={challenge.difficulty} onComplete={onComplete} onFail={onFail} />;
    case 'quiz':
      return <QuizChallenge difficulty={challenge.difficulty} onComplete={onComplete} onFail={onFail} />;
    default:
      return null;
  }
};