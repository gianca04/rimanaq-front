import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, BookOpen, PlayCircle } from 'lucide-react';
import { LessonContentStep, Gesture } from '../types';
import GesturePractice from './GestureRecognition/GesturePractice';

interface LessonContentRendererProps {
  content: LessonContentStep[] | null;
  gestures?: Gesture[] | null;
  onComplete?: () => void;
  onShowPracticeChange?: (show: boolean) => void;
  className?: string;
}

const LessonContentRenderer: React.FC<LessonContentRendererProps> = ({
  content,
  gestures,
  onComplete,
  onShowPracticeChange,
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

  const handleShowPracticeChange = (show: boolean) => {
    setShowPractice(show);
    onShowPracticeChange?.(show);
  };

  const goToNextStep = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Si no hay gestos, completar directamente sin mostrar práctica
      if (!gestures || gestures.length === 0) {
        onComplete?.();
      } else {
        handleShowPracticeChange(true);
      }
    }
  };

  const goToPreviousStep = () => {
    if (showPractice) {
      handleShowPracticeChange(false);
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
    <div className={`${className}`}>
      {showPractice ? (
        <>
          <div className="flex-grow flex flex-col overflow-hidden">
            <GesturePractice
              gestures={gestures}
              onComplete={handleCompletePractice}
              className="flex-grow"
            />
          </div>
          <div className="px-4 py-3 border-t-2 border-duo-gray">
            <button
              onClick={() => setShowPractice(false)}
              className="btn-duo-white w-full text-xs"
            >
              VOLVER A LA LECCIÓN
            </button>
          </div>
        </>
      ) : (
        <>
          {/* Contenido scrollable */}
          <div className="flex-grow overflow-y-auto px-4 pt-3 pb-2">
            {/* Indicador de paso */}
            <div className="text-center mb-2">
              <span className="inline-block px-3 py-1 bg-duo-blue/10 text-duo-blue rounded-full text-xs font-black uppercase tracking-widest">
                Paso {currentStep + 1} de {totalSteps}
              </span>
            </div>

            {/* Título del paso */}
            <h2 className="text-xl sm:text-2xl font-black text-duo-text text-center uppercase tracking-tight mb-1">
              {currentContentStep.titulo}
            </h2>
            <div className="h-1 w-12 bg-duo-blue mx-auto rounded-full mb-2"></div>

            {/* Descripción */}
            <p className="text-sm font-bold text-duo-gray-dark text-center mb-3 leading-relaxed">
              {currentContentStep.descripcion}
            </p>

            {/* Media */}
            <div className="mb-3">
              <MediaRenderer media={currentContentStep.media} />
            </div>

            {/* Instrucción / contenido */}
            <div className="bg-duo-background-soft rounded-2xl p-3 border-2 border-duo-gray">
              <p className="text-duo-text font-bold text-sm text-center leading-relaxed">
                {currentContentStep.contenido}
              </p>
            </div>
          </div>

          {/* Navegación fija al fondo de la tarjeta */}
          <div className="px-4 py-3 border-t-2 border-duo-gray flex items-center justify-between">
            <button
              onClick={goToPreviousStep}
              disabled={currentStep === 0}
              className={`btn-duo-white px-4 ${currentStep === 0 ? 'opacity-0 pointer-events-none' : ''}`}
            >
              <ChevronLeft className="w-6 h-6" strokeWidth={3} />
            </button>

            <div className="flex space-x-2">
              {sortedContent.map((_, idx) => (
                <div
                  key={idx}
                  className={`h-2 rounded-full transition-all duration-300 ${idx === currentStep ? 'w-8 bg-duo-blue' : 'w-2 bg-duo-gray'}`}
                ></div>
              ))}
            </div>

            <button
              onClick={goToNextStep}
              className="btn-duo-blue px-4"
            >
              <ChevronRight className="w-6 h-6" strokeWidth={3} />
            </button>
          </div>
        </>
      )}
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
