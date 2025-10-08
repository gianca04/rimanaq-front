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
    <div className={`bg-white/95 backdrop-blur-md rounded-2xl px-5 py-3 shadow-xl border-2 transition-all duration-300 ${
      isMatch ? 'border-emerald-400 bg-emerald-50/80' : 'border-slate-200'
    }`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isMatch ? (
            <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center animate-pulse">
              <Check className="w-5 h-5 text-white" />
            </div>
          ) : (
            <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center">
              <Target className="w-5 h-5 text-slate-600" />
            </div>
          )}
          <span className="text-sm font-semibold text-slate-700">Precisión</span>
        </div>
        <div className="text-right">
          <div className={`text-2xl font-bold ${
            isMatch ? 'text-emerald-600' : similarity >= threshold - 10 ? 'text-amber-600' : 'text-slate-700'
          }`}>
            {similarity.toFixed(0)}%
          </div>
          <div className="text-xs text-slate-500">Meta: {threshold}%</div>
        </div>
      </div>
    </div>
  );
};
