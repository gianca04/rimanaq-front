import React, { useState } from 'react';
import { X, Clock, Star, CheckCircle, ArrowRight } from 'lucide-react';
import { Course, Level, LevelProgress } from '../types';

interface LessonModalProps {
  level: Level;
  course: Course;
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
  const [answers, setAnswers] = useState<number[]>([]);
  const [isCompleted, setIsCompleted] = useState(false);
  const [earnedStars, setEarnedStars] = useState(0);

  const handleAnswer = (answerIndex: number) => {
    const newAnswers = [...answers];
    newAnswers[currentStep] = answerIndex;
    setAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentStep < level.content.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      completeLesson();
    }
  };

  const completeLesson = () => {
    // Calcular estrellas basado en respuestas correctas
    const quizQuestions = level.content.filter(content => content.type === 'quiz');
    const correctAnswers = quizQuestions.filter((question, index) => {
      const userAnswer = answers.find((_, answerIndex) => 
        level.content[answerIndex] === question
      );
      return userAnswer === question.correctAnswer;
    }).length;

    let stars = 1; // Mínimo 1 estrella por completar
    if (quizQuestions.length > 0) {
      const accuracy = correctAnswers / quizQuestions.length;
      if (accuracy >= 0.8) stars = 3;
      else if (accuracy >= 0.6) stars = 2;
    } else {
      stars = 3; // Si no hay quizzes, dar máximas estrellas
    }

    setEarnedStars(stars);
    setIsCompleted(true);
  };

  const handleComplete = () => {
    onComplete(course.id, level.id, earnedStars);
  };

  const currentContent = level.content[currentStep];

  if (isCompleted) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden">
          <div className={`h-32 bg-gradient-to-r ${course.color} relative`}>
            <div className="absolute inset-0 flex items-center justify-center">
              <CheckCircle className="w-16 h-16 text-white" />
            </div>
          </div>

          <div className="p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              ¡Lección Completada!
            </h2>
            
            <div className="flex items-center justify-center space-x-2 mb-6">
              <span className="text-lg font-semibold text-gray-700">Tu puntuación:</span>
              <div className="flex space-x-1">
                {[1, 2, 3].map((star) => (
                  <Star
                    key={star}
                    className={`w-8 h-8 ${
                      star <= earnedStars 
                        ? 'text-yellow-400 fill-current animate-pulse' 
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
            </div>

            <p className="text-gray-600 mb-8">
              {earnedStars === 3 && "¡Excelente trabajo! Dominaste esta lección."}
              {earnedStars === 2 && "¡Bien hecho! Vas por buen camino."}
              {earnedStars === 1 && "¡Completaste la lección! Sigue practicando."}
            </p>

            <button
              onClick={handleComplete}
              className={`w-full bg-gradient-to-r ${course.color} text-white py-4 rounded-xl font-semibold text-lg hover:shadow-lg transform hover:scale-105 transition-all duration-200`}
            >
              Continuar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className={`bg-gradient-to-r ${course.color} p-6 relative`}>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white hover:text-gray-200 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
          
          <div className="text-white">
            <h2 className="text-2xl font-bold mb-2">{level.title}</h2>
            <div className="flex items-center space-x-4 text-sm opacity-90">
              <div className="flex items-center space-x-1">
                <Clock className="w-4 h-4" />
                <span>{level.estimatedTime} min</span>
              </div>
              <span>Paso {currentStep + 1} de {level.content.length}</span>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="bg-gray-200 h-2">
          <div 
            className={`h-2 bg-gradient-to-r ${course.color} transition-all duration-300`}
            style={{ width: `${((currentStep + 1) / level.content.length) * 100}%` }}
          ></div>
        </div>

        {/* Content */}
        <div className="p-8 flex-1 overflow-y-auto">
          {currentContent.type === 'text' && (
            <div>
              <p className="text-lg leading-relaxed text-gray-700 mb-8">
                {currentContent.content}
              </p>
            </div>
          )}

          {currentContent.type === 'quiz' && (
            <div>
              <h3 className="text-xl font-semibold text-gray-800 mb-6">
                {currentContent.content}
              </h3>
              
              <div className="space-y-3">
                {currentContent.options?.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => handleAnswer(index)}
                    className={`
                      w-full p-4 text-left rounded-xl border-2 transition-all duration-200
                      ${answers[currentStep] === index
                        ? `border-blue-500 bg-blue-50`
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }
                    `}
                  >
                    <span className="font-medium">{String.fromCharCode(65 + index)}.</span>{' '}
                    {option}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 flex justify-between items-center">
          <div className="text-sm text-gray-500">
            {currentContent.type === 'quiz' && !answers[currentStep] && (
              "Selecciona una respuesta para continuar"
            )}
          </div>
          
          <button
            onClick={handleNext}
            disabled={currentContent.type === 'quiz' && answers[currentStep] === undefined}
            className={`
              flex items-center space-x-2 px-6 py-3 rounded-xl font-semibold transition-all duration-200
              ${currentContent.type === 'quiz' && answers[currentStep] === undefined
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : `bg-gradient-to-r ${course.color} text-white hover:shadow-lg transform hover:scale-105`
              }
            `}
          >
            <span>{currentStep < level.content.length - 1 ? 'Siguiente' : 'Completar'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default LessonModal;