import React, { useState, useEffect } from 'react';
import { X, Clock, Star, CheckCircle, BookOpen, Loader, Award, TrendingUp } from 'lucide-react';
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

  useEffect(() => {
    const loadLessonData = async () => {
      try {
        setLoading(true);
        setError(null);
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
    const timeBonus = Math.max(0, level.estimatedTime - 10);
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
        return 'text-emerald-700 bg-emerald-50 border-emerald-200';
      case 'medio':
        return 'text-amber-700 bg-amber-50 border-amber-200';
      case 'difícil':
        return 'text-rose-700 bg-rose-50 border-rose-200';
      default:
        return 'text-slate-700 bg-slate-50 border-slate-200';
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-black/60 to-black/40 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
        <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-10 text-center transform animate-in zoom-in-95 duration-300">
          <div className="relative inline-flex mb-6">
            <div className="absolute inset-0 bg-blue-400 rounded-full blur-xl opacity-40 animate-pulse"></div>
            <Loader className="w-14 h-14 animate-spin text-blue-600 relative" strokeWidth={2.5} />
          </div>
          <h3 className="text-2xl font-bold text-slate-800 mb-3">
            Cargando lección
          </h3>
          <p className="text-slate-500 text-sm">
            Preparando el contenido...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-black/60 to-black/40 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
        <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-10 text-center transform animate-in zoom-in-95 duration-300">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <X className="w-10 h-10 text-red-600" strokeWidth={2.5} />
          </div>
          <h3 className="text-2xl font-bold text-slate-800 mb-3">
            Error al cargar
          </h3>
          <p className="text-slate-600 mb-8 text-sm leading-relaxed">{error}</p>
          <button
            onClick={onClose}
            className="w-full px-6 py-3.5 bg-slate-100 text-slate-700 rounded-xl font-semibold hover:bg-slate-200 active:scale-[0.98] transition-all duration-200"
          >
            Cerrar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-black/60 to-black/40 backdrop-blur-md flex items-center justify-center z-50 p-2 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-sm sm:max-w-2xl lg:max-w-4xl xl:max-w-6xl max-h-[98vh] sm:max-h-[95vh] overflow-hidden transform animate-in zoom-in-95 duration-300">
        {/* Header mejorado */}
        <div className="relative h-24 sm:h-28 overflow-hidden">
          {/* Fondo con gradiente y patrón */}
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(135deg, ${course.color} 0%, ${course.color}cc 50%, ${course.color}99 100%)`
            }}
          >
            <div className="absolute inset-0 opacity-10" style={{
              backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
              backgroundSize: '32px 32px'
            }}></div>
          </div>

          {/* Overlay sutil */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/10 to-black/30"></div>

          {/* Botón cerrar mejorado */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 sm:top-4 sm:right-4 w-9 h-9 sm:w-10 sm:h-10 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white rounded-full transition-all duration-200 flex items-center justify-center group active:scale-95"
          >
            <X className="w-5 h-5 sm:w-6 sm:h-6 group-hover:rotate-90 transition-transform duration-300" />
          </button>

          {/* Información de la lección mejorada */}
          <div className="absolute bottom-3 left-4 right-14 sm:bottom-4 sm:left-6 sm:right-20">
            <div className="flex items-center space-x-2 sm:space-x-2.5 text-white mb-2">
              <div className="w-8 h-8 sm:w-9 sm:h-9 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center flex-shrink-0">
                <BookOpen className="w-4 h-4 sm:w-5 sm:h-5" strokeWidth={2.5} />
              </div>
              <span className="font-bold text-base sm:text-lg truncate drop-shadow-md">
                {lessonData?.name || level.title}
              </span>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="flex items-center space-x-1.5 bg-white/20 backdrop-blur-sm px-2.5 py-1 rounded-lg">
                <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4" strokeWidth={2.5} />
                <span className="text-xs sm:text-sm font-medium">
                  {lessonData?.time_minutes || level.estimatedTime} min
                </span>
              </div>
              <div className={`px-3 py-1 rounded-lg text-xs font-semibold border ${getDifficultyColor(lessonData?.difficulty || level.difficulty)}`}>
                {lessonData?.difficulty || level.difficulty}
              </div>
            </div>
          </div>
        </div>

        {/* Contenido principal con mejor espaciado */}
        <div className="overflow-y-auto max-h-[calc(98vh-96px)] sm:max-h-[calc(95vh-112px)] scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100">
          {!isCompleted ? (
            <LessonContentRenderer
              content={lessonData?.content || null}
              gestures={lessonData?.gestures || null}
              onComplete={handleComplete}
              className="p-4 sm:p-8"
            />
          ) : (
            /* Pantalla de completado mejorada */
            <div className="p-6 sm:p-12 text-center">
              {/* Animación de éxito */}
              <div className="relative inline-flex mb-6 sm:mb-8">
                <div className="absolute inset-0 bg-emerald-400 rounded-full blur-2xl opacity-30 animate-pulse"></div>
                <div className="relative w-24 h-24 sm:w-28 sm:h-28 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center transform animate-in zoom-in-90 duration-500">
                  <CheckCircle className="w-14 h-14 sm:w-16 sm:h-16 text-white" strokeWidth={2.5} />
                </div>
              </div>

              <h2 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent mb-3 sm:mb-4">
                ¡Lección completada!
              </h2>
              <p className="text-base sm:text-lg text-slate-600 mb-8 sm:mb-10 max-w-md mx-auto leading-relaxed">
                Has terminado <span className="font-semibold text-slate-800">"{lessonData?.name || level.title}"</span> exitosamente
              </p>

              {/* Tarjeta de puntuación mejorada */}
              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-6 sm:p-8 mb-8 sm:mb-10 inline-block border border-emerald-100 shadow-lg shadow-emerald-100/50">
                <div className="flex items-center justify-center gap-3 mb-3">
                  <Award className="w-8 h-8 sm:w-10 sm:h-10 text-emerald-600" strokeWidth={2.5} />
                  <TrendingUp className="w-6 h-6 sm:w-8 sm:h-8 text-teal-600" strokeWidth={2.5} />
                </div>
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Star className="w-7 h-7 sm:w-9 sm:h-9 text-amber-500 fill-amber-500" strokeWidth={2.5} />
                  <Star className="w-7 h-7 sm:w-9 sm:h-9 text-amber-500 fill-amber-500" strokeWidth={2.5} />
                  <Star className="w-7 h-7 sm:w-9 sm:h-9 text-amber-500 fill-amber-500" strokeWidth={2.5} />
                </div>
                <p className="text-lg sm:text-xl font-bold text-emerald-800">
                  Lección completada
                </p>
                <p className="text-sm text-emerald-600 mt-1">
                  ¡Sigue así!
                </p>
              </div>

              {/* Botones mejorados */}
              <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 max-w-md mx-auto">
                <button
                  onClick={handleReviewLesson}
                  className="w-full sm:w-auto px-6 sm:px-8 py-3.5 bg-white border-2 border-slate-200 text-slate-700 rounded-xl font-semibold hover:bg-slate-50 hover:border-slate-300 active:scale-[0.98] transition-all duration-200 shadow-sm"
                >
                  Revisar lección
                </button>
                <button
                  onClick={onClose}
                  className="w-full sm:w-auto px-8 sm:px-10 py-3.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 active:scale-[0.98] transition-all duration-200 shadow-lg shadow-blue-600/30"
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
