
import React from 'react';
// FIX: Use default import for firebase compat to resolve module loading error.
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import { auth } from '../firebase/config';
import { UserProfile } from '../types';

interface HeaderProps {
  onHomeClick: () => void;
  onProfileClick: () => void;
  // Fix: Corrected Firebase user type to `firebase.User` as the `User` type is on the top-level `firebase` object in the compat library.
  user: firebase.User | null;
  profile: UserProfile | null;
}

const Header: React.FC<HeaderProps> = ({ onHomeClick, onProfileClick, user, profile }) => {
  const handleLogout = () => {
    // Fix: Used namespaced `auth.signOut` from the compat library.
    auth.signOut();
  };

  return (
    <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <div 
            className="flex items-center space-x-2 cursor-pointer"
            onClick={onHomeClick}
          >
            <svg
              className="w-8 h-8 text-sky-500"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 2L2 7L12 12L22 7L12 2Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M2 17L12 22L22 17"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M2 12L12 17L22 12"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white">
              LingoLeap AI
            </h1>
          </div>
          {user && (
            <div className="flex items-center space-x-4">
               {profile && profile.currentStreak > 0 && (
                <div className="hidden sm:flex items-center space-x-2 bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400 font-semibold px-3 py-1.5 rounded-full">
                   <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.934l.643-.661a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.934l.643-.661a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.934l.643-.661a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.934l-.322 1.684a1 1 0 00.933 1.155.76.76 0 00.107-.013l.31-.052a1 1 0 00.822-.934c.345-.23.614-.558.822-.934l-.643.661a1 1 0 001.45.385c.345-.23.614-.558.822-.934l-.643.661a1 1 0 001.45.385c.345-.23.614-.558.822-.934l-.643.661a1 1 0 001.45.385c.345-.23.614-.558.822-.934l.322-1.684a1 1 0 00-.933-1.155.76.76 0 00-.107.013l-.31.052a1 1 0 00-.822.934c-.345.23-.614.558-.822.934l.643-.661z" clipRule="evenodd" />
                    <path d="M7 10a1 1 0 011-1h4a1 1 0 110 2H8a1 1 0 01-1-1z" />
                    <path d="M6 12a1 1 0 011-1h2a1 1 0 110 2H7a1 1 0 01-1-1z" />
                    <path fillRule="evenodd" d="M10 2a8 8 0 100 16 8 8 0 000-16zM3 10a7 7 0 1114 0 7 7 0 01-14 0z" clipRule="evenodd" />
                  </svg>
                  <span>{profile.currentStreak} Day Streak</span>
                </div>
              )}
              <span className="text-sm text-slate-600 dark:text-slate-300 hidden md:block">
                {user.email}
              </span>
              <button
                onClick={onProfileClick}
                className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors"
                aria-label="View Profile"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm font-semibold bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 rounded-full transition-colors"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;