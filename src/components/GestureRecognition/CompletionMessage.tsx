import { Trophy, PartyPopper, CheckCircle, RotateCcw } from 'lucide-react';

interface CompletionMessageProps {
  gestureName: string;
  onRestart: () => void;
  onComplete: () => void;
}

export function CompletionMessage({ gestureName, onRestart, onComplete }: CompletionMessageProps) {
  return (
    <div className="fixed inset-0 bg-duo-text/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl p-8 max-w-md w-full border-b-8 border-duo-gray animate-scale-in">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-duo-yellow rounded-3xl mb-6 shadow-lg border-b-4 border-duo-yellow-dark">
            <Trophy className="w-12 h-12 text-white" />
          </div>

          <div className="flex items-center justify-center gap-2 mb-4">
            <h2 className="text-4xl font-black text-duo-text uppercase tracking-tight">
              ¡GENIAL!
            </h2>
          </div>

          <p className="text-xl text-duo-gray-dark font-bold italic mb-6">
            Has dominado perfectamente la seña:
          </p>

          <div className="bg-duo-blue text-white px-6 py-4 rounded-2xl mb-8 border-b-4 border-duo-blue-dark">
            <p className="text-2xl font-black uppercase tracking-tight">{gestureName}</p>
          </div>

          <div className="flex flex-col gap-4">
            <button
              onClick={onComplete}
              className="btn-duo-green w-full text-lg"
            >
              <div className="flex items-center justify-center gap-2">
                <CheckCircle className="w-6 h-6" strokeWidth={3} />
                <span>CONTINUAR</span>
              </div>
            </button>
            
            <button
              onClick={onRestart}
              className="btn-duo-white w-full text-lg"
            >
              <div className="flex items-center justify-center gap-2">
                <RotateCcw className="w-6 h-6" />
                <span>PRACTICAR DE NUEVO</span>
              </div>
            </button>
          </div>

          <p className="text-xs font-black text-duo-gray-dark uppercase tracking-widest mt-8">
            ¡Sigue así para ser un experto!
          </p>
        </div>
      </div>
    </div>
  );
}
