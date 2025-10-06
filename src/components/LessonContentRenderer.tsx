import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { LessonContentStep, Gesture } from '../types';

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

  // Debug: Log gestures cuando se reciban
  React.useEffect(() => {
    if (gestures && gestures.length > 0) {
      console.log('🤟 Gestures recibidos para práctica:', gestures);
    }
  }, [gestures]);

  // Si no hay contenido, mostrar mensaje
  if (!content || content.length === 0) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <div className="text-6xl mb-4">📖</div>
        <h3 className="text-2xl font-bold text-gray-800 mb-4">
          Contenido en desarrollo
        </h3>
        <p className="text-gray-600">
          El contenido de esta lección estará disponible próximamente.
        </p>
      </div>
    );
  }

  // Ordenar pasos por index
  const sortedContent = [...content].sort((a, b) => a.index - b.index);
  const totalSteps = sortedContent.length;
  
  // Funciones de navegación
  const goToNextStep = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Al llegar al final, mostrar práctica
      setShowPractice(true);
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

  // Renderizar paso actual
  const currentContentStep = sortedContent[currentStep];

  return (
    <div className={`max-w-4xl mx-auto ${className}`}>
      {/* Indicador de progreso */}
      <div className="mb-8">
        <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
          <span>
            {showPractice ? 'Práctica' : `Paso ${currentStep + 1} de ${totalSteps}`}
          </span>
          <span>
            {showPractice ? '100%' : `${Math.round(((currentStep + 1) / totalSteps) * 100)}%`}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
            style={{ 
              width: showPractice ? '100%' : `${((currentStep + 1) / totalSteps) * 100}%` 
            }}
          ></div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden min-h-[500px]">
        {showPractice ? (
          // Sección de práctica con gestures
          <div className="p-8">
            <div className="text-center mb-8">
              <div className="text-6xl mb-6">🎯</div>
              <h2 className="text-3xl font-bold text-gray-800 mb-4">
                ¡Práctica!
              </h2>
              <p className="text-xl text-gray-600 mb-8">
                Ahora es momento de practicar los gestos aprendidos en esta lección.
              </p>
            </div>

            {/* Mostrar gestures si existen */}
            {gestures && gestures.length > 0 ? (
              <GesturesPractice gestures={gestures} />
            ) : (
              <div className="text-center py-8">
                <div className="text-4xl mb-4">🤷‍♂️</div>
                <p className="text-gray-600 mb-8">
                  No hay gestos específicos para practicar en esta lección.
                </p>
              </div>
            )}

            <div className="space-y-4 mt-8">
              <button
                onClick={handleCompletePractice}
                className="w-full px-6 py-4 bg-green-500 text-white rounded-xl font-semibold text-lg hover:bg-green-600 transition-colors"
              >
                Completar Lección
              </button>
              <button
                onClick={() => setShowPractice(false)}
                className="w-full px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
              >
                Revisar contenido
              </button>
            </div>
          </div>
        ) : (
          // Contenido del paso actual
          <div className="p-8">
            {/* Header del paso */}
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                {currentContentStep.titulo}
              </h2>
              <p className="text-lg text-gray-600">
                {currentContentStep.descripcion}
              </p>
            </div>

            {/* Media (imagen o video) */}
            <div className="mb-6">
              <MediaRenderer media={currentContentStep.media} />
            </div>

            {/* Contenido de texto */}
            <div className="prose max-w-none mb-8">
              <p className="text-gray-700 leading-relaxed text-lg">
                {currentContentStep.contenido}
              </p>
            </div>
          </div>
        )}

        {/* Controles de navegación */}
        <div className="px-8 py-4 bg-gray-50 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <button
              onClick={goToPreviousStep}
              disabled={currentStep === 0 && !showPractice}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                currentStep === 0 && !showPractice
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-gray-700 hover:bg-gray-200'
              }`}
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Anterior</span>
            </button>

            <div className="text-sm text-gray-500">
              {showPractice ? 'Práctica' : `${currentStep + 1} / ${totalSteps}`}
            </div>

            <button
              onClick={goToNextStep}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors"
            >
              <span>
                {currentStep === totalSteps - 1 ? 'Practicar' : 'Siguiente'}
              </span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Componente para renderizar media (imagen o video)
const MediaRenderer: React.FC<{ media: { tipo: string; url: string } }> = ({ media }) => {
  if (media.tipo === 'image') {
    return (
      <div className="relative rounded-xl overflow-hidden bg-gray-100">
        <img 
          src={media.url} 
          alt="Contenido de la lección"
          className="w-full h-auto max-h-96 object-contain"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
            const parent = target.parentElement;
            if (parent) {
              parent.innerHTML = `
                <div class="flex items-center justify-center h-48 text-gray-400">
                  <div class="text-center">
                    <div class="text-4xl mb-2">🖼️</div>
                    <p>Error al cargar la imagen</p>
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
    // Convertir URL de YouTube shorts a embed
    const getYouTubeEmbedUrl = (url: string) => {
      const shortsMatch = url.match(/youtube\.com\/shorts\/([a-zA-Z0-9_-]+)/);
      if (shortsMatch) {
        return `https://www.youtube.com/embed/${shortsMatch[1]}`;
      }
      
      const watchMatch = url.match(/youtube\.com\/watch\?v=([a-zA-Z0-9_-]+)/);
      if (watchMatch) {
        return `https://www.youtube.com/embed/${watchMatch[1]}`;
      }
      
      const embedMatch = url.match(/youtube\.com\/embed\/([a-zA-Z0-9_-]+)/);
      if (embedMatch) {
        return url;
      }
      
      return url; // Fallback para otras URLs
    };

    const embedUrl = getYouTubeEmbedUrl(media.url);

    return (
      <div className="relative rounded-xl overflow-hidden bg-gray-100">
        <div className="aspect-video">
          <iframe
            src={embedUrl}
            title="Video de la lección"
            className="w-full h-full"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            onError={() => {
              console.error('Error al cargar el video:', media.url);
            }}
          />
        </div>
      </div>
    );
  }

  // Fallback para tipos no reconocidos
  return (
    <div className="flex items-center justify-center h-48 bg-gray-100 rounded-xl text-gray-400">
      <div className="text-center">
        <div className="text-4xl mb-2">❓</div>
        <p>Tipo de media no soportado: {media.tipo}</p>
      </div>
    </div>
  );
};

// Componente para mostrar los gestures en la práctica
const GesturesPractice: React.FC<{ gestures: Gesture[] }> = ({ gestures }) => {
  return (
    <div className="space-y-6">
      <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">
        Gestos para practicar:
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {gestures.map((gesture) => (
          <div
            key={gesture.id}
            className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl p-6 border-2 border-blue-200 hover:border-blue-300 transition-colors"
          >
            {/* Header del gesto */}
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold">🤟</span>
              </div>
              <div>
                <h4 className="text-lg font-bold text-gray-800">
                  {gesture.gesture_data.name}
                </h4>
                <p className="text-sm text-gray-600">
                  {gesture.gesture_data.frameCount} frames • {gesture.gesture_data.isSequential ? 'Secuencial' : 'Estático'}
                </p>
              </div>
            </div>

            {/* Información del gesto */}
            <div className="space-y-3">
              <div className="bg-white/50 rounded-lg p-3">
                <p className="text-sm text-gray-700">
                  <span className="font-medium">Tipo:</span> {gesture.gesture_data.isSequential ? 'Gesto en movimiento' : 'Gesto estático'}
                </p>
              </div>

              <div className="bg-white/50 rounded-lg p-3">
                <p className="text-sm text-gray-700">
                  <span className="font-medium">Frames:</span> {gesture.gesture_data.frameCount} posiciones registradas
                </p>
              </div>

              {/* Información adicional si existe */}
              {gesture.description && (
                <div className="bg-white/50 rounded-lg p-3">
                  <p className="text-sm text-gray-700">
                    <span className="font-medium">Descripción:</span> {gesture.description}
                  </p>
                </div>
              )}
            </div>

            {/* Botón para practicar (placeholder por ahora) */}
            <div className="mt-4">
              <button className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium">
                Ver detalles del gesto
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Información adicional */}
      <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-6 mt-6">
        <div className="flex items-start space-x-3">
          <div className="text-2xl">💡</div>
          <div>
            <h4 className="font-bold text-yellow-800 mb-2">Cómo practicar:</h4>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• Observa cuidadosamente cada gesto</li>
              <li>• Practica frente a una cámara si es posible</li>
              <li>• Repite los movimientos varias veces</li>
              <li>• Presta atención a la posición de las manos</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LessonContentRenderer;