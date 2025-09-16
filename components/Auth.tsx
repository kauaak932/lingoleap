


import React, { useState } from 'react';
// FIX: Use default import for firebase compat to resolve auth types error.
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import { auth } from '../firebase/config';
import Button from './common/Button';
import Spinner from './common/Spinner';

const Auth: React.FC = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleAuthError = (err: any) => {
        // Fix: Used `firebase.auth.AuthError` type from the compat library.
        const authError = err as firebase.auth.AuthError;
        switch (authError.code) {
            case 'auth/user-not-found':
            case 'auth/wrong-password':
            case 'auth/invalid-credential': // More generic error in newer SDK versions
                setError('Invalid email or password.');
                break;
            case 'auth/email-already-in-use':
                setError('An account with this email already exists.');
                break;
            case 'auth/weak-password':
                setError('Password should be at least 6 characters.');
                break;
            case 'auth/invalid-email':
                setError('Please enter a valid email address.');
                break;
            default:
                setError('An unexpected error occurred. Please try again.');
                break;
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        try {
            if (isLogin) {
                // Fix: Used namespaced `auth.signInWithEmailAndPassword` from the compat library.
                await auth.signInWithEmailAndPassword(email, password);
            } else {
                // Fix: Used namespaced `auth.createUserWithEmailAndPassword` from the compat library.
                await auth.createUserWithEmailAndPassword(email, password);
            }
        } catch (err) {
            handleAuthError(err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] animate-fade-in">
            <div className="w-full max-w-md p-8 space-y-6 bg-white dark:bg-slate-800 rounded-2xl shadow-lg">
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-slate-800 dark:text-white">
                        LingoLeap AI
                    </h1>
                    <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                        {isLogin ? 'Sign in to continue your learning journey' : 'Create an account to get started'}
                    </p>
                </div>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                            Email address
                        </label>
                        <div className="mt-1">
                            <input
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm bg-slate-50 dark:bg-slate-700"
                            />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="password"  className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                            Password
                        </label>
                        <div className="mt-1">
                            <input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete={isLogin ? "current-password" : "new-password"}
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm bg-slate-50 dark:bg-slate-700"
                            />
                        </div>
                    </div>
                    
                    {error && <p className="text-sm text-red-500 text-center">{error}</p>}

                    <div>
                        <Button type="submit" disabled={isLoading} className="w-full flex justify-center">
                            {isLoading ? <Spinner size="sm" /> : (isLogin ? 'Log In' : 'Sign Up')}
                        </Button>
                    </div>
                </form>
                <div className="text-sm text-center">
                    <button
                        onClick={() => { setIsLogin(!isLogin); setError(null); }}
                        className="font-medium text-sky-600 hover:text-sky-500 dark:text-sky-400 dark:hover:text-sky-300"
                    >
                        {isLogin ? 'Need an account? Sign up' : 'Already have an account? Log in'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Auth;
