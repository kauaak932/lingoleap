import React, { useState, useCallback } from 'react';
import { generateListeningTranscript, generateListeningQuestions } from '../services/geminiService';
import { ListeningQuestions, DifficultyLevel } from '../types';
import Button from './common/Button';
import Spinner from './common/Spinner';
import { ICONS } from '../constants';
import DifficultySelector from './common/DifficultySelector';

interface ListeningActivityProps {
  difficulty: DifficultyLevel;
  onUpdateDifficulty: (level: DifficultyLevel) => void;
}

const ListeningActivity: React.FC<ListeningActivityProps> = ({ difficulty, onUpdateDifficulty }) => {
  const [questions, setQuestions] = useState<ListeningQuestions | null>(null);
  const [transcript, setTranscript] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showTranscript, setShowTranscript] = useState<boolean>(false);

  const fetchExercise = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setQuestions(null);
    setTranscript('');
    setShowTranscript(false);
    try {
      // First generate the transcript based on difficulty
      const newTranscript = await generateListeningTranscript(difficulty);
      setTranscript(newTranscript);
      // Then generate questions for that transcript
      const result = await generateListeningQuestions(newTranscript, difficulty);
      setQuestions(result);
    } catch (err) {
      setError('Failed to generate a listening exercise. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [difficulty]);

  return (
    <div className="animate-fade-in">
      <div className="flex items-center space-x-4 mb-6">
        <div className="p-3 bg-amber-100 dark:bg-amber-900/50 rounded-full text-amber-500">
          {ICONS.LISTENING}
        </div>
        <div>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Listening Practice</h2>
          <p className="text-slate-500 dark:text-slate-400">Listen to a conversation and answer questions.</p>
        </div>
      </div>
      
      <div className="flex justify-center mb-6">
        <DifficultySelector currentLevel={difficulty} onSelectLevel={onUpdateDifficulty} disabled={isLoading} />
      </div>

      <div className="text-center mb-8">
        <Button onClick={fetchExercise} disabled={isLoading}>
          {isLoading ? 'Generating...' : 'Start Listening Exercise'}
        </Button>
      </div>
      
      {isLoading && <div className="flex justify-center p-8"><Spinner /></div>}
      {error && <p className="text-red-500 text-center">{error}</p>}

      {questions && transcript && (
        <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-lg space-y-6 animate-fade-in">
          <div>
            <h3 className="text-2xl font-semibold mb-4 text-slate-800 dark:text-slate-100">Questions</h3>
            <p className="mb-4 text-slate-500 dark:text-slate-400">Read the questions below. When you are ready, reveal the transcript to find the answers.</p>
            <ul className="space-y-4">
              {questions.questions.map((q, index) => (
                <li key={index} className="text-slate-700 dark:text-slate-200">
                  <span className="font-semibold">{index + 1}.</span> {q.question}
                </li>
              ))}
            </ul>
          </div>
          <hr className="border-slate-200 dark:border-slate-700" />
          <div className="text-center">
             <Button onClick={() => setShowTranscript(!showTranscript)} variant="secondary">
              {showTranscript ? 'Hide Transcript' : 'Show Transcript'}
            </Button>
          </div>
          {showTranscript && (
             <div className="animate-fade-in">
                <h3 className="text-xl font-semibold mb-2 text-slate-800 dark:text-slate-100">Transcript</h3>
                <div className="p-4 bg-slate-100 dark:bg-slate-700 rounded-lg">
                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">{transcript.trim()}</p>
                </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ListeningActivity;