import React, { useState, useEffect, useCallback } from 'react';
import { generateGrammarExercise } from '../services/geminiService';
import { GrammarExercise, DifficultyLevel } from '../types';
import Button from './common/Button';
import Spinner from './common/Spinner';
import { ICONS } from '../constants';
import DifficultySelector from './common/DifficultySelector';

interface GrammarPracticeProps {
  difficulty: DifficultyLevel;
  onUpdateDifficulty: (level: DifficultyLevel) => void;
  onPracticeComplete: (xp: number, isVocab?: boolean) => void;
}

const GrammarPractice: React.FC<GrammarPracticeProps> = ({ difficulty, onUpdateDifficulty, onPracticeComplete }) => {
  const [exercise, setExercise] = useState<GrammarExercise | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [userAnswer, setUserAnswer] = useState<string>('');
  const [showAnswer, setShowAnswer] = useState<boolean>(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  const fetchExercise = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setExercise(null);
    setUserAnswer('');
    setShowAnswer(false);
    setIsCorrect(null);
    try {
      const newExercise = await generateGrammarExercise(difficulty);
      setExercise(newExercise);
    } catch (err) {
      setError('Failed to generate an exercise. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [difficulty]);
  
  useEffect(() => {
    fetchExercise();
  }, [fetchExercise]);

  const handleCheckAnswer = () => {
    if (!exercise || !userAnswer) return;
    const correct = userAnswer.trim().toLowerCase() === exercise.answer.trim().toLowerCase();
    setIsCorrect(correct);
    setShowAnswer(true);
    onPracticeComplete(0);
  };
  
  const handleNext = () => {
      fetchExercise();
  }

  const renderExercise = () => {
    if (!exercise) return null;
    switch (exercise.type) {
      case 'multiple-choice':
        return (
          <div className="space-y-3">
            <p className="text-lg text-slate-700 dark:text-slate-200 mb-4">{exercise.question}</p>
            {exercise.options?.map((option) => (
              <button
                key={option}
                onClick={() => setUserAnswer(option)}
                disabled={showAnswer}
                className={`w-full text-left p-3 rounded-lg border-2 transition ${
                  userAnswer === option ? 'border-sky-500 bg-sky-50 dark:bg-sky-900/50' : 'border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700'
                } ${showAnswer && exercise.answer === option ? '!bg-green-100 dark:!bg-green-900/50 !border-green-500' : ''} ${showAnswer && userAnswer === option && exercise.answer !== option ? '!bg-red-100 dark:!bg-red-900/50 !border-red-500' : ''}`}
              >
                {option}
              </button>
            ))}
          </div>
        );
      case 'fill-in-the-blank':
        return (
            <div>
                <p className="text-lg text-slate-700 dark:text-slate-200 mb-4" dangerouslySetInnerHTML={{__html: exercise.question.replace('___', '<span class="font-bold text-sky-500">[blank]</span>')}}></p>
                <input
                    type="text"
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    disabled={showAnswer}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm bg-slate-50 dark:bg-slate-700"
                    placeholder="Type your answer here"
                />
            </div>
        );
      case 'sentence-correction':
         return (
            <div>
                <p className="text-slate-500 dark:text-slate-400 mb-2">Correct the following sentence:</p>
                <p className="italic p-3 bg-slate-100 dark:bg-slate-700/50 rounded-lg text-lg text-slate-700 dark:text-slate-200 mb-4">{exercise.question}</p>
                <textarea
                    rows={2}
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    disabled={showAnswer}
                    className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm bg-slate-50 dark:bg-slate-700"
                    placeholder="Write the corrected sentence"
                />
            </div>
         );
      default:
        return <p>Unsupported exercise type.</p>;
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="flex items-center space-x-4 mb-6">
        <div className="p-3 bg-violet-100 dark:bg-violet-900/50 rounded-full text-violet-500">
          {ICONS.GRAMMAR}
        </div>
        <div>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Grammar Practice</h2>
          <p className="text-slate-500 dark:text-slate-400">Test your knowledge with grammar challenges.</p>
        </div>
      </div>
      
      <div className="flex justify-center mb-6">
        <DifficultySelector currentLevel={difficulty} onSelectLevel={onUpdateDifficulty} disabled={isLoading} />
      </div>

      <div className="text-center mb-8">
        <Button onClick={handleNext} disabled={isLoading}>
          {isLoading ? 'Generating...' : 'New Exercise'}
        </Button>
      </div>
      
      {isLoading && <div className="flex justify-center p-8"><Spinner /></div>}
      {error && <p className="text-red-500 text-center">{error}</p>}

      {exercise && (
        <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-lg space-y-6">
          <div>
            {renderExercise()}
          </div>
          
          {!showAnswer && (
            <div className="text-center">
                <Button onClick={handleCheckAnswer} disabled={!userAnswer.trim()}>Check Answer</Button>
            </div>
          )}

          {showAnswer && (
            <div className="animate-fade-in space-y-4">
                <div className={`p-4 rounded-lg text-center font-semibold ${isCorrect ? 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300' : 'bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300'}`}>
                    {isCorrect ? 'Correct!' : 'Not quite.'}
                </div>
                <div>
                    <h4 className="font-bold text-slate-800 dark:text-slate-100">Correct Answer:</h4>
                    <p className="text-lg text-sky-600 dark:text-sky-400">{exercise.answer}</p>
                </div>
                 <div>
                    <h4 className="font-bold text-slate-800 dark:text-slate-100">Explanation:</h4>
                    <p className="text-slate-600 dark:text-slate-300">{exercise.explanation}</p>
                </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default GrammarPractice;