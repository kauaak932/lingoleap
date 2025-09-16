import React from 'react';

interface CardProps {
  title: string;
  description: string;
  color: string;
  // Fix: Replaced JSX.Element with React.ReactElement to resolve namespace issue.
  icon: React.ReactElement;
  onClick: () => void;
}

const Card: React.FC<CardProps> = ({ title, description, color, icon, onClick }) => {
  return (
    <div
      onClick={onClick}
      className={`relative p-8 rounded-2xl cursor-pointer group transform hover:scale-105 transition-transform duration-300 overflow-hidden bg-gradient-to-br ${color}`}
    >
      <div className="absolute -top-4 -right-4 text-white/10 text-9xl group-hover:scale-125 transition-transform duration-500">
        {icon}
      </div>
      <div className="relative z-10">
        <div className="mb-4 text-white">{icon}</div>
        <h3 className="text-2xl font-bold text-white mb-2">{title}</h3>
        <p className="text-white/80">{description}</p>
      </div>
    </div>
  );
};

export default Card;