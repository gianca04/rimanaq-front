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
    <div className={`w-full flex flex-col ${className}`}>

      {/* HUD compacto: seña objetivo + precisión */}
      {gestureData && (
        <div className="flex items-center justify-between gap-3 px-4 py-2 border-b-2 border-duo-gray">
          <div className="flex-grow min-w-0">
            <span className="text-[10px] font-black text-duo-gray-dark uppercase tracking-widest block">
              Seña objetivo
            </span>
            <h3 className="font-black text-duo-text text-lg uppercase leading-tight truncate">
              {gestureData.name}
            </h3>
            {/* Progreso de pasos */}
            <div className="flex items-center gap-2 mt-1">
              <div className="flex-grow h-2 bg-duo-gray rounded-full overflow-hidden">
                <div
                  className="h-full bg-duo-blue transition-all duration-500 rounded-full"
                  style={{ width: `${((currentFrameIndex + 1) / gestureData.frames.length) * 100}%` }}
                />
              </div>
              <span className="text-[10px] font-black text-duo-gray-dark uppercase whitespace-nowrap">
                {currentFrameIndex + 1}/{gestureData.frames.length}
              </span>
            </div>
          </div>

          {/* Precisión */}
          <div className={`flex-shrink-0 flex flex-col items-center justify-center px-3 py-2 rounded-xl border-2 transition-all min-w-[80px] ${
            isActive && matchHoldTime > 0
              ? 'bg-duo-green/5 border-duo-green'
              : 'bg-duo-background-soft border-duo-gray'
          }`}>
            <span className="text-[9px] font-black text-duo-gray-dark uppercase tracking-widest mb-0.5">
              Precisión
            </span>
            {isActive ? (
              <span className={`text-xl font-black leading-none ${
                matchHoldTime > 0 ? 'text-duo-green' : similarity >= matchThreshold - 10 ? 'text-duo-yellow-dark' : 'text-duo-text'
              }`}>
                {similarity.toFixed(0)}%
              </span>
            ) : (
              <span className="text-[10px] font-bold text-duo-gray-dark uppercase text-center leading-tight">
                Presiona<br/>Iniciar
              </span>
            )}
          </div>
        </div>
      )}

      {/* Barra "¡Mantén la posición!" */}
      {gestureData && isActive && matchHoldTime > 0 && (
        <div className="flex items-center gap-3 px-4 py-2 bg-duo-green/5 border-b-2 border-duo-green">
          <span className="text-xs font-black text-duo-green uppercase tracking-tight whitespace-nowrap">
            ¡Mantén!
          </span>
          <div className="flex-grow h-3 bg-duo-gray rounded-full overflow-hidden">
            <div
              className="h-full bg-duo-green transition-all duration-100 rounded-full"
              style={{ width: `${(matchHoldTime / HOLD_DURATION) * 100}%` }}
            />
          </div>
          <span className="text-xs font-black text-duo-green min-w-[3rem] text-right">
            {((matchHoldTime / HOLD_DURATION) * 100).toFixed(0)}%
          </span>
        </div>
      )}

      {/* Selector de gestos (solo si hay más de 1) */}
      {gestures && gestures.length > 1 && (
        <div className="px-4 py-3 border-b-2 border-duo-gray">
          <span className="text-[10px] font-black text-duo-gray-dark uppercase tracking-widest block mb-2">
            Elige tu seña
          </span>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {gestures.map((gesture, index) => (
              <button
                key={gesture.id}
                onClick={() => handleGestureSelect(index)}
                className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-black uppercase border-2 border-b-4 transition-all active:translate-y-0.5 ${
                  selectedGestureIndex === index
                    ? 'border-duo-blue bg-duo-blue/10 text-duo-blue'
                    : 'border-duo-gray bg-white text-duo-gray-dark hover:border-duo-blue-dark'
                }`}
              >
                {gesture.gesture_data?.name || `Seña ${gesture.id}`}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Cámara — sin tarjeta extra, ocupa todo el ancho disponible */}
      <div className="relative bg-slate-900 overflow-hidden flex-grow" style={{ minHeight: '200px' }}>
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
            <div className="text-white text-center px-4">
              <div className="w-12 h-12 border-4 border-duo-blue border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-base font-black uppercase tracking-tight">Detectando cámara...</p>
            </div>
          </div>
        )}

        {isLoaded && !gestureData && (
          <div className="absolute inset-0 flex items-center justify-center bg-duo-text/40">
            <div className="text-center bg-white p-6 rounded-2xl border-b-4 border-duo-gray mx-4">
              <div className="w-14 h-14 rounded-2xl bg-duo-blue flex items-center justify-center mx-auto mb-3 border-b-4 border-duo-blue-dark">
                <Upload className="w-7 h-7 text-white" />
              </div>
              <p className="text-lg font-black text-duo-text uppercase tracking-tight mb-1">
                {gestures && gestures.length > 0 ? 'Selecciona una seña' : 'Sin gestos cargados'}
              </p>
            </div>
          </div>
        )}

        {/* Mensaje de completado sobre la cámara */}
        {isCompleted && gestureData && (
          <div className="absolute inset-0 flex items-center justify-center bg-duo-green/80 backdrop-blur-sm">
            <CompletionMessage
              gestureName={gestureData.name}
              onRestart={handleRestart}
              onComplete={handleCompletePractice}
            />
          </div>
        )}
      </div>

      {/* Botones de control */}
      {gestureData && (
        <div className="grid grid-cols-3 gap-2 px-4 py-3 border-t-2 border-duo-gray">
          <button
            onClick={toggleActive}
            disabled={!isLoaded}
            className={isActive
              ? 'btn-duo-white w-full py-2 text-xs font-black border-red-400 text-red-500'
              : 'btn-duo-green w-full py-2 text-xs font-black'
            }
          >
            <div className="flex items-center justify-center gap-1.5">
              {isActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              <span className="uppercase tracking-wider">{isActive ? 'Pausar' : 'Iniciar'}</span>
            </div>
          </button>

          <button onClick={handleRestart} className="btn-duo-white w-full py-2 text-xs font-black">
            <div className="flex items-center justify-center gap-1.5">
              <RotateCcw className="w-4 h-4" />
              <span className="uppercase tracking-wider">Reiniciar</span>
            </div>
          </button>

          <button onClick={handleCompletePractice} className="btn-duo-blue w-full py-2 text-xs font-black">
            <div className="flex items-center justify-center gap-1.5">
              <Check className="w-4 h-4" strokeWidth={3} />
              <span className="uppercase tracking-wider">Finalizar</span>
            </div>
          </button>
        </div>
      )}

      {/* Ajustes de práctica — sin card, colapsable */}
      {gestureData && (
        <div className="border-t-2 border-duo-gray">
          <details className="group">
            <summary className="flex items-center justify-between cursor-pointer list-none px-4 py-3 focus:outline-none">
              <div className="flex items-center gap-2">
                <Video className="w-4 h-4 text-duo-blue" />
                <span className="text-sm font-black text-duo-text uppercase tracking-tight">
                  Ajustes de Práctica
                </span>
              </div>
              <span className="transition group-open:rotate-180 text-duo-gray-dark">
                <svg fill="none" height="18" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" viewBox="0 0 24 24" width="18"><path d="M6 9l6 6 6-6"></path></svg>
              </span>
            </summary>

            <div className="px-4 pb-4 space-y-3">
              {/* Slider de precisión */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-black text-duo-text uppercase tracking-tight">Precisión requerida</span>
                  <span className="text-xs font-black text-duo-blue">{matchThreshold}%</span>
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

              {/* Modo y captura en fila */}
              <div className="grid grid-cols-2 gap-2">
                <div className="px-3 py-2 bg-duo-background-soft rounded-xl border-2 border-duo-gray">
                  <span className="block text-[9px] font-black text-duo-gray-dark uppercase tracking-widest mb-0.5">Modo</span>
                  <span className="font-black text-duo-text text-xs">{gestureData.isSequential ? 'SECUENCIAL' : 'INDIVIDUAL'}</span>
                </div>
                <div className="px-3 py-2 bg-duo-background-soft rounded-xl border-2 border-duo-gray">
                  <span className="block text-[9px] font-black text-duo-gray-dark uppercase tracking-widest mb-0.5">Captura</span>
                  <span className="font-black text-duo-text text-xs">{(HOLD_DURATION / 1000).toFixed(1)}s</span>
                </div>
              </div>
            </div>
          </details>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleFileUpload}
        className="hidden"
      />
    </div>
  );
};

export default GesturePractice;
