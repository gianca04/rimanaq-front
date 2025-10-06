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
        <h2 className="text-4xl font-bold text-white mb-4">
          ¡Aprende Lengua de Señas Peruana!
        </h2>
        <p className="text-xl text-white/80">
          Descubre el mundo de la comunicación visual
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {courses.map((course) => {
          const stats = getCourseStats(course.id);
          const levelsCount = course.levels?.length || 0;
          
          return (
            <div
              key={course.id}
              className="group relative bg-white rounded-3xl shadow-2xl overflow-hidden transform hover:scale-105 transition-all duration-300 cursor-pointer"
              onClick={() => onSelectCourse(course)}
            >
              {/* Header con imagen o color de fondo */}
              <div 
                className="h-48 relative overflow-hidden"
                style={{ 
                  background: getImageUrl(course.image_path) 
                    ? 'transparent' 
                    : `linear-gradient(135deg, ${course.color}, ${course.color}80)`
                }}
              >
                {getImageUrl(course.image_path) ? (
                  <>
                    <img 
                      src={getImageUrl(course.image_path)!} 
                      alt={course.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        // Fallback si la imagen no carga
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        const parent = target.parentElement;
                        if (parent) {
                          parent.style.background = `linear-gradient(135deg, ${course.color}, ${course.color}80)`;
                        }
                      }}
                    />
                    <div className="absolute inset-0 bg-black/20"></div>
                  </>
                ) : (
                  <div className="absolute inset-0 bg-black/20"></div>
                )}
                
                {/* Icono para LSP - mostrar solo si no hay imagen o como overlay */}
                <div className="absolute top-4 right-4 text-4xl">
                  🤟
                </div>
                
                {/* Estadísticas de progreso */}
                <div className="absolute bottom-4 left-4 flex space-x-2">
                  {stats.completed > 0 && (
                    <>
                      <div className="flex items-center space-x-1 bg-white/20 backdrop-blur-sm rounded-full px-3 py-1">
                        <Trophy className="w-4 h-4 text-yellow-300" />
                        <span className="text-white text-sm font-semibold">{stats.completed}</span>
                      </div>
                      <div className="flex items-center space-x-1 bg-white/20 backdrop-blur-sm rounded-full px-3 py-1">
                        <Star className="w-4 h-4 text-yellow-300 fill-current" />
                        <span className="text-white text-sm font-semibold">{stats.totalScore}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Contenido del curso */}
              <div className="p-6">
                <h3 className="text-2xl font-bold text-gray-800 mb-2">
                  {course.title}
                </h3>
                <p className="text-gray-600 mb-4 line-clamp-3">
                  {course.description}
                </p>

                <div className="flex items-center justify-between mb-4">
                  <div className="text-sm text-gray-500">
                    {levelsCount > 0 ? `${levelsCount} niveles` : 'Próximamente'}
                  </div>
                  <div className="flex items-center space-x-2">
                    <Play className="w-5 h-5 text-blue-500 group-hover:text-blue-600 transition-colors" />
                    <span className="text-blue-500 group-hover:text-blue-600 font-semibold transition-colors">
                      {levelsCount > 0 ? 'Comenzar' : 'Ver detalles'}
                    </span>
                  </div>
                </div>

                {/* Barra de progreso */}
                {stats.completed > 0 && levelsCount > 0 && (
                  <div className="mt-4">
                    <div className="flex justify-between text-sm text-gray-500 mb-1">
                      <span>Progreso</span>
                      <span>{stats.completed}/{levelsCount}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="h-2 rounded-full transition-all duration-500"
                        style={{ 
                          background: `linear-gradient(90deg, ${course.color}, ${course.color}80)`,
                          width: `${(stats.completed / levelsCount) * 100}%` 
                        }}
                      ></div>
                    </div>
                  </div>
                )}


              </div>
            </div>
          );
        })}
      </div>

      {/* Mensaje cuando no hay cursos */}
      {courses.length === 0 && !loading && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🤟</div>
          <h3 className="text-2xl font-bold text-white mb-2">
            No hay cursos disponibles
          </h3>
          <p className="text-white/80">
            Pronto agregaremos más cursos de Lengua de Señas Peruana
          </p>
        </div>
      )}
    </div>
  );
};

export default CourseSelection;