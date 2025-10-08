import React, { useState } from 'react';
import { X, Clock, Star, CheckCircle, ArrowRight, Trophy, Sparkles } from 'lucide-react';
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
    const quizQuestions = level.content.filter(content => content.type === 'quiz');
    const correctAnswers = quizQuestions.filter((question, index) => {
      const userAnswer = answers.find((_, answerIndex) =>
        level.content[answerIndex] === question
      );
      return userAnswer === question.correctAnswer;
    }).length;

    let stars = 1;
    if (quizQuestions.length > 0) {
      const accuracy = correctAnswers / quizQuestions.length;
      if (accuracy >= 0.8) stars = 3;
      else if (accuracy >= 0.6) stars = 2;
    } else {
      stars = 3;
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
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
        <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden transform animate-in zoom-in duration-300">
          <div className={`h-40 bg-gradient-to-br ${course.color} relative overflow-hidden`}>
            <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center animate-pulse">
                  <Trophy className="w-12 h-12 text-white" />
                </div>
                <Sparkles className="w-6 h-6 text-amber-300 absolute -top-2 -right-2 animate-bounce" />
                <Sparkles className="w-5 h-5 text-amber-200 absolute -bottom-1 -left-2 animate-bounce delay-150" />
              </div>
            </div>
          </div>

          <div className="p-10 text-center">
            <h2 className="text-3xl font-extrabold text-slate-900 mb-6">
              ¡Lección Completada!
            </h2>

            <div className="flex items-center justify-center gap-3 mb-8">
              <span className="text-lg font-semibold text-slate-600">Tu puntuación:</span>
              <div className="flex gap-2">
                {[1, 2, 3].map((star) => (
                  <div
                    key={star}
                    className={`transform transition-all duration-500 delay-${star * 100}`}
                    style={{ animationDelay: `${star * 150}ms` }}
                  >
                    <Star
                      className={`w-10 h-10 ${
                        star <= earnedStars
                          ? 'text-amber-400 fill-amber-400 animate-bounce'
                          : 'text-slate-300'
                      }`}
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="mb-8 p-6 bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl border border-slate-200">
              <p className="text-slate-700 text-lg leading-relaxed">
                {earnedStars === 3 && "¡Excelente trabajo! Has dominado esta lección a la perfección."}
                {earnedStars === 2 && "¡Muy bien hecho! Vas por excelente camino en tu aprendizaje."}
                {earnedStars === 1 && "¡Completaste la lección! Sigue practicando para mejorar."}
              </p>
            </div>

            <button
              onClick={handleComplete}
              className={`w-full bg-gradient-to-r ${course.color} text-white py-5 rounded-2xl font-bold text-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2`}
            >
              Continuar al siguiente nivel
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className={`bg-gradient-to-r ${course.color} p-8 relative`}>
          <button
            onClick={onClose}
            className="absolute top-6 right-6 text-white/90 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-xl"
          >
            <X className="w-6 h-6" />
          </button>

          <div className="text-white">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-md rounded-full text-sm font-semibold mb-3">
              <Clock className="w-4 h-4" />
              {level.estimatedTime} minutos
            </div>
            <h2 className="text-3xl font-extrabold mb-3">{level.title}</h2>
            <p className="text-white/90 text-sm">
              Paso {currentStep + 1} de {level.content.length}
            </p>
          </div>
        </div>

        <div className="bg-slate-100 h-2.5">
          <div
            className={`h-full bg-gradient-to-r ${course.color} transition-all duration-500 ease-out`}
            style={{ width: `${((currentStep + 1) / level.content.length) * 100}%` }}
          ></div>
        </div>

        <div className="flex-1 overflow-y-auto p-8 lg:p-12">
          {currentContent.type === 'text' && (
            <div>
              <div className="prose prose-lg max-w-none">
                <div className="p-8 bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl border border-slate-200">
                  <p className="text-slate-700 leading-relaxed text-xl m-0">
                    {currentContent.content}
                  </p>
                </div>
              </div>
            </div>
          )}

          {currentContent.type === 'quiz' && (
            <div>
              <div className="mb-8 p-6 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl border border-blue-200">
                <h3 className="text-2xl font-bold text-slate-900 leading-relaxed">
                  {currentContent.content}
                </h3>
              </div>

              <div className="space-y-4">
                {currentContent.options?.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => handleAnswer(index)}
                    className={`
                      w-full p-6 text-left rounded-2xl border-2 transition-all duration-300 transform hover:scale-[1.02]
                      ${answers[currentStep] === index
                        ? `border-blue-500 bg-gradient-to-br from-blue-50 to-cyan-50 shadow-lg scale-[1.02]`
                        : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50 hover:shadow-md bg-white'
                      }
                    `}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg transition-colors ${
                        answers[currentStep] === index
                          ? 'bg-blue-500 text-white'
                          : 'bg-slate-100 text-slate-600'
                      }`}>
                        {String.fromCharCode(65 + index)}
                      </div>
                      <span className={`font-medium text-lg ${
                        answers[currentStep] === index ? 'text-slate-900' : 'text-slate-700'
                      }`}>
                        {option}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="p-6 lg:p-8 border-t border-slate-200 bg-gradient-to-br from-slate-50 to-white flex justify-between items-center gap-4">
          <div className="text-sm text-slate-500 font-medium">
            {currentContent.type === 'quiz' && !answers[currentStep] && (
              <span className="flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-700 rounded-full border border-amber-200">
                <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></span>
                Selecciona una respuesta
              </span>
            )}
          </div>

          <button
            onClick={handleNext}
            disabled={currentContent.type === 'quiz' && answers[currentStep] === undefined}
            className={`
              flex items-center gap-2 px-8 py-4 rounded-2xl font-bold transition-all duration-300 text-lg
              ${currentContent.type === 'quiz' && answers[currentStep] === undefined
                ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                : `bg-gradient-to-r ${course.color} text-white hover:shadow-2xl transform hover:scale-105`
              }
            `}
          >
            <span>{currentStep < level.content.length - 1 ? 'Siguiente' : 'Completar'}</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default LessonModal;
