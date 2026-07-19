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
    <div className={`w-full max-w-7xl mx-auto px-1 sm:px-4 py-3 sm:py-6 ${className}`}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 border-b-2 border-duo-gray pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Hand className="w-6 h-6 text-duo-blue" strokeWidth={2.5} />
            <h2 className="text-xl sm:text-2xl font-black text-duo-text tracking-tight uppercase">
              Práctica de Señas
            </h2>
          </div>
          <p className="text-sm sm:text-base text-duo-gray-dark font-medium">
            Es hora de aplicar lo aprendido.
          </p>
        </div>
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
                  className={`group relative p-5 rounded-2xl text-left transition-all duration-100 border-2 border-b-4 transform active:translate-y-1 ${selectedGestureIndex === index
                    ? 'border-duo-blue bg-white'
                    : 'border-duo-gray bg-white hover:border-duo-blue-dark'
                    }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${selectedGestureIndex === index
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
                  <div className={`font-black text-base mb-1 truncate uppercase tracking-tight ${selectedGestureIndex === index ? 'text-duo-blue' : 'text-duo-text'
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

      {/* Popup de manteniendo posición fuera del canvas */}

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
        <div className="lg:col-span-2 space-y-4">
          {/* HUD de la Seña actual Unificado */}
          {gestureData && (
            <div className="bg-white border-2 border-duo-gray rounded-2xl p-4 shadow-sm space-y-4">
              <div className="flex items-center justify-between gap-4">
                {/* Lado izquierdo: Información de la seña */}
                <div className="flex-grow">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-black text-duo-gray-dark uppercase tracking-widest leading-none">
                      Seña Objetivo
                    </span>
                  </div>
                  <h3 className="font-black text-duo-text text-xl sm:text-2xl uppercase leading-none mb-3">
                    {gestureData.name}
                  </h3>

                  {/* Barra de progreso de pasos */}
                  <div className="space-y-1 max-w-xs">
                    <div className="flex items-center justify-between text-[10px] font-black text-duo-gray-dark uppercase tracking-wide">
                      <span>Progreso</span>
                      <span>Paso {currentFrameIndex + 1} / {gestureData.frames.length}</span>
                    </div>
                    <div className="w-full h-2.5 bg-duo-gray rounded-full overflow-hidden border border-duo-gray">
                      <div
                        className="h-full bg-duo-blue transition-all duration-500 rounded-full"
                        style={{ width: `${((currentFrameIndex + 1) / gestureData.frames.length) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Lado derecho: Precisión del usuario */}
                {isActive ? (
                  <div className={`flex flex-col items-center justify-center p-3 rounded-2xl border-2 transition-all min-w-[100px] sm:min-w-[120px] ${
                    matchHoldTime > 0 ? 'bg-duo-green/5 border-duo-green' : 'bg-duo-background-soft border-duo-gray'
                  }`}>
                    <span className="text-[10px] font-black text-duo-gray-dark uppercase tracking-widest mb-1">
                      Precisión
                    </span>
                    <span className={`text-2xl sm:text-3xl font-black leading-none ${
                      matchHoldTime > 0 ? 'text-duo-green' : similarity >= matchThreshold - 10 ? 'text-duo-yellow-dark' : 'text-duo-text'
                    }`}>
                      {similarity.toFixed(0)}%
                    </span>
                    <span className="text-[9px] font-bold text-duo-gray-dark uppercase tracking-wide mt-1">
                      Meta: {matchThreshold}%
                    </span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center p-3 rounded-2xl border-2 bg-duo-background-soft border-duo-gray min-w-[100px] sm:min-w-[120px]">
                    <span className="text-[10px] font-black text-duo-gray-dark uppercase tracking-widest mb-1">
                      Precisión
                    </span>
                    <span className="text-xs font-bold text-duo-gray-dark uppercase text-center leading-tight">
                      Presiona<br/>Iniciar
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

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

          {/* Botones de control más pequeños debajo de la cámara */}
          {gestureData && (
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={toggleActive}
                disabled={!isLoaded}
                className={isActive ? 'btn-duo-white w-full border-red-500 text-red-500 py-1.5 sm:py-2 text-[10px] sm:text-xs font-black' : 'btn-duo-green w-full py-1.5 sm:py-2 text-[10px] sm:text-xs font-black'}
              >
                <div className="flex items-center justify-center gap-1.5">
                  {isActive ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                  <span className="uppercase tracking-wider">{isActive ? 'Pausar' : 'Iniciar'}</span>
                </div>
              </button>

              <button
                onClick={handleRestart}
                className="btn-duo-white w-full py-1.5 sm:py-2 text-[10px] sm:text-xs font-black"
              >
                <div className="flex items-center justify-center gap-1.5">
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span className="uppercase tracking-wider">Reiniciar</span>
                </div>
              </button>

              <button
                onClick={handleCompletePractice}
                className="btn-duo-blue w-full py-1.5 sm:py-2 text-[10px] sm:text-xs font-black"
              >
                <div className="flex items-center justify-center gap-1.5">
                  <Check className="w-3.5 h-3.5" strokeWidth={3} />
                  <span className="uppercase tracking-wider">Finalizar</span>
                </div>
              </button>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleFileUpload}
            className="hidden"
          />

          {gestureData && (
            <div className="card-duo">
              <details className="group" open>
                <summary className="flex items-center justify-between cursor-pointer list-none focus:outline-none">
                  <div className="flex items-center gap-2">
                    <Video className="w-5 h-5 text-duo-blue" />
                    <h3 className="text-base font-black text-duo-text uppercase tracking-tight">
                      Ajustes de Práctica
                    </h3>
                  </div>
                  <span className="transition group-open:rotate-180 text-duo-gray-dark">
                    <svg fill="none" height="20" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" viewBox="0 0 24 24" width="20"><path d="M6 9l6 6 6-6"></path></svg>
                  </span>
                </summary>

                <div className="mt-4 pt-4 border-t-2 border-duo-gray space-y-4">
                  <div className="p-4 bg-duo-background-soft rounded-2xl border-2 border-duo-gray">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-black text-duo-text uppercase tracking-tight">Precisión requerida</span>
                      <span className="text-sm font-black text-duo-blue">{matchThreshold}%</span>
                    </div>
                    <input
                      type="range"
                      min="50"
                      max="95"
                      step="5"
                      value={matchThreshold}
                      onChange={(e) => setMatchThreshold(Number(e.target.value))}
                      className="w-full h-2 bg-duo-gray rounded-full appearance-none cursor-pointer accent-duo-blue"
                    />
                    <div className="flex items-center justify-between mt-1 text-[9px] font-black text-duo-gray-dark uppercase">
                      <span>Tolerante</span>
                      <span>Estricto</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-3 bg-duo-background-soft rounded-xl border-2 border-duo-gray">
                      <span className="block text-[9px] font-black text-duo-gray-dark uppercase tracking-widest mb-1">Modo</span>
                      <span className="font-black text-duo-text text-[11px]">{gestureData.isSequential ? 'SECUENCIAL' : 'INDIVIDUAL'}</span>
                    </div>
                    <div className="p-3 bg-duo-background-soft rounded-xl border-2 border-duo-gray">
                      <span className="block text-[9px] font-black text-duo-gray-dark uppercase tracking-widest mb-1">Captura</span>
                      <span className="font-black text-duo-text text-[11px]">{(HOLD_DURATION / 1000).toFixed(1)}s</span>
                    </div>
                  </div>
                </div>
              </details>
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
