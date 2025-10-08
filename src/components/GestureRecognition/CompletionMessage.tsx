import { Trophy, PartyPopper, CheckCircle, RotateCcw } from 'lucide-react';

interface CompletionMessageProps {
  gestureName: string;
  onRestart: () => void;
  onComplete: () => void;
}

export function CompletionMessage({ gestureName, onRestart, onComplete }: CompletionMessageProps) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-white to-slate-50 rounded-2xl shadow-2xl p-8 max-w-md w-full border-2 border-slate-200 animate-scale-in">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-full mb-4 animate-bounce">
            <Trophy className="w-10 h-10 text-white" />
          </div>

          <div className="flex items-center justify-center gap-2 mb-2">
            <PartyPopper className="w-6 h-6 text-yellow-500 animate-pulse" />
            <h2 className="text-3xl font-bold text-slate-800">
              ¡Felicitaciones!
            </h2>
            <PartyPopper className="w-6 h-6 text-yellow-500 animate-pulse" />
          </div>

          <p className="text-lg text-slate-600 mb-6">
            Has completado con éxito todos los gestos de
          </p>

          <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-lg mb-6 shadow-lg">
            <p className="text-xl font-bold">{gestureName}</p>
          </div>

          <div className="flex items-center justify-center gap-2 mb-6 text-green-600">
            <CheckCircle className="w-5 h-5" />
            <span className="font-semibold">Aprendizaje completado</span>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={onComplete}
              className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
            >
              <CheckCircle className="w-5 h-5" />
              Continuar
            </button>
            
            <button
              onClick={onRestart}
              className="flex-1 bg-gradient-to-r from-slate-700 to-slate-900 hover:from-slate-800 hover:to-black text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-5 h-5" />
              Practicar de Nuevo
            </button>
          </div>

          <p className="text-xs text-slate-500 mt-4">
            Continúa practicando para mejorar tu precisión
          </p>
        </div>
      </div>
    </div>
  );
}
