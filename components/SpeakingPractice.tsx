import React, { useState, useEffect, useCallback, useRef } from 'react';
import { generateSpeakingPrompt, getPronunciationFeedback, generateVocabularyList } from '../services/geminiService';
import { PronunciationFeedback, DifficultyLevel, VocabularyWord } from '../types';
import { saveWord, savePracticeSession } from '../services/firebaseService';
import Button from './common/Button';
import Spinner from './common/Spinner';
import { ICONS } from '../constants';
import DifficultySelector from './common/DifficultySelector';
import VocabularyCard from './common/VocabularyCard';

// Type definition for the SpeechRecognition API
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

// A new, more powerful hook that combines recording and speech-to-text
const useSpeechRecognitionAndRecorder = () => {
    const [status, setStatus] = useState<'idle' | 'recording' | 'stopped'>('idle');
    const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
    const [transcript, setTranscript] = useState('');
    const [error, setError] = useState<string | null>(null);

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const recognitionRef = useRef<any | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const finalTranscriptRef = useRef<string>('');
    
    // This ref is the source of truth for callbacks to avoid stale closures.
    const statusRef = useRef(status);

    const startRecording = useCallback(async () => {
        setAudioBlob(null);
        setTranscript('');
        setError(null);
        finalTranscriptRef.current = '';
        
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (!SpeechRecognition) {
            setError("Speech Recognition is not supported by your browser. Please try using Chrome or Edge.");
            return;
        }
        
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            statusRef.current = 'recording';
            setStatus('recording');

            const newMediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
            mediaRecorderRef.current = newMediaRecorder;
            audioChunksRef.current = [];
            newMediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) audioChunksRef.current.push(event.data);
            };
            newMediaRecorder.onstop = () => {
                const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                setAudioBlob(blob);
                stream.getTracks().forEach(track => track.stop());
            };
            newMediaRecorder.start();

            const recognition = new SpeechRecognition();
            recognitionRef.current = recognition;
            recognition.continuous = true;
            recognition.interimResults = true;
            recognition.lang = 'en-US';

            recognition.onresult = (event: SpeechRecognitionEvent) => {
                let interimTranscript = '';
                for (let i = event.resultIndex; i < event.results.length; i++) {
                    const part = event.results[i][0].transcript;
                    if (event.results[i].isFinal) {
                        finalTranscriptRef.current += part.trim() + ' ';
                    } else {
                        interimTranscript += part;
                    }
                }
                setTranscript(finalTranscriptRef.current + interimTranscript);
            };
            
            recognition.onerror = (event: any) => {
                if (event.error !== 'no-speech' && event.error !== 'aborted') {
                    setError(`Speech recognition error: ${event.error}`);
                }
            }

            recognition.onend = () => {
                if (statusRef.current === 'recording') {
                    try {
                        recognitionRef.current?.start();
                    } catch (e) {
                        console.error("Recognition restart failed", e);
                        setError("Speech recognition was interrupted.");
                    }
                }
            };

            recognition.start();

        } catch (err: any) {
            console.error("Error accessing microphone:", err);
            setError(`Microphone access denied: ${err.message}. Please allow microphone permissions in your browser settings.`);
            statusRef.current = 'idle';
            setStatus('idle');
        }
    }, []); 

    const stopRecording = useCallback(() => {
        statusRef.current = 'stopped';
        setStatus('stopped');
        
        if (mediaRecorderRef.current?.state === 'recording') {
            mediaRecorderRef.current.stop();
        }
        if (recognitionRef.current) {
            recognitionRef.current.stop();
        }
    }, []);

    useEffect(() => {
        return () => {
            statusRef.current = 'stopped'; // Ensure it doesn't restart on unmount
            if (recognitionRef.current) {
                recognitionRef.current.onend = null;
                recognitionRef.current.stop();
            }
            mediaRecorderRef.current?.stream?.getTracks().forEach(track => track.stop());
        }
    }, []);

    return { status, audioBlob, transcript, error, startRecording, stopRecording };
};

interface SpeakingPracticeProps {
  userId: string;
  difficulty: DifficultyLevel;
  onUpdateDifficulty: (level: DifficultyLevel) => void;
  onPracticeComplete: (xp: number, isVocab?: boolean) => void;
}

const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            const base64String = (reader.result as string).split(',')[1];
            resolve(base64String);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
};

const SpeakingPractice: React.FC<SpeakingPracticeProps> = ({ userId, difficulty, onUpdateDifficulty, onPracticeComplete }) => {
  const [prompt, setPrompt] = useState<string>('');
  const [promptMode, setPromptMode] = useState<'ai' | 'custom'>('ai');
  const [feedback, setFeedback] = useState<PronunciationFeedback | null>(null);
  const [vocabularyList, setVocabularyList] = useState<VocabularyWord[]>([]);
  const [isLoading, setIsLoading] = useState<'prompt' | 'feedback' | false>(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const [selectedDuration, setSelectedDuration] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  const { status, audioBlob, transcript, error: speechError, startRecording, stopRecording } = useSpeechRecognitionAndRecorder();

  const fetchPrompt = useCallback(async () => {
    setIsLoading('prompt');
    setApiError(null);
    setFeedback(null);
    setVocabularyList([]);
    setSelectedDuration(null);
    setTimeLeft(null);
    try {
      const newPrompt = await generateSpeakingPrompt(difficulty);
      setPrompt(newPrompt);
    } catch (err) {
      setApiError('Failed to generate a prompt. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [difficulty]);

  useEffect(() => {
    if (promptMode === 'ai') {
      fetchPrompt();
    }
  }, [fetchPrompt, promptMode]);

  // Timer countdown effect
  useEffect(() => {
    if (status !== 'recording' || selectedDuration === null || timeLeft === null) {
      return;
    }

    if (timeLeft === 0) {
      stopRecording();
      return;
    }

    const timerId = setInterval(() => {
      setTimeLeft(prev => (prev ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timerId);
  }, [status, timeLeft, selectedDuration, stopRecording]);

  const handleGetFeedback = async () => {
    if (!audioBlob || !transcript) {
        setApiError("No audio was recorded or nothing was said. Please try again.");
        return;
    }
    
    setIsLoading('feedback');
    setApiError(null);
    setFeedback(null);
    setVocabularyList([]);

    try {
        const audioBase64 = await blobToBase64(audioBlob);
        const mimeType = audioBlob.type;
        
        if(!transcript.trim()) {
            throw new Error("Could not understand audio, please try speaking louder and clearer.")
        }
        
        const feedbackResult = await getPronunciationFeedback(prompt, audioBase64, mimeType, transcript);
        setFeedback(feedbackResult);

        const vocab = await generateVocabularyList(transcript);
        setVocabularyList(vocab);

        await savePracticeSession({
            userId,
            mode: 'speaking',
            difficulty,
            prompt,
            userResponse: transcript,
            feedback: feedbackResult,
            score: feedbackResult.overallScore,
        });

        onPracticeComplete(feedbackResult.overallScore);

    } catch (err: any) {
        setApiError(err.message || 'Failed to get feedback. Please try again.');
        console.error(err);
    } finally {
        setIsLoading(false);
    }
  };
  
  const handleSaveWord = async (wordData: VocabularyWord) => {
    try {
        await saveWord(userId, wordData);
        setVocabularyList(prev => prev.filter(w => w.word !== wordData.word));
        onPracticeComplete(0, true);
    } catch(err) {
        console.error("Failed to save word:", err);
        setApiError("Could not save the word. Please try again.");
    }
  }

  const handleTryAgain = () => {
      setFeedback(null);
      setVocabularyList([]);
      setApiError(null);
      setTimeLeft(null);
  }

  const handleStartRecording = () => {
    if (selectedDuration) {
      setTimeLeft(selectedDuration);
    } else {
      setTimeLeft(null);
    }
    startRecording();
  };
  
  const handleModeChange = (mode: 'ai' | 'custom') => {
    if (status === 'recording' || isLoading) return;
    
    setFeedback(null);
    setVocabularyList([]);
    setApiError(null);
    
    setPromptMode(mode);

    if (mode === 'custom') {
        setPrompt('');
    }
  };

  const handleCustomPromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPrompt(e.target.value);
    if (feedback) setFeedback(null);
    if (vocabularyList.length > 0) setVocabularyList([]);
  };

  const formatTime = (seconds: number): string => {
    if (isNaN(seconds) || seconds < 0) return '00:00';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const DURATION_OPTIONS = [
    { label: '3 min', value: 180 },
    { label: '7 min', value: 420 },
    { label: '15 min', value: 900 },
    { label: 'No Limit', value: null },
  ];

  const PROMPT_MODE_OPTIONS = [
    { label: 'AI Prompt', value: 'ai' },
    { label: 'My Topic', value: 'custom' },
  ];

  const renderContent = () => {
    if (isLoading === 'feedback') {
        return (
            <div className="text-center p-8 space-y-4">
                <Spinner />
                <p className="text-slate-500 dark:text-slate-400">Analyzing your speech... This might take a moment.</p>
            </div>
        );
    }
    
    if (feedback) {
        return (
            <div className="space-y-6 animate-fade-in">
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-lg">
                    <h3 className="text-xl font-bold mb-4 text-slate-800 dark:text-slate-100">Your Score</h3>
                    <div className="flex items-center justify-center space-x-4">
                        <div className={`text-6xl font-bold ${feedback.overallScore > 70 ? 'text-green-500' : feedback.overallScore > 40 ? 'text-amber-500' : 'text-red-500'}`}>
                            {feedback.overallScore}
                        </div>
                        <div className="text-left">
                            <h4 className="font-semibold text-slate-700 dark:text-slate-200">Overall Feedback</h4>
                            <p className="text-slate-500 dark:text-slate-400">{feedback.overallFeedback}</p>
                        </div>
                    </div>
                </div>
                
                {feedback.wordsToPractice.length > 0 && (
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-lg">
                    <h3 className="text-xl font-bold mb-4 text-slate-800 dark:text-slate-100">Words to Practice</h3>
                    <ul className="space-y-3">
                        {feedback.wordsToPractice.map(item => (
                            <li key={item.word}>
                                <strong className="text-slate-700 dark:text-slate-200">{item.word}</strong>: <span className="text-slate-500 dark:text-slate-400">{item.feedback}</span>
                            </li>
                        ))}
                    </ul>
                </div>
                )}

                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-lg">
                    <h3 className="text-xl font-bold mb-4 text-slate-800 dark:text-slate-100">Detailed Analysis</h3>
                    <div className="space-y-2">
                        <p><strong className="text-slate-700 dark:text-slate-200">Fluency:</strong> {feedback.fluencyFeedback}</p>
                        <p><strong className="text-slate-700 dark:text-slate-200">Intonation:</strong> {feedback.intonationFeedback}</p>
                    </div>
                </div>
                
                {vocabularyList.length > 0 && (
                <div className="p-6 rounded-2xl">
                    <h3 className="text-2xl text-center font-bold mb-6 text-slate-800 dark:text-slate-100">Vocabulary from Your Speech</h3>
                     <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {vocabularyList.map((word, index) => (
                           <div key={index} className="relative group">
                             <VocabularyCard wordData={word} />
                             <Button
                                onClick={() => handleSaveWord(word)}
                                className="absolute -bottom-4 left-1/2 -translate-x-1/2 z-20 opacity-0 group-hover:opacity-100 transition-opacity !px-4 !py-2 text-sm"
                             >
                                Save Word
                             </Button>
                           </div>
                        ))}
                     </div>
                </div>
                )}
                 <div className="text-center pt-4">
                    <Button onClick={handleTryAgain} variant="secondary">Try Again</Button>
                </div>
            </div>
        );
    }
    
    return (
        <div className="text-center">
            <h3 className="text-2xl font-semibold mb-6 text-slate-800 dark:text-slate-100">{prompt}</h3>
            
            {status === 'recording' && (
                <div className="my-6 p-4 bg-slate-100 dark:bg-slate-700/50 rounded-lg min-h-[6rem] text-left animate-fade-in">
                    <p className="text-slate-700 dark:text-slate-200 italic">{transcript || 'Listening...'}</p>
                </div>
            )}

            {status === 'idle' && <Button onClick={handleStartRecording} disabled={!!speechError || !prompt.trim()}>Start Recording</Button>}
            {status === 'recording' && <Button onClick={stopRecording} variant="secondary">Stop Recording</Button>}
            {status === 'stopped' && audioBlob && <Button onClick={handleGetFeedback}>Get Feedback</Button>}
            
            {status === 'recording' && (
                <div className="mt-4 flex items-center justify-center space-x-4">
                    <div className="flex items-center space-x-2 text-red-500">
                        <span className="relative flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                        </span>
                        <span>Recording...</span>
                    </div>
                    {selectedDuration !== null && timeLeft !== null && (
                      <div className="font-mono text-lg text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-700 px-3 py-1 rounded-md">
                          {formatTime(timeLeft)}
                      </div>
                    )}
                </div>
            )}
        </div>
    );
  };

  return (
    <div className="animate-fade-in">
      <div className="flex items-center space-x-4 mb-6">
        <div className="p-3 bg-sky-100 dark:bg-sky-900/50 rounded-full text-sky-500">
          {ICONS.SPEAKING}
        </div>
        <div>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Spoken English Practice</h2>
          <p className="text-slate-500 dark:text-slate-400">Record your response and get instant feedback.</p>
        </div>
      </div>
      
      <div className="flex justify-center mb-6">
        <DifficultySelector currentLevel={difficulty} onSelectLevel={onUpdateDifficulty} disabled={isLoading !== false || status === 'recording'} />
      </div>

       <div className="flex flex-col items-center gap-2 mb-6">
          <h4 className="text-sm font-medium text-slate-500 dark:text-slate-400">Choose a topic source</h4>
          <div className="inline-flex rounded-full shadow-sm bg-slate-100 dark:bg-slate-700 p-1" role="group">
            {PROMPT_MODE_OPTIONS.map(({ label, value }) => (
              <button
                key={value}
                type="button"
                onClick={() => handleModeChange(value as 'ai' | 'custom')}
                disabled={isLoading !== false || status === 'recording'}
                className={`px-4 sm:px-5 py-2 text-sm font-semibold rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900 disabled:opacity-60
                  ${promptMode === value
                    ? 'bg-white dark:bg-slate-800 text-sky-600 dark:text-sky-400 shadow'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'}`}
              >
                {label}
              </button>
            ))}
          </div>
       </div>

      {promptMode === 'ai' ? (
        <div className="text-center mb-8">
            <Button onClick={fetchPrompt} disabled={isLoading !== false || status === 'recording'} variant="secondary">
            {isLoading === 'prompt' ? 'Generating...' : 'New Prompt'}
            </Button>
        </div>
      ) : (
        <div className="mb-8 animate-fade-in">
            <textarea
            rows={3}
            className="w-full p-4 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-900 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition"
            placeholder="Type your topic here... e.g., 'A meeting to introduce a new app.'"
            value={prompt}
            onChange={handleCustomPromptChange}
            disabled={isLoading !== false || status === 'recording'}
            />
        </div>
      )}

      {isLoading === 'prompt' && <div className="flex justify-center p-8"><Spinner /></div>}
      {(apiError || speechError) && <p className="text-red-500 text-center mb-4 p-3 bg-red-100 dark:bg-red-900/50 rounded-lg">{apiError || speechError}</p>}
      
      {!prompt && !isLoading && !apiError && !speechError && (
        <div className="text-center bg-white dark:bg-slate-800 p-12 rounded-2xl shadow-lg">
          <div className="text-5xl text-slate-400 dark:text-slate-500 mb-4">
            {ICONS.SPEAKING}
          </div>
          <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2">Ready to Practice?</h3>
          <p className="text-slate-500 dark:text-slate-400">
            {promptMode === 'ai' ? 'Click the "New Prompt" button to get started.' : 'Type your topic above to begin.'}
          </p>
        </div>
      )}
      
      {prompt && !isLoading && !apiError && (
        <>
            <div className="flex flex-col items-center gap-2 mb-6 animate-fade-in">
              <h4 className="text-sm font-medium text-slate-500 dark:text-slate-400">Set a time limit (optional)</h4>
              <div className="inline-flex rounded-full shadow-sm bg-slate-100 dark:bg-slate-700 p-1" role="group">
                {DURATION_OPTIONS.map(({ label, value }) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => setSelectedDuration(value)}
                    disabled={status === 'recording'}
                    className={`px-4 sm:px-5 py-2 text-sm font-semibold rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900 disabled:opacity-60
                      ${selectedDuration === value
                        ? 'bg-white dark:bg-slate-800 text-sky-600 dark:text-sky-400 shadow'
                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'}`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
            <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-lg">
              {renderContent()}
            </div>
        </>
      )}
    </div>
  );
};

export default SpeakingPractice;
