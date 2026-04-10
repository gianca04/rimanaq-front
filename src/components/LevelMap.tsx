import React from 'react';
import { Clock, Star, Lock, CheckCircle, Trophy, Sparkles, Play } from 'lucide-react';
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
    <div className="min-h-screen bg-white py-12 px-4">
      <div className="w-full max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-black text-duo-text uppercase tracking-tight mb-2">
            Tu Ruta de Aprendizaje
          </h2>
          <p className="text-xl font-bold text-duo-gray-dark italic">
            {course.title}
          </p>
        </div>

        <div className="relative flex flex-col items-center space-y-12">
          {/* Línea vertical de fondo */}
          <div className="absolute top-0 bottom-0 w-4 bg-duo-gray left-1/2 -translate-x-1/2 rounded-full z-0"></div>

          {course.levels.map((level, index) => {
            const isUnlocked = isLevelUnlocked(index);
            const progress = userProgress[course.id]?.[level.id];
            const isCompleted = progress?.completed || false;
            const isCurrent = isUnlocked && !isCompleted;
            
            // Efecto zig-zag de Duolingo
            const xOffset = index % 2 === 0 ? (index % 4 === 0 ? '0' : '40px') : (index % 4 === 1 ? '-40px' : '0');
            const marginLeft = index % 2 === 0 ? (index % 4 === 0 ? '0' : '80px') : (index % 4 === 1 ? '-80px' : '0');

            return (
              <div 
                key={level.id} 
                className="relative z-10 flex flex-col items-center group"
                style={{ transform: `translateX(${marginLeft})` }}
              >
                {/* Etiqueta de lección flotante */}
                {isCurrent && (
                  <div className="absolute -top-12 bg-duo-blue text-white px-4 py-2 rounded-xl font-black text-sm uppercase animate-bounce shadow-lg after:content-[''] after:absolute after:top-full after:left-1/2 after:-translate-x-1/2 after:border-8 after:border-transparent after:border-t-duo-blue">
                    ¡EMPEZAR!
                  </div>
                )}

                {/* Nodo de nivel (Círculo Duolingo) */}
                <button
                  onClick={() => isUnlocked && onSelectLevel(level)}
                  disabled={!isUnlocked}
                  className={`
                    relative w-24 h-24 rounded-full border-b-8 flex items-center justify-center transition-all duration-100
                    ${isCompleted 
                      ? 'bg-duo-green border-duo-green-dark text-white hover:bg-[#61E002]' 
                      : isCurrent 
                        ? 'bg-duo-blue border-duo-blue-dark text-white hover:bg-[#23C4FF] scale-110' 
                        : 'bg-duo-gray border-duo-gray-dark text-duo-gray-dark cursor-not-allowed'}
                    active:border-b-0 active:translate-y-2
                  `}
                >
                  {isCompleted ? (
                    <Trophy className="w-10 h-10" strokeWidth={3} />
                  ) : !isUnlocked ? (
                    <Lock className="w-10 h-10" strokeWidth={3} />
                  ) : (
                    <Play className="w-10 h-10 ml-1" strokeWidth={3} fill="currentColor" />
                  )}
                </button>

                {/* Información del nivel al pasar el mouse (opcional o fijo) */}
                <div className="mt-4 text-center">
                  <h3 className={`text-lg font-black uppercase tracking-tight ${isUnlocked ? 'text-duo-text' : 'text-duo-gray-dark'}`}>
                    {level.title}
                  </h3>
                  {isCompleted && renderStars(progress?.stars || 0)}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-24 text-center">
          <div className="inline-flex items-center gap-3 px-8 py-4 bg-duo-background-soft rounded-2xl border-b-4 border-duo-gray">
            <Sparkles className="w-6 h-6 text-duo-yellow" />
            <span className="text-lg font-black text-duo-text uppercase tracking-wide">¡Sigue practicando!</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LevelMap;