import React, { useState, useRef, useEffect } from 'react';
import { Upload, Play, Pause, RotateCcw, Video, Check, Hand } from 'lucide-react';
import { useMediaPipeHands } from '../../hooks/GestureRecognition/useMediaPipeHands';
import { ProgressIndicator } from './ProgressIndicator';
import { MatchIndicator } from './MatchIndicator';
import { CompletionMessage } from './CompletionMessage';
import { GestureData } from '../../types/GestureRecognition/gesture';
import { compareWithFrame } from '../../utils/GestureRecognition/gestureComparison';
import { Gesture } from '../../types';

interface GesturePracticeProps {
  gestures?: Gesture[] | null;
  onComplete?: () => void;
  className?: string;
}

const GesturePractice: React.FC<GesturePracticeProps> = ({
  gestures,
  onComplete,
  className = ''
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [gestureData, setGestureData] = useState<GestureData | null>(null);
  const [currentFrameIndex, setCurrentFrameIndex] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [similarity, setSimilarity] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [matchHoldTime, setMatchHoldTime] = useState(0);
  const [matchThreshold, setMatchThreshold] = useState(75);
  const [selectedGestureIndex, setSelectedGestureIndex] = useState(0);

  const { isLoaded, currentHands } = useMediaPipeHands(videoRef, canvasRef);

  const HOLD_DURATION = 1500;

  useEffect(() => {
    if (gestures && gestures.length > 0 && !gestureData) {
      const firstGesture = gestures[0];
      if (firstGesture.gesture_data) {
        try {
          const parsedData = typeof firstGesture.gesture_data === 'string'
            ? JSON.parse(firstGesture.gesture_data)
            : firstGesture.gesture_data;
          setGestureData(parsedData);
          setCurrentFrameIndex(0);
          setIsActive(false);
          setIsCompleted(false);
          setSimilarity(0);
          setMatchHoldTime(0);
        } catch (error) {
          console.error('Error parsing gesture data:', error);
        }
      }
    }
  }, [gestures, gestureData]);

  useEffect(() => {
    if (!isActive || !gestureData || !currentHands) {
      setSimilarity(0);
      setMatchHoldTime(0);
      return;
    }

    const currentFrame = gestureData.frames[currentFrameIndex];

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

      if (nextIndex >= gestureData.frames.length) {
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

  const handleGestureSelect = (index: number) => {
    if (gestures && gestures[index]) {
      const selectedGesture = gestures[index];
      setSelectedGestureIndex(index);

      if (selectedGesture.gesture_data) {
        try {
          const parsedData = typeof selectedGesture.gesture_data === 'string'
            ? JSON.parse(selectedGesture.gesture_data)
            : selectedGesture.gesture_data;
          setGestureData(parsedData);
          setCurrentFrameIndex(0);
          setIsActive(false);
          setIsCompleted(false);
          setSimilarity(0);
          setMatchHoldTime(0);
        } catch (error) {
          console.error('Error parsing gesture data:', error);
        }
      }
    }
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

  const handleCompletePractice = () => {
    onComplete?.();
  };

  return (
    <div className={`w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 ${className}`}>
      <div className="text-center mb-8 sm:mb-12">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-duo-blue rounded-3xl mb-6 shadow-lg border-b-4 border-duo-blue-dark">
          <Hand className="w-10 h-10 text-white" />
        </div>
        <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-duo-text mb-4 tracking-tight uppercase">
          Práctica de Señas
        </h2>
        <p className="text-xl sm:text-2xl text-duo-gray-dark max-w-2xl mx-auto font-bold italic">
          Domina el lenguaje de señas con inteligencia artificial
        </p>
      </div>

      {gestures && gestures.length > 1 && (
        <div className="mb-10 sm:mb-14">
          <div className="card-duo">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-duo-blue flex items-center justify-center border-b-2 border-duo-blue-dark">
                <Video className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-2xl font-black text-duo-text uppercase tracking-tight">
                Elige tu desafío
              </h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {gestures.map((gesture, index) => (
                <button
                  key={gesture.id}
                  onClick={() => handleGestureSelect(index)}
                  className={`group relative p-5 rounded-2xl text-left transition-all duration-100 border-2 border-b-4 transform active:translate-y-1 ${
                    selectedGestureIndex === index
                      ? 'border-duo-blue bg-white'
                      : 'border-duo-gray bg-white hover:border-duo-blue-dark'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                      selectedGestureIndex === index
                        ? 'bg-duo-blue text-white'
                        : 'bg-duo-background-soft text-duo-gray-dark group-hover:bg-duo-blue/10'
                    }`}>
                      <Hand className="w-5 h-5" />
                    </div>
                    {selectedGestureIndex === index && (
                      <div className="w-6 h-6 rounded-full bg-duo-green flex items-center justify-center border-b-2 border-duo-green-dark">
                        <Check className="w-4 h-4 text-white" strokeWidth={3} />
                      </div>
                    )}
                  </div>
                  <div className={`font-black text-base mb-1 truncate uppercase tracking-tight ${
                    selectedGestureIndex === index ? 'text-duo-blue' : 'text-duo-text'
                  }`}>
                    {gesture.gesture_data?.name || `Seña ${gesture.id}`}
                  </div>
                  <div className="text-xs font-bold text-duo-gray-dark uppercase tracking-wider">
                    {selectedGestureIndex === index ? '¡Prepárate!' : 'Toca para practicar'}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Indicadores fuera del canvas */}
      {gestureData && isActive && (
        <div className="mb-6 space-y-4">
          <ProgressIndicator
            currentStep={currentFrameIndex + 1}
            totalSteps={gestureData.frames.length}
            gestureName={gestureData.name}
          />
          <MatchIndicator
            similarity={similarity}
            threshold={matchThreshold}
            isMatch={matchHoldTime > 0}
          />
        </div>
      )}

      {/* Popup de manteniendo posición fuera del canvas */}
      {gestureData && isActive && matchHoldTime > 0 && (
        <div className="mb-6 flex justify-center">
          <div className="bg-white rounded-2xl px-6 py-4 shadow-xl border-b-4 border-duo-green-dark max-w-md w-full">
            <div className="flex items-center justify-between gap-4">
              <span className="text-sm font-black text-duo-text uppercase tracking-tight">
                ¡MANTÉN LA POSICIÓN!
              </span>
              <div className="w-40 h-4 bg-duo-gray rounded-full overflow-hidden flex-1 border-2 border-duo-gray">
                <div
                  className="h-full bg-duo-green transition-all duration-100 rounded-full"
                  style={{ width: `${(matchHoldTime / HOLD_DURATION) * 100}%` }}
                />
              </div>
              <span className="text-sm font-black text-duo-green min-w-[3rem] text-right">
                {((matchHoldTime / HOLD_DURATION) * 100).toFixed(0)}%
              </span>
            </div>
          </div>
        </div>
      )}

       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-10">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl shadow-xl overflow-hidden border-2 border-duo-gray relative group">
            <div className="relative aspect-video bg-slate-900 overflow-hidden">
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
                <div className="absolute inset-0 flex items-center justify-center bg-duo-text/80 backdrop-blur-sm">
                  <div className="text-white text-center">
                    <div className="w-16 h-16 border-4 border-duo-blue border-t-transparent rounded-full animate-spin mx-auto mb-6" />
                    <p className="text-xl font-black uppercase tracking-tight">Detectando cámara...</p>
                    <p className="text-sm text-duo-gray font-bold mt-2">Estamos preparando tus sensores</p>
                  </div>
                </div>
              )}

              {isLoaded && !gestureData && (
                <div className="absolute inset-0 flex items-center justify-center bg-duo-text/40">
                  <div className="text-center bg-white p-10 rounded-3xl border-b-8 border-duo-gray max-w-md mx-4 transform transition-all group-hover:scale-105">
                    <div className="w-20 h-20 rounded-2xl bg-duo-blue flex items-center justify-center mx-auto mb-6 border-b-4 border-duo-blue-dark">
                      <Upload className="w-10 h-10 text-white" />
                    </div>
                    <p className="text-2xl font-black text-duo-text uppercase tracking-tight mb-3">
                      Lista de Práctica
                    </p>
                    <p className="text-lg text-duo-gray-dark font-bold italic">
                      {gestures && gestures.length > 0
                        ? 'Selecciona una seña para comenzar tu entrenamiento'
                        : 'Carga un archivo JSON de gestos'
                      }
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="card-duo">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-duo-text flex items-center justify-center border-b-2 border-slate-700">
                <Play className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-xl font-black text-duo-text uppercase tracking-tight">Controles</h3>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleFileUpload}
              className="hidden"
            />

            {gestureData && (
              <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-1 gap-4">
                <button
                  onClick={toggleActive}
                  disabled={!isLoaded}
                  className={isActive ? 'btn-duo-white w-full border-red-500 text-red-500' : 'btn-duo-green w-full'}
                >
                  <div className="flex items-center gap-2">
                    {isActive ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                    <span>{isActive ? 'Pausar' : 'Iniciar'}</span>
                  </div>
                </button>

                <button
                  onClick={handleRestart}
                  className="btn-duo-white w-full"
                >
                  <div className="flex items-center gap-2">
                    <RotateCcw className="w-5 h-5" />
                    <span>Reiniciar</span>
                  </div>
                </button>

                <button
                  onClick={handleCompletePractice}
                  className="btn-duo-blue w-full"
                >
                  <div className="flex items-center gap-2">
                    <Check className="w-5 h-5" />
                    <span>Finalizar</span>
                  </div>
                </button>
              </div>
            )}
          </div>

          {gestureData && (
            <div className="card-duo">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-duo-blue flex items-center justify-center border-b-2 border-duo-blue-dark">
                  <Hand className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-xl font-black text-duo-text uppercase tracking-tight">
                  Status
                </h3>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-duo-background-soft rounded-2xl border-2 border-duo-gray">
                  <p className="text-xs font-black text-duo-gray-dark uppercase tracking-widest mb-1">Seña actual</p>
                  <p className="font-black text-duo-text text-xl truncate uppercase">
                    {gestureData.name}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-4 bg-duo-background-soft rounded-2xl border-2 border-duo-gray">
                    <p className="text-xs font-black text-duo-gray-dark uppercase tracking-widest mb-1">Pasos</p>
                    <p className="font-black text-duo-blue text-2xl">
                      {gestureData.frames.length}
                    </p>
                  </div>

                  <div className="p-4 bg-duo-background-soft rounded-2xl border-2 border-duo-gray">
                    <p className="text-xs font-black text-duo-gray-dark uppercase tracking-widest mb-1">Modo</p>
                    <p className="font-black text-duo-text text-xs truncate">
                      {gestureData.isSequential ? 'SECUENCIAL' : 'INDIVIDUAL'}
                    </p>
                  </div>
                </div>

                <div className="p-5 bg-white rounded-2xl border-2 border-duo-blue/30">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-sm font-black text-duo-text uppercase tracking-tight">Precisión</p>
                    <span className="text-2xl font-black text-duo-blue">{matchThreshold}%</span>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="95"
                    step="5"
                    value={matchThreshold}
                    onChange={(e) => setMatchThreshold(Number(e.target.value))}
                    className="w-full h-3 bg-duo-gray rounded-full appearance-none cursor-pointer accent-duo-blue"
                  />
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-[10px] font-black text-duo-gray-dark uppercase">Tolerante</span>
                    <span className="text-[10px] font-black text-duo-gray-dark uppercase">Estricto</span>
                  </div>
                </div>

                <div className="p-4 bg-duo-background-soft rounded-2xl border-2 border-duo-gray">
                  <p className="text-xs font-black text-duo-gray-dark uppercase tracking-widest mb-1">Tiempo de captura</p>
                  <p className="font-black text-duo-text text-lg">
                    {(HOLD_DURATION / 1000).toFixed(1)} segundos
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {isCompleted && gestureData && (
        <div className="mt-8">
          <CompletionMessage
            gestureName={gestureData.name}
            onRestart={handleRestart}
            onComplete={handleCompletePractice}
          />
        </div>
      )}
    </div>
  );
};

export default GesturePractice;
