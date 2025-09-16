import React from 'react';
import Button from './Button';

interface MilestoneCelebrationProps {
  milestone: number;
  onClose: () => void;
}

const CONFETTI_COUNT = 100;

const Confetti: React.FC = () => {
  const colors = ['#fde047', '#f97316', '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899'];
  
  const confettiPieces = Array.from({ length: CONFETTI_COUNT }).map((_, i) => {
    const style = {
      left: `${Math.random() * 100}vw`,
      animationDelay: `${Math.random() * 5}s`,
      animationDuration: `${2 + Math.random() * 3}s`,
      backgroundColor: colors[Math.floor(Math.random() * colors.length)],
      transform: `rotate(${Math.random() * 360}deg)`,
    };
    return <div key={i} className="confetti" style={style} />;
  });

  return <div className="absolute inset-0 overflow-hidden pointer-events-none">{confettiPieces}</div>;
};

const MilestoneCelebration: React.FC<MilestoneCelebrationProps> = ({ milestone, onClose }) => {
  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] animate-fade-in"
      aria-labelledby="milestone-title"
      role="dialog"
      aria-modal="true"
    >
      <Confetti />
      <div 
        className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-8 max-w-lg w-full text-center transform scale-95 animate-modal-pop"
        role="document"
      >
        <div className="mx-auto mb-4 w-24 h-24 flex items-center justify-center rounded-full bg-gradient-to-br from-amber-300 to-orange-500 text-white shadow-lg">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.934l.643-.661a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.934l.643-.661a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.934l.643-.661a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.934l-.322 1.684a1 1 0 00.933 1.155.76.76 0 00.107-.013l.31-.052a1 1 0 00.822-.934c.345-.23.614-.558.822-.934l-.643.661a1 1 0 001.45.385c.345-.23.614-.558.822-.934l-.643.661a1 1 0 001.45.385c.345-.23.614-.558.822-.934l-.643.661a1 1 0 001.45.385c.345-.23.614-.558.822-.934l.322-1.684a1 1 0 00-.933-1.155.76.76 0 00-.107.013l-.31.052a1 1 0 00-.822.934c-.345.23-.614-.558-.822.934l.643-.661z" clipRule="evenodd" />
            <path d="M7 10a1 1 0 011-1h4a1 1 0 110 2H8a1 1 0 01-1-1z" /><path d="M6 12a1 1 0 011-1h2a1 1 0 110 2H7a1 1 0 01-1-1z" /><path fillRule="evenodd" d="M10 2a8 8 0 100 16 8 8 0 000-16zM3 10a7 7 0 1114 0 7 7 0 01-14 0z" clipRule="evenodd" />
          </svg>
        </div>
        <h2 id="milestone-title" className="text-3xl font-bold text-slate-800 dark:text-white mb-2">Congratulations!</h2>
        <p className="text-slate-500 dark:text-slate-300 text-lg mb-6">
          You've reached a <span className="font-bold text-sky-500 dark:text-sky-400">{milestone}-day</span> streak! Your dedication is amazing. Keep the flame alive!
        </p>
        <Button onClick={onClose}>
          Keep Learning
        </Button>
      </div>
    </div>
  );
};

export default MilestoneCelebration;