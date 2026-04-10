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
    <div className="bg-white rounded-2xl px-6 py-4 border-2 border-b-8 border-duo-gray">
      <div className="flex items-center justify-between mb-3">
        <span className="text-base font-black text-duo-text uppercase tracking-tight">{gestureName}</span>
        <span className="text-xs font-black text-duo-blue bg-duo-blue/10 px-4 py-1.5 rounded-xl border border-duo-blue/20 uppercase">
          Pasos: {currentStep} / {totalSteps}
        </span>
      </div>
      <div className="w-full h-4 bg-duo-gray rounded-full overflow-hidden border-2 border-duo-gray">
        <div
          className="h-full bg-duo-blue transition-all duration-700 ease-out rounded-full"
          style={{ width: `${(currentStep / totalSteps) * 100}%` }}
        />
      </div>
    </div>
  );
};
