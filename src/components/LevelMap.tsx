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
      case 'easy': return 'bg-emerald-100 text-emerald-700 border-emerald-300';
      case 'medium': return 'bg-amber-100 text-amber-700 border-amber-300';
      case 'hard': return 'bg-rose-100 text-rose-700 border-rose-300';
      default: return 'bg-slate-100 text-slate-700 border-slate-300';
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
              ? 'text-amber-500 fill-amber-400 drop-shadow-[0_2px_4px_rgba(251,191,36,0.4)]'
              : 'text-slate-300'
              }`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-6xl mx-auto">
        <div className="text-center mb-16 space-y-4 animate-fade-in">
          <div className="inline-flex items-center gap-3 px-6 py-3 bg-white/20 backdrop-blur-md rounded-full border border-white/30 shadow-lg">
            <Trophy className="w-5 h-5 text-amber-300" />
            <span className="text-sm font-semibold text-white tracking-wide">Tu Aventura de Aprendizaje</span>
          </div>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white mb-4 tracking-tight drop-shadow-lg">
            Mapa de Aventuras
          </h2>
          <p className="text-lg sm:text-xl text-white/90 max-w-2xl mx-auto font-medium">
            Completa cada nivel para desbloquear el siguiente desafío
          </p>
        </div>

        <div className="relative">
          <svg className="absolute left-1/2 top-0 bottom-0 w-2 -translate-x-1/2 hidden lg:block" style={{ height: '100%' }}>
            <defs>
              <linearGradient id="pathGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" style={{ stopColor: '#a78bfa', stopOpacity: 1 }} />
                <stop offset="50%" style={{ stopColor: '#c084fc', stopOpacity: 1 }} />
                <stop offset="100%" style={{ stopColor: '#e879f9', stopOpacity: 1 }} />
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
                          relative bg-white rounded-3xl shadow-2xl overflow-hidden transform transition-all duration-500
                          ${isUnlocked
                            ? 'hover:scale-[1.03] hover:shadow-[0_20px_60px_rgba(0,0,0,0.3)] cursor-pointer hover:-translate-y-2'
                            : 'opacity-70 cursor-not-allowed grayscale'
                          }
                          ${isCompleted ? 'ring-4 ring-emerald-400 ring-offset-4 ring-offset-transparent' : ''}
                        `}
                        onClick={() => isUnlocked && onSelectLevel(level)}
                      >
                        <div className={`h-2 bg-gradient-to-r ${course.color} relative overflow-hidden`}>
                          {isUnlocked && (
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer"></div>
                          )}
                        </div>

                        <div className="p-8">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <span className={`
                                  inline-flex items-center justify-center w-10 h-10 rounded-xl font-bold text-lg
                                  ${isCompleted
                                    ? 'bg-emerald-100 text-emerald-600'
                                    : isUnlocked
                                      ? 'bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-lg'
                                      : 'bg-gray-200 text-gray-500'
                                  }
                                `}>
                                  {index + 1}
                                </span>
                                <h3 className="text-2xl font-bold text-gray-900 leading-tight">
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
                                <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center animate-bounce-slow">
                                  <CheckCircle className="w-7 h-7 text-emerald-500" />
                                </div>
                              </div>
                            )}
                          </div>

                          <p className="text-gray-600 mb-6 text-base leading-relaxed">
                            {level.description}
                          </p>

                          <div className="flex items-center justify-between gap-4 flex-wrap">
                            <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-xl">
                              <Clock className="w-5 h-5 text-gray-500" />
                              <span className="text-sm font-semibold text-gray-700">{level.estimatedTime} min</span>
                            </div>

                            <div className={`px-4 py-2 rounded-xl text-sm font-bold border-2 ${getDifficultyColor(level.difficulty)}`}>
                              {getDifficultyText(level.difficulty)}
                            </div>
                          </div>

                          {isCompleted && progress && (
                            <div className="mt-6 pt-6 border-t-2 border-gray-100">
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-bold text-gray-700 flex items-center gap-2">
                                  <Sparkles className="w-4 h-4 text-amber-500" />
                                  Tu Puntuación:
                                </span>
                                {renderStars(progress?.stars || 0)}
                              </div>
                            </div>
                          )}
                        </div>

                        {!isUnlocked && (
                          <div className="absolute inset-0 bg-gradient-to-br from-gray-100/80 to-gray-200/80 backdrop-blur-[2px] flex items-center justify-center">
                            <div className="bg-white rounded-2xl p-6 shadow-xl">
                              <Lock className="w-10 h-10 text-gray-400" />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="hidden lg:flex items-center justify-center w-2/12 z-10">
                      <div className={`
                        w-20 h-20 rounded-2xl flex items-center justify-center text-3xl font-black shadow-2xl transform transition-all duration-500
                        ${isCompleted
                          ? 'bg-gradient-to-br from-emerald-400 to-emerald-600 text-white rotate-12 group-hover:rotate-0 group-hover:scale-110'
                          : isUnlocked
                            ? `bg-gradient-to-br ${course.color} text-white group-hover:rotate-12 group-hover:scale-110`
                            : 'bg-gradient-to-br from-gray-300 to-gray-400 text-gray-600'
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
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 backdrop-blur-md rounded-full border border-white/20">
            <Sparkles className="w-5 h-5 text-amber-300" />
            <span className="text-sm font-medium text-white">¡Sigue avanzando en tu camino!</span>
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