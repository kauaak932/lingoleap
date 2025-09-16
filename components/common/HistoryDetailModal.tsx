
import React from 'react';
import { PracticeSession, PronunciationFeedback } from '../../types';
import Button from './Button';

interface HistoryDetailModalProps {
  session: PracticeSession;
  onClose: () => void;
}

const HistoryDetailModal: React.FC<HistoryDetailModalProps> = ({ session, onClose }) => {
    
  const renderSpeakingDetails = () => {
    const feedback = session.feedback as PronunciationFeedback;
    return (
        <div className="space-y-4">
            <div>
                <h4 className="font-semibold text-slate-600 dark:text-slate-400">Prompt</h4>
                <p className="p-3 bg-slate-100 dark:bg-slate-700/50 rounded-lg">{session.prompt}</p>
            </div>
             <div>
                <h4 className="font-semibold text-slate-600 dark:text-slate-400">Your Response (Transcript)</h4>
                <p className="p-3 bg-slate-100 dark:bg-slate-700/50 rounded-lg">{session.userResponse}</p>
            </div>
            {feedback && (
                <div>
                    <h4 className="font-semibold text-slate-600 dark:text-slate-400">AI Feedback</h4>
                    <div className="p-3 bg-slate-100 dark:bg-slate-700/50 rounded-lg space-y-2">
                        <p><strong>Overall:</strong> {feedback.overallFeedback}</p>
                        <p><strong>Fluency:</strong> {feedback.fluencyFeedback}</p>
                        <p><strong>Intonation:</strong> {feedback.intonationFeedback}</p>
                        {feedback.wordsToPractice?.length > 0 && (
                            <div>
                                <strong>Words to practice:</strong>
                                <ul className="list-disc list-inside">
                                    {feedback.wordsToPractice.map(w => <li key={w.word}>{w.word}</li>)}
                                </ul>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
  }

  const renderContent = () => {
      switch(session.mode) {
          case 'speaking':
              return renderSpeakingDetails();
          // Add cases for other modes like 'writing', 'grammar' etc.
          default:
              return <p>Details for this session type are not available yet.</p>
      }
  }

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-8 max-w-2xl w-full text-left transform scale-95 animate-modal-pop max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
        role="document"
      >
        <div className="flex justify-between items-start mb-4">
            <div>
                 <h3 className="text-2xl font-bold text-slate-900 dark:text-white capitalize">{session.mode} Session Details</h3>
                 <p className="text-sm text-slate-500 dark:text-slate-400">{session.createdAt?.toDate().toLocaleString()}</p>
            </div>
            <button onClick={onClose} className="p-1 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        </div>
        {renderContent()}
        <div className="mt-6 text-right">
            <Button onClick={onClose} variant="secondary">Close</Button>
        </div>
      </div>
    </div>
  );
};

export default HistoryDetailModal;
