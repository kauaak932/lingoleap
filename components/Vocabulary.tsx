
import React, { useState, useEffect } from 'react';
import { VocabularyWord } from '../types';
import { getSavedWords, deleteWord as deleteWordFromDb } from '../services/firebaseService';
import { ICONS } from '../constants';
import VocabularyCard from './common/VocabularyCard';
import Button from './common/Button';
import Spinner from './common/Spinner';

interface VocabularyProps {
  userId: string;
  onReturnToDashboard: () => void;
}

const Vocabulary: React.FC<VocabularyProps> = ({ userId, onReturnToDashboard }) => {
  const [savedWords, setSavedWords] = useState<VocabularyWord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWords = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const words = await getSavedWords(userId);
        setSavedWords(words);
      } catch (err) {
        setError("Could not load your saved words.");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchWords();
  }, [userId]);

  const handleDeleteWord = async (wordId: string) => {
    try {
      await deleteWordFromDb(wordId);
      setSavedWords(prevWords => prevWords.filter(word => word.id !== wordId));
    } catch (err) {
      setError("Failed to delete the word.");
      console.error(err);
    }
  };

  if (isLoading) {
    return <div className="flex justify-center p-8"><Spinner /></div>;
  }

  return (
    <div className="animate-fade-in">
      <div className="flex items-center space-x-4 mb-6">
        <div className="p-3 bg-rose-100 dark:bg-rose-900/50 rounded-full text-rose-500">
          {ICONS.VOCABULARY}
        </div>
        <div>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white">My Vocabulary</h2>
          <p className="text-slate-500 dark:text-slate-400">Your personal collection of saved words.</p>
        </div>
      </div>

      {error && (
        <div className="text-center p-3 mb-4 rounded-lg bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-300">
          <p>{error}</p>
        </div>
      )}

      {savedWords.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 [perspective:1000px]">
          {savedWords.map((word) => (
            <VocabularyCard 
              key={word.id} 
              wordData={word} 
              onDelete={() => word.id && handleDeleteWord(word.id)} 
            />
          ))}
        </div>
      ) : (
        <div className="text-center bg-white dark:bg-slate-800 p-12 rounded-2xl shadow-lg">
          <div className="text-5xl text-slate-400 dark:text-slate-500 mb-4">
            {ICONS.VOCABULARY}
          </div>
          <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2">Your Vocabulary List is Empty</h3>
          <p className="text-slate-500 dark:text-slate-400 mb-6">
            Go to the 'Spoken English' practice, get feedback, and save new words to start your collection.
          </p>
          <Button onClick={onReturnToDashboard}>Back to Dashboard</Button>
        </div>
      )}
    </div>
  );
};

export default Vocabulary;
