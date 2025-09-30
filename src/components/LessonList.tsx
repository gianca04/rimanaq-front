import React from 'react';
import { Clock, Play, Star, Trophy, ArrowLeft, BookOpen } from 'lucide-react';
import { Lesson, UserProgress } from '../types';

interface LessonListProps {
  lessons: Lesson[];
  courseId: number;
  courseName: string;
  courseColor: string;
  onSelectLesson: (lesson: Lesson) => void;
  onBackToCourses: () => void;
  userProgress?: UserProgress;
  loading?: boolean;
  error?: string | null;
}

const LessonList: React.FC<LessonListProps> = ({
  lessons,
  courseId,
  courseName,
  courseColor,
  onSelectLesson,
  onBackToCourses,
  userProgress = {},
  loading = false,
  error = null
}) => {
  const getLessonProgress = (lessonId: number) => {
    const courseProgress = userProgress[courseId.toString()] || {};
    return courseProgress[lessonId.toString()] || { completed: false, score: 0 };
  };

  const getCompletedLessonsCount = () => {
    const courseProgress = userProgress[courseId.toString()] || {};
    return Object.values(courseProgress).filter(lesson => lesson?.completed).length;
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'fácil':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'medio':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'difícil':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getDifficultyIcon = (difficulty: string) => {
    switch (difficulty) {
      case 'fácil':
        return '🟢';
      case 'medio':
        return '🟡';
      case 'difícil':
        return '🔴';
      default:
        return '⚪';
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          <div className="p-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-800 mb-4">
                Cargando lecciones...
              </h2>
            </div>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="p-6 border border-gray-200 rounded-xl animate-pulse"
                >
                  <div className="h-6 bg-gray-300 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          <div className="p-8 text-center">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              Error al cargar las lecciones
            </h2>
            <p className="text-red-600 mb-6">{error}</p>
            <button
              onClick={onBackToCourses}
              className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Volver a cursos
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header del curso */}
      <div className="bg-white rounded-3xl shadow-2xl overflow-hidden mb-8">
        <div 
          className="h-32 relative"
          style={{ 
            background: `linear-gradient(135deg, ${courseColor}, ${courseColor}80)`
          }}
        >
          <div className="absolute inset-0 bg-black/20"></div>
          
          {/* Botón de regresar */}
          <button
            onClick={onBackToCourses}
            className="absolute top-4 left-4 flex items-center space-x-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 text-white hover:bg-white/30 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Cursos</span>
          </button>

          {/* Estadísticas */}
          <div className="absolute bottom-4 right-4 flex space-x-3">
            <div className="flex items-center space-x-1 bg-white/20 backdrop-blur-sm rounded-full px-3 py-1">
              <BookOpen className="w-4 h-4 text-white" />
              <span className="text-white text-sm font-semibold">{lessons.length}</span>
            </div>
            <div className="flex items-center space-x-1 bg-white/20 backdrop-blur-sm rounded-full px-3 py-1">
              <Trophy className="w-4 h-4 text-yellow-300" />
              <span className="text-white text-sm font-semibold">{getCompletedLessonsCount()}</span>
            </div>
          </div>
        </div>

        <div className="p-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            {courseName}
          </h1>
          <p className="text-gray-600">
            {lessons.length > 0 
              ? `${lessons.length} lecciones disponibles`
              : 'No hay lecciones disponibles'
            }
          </p>
        </div>
      </div>

      {/* Lista de lecciones */}
      {lessons.length > 0 ? (
        <div className="space-y-4">
          {lessons
            .sort((a, b) => a.level_number - b.level_number)
            .map((lesson) => {
              const progress = getLessonProgress(lesson.id);
              const isCompleted = progress.completed;
              
              return (
                <div
                  key={lesson.id}
                  className={`bg-white rounded-xl shadow-lg border-2 transition-all duration-300 hover:shadow-xl cursor-pointer ${
                    isCompleted 
                      ? 'border-green-200 bg-green-50/30' 
                      : 'border-gray-200 hover:border-blue-300'
                  }`}
                  onClick={() => onSelectLesson(lesson)}
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-3">
                          <div 
                            className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-lg ${
                              isCompleted ? 'bg-green-500' : 'bg-blue-500'
                            }`}
                          >
                            {isCompleted ? '✓' : lesson.level_number}
                          </div>
                          
                          <div className="flex-1">
                            <h3 className="text-xl font-bold text-gray-800 mb-1">
                              {lesson.name}
                            </h3>
                            <p className="text-gray-600">
                              {lesson.description}
                            </p>
                          </div>
                        </div>

                        {/* Metadata de la lección */}
                        <div className="flex items-center space-x-4 text-sm">
                          <div className="flex items-center space-x-1 text-gray-500">
                            <Clock className="w-4 h-4" />
                            <span>{lesson.time_minutes} min</span>
                          </div>
                          
                          <div className={`px-2 py-1 rounded-full border text-xs font-medium ${getDifficultyColor(lesson.difficulty)}`}>
                            <span className="mr-1">{getDifficultyIcon(lesson.difficulty)}</span>
                            {lesson.difficulty}
                          </div>
                          
                          {isCompleted && (
                            <div className="flex items-center space-x-1 text-green-600">
                              <Star className="w-4 h-4 fill-current" />
                              <span className="font-semibold">{progress.score} pts</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Botón de acción */}
                      <div className="ml-4">
                        <div className="flex items-center space-x-2 text-blue-500">
                          <Play className="w-5 h-5" />
                          <span className="font-semibold">
                            {isCompleted ? 'Repasar' : 'Comenzar'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      ) : (
        <div className="bg-white rounded-3xl shadow-2xl p-12 text-center">
          <div className="text-6xl mb-4">📚</div>
          <h3 className="text-2xl font-bold text-gray-800 mb-4">
            Lecciones en desarrollo
          </h3>
          <p className="text-gray-600 mb-6">
            Las lecciones para este curso estarán disponibles próximamente.
          </p>
          <button
            onClick={onBackToCourses}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Explorar otros cursos
          </button>
        </div>
      )}
    </div>
  );
};

export default LessonList;