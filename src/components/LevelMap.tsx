import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Star, Lock, Check, Clock, Zap,
  BookOpen, Target, Lightbulb, Flame, Sparkles,
  Trophy, GraduationCap, Rocket, Hand, Eye,
} from 'lucide-react';
import { CourseWithLevels, Level, UserProgress } from '../types';

interface LevelMapProps {
  course: CourseWithLevels;
  userProgress: UserProgress;
  onSelectLevel: (level: Level) => void;
}

function darken(hex: string, amount = 45): string {
  const col = hex.replace('#', '');
  const num = parseInt(col.length === 3 ? col.split('').map(c => c + c).join('') : col, 16);
  const r = Math.max(0, (num >> 16) - amount);
  const g = Math.max(0, ((num >> 8) & 0xff) - amount);
  const b = Math.max(0, (num & 0xff) - amount);
  return `#${[r, g, b].map(v => v.toString(16).padStart(2, '0')).join('')}`;
}

function lighten(hex: string): string {
  const col = hex.replace('#', '');
  const num = parseInt(col.length === 3 ? col.split('').map(c => c + c).join('') : col, 16);
  const r = Math.min(255, (num >> 16) + 195);
  const g = Math.min(255, ((num >> 8) & 0xff) + 195);
  const b = Math.min(255, (num & 0xff) + 195);
  return `#${[r, g, b].map(v => v.toString(16).padStart(2, '0')).join('')}`;
}

// Lucide icons para cada slot
const LEVEL_ICONS = [
  Star, BookOpen, Target, Lightbulb, Flame,
  Sparkles, Trophy, GraduationCap, Rocket, Hand, Eye,
];

// Zigzag horizontal en px (relativo al centro)
const OFFSETS = [0, 55, 90, 55, 0, -55, -90, -55];

const LevelMap: React.FC<LevelMapProps> = ({ course, userProgress, onSelectLevel }) => {
  const [activeLevel, setActiveLevel] = useState<string | null>(null);
  const [tooltipBelow, setTooltipBelow] = useState<Record<string, boolean>>({});

  const btnRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const tooltipRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const courseColor = course.color || '#1CB0F6';
  const courseDark = darken(courseColor);
  const courseLight = lighten(courseColor);

  const isLevelUnlocked = (idx: number) => {
    if (idx === 0) return true;
    const prev = course.levels[idx - 1];
    return userProgress[course.id]?.[prev.id]?.completed || false;
  };

  const getDifficultyLabel = (d: string) => {
    if (d === 'easy') return 'Fácil';
    if (d === 'medium') return 'Medio';
    if (d === 'hard') return 'Difícil';
    return d;
  };

  const renderStars = (stars: number) => (
    <div className="flex gap-0.5">
      {[1, 2, 3].map(s => (
        <Star key={s} className={`w-4 h-4 ${s <= stars ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`} />
      ))}
    </div>
  );

  // Detecta si el tooltip debe aparecer abajo (botón en mitad superior) o arriba
  const handleLevelClick = useCallback((levelId: string, isUnlocked: boolean, isActive: boolean) => {
    if (!isUnlocked) return;
    if (isActive) { setActiveLevel(null); return; }
    const btn = btnRefs.current[levelId];
    if (btn) {
      const rect = btn.getBoundingClientRect();
      setTooltipBelow(prev => ({ ...prev, [levelId]: rect.top < window.innerHeight / 2 }));
    }
    setActiveLevel(levelId);
  }, []);

  // Cerrar al click fuera
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!activeLevel) return;
      const btn = btnRefs.current[activeLevel];
      const tip = tooltipRefs.current[activeLevel];
      if (btn && !btn.contains(e.target as Node) && tip && !tip.contains(e.target as Node)) {
        setActiveLevel(null);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [activeLevel]);

  // Conector SVG bezier entre dos nodos
  const renderConnector = (fromOffset: number, toOffset: number, isUnlocked: boolean) => {
    const W = 240, H = 52;
    const cx = W / 2;
    const x1 = cx + fromOffset, x2 = cx + toOffset;
    const mid = H / 2;
    const strokeColor = isUnlocked ? courseColor : '#D8D8D8';
    const d = `M ${x1} 0 C ${x1} ${mid}, ${x2} ${mid}, ${x2} ${H}`;
    return (
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} className="block mx-auto flex-shrink-0"
        style={{ marginTop: -3, marginBottom: -3 }}>
        {/* Sombra */}
        <path d={d} stroke={isUnlocked ? courseDark : '#C0C0C0'} strokeWidth={8}
          fill="none" strokeLinecap="round" opacity={0.2} />
        {/* Línea principal */}
        <path d={d} stroke={strokeColor} strokeWidth={5}
          fill="none" strokeLinecap="round"
          strokeDasharray={isUnlocked ? undefined : '9 7'}
          opacity={isUnlocked ? 0.6 : 0.4} />
      </svg>
    );
  };

  return (
    <div className="min-h-screen bg-duo-background-soft pb-24">

      {/* Banner del curso — efecto Duolingo con border-b */}
      <div
        className="px-5 py-5 mb-2 mx-4 mt-4 rounded-2xl"
        style={{
          backgroundColor: courseColor,
          borderBottom: `5px solid ${courseDark}`,
        }}
      >
        <span className="text-white/70 text-[11px] font-black uppercase tracking-widest block mb-1">
          {course.levels.length} NIVELES
        </span>
        <h2 className="text-white font-black text-xl sm:text-2xl uppercase tracking-tight leading-tight">
          {course.title}
        </h2>
      </div>

      {/* Path */}
      <div className="relative flex flex-col items-center pt-8 px-4">
        {course.levels.map((level, index) => {
          const isUnlocked = isLevelUnlocked(index);
          const progress = userProgress[course.id]?.[level.id];
          const isCompleted = progress?.completed || false;
          const isActive = activeLevel === level.id;
          const showBelow = tooltipBelow[level.id] ?? false;

          const xOffset = OFFSETS[index % OFFSETS.length];
          const prevOffset = index > 0 ? OFFSETS[(index - 1) % OFFSETS.length] : 0;

          // Icono Lucide para este slot
          const IconComp = isCompleted
            ? Check
            : isUnlocked
              ? LEVEL_ICONS[index % LEVEL_ICONS.length]
              : Lock;

          // Colores Duolingo según estado
          const btnBg = isCompleted ? '#58CC02' : isUnlocked ? courseColor : '#E8E8E8';
          const btnBorderColor = isCompleted ? '#46A302' : isUnlocked ? courseDark : '#B8B8B8';
          const iconColor = isUnlocked || isCompleted ? '#ffffff' : '#AAAAAA';

          return (
            <div key={level.id} className="relative flex flex-col items-center w-full">

              {/* Conector SVG */}
              {index > 0 && renderConnector(prevOffset, xOffset, isUnlocked)}

              {/* Tooltip */}
              {isActive && isUnlocked && (
                <div
                  ref={el => { tooltipRefs.current[level.id] = el; }}
                  className="absolute z-40 w-64 bg-white rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
                  style={{
                    ...(showBelow
                      ? { top: 'calc(100% + 16px)' }
                      : { bottom: 'calc(100% + 16px)' }),
                    left: '50%',
                    transform: `translateX(calc(-50% + ${xOffset}px))`,
                    border: `2px solid ${btnBorderColor}`,
                    borderBottom: `5px solid ${btnBorderColor}`,
                  }}
                >
                  {/* Flecha */}
                  <div
                    className="absolute w-3 h-3 bg-white rotate-45"
                    style={showBelow
                      ? { top: -6, left: '50%', transform: 'translateX(-50%)',
                          borderTop: `2px solid ${btnBorderColor}`, borderLeft: `2px solid ${btnBorderColor}` }
                      : { bottom: -6, left: '50%', transform: 'translateX(-50%)',
                          borderBottom: `2px solid ${btnBorderColor}`, borderRight: `2px solid ${btnBorderColor}` }
                    }
                  />

                  {/* Header */}
                  <div className="px-4 py-3" style={{ backgroundColor: courseColor }}>
                    <p className="text-white/75 text-[10px] font-black uppercase tracking-widest leading-none mb-0.5">
                      Nivel {index + 1}
                    </p>
                    <h3 className="text-white font-black text-sm uppercase tracking-tight leading-tight">
                      {level.title}
                    </h3>
                  </div>

                  {/* Body */}
                  <div className="px-4 py-3">
                    {level.description && (
                      <p className="text-gray-500 text-xs mb-3 leading-relaxed line-clamp-2">
                        {level.description}
                      </p>
                    )}

                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-1 text-gray-400">
                        <Clock className="w-3.5 h-3.5" />
                        <span className="text-xs font-bold">{level.estimatedTime} min</span>
                      </div>
                      <span
                        className="text-xs font-black px-2 py-0.5 rounded-full"
                        style={{ backgroundColor: courseLight, color: courseColor }}
                      >
                        {getDifficultyLabel(level.difficulty)}
                      </span>
                    </div>

                    {isCompleted && progress && (
                      <div className="flex items-center justify-between pt-2 mb-3 border-t border-gray-100">
                        <span className="text-xs font-bold text-gray-400">Tu puntuación</span>
                        {renderStars(progress.stars || 0)}
                      </div>
                    )}

                    {/* Botón Duolingo */}
                    <button
                      onClick={() => { setActiveLevel(null); onSelectLevel(level); }}
                      className="w-full py-2.5 rounded-xl font-black text-sm uppercase tracking-wide text-white
                                 transition-all duration-100 active:translate-y-[2px] active:border-b-0"
                      style={{
                        backgroundColor: isCompleted ? '#58CC02' : courseColor,
                        borderBottom: `4px solid ${isCompleted ? '#46A302' : courseDark}`,
                      }}
                    >
                      {isCompleted ? '↺ Repetir' : '▶ Iniciar'}
                    </button>
                  </div>
                </div>
              )}

              {/* Botón circular — efecto Duolingo 3D */}
              <button
                ref={el => { btnRefs.current[level.id] = el; }}
                onClick={() => handleLevelClick(level.id, isUnlocked, isActive)}
                className="relative flex items-center justify-center rounded-full
                           transition-all duration-100 focus:outline-none select-none
                           active:translate-y-[3px]"
                style={{
                  width: 68,
                  height: 68,
                  backgroundColor: btnBg,
                  // Efecto 3D: borde inferior grueso en color oscuro (como btn-duo)
                  borderBottom: isActive
                    ? `2px solid ${btnBorderColor}`
                    : `6px solid ${btnBorderColor}`,
                  // Borde lateral sutil
                  border: `3px solid ${btnBorderColor}`,
                  borderBottomWidth: isActive ? 2 : 6,
                  transform: `translateX(${xOffset}px) translateY(${isActive ? 3 : 0}px)`,
                  cursor: isUnlocked ? 'pointer' : 'not-allowed',
                  zIndex: isActive ? 20 : 1,
                }}
              >
                <IconComp
                  className="w-7 h-7"
                  style={{ color: iconColor }}
                  strokeWidth={isCompleted ? 3 : 2.5}
                />

                {/* Pulso en el nivel activo */}
                {isUnlocked && !isCompleted && (
                  <span
                    className="absolute inset-0 rounded-full animate-ping opacity-20 pointer-events-none"
                    style={{ backgroundColor: courseColor }}
                  />
                )}
              </button>

              {/* Estrellas debajo */}
              {isCompleted && (
                <div
                  className="flex gap-0.5 mt-2"
                  style={{ transform: `translateX(${xOffset}px)` }}
                >
                  {renderStars(progress?.stars || 0)}
                </div>
              )}
            </div>
          );
        })}

        {/* Final del camino */}
        <div className="flex flex-col items-center mt-4 opacity-35">
          <svg width={240} height={36} viewBox="0 0 240 36">
            <path d="M 120 0 L 120 30" stroke="#C0C0C0" strokeWidth={5}
              strokeLinecap="round" strokeDasharray="8 6" />
          </svg>
          <div className="w-14 h-14 rounded-full border-4 border-dashed border-gray-300
                          flex items-center justify-center">
            <Zap className="w-5 h-5 text-gray-300" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LevelMap;