import React, { useState, useEffect, useMemo } from 'react';
import { VocabularyWord, DifficultyLevel } from '../types';
import { getSavedWords } from '../services/firebaseService';
import { generateSpokenEnglishTips } from '../services/geminiService';
import Button from './common/Button';
import Spinner from './common/Spinner';

interface DailyChallengeProps {
  userId: string;
  difficulty: DifficultyLevel;
  onClose: () => void;
}

interface QuizQuestion {
  word: string;
  options: string[];
  correctAnswer: string;
}

type ChallengeStage = 'loading_words' | 'quiz_intro' | 'quiz_inprogress' | 'quiz_results' | 'loading_tips' | 'showing_tips';

const DailyChallenge: React.FC<DailyChallengeProps> = ({ userId, difficulty, onClose }) => {
  const [stage, setStage] = useState<ChallengeStage>('loading_words');
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [tips, setTips] = useState<{ tip: string; explanation: string }[]>([]);
  
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 1. Load words and generate quiz
  useEffect(() => {
    const setupQuiz = async () => {
      try {
        const words = await getSavedWords(userId);
        if (words.length < 4) {
          // Not enough words for a quiz, skip to tips
          setStage('loading_tips');
          return;
        }

        // Generate questions
        const shuffledWords = [...words].sort(() => 0.5 - Math.random());
        const quizWords = shuffledWords.slice(0, Math.min(5, shuffledWords.length));
        const newQuestions: QuizQuestion[] = quizWords.map((correctWord, index) => {
          const distractors = shuffledWords
            .filter(w => w.id !== correctWord.id)
            .slice(index, index + 3) // get some other words
            .map(w => w.banglaMeaning);
          
          const options = [...distractors, correctWord.banglaMeaning].sort(() => 0.5 - Math.random());
          
          return {
            word: correctWord.word,
            options: options,
            correctAnswer: correctWord.banglaMeaning,
          };
        });
        
        setQuestions(newQuestions);
        setStage('quiz_intro');
      } catch (err) {
        setError("Could not load your vocabulary for the quiz.");
        setStage('loading_tips'); // Still try to load tips
      }
    };
    setupQuiz();
  }, [userId]);

  // 2. Load tips when it's time
  useEffect(() => {
    if (stage === 'loading_tips') {
      const fetchTips = async () => {
        try {
          const fetchedTips = await generateSpokenEnglishTips(difficulty);
          setTips(fetchedTips);
          setStage('showing_tips');
        } catch (err) {
          setError("Could not load daily tips, but you can still close this window.");
          // User can still close the modal
        }
      };
      fetchTips();
    }
  }, [stage, difficulty]);

  const handleAnswerSelect = (answer: string) => {
    if (showFeedback) return;
    setUserAnswer(answer);
    setShowFeedback(true);
    if (answer === questions[currentQuestionIndex].correctAnswer) {
      setScore(s => s + 1);
    }
  };

  const handleNextQuestion = () => {
    setShowFeedback(false);
    setUserAnswer(null);
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(i => i + 1);
    } else {
      setStage('quiz_results');
    }
  };
  
  const handleStartQuiz = () => {
    setStage('quiz_inprogress');
  };
  
  const handleFinishQuiz = () => {
    setStage('loading_tips');
  };

  const renderContent = () => {
    switch (stage) {
      case 'loading_words':
        return <div className="text-center p-8"><Spinner /><p className="mt-2">Preparing your daily challenge...</p></div>;

      case 'quiz_intro':
        return (
          <div className="text-center">
            <h3 className="text-2xl font-bold">Daily Vocabulary Quiz</h3>
            <p className="mt-2 text-slate-600 dark:text-slate-300">Let's test your memory on {questions.length} of your saved words.</p>
            <Button onClick={handleStartQuiz} className="mt-6">Start Quiz</Button>
          </div>
        );
      
      case 'quiz_inprogress': {
        const question = questions[currentQuestionIndex];
        return (
            <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Question {currentQuestionIndex + 1} of {questions.length}</p>
                <p className="mt-2 text-lg">What is the meaning of the word:</p>
                <h3 className="text-3xl font-bold my-4 text-sky-500 dark:text-sky-400 text-center">"{question.word}"</h3>
                <div className="space-y-3">
                    {question.options.map(option => {
                        const isCorrect = option === question.correctAnswer;
                        const isSelected = userAnswer === option;
                        let buttonClass = 'border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700';
                        if (showFeedback) {
                            if (isCorrect) buttonClass = '!bg-green-100 dark:!bg-green-900/50 !border-green-500';
                            else if (isSelected) buttonClass = '!bg-red-100 dark:!bg-red-900/50 !border-red-500';
                        } else if (isSelected) {
                            buttonClass = 'border-sky-500 bg-sky-50 dark:bg-sky-900/50';
                        }
                        
                        return (
                            <button
                                key={option}
                                onClick={() => handleAnswerSelect(option)}
                                disabled={showFeedback}
                                className={`w-full text-left p-3 rounded-lg border-2 transition ${buttonClass}`}
                            >
                                {option}
                            </button>
                        );
                    })}
                </div>
                {showFeedback && <Button onClick={handleNextQuestion} className="mt-6 w-full">Next</Button>}
            </div>
        )
      }

      case 'quiz_results':
        return (
           <div className="text-center">
            <h3 className="text-2xl font-bold">Quiz Complete!</h3>
            <p className="text-4xl font-bold my-4">{score} / {questions.length}</p>
            <p className="text-slate-600 dark:text-slate-300">Well done! Keep practicing to master your vocabulary.</p>
            <Button onClick={handleFinishQuiz} className="mt-6">See Today's Tips</Button>
          </div>
        );

      case 'loading_tips':
        return <div className="text-center p-8"><Spinner /><p className="mt-2">Generating your daily tips...</p></div>;
      
      case 'showing_tips':
        return (
          <div>
            {questions.length < 4 && (
                <div className="text-center mb-6 p-4 bg-amber-50 dark:bg-amber-900/50 rounded-lg">
                    <h4 className="font-bold text-amber-700 dark:text-amber-300">Vocabulary Quiz Skipped</h4>
                    <p className="text-sm text-amber-600 dark:text-amber-400">Save at least 4 words to unlock your daily quiz!</p>
                </div>
            )}
            <h3 className="text-2xl font-bold text-center mb-4">Today's Spoken English Tips</h3>
            <ul className="space-y-4">
              {tips.map((tip, index) => (
                <li key={index} className="p-4 bg-slate-100 dark:bg-slate-700/50 rounded-lg">
                  <h4 className="font-bold text-sky-600 dark:text-sky-400">{tip.tip}</h4>
                  <p className="text-slate-700 dark:text-slate-300 text-sm mt-1">{tip.explanation}</p>
                </li>
              ))}
            </ul>
          </div>
        );
        
      default:
        return null;
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] animate-fade-in"
      aria-labelledby="daily-challenge-title"
      role="dialog"
      aria-modal="true"
    >
      <div
        className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-8 max-w-2xl w-full transform scale-95 animate-modal-pop max-h-[90vh] overflow-y-auto"
        role="document"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 id="daily-challenge-title" className="text-xl font-bold text-slate-800 dark:text-white">Daily Warm-up</h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
        {renderContent()}
        {(stage === 'showing_tips' && !error) && (
            <div className="mt-6 text-center">
                <Button onClick={onClose}>Start Learning!</Button>
            </div>
        )}
      </div>
    </div>
  );
};

export default DailyChallenge;
