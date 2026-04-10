import React from 'react';
import { Play, Star, Trophy } from 'lucide-react';
import { CourseWithLevels, UserProgress } from '../types';
import { API_CONFIG } from '../config/constants';

interface CourseSelectionProps {
  courses: CourseWithLevels[];
  onSelectCourse: (course: CourseWithLevels) => void;
  userProgress?: UserProgress;
  loading?: boolean;
  error?: string | null;
}

const CourseSelection: React.FC<CourseSelectionProps> = ({
  courses,
  onSelectCourse,
  userProgress = {},
  loading = false,
  error = null
}) => {
  const getCourseStats = (courseId: string) => {
    const progress = userProgress[courseId] || {};
    const completed = Object.values(progress).filter(lesson => lesson?.completed).length;
    const totalScore = Object.values(progress).reduce((total, lesson) => total + (lesson?.score || 0), 0);
    return { completed, totalScore };
  };

  // Helper para construir la URL completa de la imagen
  const getImageUrl = (imagePath: string | undefined) => {
    if (!imagePath) return null;
    
    // Si ya es una URL completa, devolverla tal como está
    if (imagePath.startsWith('http')) {
      return imagePath;
    }
    
    // Si es una ruta relativa, construir la URL completa
    // Asumiendo que el servidor Laravel sirve las imágenes desde el dominio base
    const baseUrl = API_CONFIG.BASE_URL.replace('/api', ''); // Quitar /api del final
    return `${baseUrl}${imagePath}`;
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-white mb-4">
            Cargando cursos...
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white rounded-3xl shadow-2xl overflow-hidden animate-pulse"
            >
              <div className="h-32 bg-gray-300"></div>
              <div className="p-6">
                <div className="h-6 bg-gray-300 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-white mb-4">
            Error al cargar los cursos
          </h2>
          <p className="text-xl text-red-300">
            {error}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-12">
        <h2 className="text-5xl font-black text-duo-text mb-4 uppercase tracking-tight">
          ¿Qué quieres aprender hoy?
        </h2>
        <p className="text-xl font-bold text-duo-gray-dark">
          Explora la Lengua de Señas Peruana paso a paso
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-10">
        {courses.map((course) => {
          const stats = getCourseStats(course.id);
          const levelsCount = course.levels?.length || 0;
          
          return (
            <div
              key={course.id}
              className="card-duo-interactive h-full flex flex-col p-0 overflow-hidden"
              onClick={() => onSelectCourse(course)}
            >
              {/* Header con imagen o color de fondo sólido */}
              <div 
                className="h-44 relative overflow-hidden"
                style={{ 
                  backgroundColor: course.color || '#1CB0F6'
                }}
              >
                {getImageUrl(course.image_path) && (
                  <img 
                    src={getImageUrl(course.image_path)!} 
                    alt={course.title}
                    className="w-full h-full object-cover mix-blend-multiply opacity-80"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                )}
                
                {/* Estadísticas de progreso flotantes */}
                <div className="absolute top-4 left-4 flex space-x-2">
                  {stats.completed > 0 && (
                    <div className="flex items-center space-x-1 bg-white rounded-xl px-3 py-1.5 border-b-4 border-duo-gray shadow-sm">
                      <Trophy className="w-4 h-4 text-duo-yellow fill-duo-yellow" />
                      <span className="text-duo-text text-sm font-black">{stats.completed}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Contenido del curso */}
              <div className="p-6 flex-grow flex flex-col">
                <h3 className="text-2xl font-black text-duo-text mb-2 uppercase tracking-tight">
                  {course.title}
                </h3>
                <p className="text-duo-gray-dark font-bold mb-6 line-clamp-2">
                  {course.description}
                </p>

                <div className="mt-auto">
                  {/* Barra de progreso estilo Duolingo */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-end">
                      <span className="text-xs font-black text-duo-gray-dark uppercase tracking-widest">
                        {levelsCount > 0 ? `${levelsCount} NIVELES` : 'PRÓXIMAMENTE'}
                      </span>
                      {stats.completed > 0 && (
                        <span className="text-sm font-black text-duo-green">
                          {Math.round((stats.completed / levelsCount) * 100)}%
                        </span>
                      )}
                    </div>
                    <div className="w-full bg-duo-gray rounded-full h-4 overflow-hidden">
                      <div 
                        className="h-full bg-duo-green rounded-full transition-all duration-500"
                        style={{ 
                          width: `${(stats.completed / levelsCount) * 100}%` 
                        }}
                      ></div>
                    </div>
                  </div>
                  
                  <button className="w-full mt-6 btn-duo-white text-sm">
                    {levelsCount > 0 ? 'EMPEZAR' : 'VER DETALLES'}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Mensaje cuando no hay cursos */}
      {courses.length === 0 && !loading && (
        <div className="text-center py-20 card-duo bg-white">
          <div className="text-6xl mb-6">🏜️</div>
          <h3 className="text-3xl font-black text-duo-text mb-2">
            No hay cursos disponibles
          </h3>
          <p className="text-xl font-bold text-duo-gray-dark">
            Pronto agregaremos más lecciones para ti.
          </p>
        </div>
      )}
    </div>
  );
};

export default CourseSelection;