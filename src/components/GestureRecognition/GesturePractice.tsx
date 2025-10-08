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
    <div className={`w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 ${className}`}>
      <div className="text-center mb-6 sm:mb-8 lg:mb-10">
        <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-blue-500 via-cyan-500 to-teal-500 rounded-3xl mb-5 shadow-xl">
          <Hand className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
        </div>
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 mb-3 tracking-tight">
          Práctica de Señas
        </h2>
        <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
          Aprende y practica lenguaje de señas siguiendo los movimientos en pantalla
        </p>
      </div>

      {gestures && gestures.length > 1 && (
        <div className="mb-8 lg:mb-10">
          <div className="bg-gradient-to-br from-white to-slate-50 rounded-3xl shadow-xl p-6 lg:p-8 border border-slate-200">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                <Video className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-slate-900">
                Selecciona una Seña para Practicar
              </h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {gestures.map((gesture, index) => (
                <button
                  key={gesture.id}
                  onClick={() => handleGestureSelect(index)}
                  className={`group relative p-5 rounded-2xl text-left transition-all duration-300 border-2 transform hover:scale-[1.02] hover:shadow-lg ${
                    selectedGestureIndex === index
                      ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-cyan-50 shadow-lg scale-[1.02]'
                      : 'border-slate-200 bg-white hover:border-blue-300'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                      selectedGestureIndex === index
                        ? 'bg-blue-500 text-white'
                        : 'bg-slate-100 text-slate-600 group-hover:bg-blue-100'
                    }`}>
                      <Hand className="w-5 h-5" />
                    </div>
                    {selectedGestureIndex === index && (
                      <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </div>
                  <div className={`font-bold text-base mb-1 truncate transition-colors ${
                    selectedGestureIndex === index ? 'text-blue-900' : 'text-slate-800'
                  }`}>
                    {gesture.gesture_data?.name || `Seña ${gesture.id}`}
                  </div>
                  <div className="text-sm text-slate-500">
                    Toca para comenzar
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
        <div className="mb-4 flex justify-center animate-pulse">
          <div className="bg-white/95 backdrop-blur-md rounded-xl sm:rounded-2xl px-4 sm:px-6 py-2 sm:py-3 shadow-2xl border border-emerald-200 max-w-sm sm:max-w-md w-full">
            <div className="flex items-center justify-between gap-2 sm:gap-3">
              <span className="text-xs sm:text-sm font-semibold text-slate-700 flex-shrink-0">
                Manteniendo posición...
              </span>
              <div className="w-24 sm:w-40 h-2 sm:h-3 bg-slate-200 rounded-full overflow-hidden flex-1">
                <div
                  className="h-full bg-gradient-to-r from-emerald-400 via-emerald-500 to-emerald-600 transition-all duration-100 rounded-full"
                  style={{ width: `${(matchHoldTime / HOLD_DURATION) * 100}%` }}
                />
              </div>
              <span className="text-xs sm:text-sm font-bold text-emerald-600 min-w-[2rem] sm:min-w-[3rem] text-right">
                {((matchHoldTime / HOLD_DURATION) * 100).toFixed(0)}%
              </span>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
        <div className="lg:col-span-2">
          <div className="bg-gradient-to-br from-white to-slate-50 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden border border-slate-200">
            <div className="relative aspect-video bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 overflow-hidden">
              <video
                ref={videoRef}
                className="absolute inset-0 w-full h-full hidden"
                playsInline
              />
              <canvas
                ref={canvasRef}
                width={640}
                height={480}
                className="absolute inset-0 w-full h-full object-cover rounded-2xl sm:rounded-none"
              />

              {!isLoaded && (
                <div className="absolute inset-0 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm">
                  <div className="text-white text-center">
                    <div className="w-16 h-16 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-lg font-semibold">Inicializando cámara...</p>
                    <p className="text-sm text-slate-300 mt-2">Preparando detección de manos</p>
                  </div>
                </div>
              )}

              {isLoaded && !gestureData && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-white text-center bg-slate-900/80 backdrop-blur-md p-8 rounded-2xl border border-slate-700 max-w-md mx-4">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mx-auto mb-4">
                      <Upload className="w-8 h-8" />
                    </div>
                    <p className="text-xl font-bold mb-2">
                      {gestures && gestures.length > 0
                        ? 'Selecciona una seña para comenzar'
                        : 'Carga un archivo JSON para empezar'
                      }
                    </p>
                    <p className="text-sm text-slate-300">
                      {gestures && gestures.length > 0
                        ? 'Elige una seña de la lista superior'
                        : 'Usa el botón de cargar archivo'
                      }
                    </p>
                  </div>
                </div>
              )}




            </div>
          </div>
        </div>

        <div className="space-y-4 sm:space-y-6">
          <div className="bg-gradient-to-br from-white to-slate-50 rounded-2xl sm:rounded-3xl shadow-xl p-4 sm:p-6 border border-slate-200">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center">
                <Play className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Controles</h3>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleFileUpload}
              className="hidden"
            />

            {gestureData && (
              <div className="grid grid-cols-3 gap-2 sm:gap-3">
                <button
                  onClick={toggleActive}
                  disabled={!isLoaded}
                  className={`flex flex-col items-center justify-center gap-1 sm:gap-2 font-semibold py-3 sm:py-4 px-2 sm:px-3 rounded-xl sm:rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 ${
                    isActive
                      ? 'bg-gradient-to-br from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white'
                      : 'bg-gradient-to-br from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white'
                  }`}
                >
                  {isActive ? <Pause className="w-5 h-5 sm:w-6 sm:h-6" /> : <Play className="w-5 h-5 sm:w-6 sm:h-6" />}
                  <span className="text-xs">{isActive ? 'Pausar' : 'Iniciar'}</span>
                </button>

                <button
                  onClick={handleRestart}
                  className="flex flex-col items-center justify-center gap-1 sm:gap-2 bg-gradient-to-br from-slate-500 to-slate-700 hover:from-slate-600 hover:to-slate-800 text-white font-semibold py-3 sm:py-4 px-2 sm:px-3 rounded-xl sm:rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  <RotateCcw className="w-5 h-5 sm:w-6 sm:h-6" />
                  <span className="text-xs">Reiniciar</span>
                </button>

                <button
                  onClick={handleCompletePractice}
                  className="flex flex-col items-center justify-center gap-1 sm:gap-2 bg-gradient-to-br from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white font-semibold py-3 sm:py-4 px-2 sm:px-3 rounded-xl sm:rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  <Check className="w-5 h-5 sm:w-6 sm:h-6" />
                  <span className="text-xs">Finalizar</span>
                </button>
              </div>
            )}
          </div>

          {gestureData && (
            <div className="bg-gradient-to-br from-white to-slate-50 rounded-2xl sm:rounded-3xl shadow-xl p-4 sm:p-6 border border-slate-200">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                  <Hand className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">
                  Información
                </h3>
              </div>

              <div className="space-y-3 sm:space-y-4">
                <div className="p-3 sm:p-4 bg-white rounded-xl border border-slate-200">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Nombre de la Seña</p>
                  <p className="font-bold text-slate-900 text-lg truncate">
                    {gestureData.name}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 sm:gap-3">
                  <div className="p-3 sm:p-4 bg-white rounded-xl border border-slate-200">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Pasos</p>
                    <p className="font-bold text-slate-900 text-2xl">
                      {gestureData.frames.length}
                    </p>
                  </div>

                  <div className="p-3 sm:p-4 bg-white rounded-xl border border-slate-200">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Tipo</p>
                    <p className="font-bold text-slate-900 text-sm truncate">
                      {gestureData.isSequential ? 'Secuencial' : 'Individual'}
                    </p>
                  </div>
                </div>

                <div className="p-4 sm:p-5 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl border border-blue-200">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-bold text-slate-700">Precisión Requerida</p>
                    <span className="text-2xl font-black text-blue-600">{matchThreshold}%</span>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="95"
                    step="5"
                    value={matchThreshold}
                    onChange={(e) => setMatchThreshold(Number(e.target.value))}
                    className="w-full h-3 bg-slate-200 rounded-full appearance-none cursor-pointer slider accent-blue-600"
                  />
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs font-medium text-slate-500">Tolerante (50%)</span>
                    <span className="text-xs font-medium text-slate-500">Estricto (95%)</span>
                  </div>
                </div>

                <div className="p-3 sm:p-4 bg-white rounded-xl border border-slate-200">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Tiempo de Espera</p>
                  <p className="font-bold text-slate-900 text-lg">
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
