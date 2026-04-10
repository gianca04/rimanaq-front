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
    <div className={`max-w-4xl mx-auto pb-12 ${className}`}>
      {/* El progreso ahora se maneja en el Modal superior estilo Duolingo */}

      <div className="card-duo min-h-[500px] flex flex-col">
        {showPractice ? (
          <div className="flex-grow flex flex-col">
            <GesturePractice
              gestures={gestures}
              onComplete={handleCompletePractice}
              className="flex-grow"
            />

            <div className="p-6 border-t-2 border-duo-gray">
              <button
                onClick={() => setShowPractice(false)}
                className="btn-duo-white w-full text-xs"
              >
                VOLVER A LA LECCIÓN
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col flex-grow">
            <div className="p-8 sm:p-12 flex-grow">
              <div className="mb-10 text-center">
                <span className="inline-block px-4 py-2 bg-duo-blue/10 text-duo-blue rounded-xl text-xs font-black uppercase tracking-widest mb-6">
                  Paso {currentStep + 1} de {totalSteps}
                </span>
                <h2 className="text-3xl sm:text-4xl font-black text-duo-text mb-6 uppercase tracking-tight">
                  {currentContentStep.titulo}
                </h2>
                <div className="h-2 w-20 bg-duo-blue mx-auto rounded-full mb-8"></div>
                <p className="text-xl font-bold text-duo-gray-dark leading-relaxed max-w-2xl mx-auto">
                  {currentContentStep.descripcion}
                </p>
              </div>

              <div className="mb-12">
                <MediaRenderer media={currentContentStep.media} />
              </div>

              <div className="bg-duo-background-soft rounded-2xl p-8 border-2 border-duo-gray">
                <p className="text-duo-text font-bold leading-relaxed text-lg sm:text-xl text-center">
                  {currentContentStep.contenido}
                </p>
              </div>
            </div>

            {/* Navegación interna de la lección */}
            <div className="p-6 border-t-2 border-duo-gray flex items-center justify-between">
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
          </div>
        )}
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
