import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, BookOpen, PlayCircle } from 'lucide-react';
import { LessonContentStep, Gesture } from '../types';
import GesturePractice from './GestureRecognition/GesturePractice';

interface LessonContentRendererProps {
  content: LessonContentStep[] | null;
  gestures?: Gesture[] | null;
  onComplete?: () => void;
  className?: string;
}

const LessonContentRenderer: React.FC<LessonContentRendererProps> = ({
  content,
  gestures,
  onComplete,
  className = ''
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [showPractice, setShowPractice] = useState(false);

  React.useEffect(() => {
    if (gestures && gestures.length > 0) {
      console.log('🤟 Gestures recibidos para práctica:', gestures);
    }
  }, [gestures]);

  if (!content || content.length === 0) {
    return (
      <div className={`text-center py-20 ${className}`}>
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-slate-100 to-slate-200 rounded-3xl mb-6">
          <BookOpen className="w-10 h-10 text-slate-400" />
        </div>
        <h3 className="text-3xl font-bold text-slate-800 mb-4">
          Contenido en Desarrollo
        </h3>
        <p className="text-slate-600 text-lg max-w-md mx-auto leading-relaxed">
          El contenido de esta lección estará disponible próximamente.
          Estamos trabajando para ofrecerte la mejor experiencia de aprendizaje.
        </p>
      </div>
    );
  }

  const sortedContent = [...content].sort((a, b) => a.index - b.index);
  const totalSteps = sortedContent.length;

  const goToNextStep = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Si no hay gestos, completar directamente sin mostrar práctica
      if (!gestures || gestures.length === 0) {
        onComplete?.();
      } else {
        setShowPractice(true);
      }
    }
  };

  const goToPreviousStep = () => {
    if (showPractice) {
      setShowPractice(false);
    } else if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleCompletePractice = () => {
    onComplete?.();
  };

  const currentContentStep = sortedContent[currentStep];
  const progressPercentage = showPractice ? 100 : ((currentStep + 1) / totalSteps) * 100;

  return (
    <div className={`max-w-6xl mx-auto ${className}`}>
      <div className="mb-8">
        <div className="flex items-center justify-between text-sm font-semibold mb-3">
          <span className="text-slate-600">
            {showPractice ? (
              <span className="flex items-center gap-2">
                <PlayCircle className="w-4 h-4" />
                Práctica Interactiva
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                Paso {currentStep + 1} de {totalSteps}
              </span>
            )}
          </span>
          <span className="text-blue-600">
            {progressPercentage.toFixed(0)}% completado
          </span>
        </div>
        <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden shadow-inner">
          <div
            className="h-full bg-gradient-to-r from-blue-500 via-cyan-500 to-teal-500 rounded-full transition-all duration-500 ease-out shadow-lg"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-white to-slate-50 rounded-3xl shadow-2xl overflow-hidden border border-slate-200">
        {showPractice ? (
          <div>
            <GesturePractice
              gestures={gestures}
              onComplete={handleCompletePractice}
              className="min-h-[600px]"
            />

            <div className="p-6 bg-gradient-to-br from-slate-50 to-slate-100 border-t border-slate-200">
              <button
                onClick={() => setShowPractice(false)}
                className="w-full px-6 py-4 bg-white hover:bg-slate-50 text-slate-700 rounded-2xl font-semibold transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center gap-2 border border-slate-200"
              >
                <ChevronLeft className="w-5 h-5" />
                Revisar contenido de la lección
              </button>
            </div>
          </div>
        ) : (
          <div className="p-8 lg:p-12">
            <div className="mb-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-full text-sm font-semibold mb-4 border border-blue-200">
                <BookOpen className="w-4 h-4" />
                Lección {currentStep + 1}
              </div>
              <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4 leading-tight">
                {currentContentStep.titulo}
              </h2>
              <p className="text-lg lg:text-xl text-slate-600 leading-relaxed">
                {currentContentStep.descripcion}
              </p>
            </div>

            <div className="mb-8">
              <MediaRenderer media={currentContentStep.media} />
            </div>

            <div className="prose prose-lg max-w-none">
              <div className="p-6 bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl border border-slate-200">
                <p className="text-slate-700 leading-relaxed text-lg m-0">
                  {currentContentStep.contenido}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="px-4 sm:px-8 py-4 sm:py-6 bg-gradient-to-br from-slate-50 to-slate-100 border-t border-slate-200">
          <div className="flex items-center justify-between gap-2 sm:gap-4">
            <button
              onClick={goToPreviousStep}
              disabled={currentStep === 0 && !showPractice}
              className={`flex items-center justify-center gap-2 px-4 sm:px-6 py-3 rounded-2xl font-semibold transition-all duration-300 min-w-[100px] sm:min-w-[120px] ${
                currentStep === 0 && !showPractice
                  ? 'text-slate-400 cursor-not-allowed bg-slate-200'
                  : 'text-slate-700 hover:bg-white hover:shadow-md bg-white/50 border border-slate-200'
              }`}
            >
              <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="text-sm sm:text-base hidden sm:inline">Anterior</span>
            </button>

            <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-500">
              {showPractice ? (
                <span className="flex items-center gap-1.5 px-3 sm:px-4 py-2 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-200">
                  <PlayCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">Práctica</span>
                </span>
              ) : (
                <span className="px-3 sm:px-4 py-2 bg-white rounded-full border border-slate-200">
                  {currentStep + 1} / {totalSteps}
                </span>
              )}
            </div>

            <button
              onClick={goToNextStep}
              className="flex items-center justify-center gap-2 px-4 sm:px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white rounded-2xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 min-w-[100px] sm:min-w-[120px]"
            >
              <span className="text-sm sm:text-base">
                {currentStep === totalSteps - 1 
                  ? (!gestures || gestures.length === 0 ? 'Completar' : 'Completar')
                  : 'Siguiente'
                }
              </span>
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const MediaRenderer: React.FC<{ media: { tipo: string; url: string } }> = ({ media }) => {
  if (media.tipo === 'image') {
    return (
      <div className="relative rounded-2xl overflow-hidden bg-slate-100 shadow-lg border border-slate-200">
        <img
          src={media.url}
          alt="Contenido de la lección"
          className="w-full h-auto max-h-[500px] object-contain"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
            const parent = target.parentElement;
            if (parent) {
              parent.innerHTML = `
                <div class="flex items-center justify-center h-64 text-slate-400">
                  <div class="text-center p-8">
                    <div class="text-6xl mb-4">🖼️</div>
                    <p class="font-semibold text-lg">Error al cargar la imagen</p>
                    <p class="text-sm mt-2">La imagen no está disponible</p>
                  </div>
                </div>
              `;
            }
          }}
        />
      </div>
    );
  }

  if (media.tipo === 'video') {
    const getYouTubeEmbedUrl = (url: string) => {
      const cleanUrl = url.trim();

      const patterns = [
        /(?:youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
        /(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/,
        /(?:youtube\.com\/watch\?.*v=)([a-zA-Z0-9_-]{11})/,
        /(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/,
        /(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/
      ];

      for (const pattern of patterns) {
        const match = cleanUrl.match(pattern);
        if (match && match[1]) {
          return `https://www.youtube.com/embed/${match[1]}?rel=0&modestbranding=1&fs=1&cc_load_policy=0&iv_load_policy=3&autohide=1`;
        }
      }

      if (cleanUrl.includes('vimeo.com')) {
        const vimeoMatch = cleanUrl.match(/vimeo\.com\/(\d+)/);
        if (vimeoMatch) {
          return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
        }
      }

      if (cleanUrl.match(/\.(mp4|webm|ogg)(\?.*)?$/i)) {
        return cleanUrl;
      }

      console.warn('URL de video no reconocida:', cleanUrl);
      return cleanUrl;
    };

    const embedUrl = getYouTubeEmbedUrl(media.url);
    const isDirectVideo = embedUrl.match(/\.(mp4|webm|ogg)(\?.*)?$/i);

    return (
      <div className="relative rounded-2xl overflow-hidden bg-slate-900 shadow-2xl border border-slate-700">
        <div className="aspect-video">
          {isDirectVideo ? (
            <video
              src={embedUrl}
              title="Video de la lección"
              className="w-full h-full object-contain"
              controls
              preload="metadata"
              onError={(e) => {
                console.error('Error al cargar el video directo:', media.url);
                const target = e.target as HTMLVideoElement;
                const parent = target.parentElement;
                if (parent) {
                  parent.innerHTML = `
                    <div class="flex items-center justify-center h-full text-white">
                      <div class="text-center p-8">
                        <div class="text-6xl mb-4">📹</div>
                        <p class="font-semibold text-xl mb-2">Error al cargar el video</p>
                        <p class="text-sm text-slate-300">Formato no compatible o URL inválida</p>
                      </div>
                    </div>
                  `;
                }
              }}
            >
              Tu navegador no soporta la reproducción de video.
            </video>
          ) : (
            <iframe
              src={embedUrl}
              title="Video de la lección"
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              loading="lazy"
              onError={(e) => {
                console.error('Error al cargar el iframe:', media.url);
                const target = e.target as HTMLIFrameElement;
                const parent = target.parentElement;
                if (parent) {
                  parent.innerHTML = `
                    <div class="flex items-center justify-center h-full text-white">
                      <div class="text-center p-8">
                        <div class="text-6xl mb-4">🚫</div>
                        <p class="font-semibold text-xl mb-2">Video no disponible</p>
                        <p class="text-sm text-slate-300 mb-4">El video no se puede mostrar debido a restricciones</p>
                        <a href="${media.url}" target="_blank" rel="noopener noreferrer"
                           class="inline-block px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 font-semibold text-sm transition-colors">
                          Abrir en nueva ventana
                        </a>
                      </div>
                    </div>
                  `;
                }
              }}
            />
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center h-64 bg-slate-100 rounded-2xl text-slate-400 border border-slate-200">
      <div className="text-center p-8">
        <div className="text-6xl mb-4">❓</div>
        <p className="font-semibold text-lg">Tipo de media no soportado</p>
        <p className="text-sm mt-2">Tipo: {media.tipo}</p>
      </div>
    </div>
  );
};

export default LessonContentRenderer;
