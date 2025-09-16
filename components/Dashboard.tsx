import React, { useState, useEffect } from 'react';
import { LearningMode, UserProfile } from '../types';
import { MODULES } from '../constants';
import Card from './common/Card';
import MilestoneCelebration from './common/MilestoneCelebration';

interface DashboardProps {
  onSelectMode: (mode: LearningMode) => void;
  profile: UserProfile | null;
  onClearMilestone: () => void;
}

const DailyRecapCard: React.FC<{ profile: UserProfile }> = ({ profile }) => {
  const { dailySpeakingSeconds, dailyVocabLearned, dailySessionsCompleted, dailyStreakAwarded } = profile;

  const speakingMins = Math.floor(dailySpeakingSeconds / 60);
  const speakingGoal = 10;
  const vocabGoal = 5;

  const speakingProgress = Math.min((speakingMins / speakingGoal) * 100, 100);
  const vocabProgress = Math.min((dailyVocabLearned / vocabGoal) * 100, 100);
  
  if (dailyStreakAwarded) {
    return (
      <div className="w-full mb-12 bg-gradient-to-r from-green-500 to-emerald-600 p-6 rounded-2xl shadow-lg text-white text-center">
         <div className="mx-auto bg-white/20 h-16 w-16 rounded-full flex items-center justify-center mb-3">
             <svg xmlns="http://www.w3.org/2000/svg" className="h-9 w-9" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
         </div>
         <h3 className="text-2xl font-bold">Daily Goals Met!</h3>
         <p className="text-white/80 mt-1">Awesome work! Your streak is safe. Come back tomorrow.</p>
      </div>
    );
  }

  return (
    <div className="w-full mb-12 bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-lg">
      <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">Today's Recap</h3>
      <p className="text-slate-500 dark:text-slate-400 mb-6">Complete your goals to extend your streak.</p>
      <div className="space-y-5">
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
         <div className="text-sm font-medium text-slate-600 dark:text-slate-300 pt-2 border-t border-slate-200 dark:border-slate-700">
            <div className="flex justify-between items-center">
                <span>Sessions Completed Today</span>
                <span className="font-bold text-lg text-slate-800 dark:text-slate-100">{dailySessionsCompleted || 0}</span>
            </div>
         </div>
      </div>
    </div>
  );
}

const Dashboard: React.FC<DashboardProps> = ({ onSelectMode, profile, onClearMilestone }) => {
  const [showMilestone, setShowMilestone] = useState(false);

  useEffect(() => {
    // When the profile data comes in and has a milestone, trigger the celebration
    if (profile?.milestoneAchieved && profile.milestoneAchieved > 0) {
      setShowMilestone(true);
    }
  }, [profile?.milestoneAchieved]);

  const handleCloseMilestone = () => {
    setShowMilestone(false);
    onClearMilestone(); // Clear the flag in the database
  };

  return (
    <div className="flex flex-col items-center">
      {showMilestone && profile?.milestoneAchieved && (
        <MilestoneCelebration 
          milestone={profile.milestoneAchieved} 
          onClose={handleCloseMilestone} 
        />
      )}
       {profile && <DailyRecapCard profile={profile} />}
      <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 text-slate-900 dark:text-white">
        Welcome to Your English Learning Hub
      </h2>
      <p className="text-lg text-slate-600 dark:text-slate-300 text-center mb-12 max-w-2xl">
        Choose an activity to start improving your skills. Our AI-powered tools are here to guide you every step of the way.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
        {MODULES.map((module) => (
          <Card
            key={module.mode}
            title={module.title}
            description={module.description}
            color={module.color}
            icon={module.icon}
            onClick={() => onSelectMode(module.mode)}
          />
        ))}
      </div>
    </div>
  );
};

export default Dashboard;