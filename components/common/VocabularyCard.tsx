
import React, { useState } from 'react';
import { VocabularyWord } from '../../types';

interface VocabularyCardProps {
  wordData: VocabularyWord;
  onDelete?: () => void;
}

const VocabularyCard: React.FC<VocabularyCardProps> = ({ wordData, onDelete }) => {
  const [isFlipped, setIsFlipped] = useState(false);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };
  
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card from flipping when delete is clicked
    if (onDelete) {
      onDelete();
    }
  };

  return (
    <div
      className="relative w-full h-96 cursor-pointer group [perspective:1000px]"
      onClick={handleFlip}
      aria-live="polite"
      role="button"
      tabIndex={0}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && handleFlip()}
    >
      {onDelete && (
        <button 
          onClick={handleDelete}
          className="absolute top-3 right-3 z-30 p-1.5 rounded-full bg-white/20 dark:bg-black/20 backdrop-blur-sm hover:bg-red-500/80 text-white transition-all duration-300 opacity-0 group-hover:opacity-100 focus:opacity-100"
          aria-label="Delete word"
        >
            <svg xmlns="http://www.w.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
        </button>
      )}

      <div
        className={`relative w-full h-full rounded-xl shadow-lg transition-all duration-700 ease-in-out [transform-style:preserve-3d] group-hover:shadow-2xl group-hover:shadow-sky-500/20 dark:group-hover:shadow-sky-400/10 ${
          isFlipped ? '[transform:rotateY(180deg)]' : 'group-hover:[transform:rotateX(7deg)_rotateY(-15deg)]'
        }`}
      >
        {/* Card Front */}
        <div className="absolute w-full h-full bg-gradient-to-br from-white to-slate-100 dark:from-slate-900 dark:to-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl flex flex-col items-center justify-center p-4 [backface-visibility:hidden]">
          <h4 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-sky-500 to-cyan-400 text-center break-all">
            {wordData.word}
          </h4>
          <div className="absolute bottom-3 right-4 text-slate-300 dark:text-slate-600 opacity-50 group-hover:opacity-100 transition-opacity duration-300" aria-hidden="true">
             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0011.664 0l3.181-3.183m-4.991-2.696a8.25 8.25 0 00-11.664 0l-3.181 3.183" />
            </svg>
          </div>
        </div>

        {/* Card Back */}
        <div className="absolute w-full h-full bg-gradient-to-br from-slate-50 to-slate-200 dark:from-slate-800 dark:to-slate-700/80 border border-slate-200 dark:border-slate-700 rounded-xl p-4 overflow-y-auto [transform:rotateY(180deg)] [backface-visibility:hidden]">
          <div className="space-y-3 text-sm">
             <div>
                <strong className="font-semibold text-slate-800 dark:text-slate-100">বাংলা অর্থ</strong>
                <p className="text-lg text-sky-600 dark:text-sky-400">{wordData.banglaMeaning}</p>
             </div>
             <hr className="border-slate-200 dark:border-slate-600" />
             <div>
                <strong className="font-semibold text-slate-800 dark:text-slate-100 block mb-1">Example Sentence</strong>
                <p className="italic text-slate-600 dark:text-slate-300">"{wordData.exampleSentence}"</p>
             </div>
             <div>
                <strong className="font-semibold text-slate-800 dark:text-slate-100 block mb-1">When to Use</strong>
                <p className="text-slate-600 dark:text-slate-300">{wordData.usageContext}</p>
             </div>
             <div>
                <strong className="font-semibold text-slate-800 dark:text-slate-100 block mb-1.5">Synonyms</strong>
                <div className="flex flex-wrap gap-1.5">
                    {wordData.synonyms.map(s => (
                        <span key={s} className="inline-block bg-slate-200 dark:bg-slate-600/50 rounded-full px-2.5 py-1 text-xs font-medium text-slate-700 dark:text-slate-200">
                            {s}
                        </span>
                    ))}
                </div>
             </div>
             <div>
                <strong className="font-semibold text-slate-800 dark:text-slate-100 block mb-1.5">Antonyms</strong>
                <div className="flex flex-wrap gap-1.5">
                    {wordData.antonyms.map(a => (
                        <span key={a} className="inline-block bg-slate-200 dark:bg-slate-600/50 rounded-full px-2.5 py-1 text-xs font-medium text-slate-700 dark:text-slate-200">
                            {a}
                        </span>
                    ))}
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VocabularyCard;