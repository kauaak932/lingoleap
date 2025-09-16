
import React from 'react';

// Icons for different modules
export const ICONS = {
  SPEAKING: (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
    </svg>
  ),
  WRITING: (
     <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z" />
    </svg>
  ),
  READING: (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
  ),
  LISTENING: (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.636 5.636a9 9 0 0112.728 0M8.464 15.536a5 5 0 010-7.072" />
    </svg>
  ),
  GRAMMAR: (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
    </svg>
  ),
  VOCABULARY: (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M15 21v-1a6 6 0 00-5.197-5.927" />
    </svg>
  ),
  HISTORY: (
     <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
};

export const MODULES = [
  {
    mode: 'speaking' as const,
    title: 'Spoken English Practice',
    description: 'Practice speaking with our AI and get instant feedback on your pronunciation.',
    color: 'from-sky-500 to-cyan-500',
    icon: ICONS.SPEAKING,
  },
  {
    mode: 'writing' as const,
    title: 'Writing Correction',
    description: 'Improve your writing skills. Get your texts corrected for grammar, style, and flow.',
    color: 'from-blue-500 to-indigo-500',
    icon: ICONS.WRITING,
  },
  {
    mode: 'reading' as const,
    title: 'Reading Comprehension',
    description: 'Read passages and answer questions to test your understanding.',
    color: 'from-green-500 to-emerald-500',
    icon: ICONS.READING,
  },
  {
    mode: 'listening' as const,
    title: 'Listening Practice',
    description: 'Listen to dialogues and test your comprehension skills with related questions.',
    color: 'from-amber-500 to-orange-500',
    icon: ICONS.LISTENING,
  },
  {
    mode: 'grammar' as const,
    title: 'Grammar Exercises',
    description: 'Sharpen your grammar with interactive exercises tailored to your level.',
    color: 'from-violet-500 to-purple-500',
    icon: ICONS.GRAMMAR,
  },
  {
    mode: 'vocabulary' as const,
    title: 'My Vocabulary',
    description: 'Review and practice the words you have saved from your exercises.',
    color: 'from-rose-500 to-pink-500',
    icon: ICONS.VOCABULARY,
  },
  {
      mode: 'history' as const,
      title: 'Practice History',
      description: 'Review your past performance and track your improvement over time.',
      color: 'from-slate-500 to-gray-500',
      icon: ICONS.HISTORY,
  }
];
