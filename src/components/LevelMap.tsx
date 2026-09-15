import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Star, Lock, Check, Clock,
  BookOpen, Target, Lightbulb, Flame, Sparkles,
  Trophy, GraduationCap, Rocket, Hand, Eye, Sparkle,
} from 'lucide-react';
import {
  Cat,
  HumanCat,
  HumanDinosaur,
  Planet,
  IceCream,
  Ghost,
  Backpack,
  Cyborg,
  Chocolate,
  Astronaut,
  Mug,
} from 'react-kawaii';
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

// Configuración de Personajes React Kawaii
interface KawaiiCharacterConfig {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Component: React.FC<any>;
  name: string;
  defaultColor: string;
  completedQuote: string;
  activeQuote: string;
  lockedQuote: string;
}

const KAWAII_CHARACTERS: KawaiiCharacterConfig[] = [
  {
    Component: HumanCat,
    name: 'Michi',
    defaultColor: '#FFD882',
    completedQuote: '¡Increíble trabajo!',
    activeQuote: '¡Vamos por este nivel!',
    lockedQuote: '¡Pronto se desbloqueará!',
  },
  {
    Component: Cat,
    name: 'Gatito',
    defaultColor: '#A3E5D8',
    completedQuote: '¡Miau! ¡Nivel superado!',
    activeQuote: '¡Demuestra lo que sabes!',
    lockedQuote: '¡Sigue practicando!',
  },
  {
    Component: HumanDinosaur,
    name: 'Dino',
    defaultColor: '#A0E7E5',
    completedQuote: '¡Rawr! ¡Muy bien!',
    activeQuote: '¡Un nuevo reto te espera!',
    lockedQuote: '¡Casi llegamos aquí!',
  },
  {
    Component: Planet,
    name: 'Planeta',
    defaultColor: '#FCCB70',
    completedQuote: '¡Fuera de este mundo!',
    activeQuote: '¡Tu aprendizaje brilla!',
    lockedQuote: '¡Sigue avanzando!',
  },
  {
    Component: IceCream,
    name: 'Heladito',
    defaultColor: '#FDA7DF',
    completedQuote: '¡Qué dulce victoria!',
    activeQuote: '¡Aprender es genial!',
    lockedQuote: '¡Con calma y constante!',
  },
  {
    Component: Ghost,
    name: 'Fantasmita',
    defaultColor: '#E0C3FC',
    completedQuote: '¡Sorprendente nivel!',
    activeQuote: '¡Sin miedo al éxito!',
    lockedQuote: '¡Buh! Falta poco',
  },
  {
    Component: Backpack,
    name: 'Mochilita',
    defaultColor: '#FF9A9E',
    completedQuote: '¡Listos para la aventura!',
    activeQuote: '¡Empaca tus ganas!',
    lockedQuote: '¡Guarda tus energías!',
  },
  {
    Component: Cyborg,
    name: 'Robotín',
    defaultColor: '#B5EAD7',
    completedQuote: '¡Cálculo: PERFECTO!',
    activeQuote: '¡Procesando nivel!',
    lockedQuote: '¡Bloqueado aún!',
  },
  {
    Component: Chocolate,
    name: 'Choco',
    defaultColor: '#D4A373',
    completedQuote: '¡Puntaje delicioso!',
    activeQuote: '¡Nivel apetecible!',
    lockedQuote: '¡Próximamente más!',
  },
  {
    Component: Astronaut,
    name: 'Astro',
    defaultColor: '#C7CEEA',
    completedQuote: '¡A las estrellas!',
    activeQuote: '¡Despegue listo!',
    lockedQuote: '¡Explorando la ruta!',
  },
  {
    Component: Mug,
    name: 'Tacita',
    defaultColor: '#FFDAC1',
    completedQuote: '¡Salud por tu logro!',
    activeQuote: '¡Disfruta el nivel!',
    lockedQuote: '¡Preparando lección!',
  },
];

const LevelMap: React.FC<LevelMapProps> = ({ course, userProgress, onSelectLevel }) => {
  const [activeLevel, setActiveLevel] = useState<string | null>(null);
  const [tooltipBelow, setTooltipBelow] = useState<Record<string, boolean>>({});
  const [tappedCharacter, setTappedCharacter] = useState<string | null>(null);

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

  // Encontrar el primer nivel activo (desbloqueado pero aún no completado)
  const currentActiveIndex = course.levels.findIndex((lvl, idx) => {
    const unlocked = isLevelUnlocked(idx);
    const completed = userProgress[course.id]?.[lvl.id]?.completed;
    return unlocked && !completed;
  });

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

  // Interacción al presionar un personaje Kawaii
  const handleCharacterClick = (levelId: string) => {
    setTappedCharacter(levelId);
    setTimeout(() => {
      setTappedCharacter(prev => (prev === levelId ? null : prev));
    }, 3000);
  };

  // Cerrar tooltip al hacer click fuera
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
    const W = 240, H = 58;
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

  // Mascot del Banner (Planeta o Michi)
  const BannerMascot = KAWAII_CHARACTERS[0].Component;

  return (
    <div className="min-h-screen bg-duo-background-soft pb-24 select-none">

      {/* Banner del curso con personaje Kawaii de bienvenida */}
      <div
        className="px-5 py-5 mb-2 mx-4 mt-4 rounded-2xl relative overflow-hidden flex items-center justify-between"
        style={{
          backgroundColor: courseColor,
          borderBottom: `5px solid ${courseDark}`,
        }}
      >
        <div className="z-10 max-w-[70%]">
          <span className="text-white/80 text-[11px] font-black uppercase tracking-widest block mb-1 flex items-center gap-1">
            <Sparkle className="w-3.5 h-3.5 fill-white" /> {course.levels.length} NIVELES DE APRENDIZAJE
          </span>
          <h2 className="text-white font-black text-xl sm:text-2xl uppercase tracking-tight leading-tight drop-shadow-sm">
            {course.title}
          </h2>
        </div>

        {/* Personaje Kawaii flotante en el Banner */}
        <div className="animate-kawaii-float flex-shrink-0 cursor-pointer transition-transform hover:scale-110 active:scale-95"
             title="¡Bienvenido al camino de niveles!">
          <BannerMascot size={72} mood="blissful" color="#FFD882" />
        </div>
      </div>

      {/* Camino de niveles (Path) */}
      <div className="relative flex flex-col items-center pt-6 px-4 max-w-lg mx-auto">
        {course.levels.map((level, index) => {
          const isUnlocked = isLevelUnlocked(index);
          const progress = userProgress[course.id]?.[level.id];
          const isCompleted = progress?.completed || false;
          const isActive = activeLevel === level.id;
          const isCurrentTarget = index === (currentActiveIndex === -1 ? course.levels.length - 1 : currentActiveIndex);
          const showBelow = tooltipBelow[level.id] ?? false;

          const xOffset = OFFSETS[index % OFFSETS.length];
          const prevOffset = index > 0 ? OFFSETS[(index - 1) % OFFSETS.length] : 0;

          // Cálculo de posición del personaje Kawaii a los lados del nodo
          let charXOffset = 0;
          if (xOffset > 25) {
            charXOffset = xOffset - 115;
          } else if (xOffset < -25) {
            charXOffset = xOffset + 115;
          } else {
            charXOffset = index % 2 === 0 ? -115 : 115;
          }

          // Mostrar 1 personaje por cada dos niveles (índices pares: 0, 2, 4, 6...)
          const showCharacter = index % 2 === 0;

          // Selección de personaje Kawaii para este slot
          const charConfig = KAWAII_CHARACTERS[Math.floor(index / 2) % KAWAII_CHARACTERS.length];
          const KawaiiComp = charConfig.Component;

          // Estado de humor Kawaii según progreso o toque
          const isTapped = tappedCharacter === level.id;
          let currentMood: 'sad' | 'shocked' | 'happy' | 'blissful' | 'lovestruck' | 'excited' | 'ko' = 'happy';
          if (isTapped) {
            currentMood = 'lovestruck';
          } else if (isCompleted) {
            currentMood = 'blissful';
          } else if (isCurrentTarget) {
            currentMood = 'excited';
          } else if (!isUnlocked) {
            currentMood = 'sad';
          }

          // Texto de la burbuja
          const quoteText = isCompleted
            ? charConfig.completedQuote
            : isCurrentTarget
              ? charConfig.activeQuote
              : charConfig.lockedQuote;

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
            <div key={level.id} className="relative flex flex-col items-center w-full my-1">

              {/* Conector SVG */}
              {index > 0 && renderConnector(prevOffset, xOffset, isUnlocked)}

              {/* Personaje Kawaii Acompañante a un lado del camino (1 cada 2 niveles) */}
              {showCharacter && (
                <div
                  className="absolute top-1/2 -translate-y-1/2 flex flex-col items-center cursor-pointer group transition-transform duration-200 hover:scale-110 active:scale-95 z-20"
                  style={{
                    left: '50%',
                    transform: `translate(calc(-50% + ${charXOffset}px), -50%)`,
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCharacterClick(level.id);
                  }}
                  title={`${charConfig.name} - Haz clic para interactuar`}
                >
                  {/* Div apilado verticalmente: Globo arriba + Personaje abajo */}
                  <div className="flex flex-col items-center">
                    {/* Globo de diálogo (Speech Bubble) inmediatamente encima del personaje */}
                    {(isCurrentTarget || isTapped) && (
                      <div className="relative mb-0.5 px-3 py-1.5 bg-white rounded-2xl shadow-xl border-2 border-gray-300 text-[11px] font-black text-gray-800 whitespace-nowrap animate-kawaii-bounce flex items-center gap-1 z-30 pointer-events-none">
                        <span>{quoteText}</span>
                        {/* Flecha inferior del globo que sale del personaje */}
                        <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-white border-r-2 border-b-2 border-gray-300 rotate-45 z-10" />
                      </div>
                    )}

                    {/* Personaje Kawaii */}
                    <div className={isCurrentTarget ? 'animate-kawaii-float' : isCompleted ? 'animate-kawaii-bounce' : 'opacity-85'}>
                      <KawaiiComp
                        size={56}
                        mood={currentMood}
                        color={isUnlocked ? charConfig.defaultColor : '#D1D5DB'}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Tooltip de nivel al hacer click */}
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

              {/* Botón circular del Nivel — efecto Duolingo 3D */}
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
                  borderTopWidth: 3,
                  borderRightWidth: 3,
                  borderLeftWidth: 3,
                  borderBottomWidth: isActive ? 2 : 6,
                  borderStyle: 'solid',
                  borderColor: btnBorderColor,
                  transform: `translateX(${xOffset}px) translateY(${isActive ? 3 : 0}px)`,
                  cursor: isUnlocked ? 'pointer' : 'not-allowed',
                  zIndex: isActive ? 30 : 1,
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

        {/* Meta / Final del camino con Personaje Celebrando */}
        <div className="flex flex-col items-center mt-6 mb-8">
          <svg width={240} height={36} viewBox="0 0 240 36">
            <path d="M 120 0 L 120 30" stroke="#C0C0C0" strokeWidth={5}
              strokeLinecap="round" strokeDasharray="8 6" />
          </svg>

          <div className="flex flex-col items-center gap-2 animate-kawaii-float cursor-pointer hover:scale-105 transition-transform">
            <div className="relative">
              <Astronaut size={85} mood="excited" color="#C7CEEA" />
              <div className="absolute -top-2 -right-2 bg-amber-400 p-1.5 rounded-full text-white shadow-md">
                <Trophy className="w-5 h-5 fill-white" />
              </div>
            </div>
            <span className="text-xs font-black text-gray-500 uppercase tracking-wider bg-white px-3 py-1 rounded-full border-2 border-gray-200 shadow-sm">
              ¡Gran Meta Final!
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LevelMap;