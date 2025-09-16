import React, { useState } from 'react';
import firebase from 'firebase/compat/app';
import { UserProfile, DifficultyLevel } from '../types';
import Button from './common/Button';
import Spinner from './common/Spinner';
import DifficultySelector from './common/DifficultySelector';

interface ProfileProps {
  user: firebase.User;
  profile: UserProfile;
  onUpdateGoal: (newGoal: string) => Promise<void>;
  onUpdateDifficulty: (newDifficulty: DifficultyLevel) => Promise<void>;
}

const StatCard: React.FC<{ label: string; value: number | string, icon?: React.ReactNode }> = ({ label, value, icon }) => (
  <div className="bg-slate-100 dark:bg-slate-700/50 p-4 rounded-xl text-center">
    <div className="flex justify-center items-center text-3xl font-bold text-sky-500">
        {icon && <span className="mr-2 -ml-2">{icon}</span>}
        {value}
    </div>
    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{label}</p>
  </div>
);

const DailyProgress: React.FC<{profile: UserProfile}> = ({ profile }) => {
    const { dailySpeakingSeconds, dailyVocabLearned, dailyStreakAwarded } = profile;

    const speakingMins = (dailySpeakingSeconds / 60).toFixed(1);
    const speakingGoal = 10;
    const vocabGoal = 5;

    const speakingProgress = Math.min(((dailySpeakingSeconds/60) / speakingGoal) * 100, 100);
    const vocabProgress = Math.min((dailyVocabLearned / vocabGoal) * 100, 100);

    return (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-lg">
            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-1">Today's Progress</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
              {dailyStreakAwarded ? "You've met your daily goals. Great job!" : "Complete these goals to earn your daily streak."}
            </p>
            <div className="space-y-4">
                <div>
                    <div className="flex justify-between items-center mb-1 text-sm font-medium text-slate-600 dark:text-slate-300">
                        <span>Speaking Practice</span>
                        <span>{speakingMins} / {speakingGoal} min</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2.5 dark:bg-slate-700">
                        <div className="bg-sky-500 h-2.5 rounded-full transition-all duration-500" style={{ width: `${speakingProgress}%` }}></div>
                    </div>
                </div>
                <div>
                    <div className="flex justify-between items-center mb-1 text-sm font-medium text-slate-600 dark:text-slate-300">
                        <span>New Vocabulary</span>
                        <span>{dailyVocabLearned} / {vocabGoal} words</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2.5 dark:bg-slate-700">
                        <div className="bg-fuchsia-500 h-2.5 rounded-full transition-all duration-500" style={{ width: `${vocabProgress}%` }}></div>
                    </div>
                </div>
            </div>
        </div>
    )
}

const Profile: React.FC<ProfileProps> = ({ user, profile, onUpdateGoal, onUpdateDifficulty }) => {
  const [goal, setGoal] = useState(profile.learningGoal);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  
  const handleSave = async () => {
    if (goal === profile.learningGoal) return;
    setIsSaving(true);
    setSaveSuccess(false);
    try {
      await onUpdateGoal(goal);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    } catch (error) {
      console.error("Failed to save goal:", error);
      // Here you might want to show an error state to the user
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="animate-fade-in space-y-8">
      <div className="flex flex-col items-center space-y-4">
        <div className="relative w-32 h-32">
            <div className="w-full h-full rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-slate-400 dark:text-slate-500" fill="none" viewBox="0 0 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
            </div>
        </div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white break-all">{user.email}</h2>
      </div>

      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-lg">
        <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-4">My Progress</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard label="Current Streak" value={`${profile.currentStreak} days`} icon={
                <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-amber-500" viewBox="0 0 20 20" fill="currentColor">
                   <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.934l.643-.661a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.934l.643-.661a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.934l.643-.661a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.934l-.322 1.684a1 1 0 00.933 1.155.76.76 0 00.107-.013l.31-.052a1 1 0 00.822-.934c.345-.23.614-.558.822-.934l-.643.661a1 1 0 001.45.385c.345-.23.614-.558.822-.934l-.643.661a1 1 0 001.45.385c.345-.23.614-.558.822-.934l-.643.661a1 1 0 001.45.385c.345-.23.614-.558.822-.934l.322-1.684a1 1 0 00-.933-1.155.76.76 0 00-.107.013l-.31.052a1 1 0 00-.822.934c-.345.23-.614.558-.822.934l.643-.661z" clipRule="evenodd" />
                   <path d="M7 10a1 1 0 011-1h4a1 1 0 110 2H8a1 1 0 01-1-1z" />
                   <path d="M6 12a1 1 0 011-1h2a1 1 0 110 2H7a1 1 0 01-1-1z" />
                   <path fillRule="evenodd" d="M10 2a8 8 0 100 16 8 8 0 000-16zM3 10a7 7 0 1114 0 7 7 0 01-14 0z" clipRule="evenodd" />
                </svg>
            } />
            <StatCard label="Words Learned" value={profile.wordsLearned} />
            <StatCard label="Total Sessions" value={profile.practiceSessionsCompleted} />
        </div>
      </div>
      
      <DailyProgress profile={profile} />

      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-lg">
        <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-4">My Default Difficulty</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Set your preferred difficulty level for all exercises. This will be saved automatically.</p>
        <div className="flex justify-center">
            <DifficultySelector currentLevel={profile.difficultyLevel} onSelectLevel={onUpdateDifficulty} />
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-lg">
        <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-4">My Learning Goal</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Set a goal to keep yourself motivated. For example: "Practice speaking for 15 minutes every day."</p>
        <textarea
            rows={3}
            className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-700 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition"
            placeholder="What's your goal?"
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
        />
        <div className="mt-4 text-right">
            <Button onClick={handleSave} disabled={isSaving || goal === profile.learningGoal}>
                {isSaving ? <Spinner size="sm" /> : (saveSuccess ? 'Saved!' : 'Save Goal')}
            </Button>
        </div>
      </div>
    </div>
  );
};

export default Profile;