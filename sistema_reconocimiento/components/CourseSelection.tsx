import React from 'react';
import { Play, Star, Trophy } from 'lucide-react';
import { Course, UserProgress } from '../types';

interface CourseSelectionProps {
  courses: Course[];
  onSelectCourse: (course: Course) => void;
  userProgress: UserProgress;
}

const CourseSelection: React.FC<CourseSelectionProps> = ({
  courses,
  onSelectCourse,
  userProgress
}) => {
  const getCourseStats = (courseId: string) => {
    const progress = userProgress[courseId] || {};
    const completed = Object.values(progress).filter(level => level?.completed).length;
    const totalStars = Object.values(progress).reduce((total, level) => total + (level?.stars || 0), 0);
    return { completed, totalStars };
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold text-white mb-4">
          ¡Elige tu aventura de aprendizaje!
        </h2>
        <p className="text-xl text-white/80">
          Cada curso es una nueva aventura llena de desafíos y recompensas
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {courses.map((course) => {
          const stats = getCourseStats(course.id);
          return (
            <div
              key={course.id}
              className="group relative bg-white rounded-3xl shadow-2xl overflow-hidden transform hover:scale-105 transition-all duration-300 cursor-pointer"
              onClick={() => onSelectCourse(course)}
            >
              <div className={`h-32 bg-gradient-to-r ${course.color} relative overflow-hidden`}>
                <div className="absolute inset-0 bg-black/10"></div>
                <div className="absolute top-4 right-4 text-4xl">
                  {course.icon}
                </div>
                <div className="absolute bottom-4 left-4 flex space-x-2">
                  {stats.completed > 0 && (
                    <>
                      <div className="flex items-center space-x-1 bg-white/20 backdrop-blur-sm rounded-full px-3 py-1">
                        <Trophy className="w-4 h-4 text-yellow-300" />
                        <span className="text-white text-sm font-semibold">{stats.completed}</span>
                      </div>
                      <div className="flex items-center space-x-1 bg-white/20 backdrop-blur-sm rounded-full px-3 py-1">
                        <Star className="w-4 h-4 text-yellow-300 fill-current" />
                        <span className="text-white text-sm font-semibold">{stats.totalStars}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="p-6">
                <h3 className="text-2xl font-bold text-gray-800 mb-2">
                  {course.title}
                </h3>
                <p className="text-gray-600 mb-4 line-clamp-2">
                  {course.description}
                </p>

                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-500">
                    {course.levels.length} lecciones
                  </div>
                  <div className="flex items-center space-x-2">
                    <Play className="w-5 h-5 text-blue-500 group-hover:text-blue-600 transition-colors" />
                    <span className="text-blue-500 group-hover:text-blue-600 font-semibold transition-colors">
                      Comenzar
                    </span>
                  </div>
                </div>

                {stats.completed > 0 && (
                  <div className="mt-4">
                    <div className="flex justify-between text-sm text-gray-500 mb-1">
                      <span>Progreso</span>
                      <span>{stats.completed}/{course.levels.length}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 bg-gradient-to-r ${course.color} rounded-full transition-all duration-500`}
                        style={{ width: `${(stats.completed / course.levels.length) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CourseSelection;