import React from 'react';
import { Clock, Star, Lock, CheckCircle } from 'lucide-react';
import { CourseWithLevels, Level, UserProgress } from '../types';

interface LevelMapProps {
  course: CourseWithLevels;
  userProgress: UserProgress;
  onSelectLevel: (level: Level) => void;
}

const LevelMap: React.FC<LevelMapProps> = ({
  course,
  userProgress,
  onSelectLevel
}) => {
  const isLevelUnlocked = (levelIndex: number) => {
    if (levelIndex === 0) return true;
    const previousLevel = course.levels[levelIndex - 1];
    return userProgress[course.id]?.[previousLevel.id]?.completed || false;
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-500';
      case 'medium': return 'bg-yellow-500';
      case 'hard': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getDifficultyText = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'Fácil';
      case 'medium': return 'Medio';
      case 'hard': return 'Difícil';
      default: return '';
    }
  };

  const renderStars = (stars: number) => {
    return (
      <div className="flex space-x-1">
        {[1, 2, 3].map((star) => (
          <Star
            key={star}
            className={`w-5 h-5 ${
              star <= stars 
                ? 'text-yellow-400 fill-current' 
                : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">
          Mapa de Aventuras
        </h2>
        <p className="text-white/80">
          Completa cada nivel para desbloquear el siguiente
        </p>
      </div>

      <div className="relative">
        {/* Línea de conexión entre niveles */}
        <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-purple-400 to-blue-400 transform -translate-x-1/2 hidden md:block"></div>

        <div className="space-y-8">
          {course.levels.map((level, index) => {
            const isUnlocked = isLevelUnlocked(index);
            const progress = userProgress[course.id]?.[level.id];
            const isCompleted = progress?.completed || false;
            const isEven = index % 2 === 0;

            return (
              <div key={level.id} className="relative">
                <div className={`flex items-center ${isEven ? 'md:flex-row' : 'md:flex-row-reverse'} flex-col`}>
                  {/* Contenido del nivel */}
                  <div className={`w-full md:w-5/12 ${isEven ? 'md:pr-8' : 'md:pl-8'}`}>
                    <div
                      className={`
                        relative bg-white rounded-2xl shadow-xl overflow-hidden transform transition-all duration-300
                        ${isUnlocked ? 'hover:scale-105 cursor-pointer' : 'opacity-60 cursor-not-allowed'}
                        ${isCompleted ? 'ring-4 ring-green-400' : ''}
                      `}
                      onClick={() => isUnlocked && onSelectLevel(level)}
                    >
                      <div className={`h-4 bg-gradient-to-r ${course.color}`}></div>
                      
                      <div className="p-6">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="text-xl font-bold text-gray-800">
                            Nivel {index + 1}: {level.title}
                          </h3>
                          {!isUnlocked && <Lock className="w-5 h-5 text-gray-400" />}
                          {isCompleted && <CheckCircle className="w-6 h-6 text-green-500" />}
                        </div>

                        <p className="text-gray-600 mb-4">
                          {level.description}
                        </p>

                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center space-x-2">
                            <Clock className="w-4 h-4 text-gray-500" />
                            <span className="text-gray-500">{level.estimatedTime} min</span>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <div className={`px-2 py-1 rounded-full text-xs text-white ${getDifficultyColor(level.difficulty)}`}>
                              {getDifficultyText(level.difficulty)}
                            </div>
                          </div>
                        </div>

                        {isCompleted && progress && (
                          <div className="mt-4 pt-4 border-t border-gray-200">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-semibold text-gray-700">Tu puntuación:</span>
                              {renderStars(progress?.stars || 0)}
                            </div>
                          </div>
                        )}
                      </div>

                      {!isUnlocked && (
                        <div className="absolute inset-0 bg-gray-200/50 backdrop-blur-sm flex items-center justify-center">
                          <div className="bg-white rounded-full p-4 shadow-lg">
                            <Lock className="w-8 h-8 text-gray-400" />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Círculo central en desktop */}
                  <div className="hidden md:flex items-center justify-center w-2/12">
                    <div className={`
                      w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold shadow-lg z-10
                      ${isCompleted ? 'bg-green-500 text-white' : isUnlocked ? `bg-gradient-to-r ${course.color} text-white` : 'bg-gray-300 text-gray-500'}
                    `}>
                      {isCompleted ? '✓' : index + 1}
                    </div>
                  </div>

                  <div className="w-full md:w-5/12"></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default LevelMap;