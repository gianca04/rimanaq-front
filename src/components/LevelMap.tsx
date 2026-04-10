import React from 'react';
import { Clock, Star, Lock, CheckCircle, Trophy, Sparkles } from 'lucide-react';
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
      case 'easy': return 'bg-duo-green/10 text-duo-green border-duo-green/30';
      case 'medium': return 'bg-duo-yellow/10 text-duo-yellow-dark border-duo-yellow/30';
      case 'hard': return 'bg-duo-red/10 text-duo-red border-duo-red/30';
      default: return 'bg-duo-gray/10 text-duo-text border-duo-gray/30';
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
            className={`w-5 h-5 transition-all duration-300 ${star <= stars
              ? 'text-duo-yellow fill-duo-yellow drop-shadow-[0_2px_4px_rgba(255,200,0,0.4)]'
              : 'text-duo-gray'
              }`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-duo-background-soft py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-6xl mx-auto">
        <div className="text-center mb-16 space-y-4 animate-fade-in">
          <div className="inline-flex items-center gap-3 px-6 py-3 bg-white rounded-full border-b-4 border-duo-gray shadow-md">
            <Trophy className="w-5 h-5 text-duo-yellow" />
            <span className="text-sm font-black text-duo-text uppercase tracking-wide">Tu Aventura de Aprendizaje</span>
          </div>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-duo-text mb-4 tracking-tight drop-shadow-sm uppercase">
            Mapa de Aventuras
          </h2>
          <p className="text-lg sm:text-xl text-duo-gray-dark max-w-2xl mx-auto font-bold italic">
            Completa cada nivel para desbloquear el siguiente desafío
          </p>
        </div>

        <div className="relative">
          <svg className="absolute left-1/2 top-0 bottom-0 w-2 -translate-x-1/2 hidden lg:block" style={{ height: '100%' }}>
            <defs>
              <linearGradient id="pathGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" style={{ stopColor: '#1CB0F6', stopOpacity: 1 }} />
                <stop offset="50%" style={{ stopColor: '#58CC02', stopOpacity: 1 }} />
                <stop offset="100%" style={{ stopColor: '#1CB0F6', stopOpacity: 1 }} />
              </linearGradient>
            </defs>
            <path
              d={`M 4 0 Q 4 50, ${Math.sin(0) * 20 + 4} 100 T 4 200 T 4 300 T 4 400 T 4 500 T 4 600 T 4 700 T 4 800 T 4 900 T 4 1000 L 4 10000`}
              stroke="url(#pathGradient)"
              strokeWidth="4"
              fill="none"
              className="drop-shadow-lg"
            />
          </svg>

          <div className="space-y-12 lg:space-y-20">
            {course.levels.map((level, index) => {
              const isUnlocked = isLevelUnlocked(index);
              const progress = userProgress[course.id]?.[level.id];
              const isCompleted = progress?.completed || false;
              const isEven = index % 2 === 0;

              return (
                <div key={level.id} className="relative group">
                  <div className={`flex items-center gap-8 ${isEven ? 'lg:flex-row' : 'lg:flex-row-reverse'} flex-col`}>
                    <div className={`w-full lg:w-5/12 ${isEven ? 'lg:pr-12' : 'lg:pl-12'}`}>
                      <div
                        className={`
                          relative bg-white rounded-3xl shadow-xl overflow-hidden transform transition-all duration-300 border-b-8
                          ${isUnlocked
                            ? 'hover:scale-[1.03] hover:shadow-2xl cursor-pointer hover:-translate-y-2 border-duo-gray hover:border-duo-blue-dark'
                            : 'opacity-70 cursor-not-allowed grayscale border-duo-gray'
                          }
                          ${isCompleted ? 'border-duo-green-dark' : isUnlocked ? 'border-duo-blue-dark' : ''}
                        `}
                        onClick={() => isUnlocked && onSelectLevel(level)}
                      >
                        <div className={`h-2 bg-duo-gray relative overflow-hidden`}>
                          {isUnlocked && (
                            <div className={`absolute inset-0 bg-duo-blue/20 animate-shimmer`}></div>
                          )}
                        </div>

                        <div className="p-8">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <span className={`
                                  inline-flex items-center justify-center w-10 h-10 rounded-xl font-black text-lg border-b-4
                                  ${isCompleted
                                    ? 'bg-duo-green border-duo-green-dark text-white'
                                    : isUnlocked
                                      ? 'bg-duo-blue border-duo-blue-dark text-white shadow-lg'
                                      : 'bg-duo-gray border-duo-gray-dark text-duo-gray-dark'
                                  }
                                `}>
                                  {index + 1}
                                </span>
                                <h3 className={`text-2xl font-black tracking-tight ${isUnlocked ? 'text-duo-text' : 'text-duo-gray-dark'} leading-tight`}>
                                  {level.title}
                                </h3>
                              </div>
                            </div>
                            {!isUnlocked && (
                              <div className="flex-shrink-0 ml-3">
                                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                                  <Lock className="w-6 h-6 text-gray-400" />
                                </div>
                              </div>
                            )}
                            {isCompleted && (
                              <div className="flex-shrink-0 ml-3">
                                <div className="w-12 h-12 rounded-full bg-duo-green/10 flex items-center justify-center animate-bounce-slow">
                                  <CheckCircle className="w-7 h-7 text-duo-green" />
                                </div>
                              </div>
                            )}
                          </div>

                          <p className={`mb-6 text-base font-bold italic leading-relaxed ${isUnlocked ? 'text-duo-text/70' : 'text-duo-gray-dark'}`}>
                            {level.description}
                          </p>

                          <div className="flex items-center justify-between gap-4 flex-wrap">
                            <div className="flex items-center gap-2 px-4 py-2 bg-duo-background-soft rounded-xl border-b-2 border-duo-gray">
                              <Clock className="w-5 h-5 text-duo-gray-dark" />
                              <span className="text-sm font-black text-duo-text">{level.estimatedTime} min</span>
                            </div>

                            <div className={`px-4 py-2 rounded-xl text-sm font-bold border-2 ${getDifficultyColor(level.difficulty)}`}>
                              {getDifficultyText(level.difficulty)}
                            </div>
                          </div>

                          {isCompleted && progress && (
                            <div className="mt-6 pt-6 border-t-2 border-gray-100">
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-black text-duo-text flex items-center gap-2 uppercase">
                                  <Sparkles className="w-4 h-4 text-duo-yellow" />
                                  Tu Puntuación:
                                </span>
                                {renderStars(progress?.stars || 0)}
                              </div>
                            </div>
                          )}
                        </div>

                        {!isUnlocked && (
                          <div className="absolute inset-0 bg-duo-background-soft/80 backdrop-blur-[1px] flex items-center justify-center">
                            <div className="bg-white rounded-2xl p-6 shadow-xl border-b-4 border-duo-gray">
                              <Lock className="w-10 h-10 text-duo-gray-dark" />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="hidden lg:flex items-center justify-center w-2/12 z-10">
                      <div className={`
                        w-20 h-20 rounded-2xl flex items-center justify-center text-3xl font-black shadow-xl transform transition-all duration-300 border-b-4
                        ${isCompleted
                          ? 'bg-duo-green border-duo-green-dark text-white rotate-12 group-hover:rotate-0 group-hover:scale-110'
                          : isUnlocked
                            ? `bg-duo-blue border-duo-blue-dark text-white group-hover:rotate-12 group-hover:scale-110`
                            : 'bg-duo-gray border-duo-gray-dark text-duo-gray-dark'
                        }
                      `}>
                        {isCompleted ? '✓' : index + 1}
                      </div>
                    </div>

                    <div className="w-full lg:w-5/12"></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-16 text-center">
          <div className="inline-flex items-center gap-3 px-8 py-4 bg-white rounded-2xl border-b-4 border-duo-gray shadow-md animate-bounce-slow">
            <Sparkles className="w-6 h-6 text-duo-yellow" />
            <span className="text-lg font-black text-duo-text uppercase tracking-wide">¡Sigue avanzando en tu camino!</span>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.8s ease-out;
        }
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .animate-bounce-slow {
          animation: bounce-slow 2s infinite;
        }
      `}</style>
    </div>
  );
};

export default LevelMap;