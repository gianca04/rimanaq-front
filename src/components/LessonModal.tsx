import React, { useState, useEffect } from 'react';
import { X, Clock, Star, CheckCircle, BookOpen, Loader, Award, TrendingUp, Trophy } from 'lucide-react';
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
    <div className="fixed inset-0 bg-white z-50 flex flex-col animate-in fade-in duration-200">
      {/* Header Estilo Duolingo */}
      <div className="container mx-auto px-4 py-6 flex items-center space-x-4">
        <button
          onClick={onClose}
          className="text-duo-gray-dark hover:text-duo-text transition-colors"
        >
          <X className="w-8 h-8" strokeWidth={3} />
        </button>
        
        {/* Barra de progreso superior */}
        <div className="flex-grow bg-duo-gray rounded-full h-4 overflow-hidden">
          <div 
            className="h-full bg-duo-green rounded-full transition-all duration-500 shadow-[inset_0_-4px_0_rgba(0,0,0,0.1)]"
            style={{ width: isCompleted ? '100%' : '50%' }} // Simulado, debería ser real según el paso
          ></div>
        </div>

        <div className="flex items-center space-x-2 text-duo-yellow">
          <Star className="w-6 h-6 fill-current" strokeWidth={3} />
          <span className="font-black text-lg">3</span>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="flex-grow overflow-y-auto">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          {!isCompleted ? (
            <div className="animate-in slide-in-from-bottom duration-500">
              <h2 className="text-3xl font-black text-duo-text mb-8 text-center uppercase tracking-tight">
                {lessonData?.name || level.title}
              </h2>
              <LessonContentRenderer
                content={lessonData?.content || null}
                gestures={lessonData?.gestures || null}
                onComplete={handleComplete}
                className="p-0"
              />
            </div>
          ) : (
            /* Pantalla de completado estilo Duolingo */
            <div className="flex flex-col items-center justify-center py-12 animate-in zoom-in-95 duration-500">
              <div className="w-48 h-48 bg-duo-yellow rounded-full flex items-center justify-center shadow-[0_8px_0_#E5B400] mb-12">
                <Trophy className="w-24 h-24 text-white" strokeWidth={3} />
              </div>

              <h2 className="text-4xl font-black text-duo-text mb-4 uppercase tracking-tighter text-center">
                ¡Lección completada!
              </h2>
              <p className="text-xl font-bold text-duo-gray-dark mb-12 text-center">
                Has ganado <span className="text-duo-yellow font-black">+10 XP</span>
              </p>

              <div className="grid grid-cols-2 gap-4 w-full max-w-md">
                <div className="card-duo p-6 text-center">
                  <span className="block text-xs font-black text-duo-gray-dark uppercase mb-1">Puntos</span>
                  <span className="text-2xl font-black text-duo-blue">150</span>
                </div>
                <div className="card-duo p-6 text-center">
                  <span className="block text-xs font-black text-duo-gray-dark uppercase mb-1">Tiempo</span>
                  <span className="text-2xl font-black text-duo-green">{lessonData?.time_minutes || level.estimatedTime}m</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer Fijo Duolingo */}
      <div className="border-t-4 border-duo-gray py-6 sm:py-10 bg-white">
        <div className="container mx-auto px-4 max-w-4xl flex flex-col sm:flex-row justify-between items-center gap-4">
          {!isCompleted ? (
            <p className="text-duo-gray-dark font-bold text-sm uppercase tracking-widest hidden sm:block">
              Presiona continuar al terminar
            </p>
          ) : (
            <button
              onClick={handleReviewLesson}
              className="btn-duo-white sm:w-auto"
            >
              REVISAR LECCIÓN
            </button>
          )}
          
          <button
            onClick={isCompleted ? onClose : handleComplete}
            className={`w-full sm:w-auto sm:px-12 ${isCompleted ? 'btn-duo-green' : 'btn-duo-blue'}`}
          >
            {isCompleted ? 'CONTINUAR' : 'COMPLETAR'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LessonModal;
