import { CheckCircle, Circle } from 'lucide-react';

interface ProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
  gestureName: string;
}

export function ProgressIndicator({
  currentStep,
  totalSteps,
  gestureName,
}: ProgressIndicatorProps) {
  const progress = (currentStep / totalSteps) * 100;

  return (
    <div className="bg-slate-900/20 backdrop-blur-sm rounded-lg p-2.5 border border-white/10">
      <div className="flex items-center justify-between mb-1.5">
        <h3 className="text-xs font-medium text-white/90">{gestureName}</h3>
        <span className="text-xs font-medium text-white/80">
          {currentStep} / {totalSteps}
        </span>
      </div>

      <div className="w-full bg-white/10 rounded-full h-1.5 mb-2 overflow-hidden">
        <div
          className="bg-gradient-to-r from-blue-400 to-blue-500 h-full rounded-full transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="flex items-center gap-1.5 flex-wrap">
        {Array.from({ length: totalSteps }).map((_, index) => (
          <div
            key={index}
            className="flex items-center"
          >
            {index + 1 < currentStep ? (
              <CheckCircle className="w-3.5 h-3.5 text-green-400" />
            ) : index + 1 === currentStep ? (
              <Circle className="w-3.5 h-3.5 text-blue-400 fill-blue-400 animate-pulse" />
            ) : (
              <Circle className="w-3.5 h-3.5 text-white/20" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
