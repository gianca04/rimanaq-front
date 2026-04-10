import React from 'react';
import { Clock, Star, Lock, CheckCircle, Trophy, Sparkles, Check } from 'lucide-react';
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
      case 'easy': return 'bg-white text-duo-green border-duo-green';
      case 'medium': return 'bg-white text-duo-yellow-dark border-duo-yellow-dark';
      case 'hard': return 'bg-white text-duo-red border-duo-red';
      default: return 'bg-white text-duo-gray-dark border-duo-gray';
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
    <div className="min-h-screen bg-duo-background-soft py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-6xl mx-auto">
        <div className="text-center mb-16 space-y-4 animate-fade-in">
          <div className="inline-flex items-center gap-3 px-6 py-3 bg-white rounded-full border-b-4 border-duo-gray shadow-sm">
            <Trophy className="w-5 h-5 text-duo-yellow" />
            <span className="text-sm font-black text-duo-text uppercase tracking-wide">Tu Aventura de Aprendizaje</span>
          </div>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-duo-text mb-4 tracking-tight italic">
            Mapa de Aventuras
          </h2>
          <p className="text-lg sm:text-xl text-duo-gray-dark max-w-2xl mx-auto font-bold">
            Completa cada nivel para desbloquear el siguiente desafío
          </p>
        </div>

        <div className="relative">
          <svg className="absolute left-1/2 top-0 bottom-0 w-8 -translate-x-1/2 z-0" style={{ height: '100%' }}>
            <defs>
              <linearGradient id="pathGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" style={{ stopColor: '#1CB0F6', stopOpacity: 1 }} />
                <stop offset="50%" style={{ stopColor: '#58CC02', stopOpacity: 1 }} />
                <stop offset="100%" style={{ stopColor: '#1CB0F6', stopOpacity: 1 }} />
              </linearGradient>
            </defs>
            <path
              d={`M 16 0 Q 16 50, ${Math.sin(0) * 40 + 16} 100 T 16 200 T 16 300 T 16 400 T 16 500 T 16 600 T 16 700 T 16 800 T 16 900 T 16 1000 L 16 10000`}
              stroke="url(#pathGradient)"
              strokeWidth="12"
              fill="none"
              strokeLinecap="round"
              className="drop-shadow-md opacity-40"
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
                          relative bg-white rounded-3xl border-b-8 border-duo-gray transition-all duration-200 overflow-hidden
                          ${isUnlocked
                            ? 'hover:scale-[1.02] cursor-pointer hover:border-duo-blue'
                            : 'opacity-70 cursor-not-allowed grayscale'
                          }
                          ${isCompleted ? 'border-duo-green' : isUnlocked ? 'border-duo-blue' : 'border-duo-gray'}
                        `}
                        onClick={() => isUnlocked && onSelectLevel(level)}
                      >
                        <div className={`h-2 ${isCompleted ? 'bg-duo-green' : isUnlocked ? 'bg-duo-blue' : 'bg-duo-gray'} relative overflow-hidden`}>
                          {isUnlocked && (
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
                          )}
                        </div>

                        <div className="p-8">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <span className={`
                                  inline-flex items-center justify-center w-10 h-10 rounded-xl font-black text-lg
                                  ${isCompleted
                                    ? 'bg-duo-green text-white'
                                    : isUnlocked
                                      ? 'bg-duo-blue text-white shadow-lg'
                                      : 'bg-duo-gray text-duo-gray-dark'
                                  }
                                `}>
                                  {index + 1}
                                </span>
                                <h3 className="text-2xl font-black text-duo-text leading-tight uppercase tracking-tight">
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
                                <div className="w-12 h-12 rounded-full bg-duo-green flex items-center justify-center animate-bounce-slow border-b-4 border-duo-green-dark">
                                  <Check className="w-7 h-7 text-white" strokeWidth={4} />
                                </div>
                              </div>
                            )}
                          </div>

                          <p className="text-gray-600 mb-6 text-base leading-relaxed">
                            {level.description}
                          </p>

                           <div className="flex items-center justify-between gap-4 flex-wrap">
                            <div className="flex items-center gap-2 px-4 py-2 bg-duo-background-soft rounded-xl border-b-2 border-duo-gray">
                              <Clock className="w-5 h-5 text-duo-gray-dark" />
                              <span className="text-sm font-black text-duo-text tracking-wide">{level.estimatedTime} MIN</span>
                            </div>

                            <div className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest border-b-4 ${getDifficultyColor(level.difficulty)}`}>
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
                        w-20 h-20 rounded-2xl flex items-center justify-center text-3xl font-black shadow-lg transform transition-all duration-500 border-b-8
                        ${isCompleted
                          ? 'bg-duo-green border-duo-green-dark text-white rotate-12 group-hover:rotate-0 group-hover:scale-110'
                          : isUnlocked
                            ? 'bg-duo-blue border-duo-blue-dark text-white group-hover:rotate-12 group-hover:scale-110 shadow-duo-blue/30'
                            : 'bg-duo-gray border-duo-gray-dark text-duo-gray-dark'
                        }
                      `}>
                        {isCompleted ? <Check className="w-10 h-10" strokeWidth={4} /> : index + 1}
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
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-white rounded-2xl border-b-4 border-duo-gray shadow-sm">
            <Sparkles className="w-5 h-5 text-duo-yellow" />
            <span className="text-sm font-black text-duo-text uppercase tracking-wide">¡Sigue avanzando en tu camino!</span>
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