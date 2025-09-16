import React, { useState, useCallback } from 'react';
import { generateReadingPassage } from '../services/geminiService';
import { ReadingPassage, DifficultyLevel } from '../types';
import Button from './common/Button';
import Spinner from './common/Spinner';
import { ICONS } from '../constants';
import DifficultySelector from './common/DifficultySelector';

interface ReadingComprehensionProps {
  difficulty: DifficultyLevel;
  onUpdateDifficulty: (level: DifficultyLevel) => void;
}

const ReadingComprehension: React.FC<ReadingComprehensionProps> = ({ difficulty, onUpdateDifficulty }) => {
  const [content, setContent] = useState<ReadingPassage | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPassage = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setContent(null);
    try {
      const newContent = await generateReadingPassage(difficulty);
      setContent(newContent);
    } catch (err) {
      setError('Failed to generate a passage. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [difficulty]);

  return (
    <div className="animate-fade-in">
      <div className="flex items-center space-x-4 mb-6">
        <div className="p-3 bg-green-100 dark:bg-green-900/50 rounded-full text-green-500">
          {ICONS.READING}
        </div>
        <div>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Reading Comprehension</h2>
          <p className="text-slate-500 dark:text-slate-400">Test your understanding with a new story.</p>
        </div>
      </div>
      
      <div className="flex justify-center mb-6">
        <DifficultySelector currentLevel={difficulty} onSelectLevel={onUpdateDifficulty} disabled={isLoading} />
      </div>

      <div className="text-center mb-8">
        <Button onClick={fetchPassage} disabled={isLoading}>
          {isLoading ? 'Generating...' : 'Generate New Passage'}
        </Button>
      </div>
      
      {isLoading && <div className="flex justify-center p-8"><Spinner /></div>}
      {error && <p className="text-red-500 text-center">{error}</p>}

      {content && (
        <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-lg space-y-6 animate-fade-in">
          <div>
            <h3 className="text-2xl font-semibold mb-4 text-slate-800 dark:text-slate-100">Reading Passage</h3>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">{content.passage}</p>
          </div>
          <hr className="border-slate-200 dark:border-slate-700" />
          <div>
            <h3 className="text-2xl font-semibold mb-4 text-slate-800 dark:text-slate-100">Questions</h3>
            <ul className="space-y-4">
              {content.questions.map((q, index) => (
                <li key={index} className="text-slate-700 dark:text-slate-200">
                  <span className="font-semibold">{index + 1}.</span> {q.question}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReadingComprehension;