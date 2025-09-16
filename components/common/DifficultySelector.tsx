import React from 'react';
import { DifficultyLevel } from '../../types';

interface DifficultySelectorProps {
  currentLevel: DifficultyLevel;
  onSelectLevel: (level: DifficultyLevel) => void;
  disabled?: boolean;
}

const levels = [DifficultyLevel.BEGINNER, DifficultyLevel.INTERMEDIATE, DifficultyLevel.ADVANCED];

const DifficultySelector: React.FC<DifficultySelectorProps> = ({ currentLevel, onSelectLevel, disabled = false }) => {
  return (
    <div className="inline-flex rounded-full shadow-sm bg-slate-100 dark:bg-slate-700 p-1" role="group">
      {levels.map((level) => (
        <button
          key={level}
          type="button"
          onClick={() => onSelectLevel(level)}
          disabled={disabled}
          className={`px-4 sm:px-6 py-2 text-sm font-semibold rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800 disabled:cursor-not-allowed disabled:opacity-60
            ${currentLevel === level
              ? 'bg-white dark:bg-slate-800 text-sky-600 dark:text-sky-400 shadow'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'}`}
        >
          {level}
        </button>
      ))}
    </div>
  );
};

export default DifficultySelector;
