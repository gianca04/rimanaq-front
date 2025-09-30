import React, { useState } from 'react';
import { X, Clock, Star, CheckCircle, ArrowRight, BookOpen, Target } from 'lucide-react';
import { CourseWithLevels, Level, LevelProgress } from '../types';

interface LessonModalProps {
  level: Level;
  course: CourseWithLevels;
  onClose: () => void;
  onComplete: (courseId: string, levelId: string, stars: number) => void;
  currentProgress?: LevelProgress;
}

const LessonModal: React.FC<LessonModalProps> = ({
  level,
  course,
  onClose,
  onComplete,
  currentProgress
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isCompleted, setIsCompleted] = useState(currentProgress?.completed || false);
  const [earnedScore, setEarnedScore] = useState(currentProgress?.stars || 0);

  // Para esta demostración, crearemos pasos simulados basados en la lección
  const steps = [
    {
      type: 'intro',
      title: `Bienvenido a: ${level.title}`,
      content: level.description
    },
    {
      type: 'content',
      title: 'Contenido de la lección',
      content: 'En esta lección aprenderás sobre la lengua de señas peruana. Esta es una demostración del contenido que vendría de la API.'
    },
    {
      type: 'practice',
      title: 'Práctica',
      content: '¡Es hora de practicar! En el futuro, aquí habría ejercicios interactivos.'
    },
    {
      type: 'completion',
      title: '¡Lección completada!',
      content: `Has completado "${level.title}" exitosamente.`
    }
  ];

  const currentStepData = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else if (!isCompleted) {
      completeLesson();
    }
  };

  const completeLesson = () => {
    const baseScore = 100;
    const timeBonus = Math.max(0, level.estimatedTime - 10); // Bonus por tiempo
    const finalScore = baseScore + timeBonus;
    
    setEarnedScore(finalScore);
    setIsCompleted(true);
    onComplete(course.id, level.id, finalScore);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'fácil':
        return 'text-green-600 bg-green-100';
      case 'medio':
        return 'text-yellow-600 bg-yellow-100';
      case 'difícil':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div 
          className="h-24 relative"
          style={{ 
            background: `linear-gradient(135deg, ${course.color}, ${course.color}80)`
          }}
        >
          <div className="absolute inset-0 bg-black/20"></div>
          
          {/* Botón cerrar */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white hover:text-gray-200 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Información de la lección */}
          <div className="absolute bottom-4 left-6 flex items-center space-x-4 text-white">
            <div className="flex items-center space-x-2">
              <BookOpen className="w-5 h-5" />
              <span className="font-semibold">{level.title}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4" />
              <span className="text-sm">{level.estimatedTime} min</span>
            </div>
            <div className={`px-3 py-1 rounded-full text-xs font-medium ${getDifficultyColor(level.difficulty)}`}>
              {level.difficulty}
            </div>
          </div>
        </div>

        {/* Contenido principal */}
        <div className="p-8">
          {!isCompleted ? (
            <div className="text-center">
              {/* Progreso */}
              <div className="mb-8">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-500">Nivel {level.id}</span>
                  <span className="text-sm text-gray-500">Paso {currentStep + 1} de {steps.length}</span>
                </div>
                
                {/* Barra de progreso */}
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="h-2 rounded-full transition-all duration-500"
                    style={{ 
                      background: `linear-gradient(90deg, ${course.color}, ${course.color}80)`,
                      width: `${((currentStep + 1) / steps.length) * 100}%` 
                    }}
                  ></div>
                </div>
              </div>

              {/* Contenido del paso actual */}
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-gray-800 mb-4">
                  {steps[currentStep].title}
                </h2>
                <div className="bg-gray-50 rounded-xl p-6 mb-6">
                  <p className="text-gray-700 text-lg leading-relaxed">
                    {steps[currentStep].content}
                  </p>
                </div>

                {/* Contenido específico por tipo de paso */}
                {steps[currentStep].type === 'practice' && (
                  <div className="bg-blue-50 rounded-xl p-6">
                    <Target className="w-12 h-12 text-blue-500 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">Ejercicio Práctico</h3>
                    <p className="text-gray-600">
                      En una versión completa, aquí tendríás ejercicios interactivos, 
                      videos de señas, y actividades de práctica.
                    </p>
                  </div>
                )}
              </div>

              {/* Botones de navegación */}
              <div className="flex justify-between items-center">
                <button
                  onClick={onClose}
                  className="px-6 py-3 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Cerrar
                </button>
                
                <button
                  onClick={handleNext}
                  className="flex items-center space-x-2 px-8 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  <span>{currentStep === steps.length - 1 ? 'Completar lección' : 'Siguiente'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            /* Pantalla de completado */
            <div className="text-center py-8">
              <CheckCircle className="w-24 h-24 text-green-500 mx-auto mb-6" />
              
              <h2 className="text-3xl font-bold text-gray-800 mb-4">
                ¡Lección Completada!
              </h2>
              
              <div className="bg-green-50 rounded-xl p-6 mb-6">
                <div className="flex items-center justify-center space-x-2 mb-4">
                  <Star className="w-6 h-6 text-yellow-400 fill-current" />
                  <span className="text-2xl font-bold text-gray-800">{earnedScore} puntos</span>
                </div>
                <p className="text-gray-600">
                  ¡Excelente trabajo! Has completado "{level.title}" exitosamente.
                </p>
              </div>

              <button
                onClick={onClose}
                className="w-full py-4 bg-blue-500 text-white rounded-xl font-semibold text-lg hover:bg-blue-600 transition-colors"
              >
                Continuar
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LessonModal;