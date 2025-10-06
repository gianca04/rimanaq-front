import React, { useState, useEffect } from 'react';
import { X, Clock, Star, CheckCircle, BookOpen, Loader } from 'lucide-react';
import { CourseWithLevels, Level, LevelProgress, Lesson } from '../types';
import { CourseService } from '../services/courseService';
import LessonContentRenderer from './LessonContentRenderer';

interface LessonModalProps {
  level: Level;
  course: CourseWithLevels;
  onClose: () => void;
  onComplete: (courseId: string, levelId: string, stars: number) => void;
  currentProgress?: LevelProgress;
}

const LessonModal: React.FC<LessonModalProps> = ({
  level,
  course,
  onClose,
  onComplete,
  currentProgress
}) => {
  const [lessonData, setLessonData] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCompleted, setIsCompleted] = useState(currentProgress?.completed || false);

  // Cargar los datos de la lección desde la API
  useEffect(() => {
    const loadLessonData = async () => {
      try {
        setLoading(true);
        setError(null);
        // Convertir level.id de string a number para la API
        const lessonId = parseInt(level.id);
        const lesson = await CourseService.getLessonById(lessonId);
        setLessonData(lesson);
      } catch (err) {
        console.error('Error al cargar la lección:', err);
        setError(err instanceof Error ? err.message : 'Error al cargar la lección');
      } finally {
        setLoading(false);
      }
    };

    loadLessonData();
  }, [level.id]);

  const handleComplete = () => {
    const baseScore = 100;
    const timeBonus = Math.max(0, level.estimatedTime - 10); // Bonus por tiempo
    const finalScore = baseScore + timeBonus;
    
    setIsCompleted(true);
    onComplete(course.id, level.id, finalScore);
  };

  const handleReviewLesson = () => {
    setIsCompleted(false);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'fácil':
        return 'text-green-600 bg-green-100';
      case 'medio':
        return 'text-yellow-600 bg-yellow-100';
      case 'difícil':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full p-8 text-center">
          <Loader className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            Cargando lección...
          </h3>
          <p className="text-gray-600">
            Obteniendo el contenido desde el servidor
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full p-8 text-center">
          <div className="text-6xl mb-4">❌</div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            Error al cargar la lección
          </h3>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={onClose}
            className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-6xl w-full max-h-[95vh] overflow-hidden">
        {/* Header */}
        <div 
          className="h-20 relative"
          style={{ 
            background: `linear-gradient(135deg, ${course.color}, ${course.color}80)`
          }}
        >
          <div className="absolute inset-0 bg-black/20"></div>
          
          {/* Botón cerrar */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white hover:text-gray-200 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Información de la lección */}
          <div className="absolute bottom-4 left-6 flex items-center space-x-4 text-white">
            <div className="flex items-center space-x-2">
              <BookOpen className="w-5 h-5" />
              <span className="font-semibold">
                {lessonData?.name || level.title}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4" />
              <span className="text-sm">
                {lessonData?.time_minutes || level.estimatedTime} min
              </span>
            </div>
            <div className={`px-3 py-1 rounded-full text-xs font-medium ${getDifficultyColor(lessonData?.difficulty || level.difficulty)}`}>
              {lessonData?.difficulty || level.difficulty}
            </div>
          </div>
        </div>

        {/* Contenido principal */}
        <div className="overflow-y-auto" style={{ maxHeight: 'calc(95vh - 80px)' }}>
          {!isCompleted ? (
            <LessonContentRenderer
              content={lessonData?.content || null}
              gestures={lessonData?.gestures || null}
              onComplete={handleComplete}
              className="p-6"
            />
          ) : (
            /* Pantalla de completado */
            <div className="p-8 text-center">
              <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-6" />
              <h2 className="text-3xl font-bold text-gray-800 mb-4">
                ¡Lección completada!
              </h2>
              <p className="text-xl text-gray-600 mb-6">
                Has terminado "{lessonData?.name || level.title}" exitosamente
              </p>
              
              {/* Puntuación */}
              <div className="bg-green-50 rounded-xl p-6 mb-6 inline-block">
                <Star className="w-8 h-8 text-yellow-500 mx-auto mb-2 fill-current" />
                <div className="text-green-800">
                  <span className="text-lg text-gray-600">Lección completada</span>
                </div>
              </div>

              <div className="flex justify-center space-x-4">
                <button
                  onClick={handleReviewLesson}
                  className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
                >
                  Revisar lección
                </button>
                <button
                  onClick={onClose}
                  className="px-8 py-3 bg-blue-500 text-white rounded-xl font-semibold hover:bg-blue-600 transition-colors"
                >
                  Continuar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LessonModal;