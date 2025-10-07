import { useState, useRef, useEffect } from 'react';
import { Upload, Play, Pause, RotateCcw, Video } from 'lucide-react';
import { useMediaPipeHands } from './hooks/useMediaPipeHands';
import { ProgressIndicator } from './components/ProgressIndicator';
import { MatchIndicator } from './components/MatchIndicator';
import { CompletionMessage } from './components/CompletionMessage';
import { GestureFile } from './types/gesture';
import { compareWithFrame } from './utils/gestureComparison';

function App() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [gestureData, setGestureData] = useState<GestureFile | null>(null);
  const [currentFrameIndex, setCurrentFrameIndex] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [similarity, setSimilarity] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [matchHoldTime, setMatchHoldTime] = useState(0);
  const [matchThreshold, setMatchThreshold] = useState(75);

  const { isLoaded, currentHands } = useMediaPipeHands(videoRef, canvasRef);

  const HOLD_DURATION = 1500;

  useEffect(() => {
    if (!isActive || !gestureData || !currentHands) {
      setSimilarity(0);
      setMatchHoldTime(0);
      return;
    }

    const currentFrame = gestureData.gesture.frames[currentFrameIndex];
    
    // Crear objeto compatible con la nueva interfaz CurrentHandsData
    const currentHandsData = {
      landmarks: currentHands.landmarks,
      handedness: currentHands.handedness,
      landmarksNormalizados: currentHands.landmarksNormalizados
    };
    
    const comparison = compareWithFrame(currentHandsData, currentFrame, matchThreshold);

    setSimilarity(comparison.similarity);

    if (comparison.isMatch) {
      setMatchHoldTime((prev) => prev + 100);
    } else {
      setMatchHoldTime(0);
    }
  }, [currentHands, isActive, gestureData, currentFrameIndex, matchThreshold]);

  useEffect(() => {
    if (matchHoldTime >= HOLD_DURATION && gestureData) {
      const nextIndex = currentFrameIndex + 1;

      if (nextIndex >= gestureData.gesture.frames.length) {
        setIsCompleted(true);
        setIsActive(false);
      } else {
        setCurrentFrameIndex(nextIndex);
        setMatchHoldTime(0);
        setSimilarity(0);
      }
    }
  }, [matchHoldTime, currentFrameIndex, gestureData]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target?.result as string);
        setGestureData(json);
        setCurrentFrameIndex(0);
        setIsActive(false);
        setIsCompleted(false);
        setSimilarity(0);
        setMatchHoldTime(0);
      } catch {
        alert('Error al cargar el archivo JSON. Por favor verifica el formato.');
      }
    };
    reader.readAsText(file);
  };

  const handleRestart = () => {
    setCurrentFrameIndex(0);
    setIsActive(false);
    setIsCompleted(false);
    setSimilarity(0);
    setMatchHoldTime(0);
  };

  const toggleActive = () => {
    if (gestureData) {
      setIsActive(!isActive);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-slate-200 to-slate-300 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold text-slate-800 mb-2 flex items-center justify-center gap-3">
            <Video className="w-10 h-10 text-blue-600" />
            Aprendizaje de Gestos con IA
          </h1>
          <p className="text-slate-600">
            Carga un archivo JSON y practica los gestos siguiendo las instrucciones
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-xl p-4 border-2 border-slate-200">
              <div className="relative aspect-video bg-slate-900 rounded-lg overflow-hidden">
                <video
                  ref={videoRef}
                  className="absolute inset-0 w-full h-full hidden"
                  playsInline
                />
                <canvas
                  ref={canvasRef}
                  width={640}
                  height={480}
                  className="absolute inset-0 w-full h-full object-cover"
                />

                {!isLoaded && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-white text-center">
                      <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                      <p className="text-sm">Cargando MediaPipe...</p>
                    </div>
                  </div>
                )}

                {isLoaded && !gestureData && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-white text-center bg-black/50 backdrop-blur-sm p-6 rounded-lg">
                      <Upload className="w-12 h-12 mx-auto mb-3" />
                      <p className="text-lg font-semibold">
                        Carga un archivo JSON para comenzar
                      </p>
                    </div>
                  </div>
                )}

                <div className="absolute top-4 left-4 right-4 flex flex-col gap-3">
                  {gestureData && isActive && (
                    <>
                      <ProgressIndicator
                        currentStep={currentFrameIndex + 1}
                        totalSteps={gestureData.gesture.frames.length}
                        gestureName={gestureData.gesture.name}
                      />
                      <MatchIndicator
                        similarity={similarity}
                        threshold={matchThreshold}
                        isMatch={matchHoldTime > 0}
                      />
                    </>
                  )}
                </div>

                {gestureData && isActive && matchHoldTime > 0 && (
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
                    <div className="bg-white/95 backdrop-blur-sm rounded-full px-4 py-2 shadow-lg">
                      <div className="flex items-center gap-2">
                        <div className="w-32 h-2 bg-slate-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-green-400 to-green-600 transition-all duration-100"
                            style={{ width: `${(matchHoldTime / HOLD_DURATION) * 100}%` }}
                          />
                        </div>
                        <span className="text-xs font-semibold text-slate-700">
                          {((matchHoldTime / HOLD_DURATION) * 100).toFixed(0)}%
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-white rounded-xl shadow-xl p-6 border-2 border-slate-200">
              <h2 className="text-xl font-bold text-slate-800 mb-4">Controles</h2>

              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleFileUpload}
                className="hidden"
              />

              

              {gestureData && (
                <>
                  <button
                    onClick={toggleActive}
                    disabled={!isLoaded}
                    className={`w-full font-semibold py-3 px-4 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center gap-2 mb-3 ${
                      isActive
                        ? 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white'
                        : 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {isActive ? (
                      <>
                        <Pause className="w-5 h-5" />
                        Pausar
                      </>
                    ) : (
                      <>
                        <Play className="w-5 h-5" />
                        Iniciar
                      </>
                    )}
                  </button>

                  <button
                    onClick={handleRestart}
                    className="w-full bg-gradient-to-r from-slate-500 to-slate-600 hover:from-slate-600 hover:to-slate-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                  >
                    <RotateCcw className="w-5 h-5" />
                    
                  </button>
                </>
              )}
            </div>

            {gestureData && (
              <div className="bg-white rounded-xl shadow-xl p-6 border-2 border-slate-200">
                <h2 className="text-xl font-bold text-slate-800 mb-4">
                  Información del Gesto
                </h2>

                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-slate-600">Nombre</p>
                    <p className="font-semibold text-slate-800">
                      {gestureData.gesture.name}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-slate-600">Total de Pasos</p>
                    <p className="font-semibold text-slate-800">
                      {gestureData.gesture.frames.length}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-slate-600">Versión</p>
                    <p className="font-semibold text-slate-800">
                      {gestureData.version}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-slate-600">Precisión del Modelo</p>
                    <div className="mt-2">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-slate-500">Tolerante</span>
                        <span className="text-lg font-bold text-blue-600">{matchThreshold}%</span>
                        <span className="text-xs text-slate-500">Estricto</span>
                      </div>
                      <input
                        type="range"
                        min="50"
                        max="95"
                        step="5"
                        value={matchThreshold}
                        onChange={(e) => setMatchThreshold(Number(e.target.value))}
                        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer slider"
                      />
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-slate-600">Tiempo de Espera</p>
                    <p className="font-semibold text-slate-800">
                      {(HOLD_DURATION / 1000).toFixed(1)}s
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {isCompleted && gestureData && (
        <CompletionMessage
          gestureName={gestureData.gesture.name}
          onRestart={handleRestart}
        />
      )}
    </div>
  );
}

export default App;
