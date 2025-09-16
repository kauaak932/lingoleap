import React, { useState, useEffect } from 'react';
import firebase from 'firebase/compat/app';
import { auth } from './firebase/config';
import { getUserProfile, createUserProfile, updateUserProfile } from './services/firebaseService';
import { UserProfile, LearningMode, DifficultyLevel } from './types';
import Header from './components/Header';
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';
import SpeakingPractice from './components/SpeakingPractice';
import WritingCorrection from './components/WritingCorrection';
import ReadingComprehension from './components/ReadingComprehension';
import ListeningActivity from './components/ListeningActivity';
import GrammarPractice from './components/GrammarPractice';
import Vocabulary from './components/Vocabulary';
import Profile from './components/Profile';
import PracticeHistory from './components/PracticeHistory';
import Spinner from './components/common/Spinner';
import DailyChallenge from './components/DailyChallenge';

type View = LearningMode | 'dashboard' | 'profile';

const App: React.FC = () => {
  const [user, setUser] = useState<firebase.User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [showDailyChallenge, setShowDailyChallenge] = useState<boolean>(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        let userProfile = await getUserProfile(firebaseUser.uid);
        if (!userProfile) {
          userProfile = await createUserProfile(firebaseUser);
        }
        setProfile(userProfile);

        // Daily Challenge Logic
        const today = new Date().toDateString();
        const lastChallengeDate = userProfile.lastDailyChallengeDate
          ? new Date(userProfile.lastDailyChallengeDate).toDateString()
          : null;
        
        if (lastChallengeDate !== today) {
          setShowDailyChallenge(true);
        }

      } else {
        setUser(null);
        setProfile(null);
        setCurrentView('dashboard');
      }
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleUpdateProfile = async (data: Partial<UserProfile>) => {
    if (user && profile) {
        await updateUserProfile(user.uid, data);
        setProfile(prevProfile => prevProfile ? { ...prevProfile, ...data } : null);
    }
  }

  const handleUpdateDifficulty = async (newDifficulty: DifficultyLevel) => {
    if (user && profile && profile.difficultyLevel !== newDifficulty) {
      handleUpdateProfile({ difficultyLevel: newDifficulty });
    }
  };
  
  const handleUpdateGoal = async (newGoal: string) => {
    if(user && profile && profile.learningGoal !== newGoal) {
      handleUpdateProfile({ learningGoal: newGoal });
    }
  };

  const handlePracticeComplete = async (xp: number, isVocab: boolean = false) => {
    if (user && profile) {
      const now = new Date();
      const lastPracticeDate = profile.lastPracticeDate ? new Date(profile.lastPracticeDate) : new Date(0);
      const isNewDay = now.toDateString() !== lastPracticeDate.toDateString();

      const updates: Partial<UserProfile> = {
        practiceSessionsCompleted: (profile.practiceSessionsCompleted || 0) + 1,
        lastPracticeDate: now.toISOString(),
      };
      
      let newDailySpeakingSeconds = isNewDay ? 0 : (profile.dailySpeakingSeconds || 0);
      let newDailyVocabLearned = isNewDay ? 0 : (profile.dailyVocabLearned || 0);
      
      updates.dailySessionsCompleted = isNewDay ? 1 : (profile.dailySessionsCompleted || 0) + 1;

      if (isNewDay) {
        updates.dailyStreakAwarded = false;
      }

      if (isVocab) {
        newDailyVocabLearned += 1;
        updates.wordsLearned = (profile.wordsLearned || 0) + 1;
      } else if (xp > 0) { // Assume XP > 0 means it's speaking practice
        newDailySpeakingSeconds += xp / 10; // Keeping the original logic for seconds calculation
      }
      
      updates.dailySpeakingSeconds = newDailySpeakingSeconds;
      updates.dailyVocabLearned = newDailyVocabLearned;

      // Check for goal completion
      const SPEAKING_GOAL_SECONDS = 10 * 60;
      const VOCAB_GOAL_WORDS = 5;

      const speakingGoalMet = newDailySpeakingSeconds >= SPEAKING_GOAL_SECONDS;
      const vocabGoalMet = newDailyVocabLearned >= VOCAB_GOAL_WORDS;
      
      if (speakingGoalMet && vocabGoalMet && !profile.dailyStreakAwarded) {
        updates.dailyStreakAwarded = true;
      }
      
      // Streak logic
      if (isNewDay) {
        const yesterday = new Date();
        yesterday.setDate(now.getDate() - 1);

        if (lastPracticeDate.toDateString() === yesterday.toDateString() && profile.dailyStreakAwarded) {
          updates.currentStreak = (profile.currentStreak || 0) + 1;
        } else {
          updates.currentStreak = 1;
        }
      }

      await handleUpdateProfile(updates);
    }
  };
  
  const handleClearMilestone = () => {
      if(user && profile) {
          handleUpdateProfile({milestoneAchieved: 0});
      }
  }

  const handleCloseDailyChallenge = () => {
      if (user) {
          handleUpdateProfile({ lastDailyChallengeDate: new Date().toISOString() });
      }
      setShowDailyChallenge(false);
  }

  const renderContent = () => {
    if (!profile) return <Dashboard onSelectMode={() => {}} profile={null} onClearMilestone={() => {}} />;

    switch (currentView) {
      case 'dashboard':
        return <Dashboard onSelectMode={setCurrentView} profile={profile} onClearMilestone={handleClearMilestone} />;
      case 'speaking':
        return <SpeakingPractice userId={user!.uid} difficulty={profile.difficultyLevel} onUpdateDifficulty={handleUpdateDifficulty} onPracticeComplete={handlePracticeComplete} />;
      case 'writing':
        return <WritingCorrection difficulty={profile.difficultyLevel} onUpdateDifficulty={handleUpdateDifficulty} onPracticeComplete={handlePracticeComplete} />;
      case 'reading':
        return <ReadingComprehension difficulty={profile.difficultyLevel} onUpdateDifficulty={handleUpdateDifficulty} />;
      case 'listening':
        return <ListeningActivity difficulty={profile.difficultyLevel} onUpdateDifficulty={handleUpdateDifficulty} />;
      case 'grammar':
        return <GrammarPractice difficulty={profile.difficultyLevel} onUpdateDifficulty={handleUpdateDifficulty} onPracticeComplete={handlePracticeComplete} />;
      case 'vocabulary':
        return <Vocabulary userId={user!.uid} onReturnToDashboard={() => setCurrentView('dashboard')} />;
      case 'history':
        return <PracticeHistory userId={user!.uid} />;
      case 'profile':
        return <Profile user={user!} profile={profile} onUpdateGoal={handleUpdateGoal} onUpdateDifficulty={handleUpdateDifficulty} />;
      default:
        return <Dashboard onSelectMode={setCurrentView} profile={profile} onClearMilestone={handleClearMilestone} />;
    }
  };

  if (isLoading) {
    return (
      <div className="bg-slate-50 dark:bg-slate-900 min-h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="bg-slate-50 dark:bg-slate-900 min-h-screen font-sans">
      {user && profile && showDailyChallenge && (
        <DailyChallenge 
            userId={user.uid} 
            difficulty={profile.difficultyLevel} 
            onClose={handleCloseDailyChallenge} 
        />
      )}
      <Header
        user={user}
        profile={profile}
        onHomeClick={() => setCurrentView('dashboard')}
        onProfileClick={() => setCurrentView('profile')}
      />
      <main className="container mx-auto p-4 sm:p-6 md:p-8">
        {user ? renderContent() : <Auth />}
      </main>
    </div>
  );
};

export default App;