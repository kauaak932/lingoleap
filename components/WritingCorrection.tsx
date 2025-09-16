import React, { useState, useCallback } from 'react';
import { generateWritingTopic, correctWriting } from '../services/geminiService';
import { DifficultyLevel } from '../types';
import Button from './common/Button';
import Spinner from './common/Spinner';
import { ICONS } from '../constants';
import DifficultySelector from './common/DifficultySelector';

interface WritingCorrectionProps {
  difficulty: DifficultyLevel;
  onUpdateDifficulty: (level: DifficultyLevel) => void;
  onPracticeComplete: (xp: number, isVocab?: boolean) => void;
}

const WritingCorrection: React.FC<WritingCorrectionProps> = ({ difficulty, onUpdateDifficulty, onPracticeComplete }) => {
  const [topic, setTopic] = useState<string>('');
  const [text, setText] = useState<string>('');
  const [correction, setCorrection] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isGeneratingTopic, setIsGeneratingTopic] = useState(false);

  const fetchTopic = useCallback(async () => {
    setIsGeneratingTopic(true);
    setError(null);
    setCorrection(null);
    try {
      const newTopic = await generateWritingTopic(difficulty);
      setTopic(newTopic);
      setText(''); // Clear previous text when new topic is generated
    } catch (err) {
      setError('Failed to generate a topic. Please try again.');
      console.error(err);
    } finally {
      setIsGeneratingTopic(false);
    }
  }, [difficulty]);

  const handleCorrection = async () => {
    if (!text.trim()) {
      setError('Please write something before submitting.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setCorrection(null);
    try {
      const result = await correctWriting(text, difficulty, topic);
      setCorrection(result);
      onPracticeComplete(0);
    } catch (err) {
      setError('Failed to get correction. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="flex items-center space-x-4 mb-6">
        <div className="p-3 bg-blue-100 dark:bg-blue-900/50 rounded-full text-blue-500">
          {ICONS.WRITING}
        </div>
        <div>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Writing Correction</h2>
          <p className="text-slate-500 dark:text-slate-400">Improve your writing with AI-powered feedback.</p>
        </div>
      </div>
      
      <div className="flex justify-center mb-6">
        <DifficultySelector currentLevel={difficulty} onSelectLevel={onUpdateDifficulty} disabled={isLoading || isGeneratingTopic} />
      </div>

      <div className="text-center mb-6">
        <Button onClick={fetchTopic} disabled={isGeneratingTopic || isLoading} variant="secondary">
          {isGeneratingTopic ? 'Getting Topic...' : 'Get a Writing Topic'}
        </Button>
      </div>

      {isGeneratingTopic && <div className="flex justify-center p-4"><Spinner /></div>}
      
      {topic && (
        <div className="text-center mb-6 p-4 bg-slate-100 dark:bg-slate-800 rounded-xl">
          <p className="font-semibold text-slate-800 dark:text-slate-200">{topic}</p>
        </div>
      )}

      <div className="space-y-4">
        <textarea
          rows={8}
          className="w-full p-4 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-900 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition"
          placeholder="Write your text here..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          disabled={isLoading}
        />
        <div className="text-center">
          <Button onClick={handleCorrection} disabled={isLoading || !text.trim()}>
            {isLoading ? 'Correcting...' : 'Correct My Writing'}
          </Button>
        </div>
      </div>

      {isLoading && !correction && <div className="flex justify-center p-8"><Spinner /></div>}
      {error && <p className="text-red-500 text-center mt-4">{error}</p>}

      {correction && (
        <div className="mt-8 bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-lg space-y-4 animate-fade-in">
          <h3 className="text-2xl font-semibold text-slate-800 dark:text-slate-100">Feedback</h3>
          <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
            <p className="text-slate-700 dark:text-slate-200 whitespace-pre-wrap">{correction}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default WritingCorrection;