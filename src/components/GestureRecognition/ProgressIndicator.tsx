import React from 'react';

interface ProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
  gestureName: string;
}

export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  currentStep,
  totalSteps,
  gestureName
}) => {
  return (
    <div className="bg-white/95 backdrop-blur-md rounded-2xl px-5 py-3 shadow-xl border border-blue-100">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-bold text-slate-800">{gestureName}</span>
        <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
          {currentStep} / {totalSteps}
        </span>
      </div>
      <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-blue-500 via-blue-600 to-cyan-500 transition-all duration-500 ease-out rounded-full"
          style={{ width: `${(currentStep / totalSteps) * 100}%` }}
        />
      </div>
    </div>
  );
};
