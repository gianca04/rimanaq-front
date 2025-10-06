import { getSimilarityBgColor } from '../utils/gestureComparison';

interface MatchIndicatorProps {
  similarity: number;
  threshold: number;
  isMatch: boolean;
}

export function MatchIndicator({ similarity, threshold, isMatch }: MatchIndicatorProps) {
  const bgColorClass = getSimilarityBgColor(similarity);

  return (
    <div className="bg-slate-900/20 backdrop-blur-sm rounded-lg p-2.5 border border-white/10">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs font-medium text-white/80">Precisión</span>
        <span className="text-sm font-bold text-white">
          {similarity.toFixed(1)}%
        </span>
      </div>

      <div className="relative">
        <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
          <div
            className={`${bgColorClass} h-full rounded-full transition-all duration-300 ease-out`}
            style={{ width: `${Math.min(similarity, 100)}%` }}
          />
        </div>

        <div
          className="absolute top-1/2 -translate-y-1/2 w-0.5 h-3 bg-white/60 rounded-full"
          style={{ left: `${threshold}%` }}
        >
          <div
            className="absolute left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] font-medium text-white/70"
            style={{ top: '-16px' }}
          >
            {threshold}%
          </div>
        </div>
      </div>

      {isMatch && (
        <div className="mt-1.5 text-center">
          <span className="inline-block px-2 py-0.5 bg-green-400/20 text-green-300 text-[10px] font-semibold rounded-full border border-green-400/30 animate-pulse">
            ¡Correcto!
          </span>
        </div>
      )}
    </div>
  );
}
