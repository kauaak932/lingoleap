export enum DifficultyLevel {
  BEGINNER = 'Beginner',
  INTERMEDIATE = 'Intermediate',
  ADVANCED = 'Advanced',
}

export type LearningMode = 'speaking' | 'writing' | 'reading' | 'listening' | 'grammar' | 'vocabulary' | 'history';

export interface UserProfile {
  id: string;
  email: string;
  learningGoal: string;
  difficultyLevel: DifficultyLevel;
  currentStreak: number;
  lastPracticeDate: string; // ISO string
  dailyStreakAwarded: boolean;
  dailySpeakingSeconds: number;
  dailyVocabLearned: number;
  dailySessionsCompleted: number;
  wordsLearned: number;
  practiceSessionsCompleted: number;
  milestoneAchieved: number; // e.g., 3, 7, 30 for day streaks
  lastDailyChallengeDate?: string; // ISO string
  createdAt: any; // Firestore timestamp
}

export interface ReadingPassage {
  passage: string;
  questions: { question: string }[];
}

export interface ListeningQuestions {
  questions: { question: string }[];
}

export interface PronunciationFeedback {
  overallScore: number;
  overallFeedback: string;
  wordsToPractice: {
    word: string;
    feedback: string;
  }[];
  fluencyFeedback: string;
  intonationFeedback: string;
}

export interface VocabularyWord {
  id?: string;
  word: string;
  banglaMeaning: string;
  synonyms: string[];
  antonyms: string[];
  exampleSentence: string;
  usageContext: string;
  userId?: string;
  createdAt?: any; // Firestore timestamp
}

export interface GrammarExercise {
  type: 'multiple-choice' | 'fill-in-the-blank' | 'sentence-correction';
  question: string;
  options?: string[];
  answer: string;
  explanation: string;
}

export interface PracticeSession {
    id: string;
    userId: string;
    mode: LearningMode;
    difficulty: DifficultyLevel;
    score?: number; // For speaking
    prompt?: string;
    userResponse?: string;
    feedback?: PronunciationFeedback | string;
    createdAt: any; // Firestore Timestamp
}