import React from 'react';
import { Check, Target } from 'lucide-react';

interface MatchIndicatorProps {
  similarity: number;
  threshold: number;
  isMatch: boolean;
}

export const MatchIndicator: React.FC<MatchIndicatorProps> = ({
  similarity,
  threshold,
  isMatch
}) => {
  return (
    <div className={`bg-white rounded-2xl px-6 py-4 border-2 border-b-8 transition-all duration-300 ${
      isMatch ? 'border-duo-green' : 'border-duo-gray'
    }`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {isMatch ? (
            <div className="w-10 h-10 rounded-xl bg-duo-green flex items-center justify-center border-b-2 border-duo-green-dark">
              <Check className="w-6 h-6 text-white" strokeWidth={4} />
            </div>
          ) : (
            <div className="w-10 h-10 rounded-xl bg-duo-background-soft flex items-center justify-center border-b-2 border-duo-gray">
              <Target className="w-6 h-6 text-duo-gray-dark" />
            </div>
          )}
          <span className="text-sm font-black text-duo-text uppercase tracking-tight">Precisión</span>
        </div>
        <div className="text-right">
          <div className={`text-3xl font-black leading-none ${
            isMatch ? 'text-duo-green' : similarity >= threshold - 10 ? 'text-duo-yellow-dark' : 'text-duo-text'
          }`}>
            {similarity.toFixed(0)}%
          </div>
          <div className="text-[10px] font-black text-duo-gray-dark uppercase tracking-widest mt-1">META: {threshold}%</div>
        </div>
      </div>
    </div>
  );
};
