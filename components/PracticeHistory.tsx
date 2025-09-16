
import React, { useState, useEffect } from 'react';
import { getPracticeHistory } from '../services/firebaseService';
import { PracticeSession } from '../types';
import Spinner from './common/Spinner';
import { ICONS } from '../constants';
import HistoryDetailModal from './common/HistoryDetailModal';

interface PracticeHistoryProps {
  userId: string;
}

const HistoryCard: React.FC<{ session: PracticeSession, onClick: () => void }> = ({ session, onClick }) => {
  const getIcon = () => {
    switch (session.mode) {
      case 'speaking': return ICONS.SPEAKING;
      case 'writing': return ICONS.WRITING;
      case 'reading': return ICONS.READING;
      case 'listening': return ICONS.LISTENING;
      case 'grammar': return ICONS.GRAMMAR;
      default: return ICONS.HISTORY;
    }
  };
  
  const getScoreColor = (score: number) => {
      if (score > 70) return 'text-green-500 bg-green-100 dark:bg-green-900/50';
      if (score > 40) return 'text-amber-500 bg-amber-100 dark:bg-amber-900/50';
      return 'text-red-500 bg-red-100 dark:bg-red-900/50';
  }

  return (
    <div onClick={onClick} className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm hover:shadow-lg transition-shadow cursor-pointer flex items-center space-x-4">
      <div className="p-3 bg-slate-100 dark:bg-slate-700 rounded-full text-slate-500">{getIcon()}</div>
      <div className="flex-grow">
        <div className="flex justify-between items-center">
          <p className="font-bold capitalize text-slate-800 dark:text-slate-100">{session.mode} Practice</p>
           {session.score !== undefined && (
             <span className={`text-sm font-bold px-2 py-1 rounded-full ${getScoreColor(session.score)}`}>{session.score}</span>
           )}
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {session.createdAt?.toDate().toLocaleString()}
        </p>
      </div>
       <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
       </svg>
    </div>
  );
};

const PracticeHistory: React.FC<PracticeHistoryProps> = ({ userId }) => {
  const [history, setHistory] = useState<PracticeSession[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSession, setSelectedSession] = useState<PracticeSession | null>(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const historyData = await getPracticeHistory(userId);
        setHistory(historyData);
      } catch (err) {
        setError("Failed to load practice history.");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchHistory();
  }, [userId]);

  return (
    <div className="animate-fade-in">
       {selectedSession && <HistoryDetailModal session={selectedSession} onClose={() => setSelectedSession(null)} />}
      <div className="flex items-center space-x-4 mb-6">
        <div className="p-3 bg-gray-100 dark:bg-gray-900/50 rounded-full text-gray-500">
          {ICONS.HISTORY}
        </div>
        <div>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Practice History</h2>
          <p className="text-slate-500 dark:text-slate-400">Review your past practice sessions.</p>
        </div>
      </div>

      {isLoading && <div className="flex justify-center p-8"><Spinner /></div>}
      {error && <p className="text-red-500 text-center">{error}</p>}
      
      {!isLoading && history.length === 0 && (
         <div className="text-center bg-white dark:bg-slate-800 p-12 rounded-2xl shadow-lg">
          <div className="text-5xl text-slate-400 dark:text-slate-500 mb-4">{ICONS.HISTORY}</div>
          <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2">No History Yet</h3>
          <p className="text-slate-500 dark:text-slate-400">Complete a practice session and it will appear here.</p>
        </div>
      )}

      {history.length > 0 && (
        <div className="space-y-4">
          {history.map(session => (
            <HistoryCard key={session.id} session={session} onClick={() => setSelectedSession(session)} />
          ))}
        </div>
      )}
    </div>
  );
};

export default PracticeHistory;
