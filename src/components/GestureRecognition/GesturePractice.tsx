import React, { useState, useRef, useEffect } from 'react';
import { Upload, Play, Pause, RotateCcw, Video, Check } from 'lucide-react';
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

  // Efecto para cargar automáticamente el primer gesto disponible
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
      <div className="w-full max-w-4xl mx-auto px-2 sm:px-4 py-2 sm:py-4 overflow-x-auto">
        <div className="text-center mb-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-2 flex items-center justify-center gap-3 truncate">
            <Video className="w-7 h-7 sm:w-8 sm:h-8 text-blue-600" />
            Práctica de Gestos
          </h2>
          <p className="text-slate-600 break-words">
            Practica los gestos de esta lección siguiendo las instrucciones
          </p>
        </div>

        {/* Selector de gestos */}
        {gestures && gestures.length > 1 && (
          <div className="mb-6 sm:mb-8">
            <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-6 border border-slate-200/50">
              <h3 className="text-lg sm:text-xl font-bold text-slate-800 mb-3 truncate">Selecciona un Gesto</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
                {gestures.map((gesture, index) => (
                  <button
                    key={gesture.id}
                    onClick={() => handleGestureSelect(index)}
                    className={`group p-3 sm:p-4 rounded-xl text-left transition-all duration-300 border-2 transform hover:scale-[1.02] ${
                      selectedGestureIndex === index
                        ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-indigo-50 text-blue-800 shadow-lg'
                        : 'border-slate-200 bg-white hover:border-blue-300 hover:bg-blue-50/50 hover:shadow-md'
                    }`}
                  >
                    <div className="font-medium truncate">
                      {gesture.gesture_data?.name || `Gesto ${gesture.id}`}
                    </div>
                    <div className="text-sm text-slate-500 mt-1 truncate">
                      Toca para practicar
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-xl p-4 border border-slate-200/50">
              <div className="relative aspect-video bg-slate-900 rounded-xl overflow-hidden">
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
                        {gestures && gestures.length > 0 
                          ? 'Selecciona un gesto para comenzar'
                          : 'Carga un archivo JSON para comenzar'
                        }
                      </p>
                    </div>
                  </div>
                )}

                <div className="absolute top-4 left-4 right-4 flex flex-col gap-3">
                  {gestureData && isActive && (
                    <>
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
            <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-6 border border-slate-200/50">
              <h3 className="text-xl font-bold text-slate-800 mb-4">Controles</h3>

              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleFileUpload}
                className="hidden"
              />

              

              {gestureData && (
                <div className="grid grid-cols-3 gap-2 sm:gap-4">
                  <button
                    onClick={toggleActive}
                    disabled={!isLoaded}
                    className={`w-full font-semibold py-3 px-4 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center gap-2 ${
                      isActive
                        ? 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white'
                        : 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {isActive ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                  </button>

                  <button
                    onClick={handleRestart}
                    className="w-full bg-gradient-to-r from-slate-500 to-slate-600 hover:from-slate-600 hover:to-slate-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                  >
                    <RotateCcw className="w-5 h-5" />
                  </button>

                  <button
                    onClick={handleCompletePractice}
                    className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                  >
                    <Check className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>

            {gestureData && (
              <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-6 border border-slate-200/50">
                <h3 className="text-xl font-bold text-slate-800 mb-4">
                  Información del Gesto
                </h3>

                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-slate-600">Nombre</p>
                    <p className="font-semibold text-slate-800 truncate">
                      {gestureData.name}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-slate-600">Total de Pasos</p>
                    <p className="font-semibold text-slate-800">
                      {gestureData.frames.length}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-slate-600">Tipo</p>
                    <p className="font-semibold text-slate-800 truncate">
                      {gestureData.isSequential ? 'Secuencial' : 'Individual'}
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

      {isCompleted && gestureData && (
        <div className="mt-4">
          <CompletionMessage
            gestureName={gestureData.name}
            onRestart={handleRestart}
          />
        </div>
      )}
    </div>
  );
};

export default GesturePractice;