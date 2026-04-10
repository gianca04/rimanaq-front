import { useState, useEffect } from 'react';
import { Loader, X } from 'lucide-react';
import CourseSelection from './components/CourseSelection';
import LevelMap from './components/LevelMap';
import LessonModal from './components/LessonModal';
import Header from './components/Header';
import AuthScreen from './components/AuthScreen';
import Profile from './components/Profile';
import { CourseWithLevels, Level, UserProgress } from './types';
import { getUIFormattedCourses } from './services/courseService';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { authService } from './services/authService';

// Componente principal de la aplicación autenticada
function AuthenticatedApp() {
  const [selectedCourse, setSelectedCourse] = useState<CourseWithLevels | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<Level | null>(null);
  const [viewMode, setViewMode] = useState<'courses' | 'levels' | 'lesson' | 'profile'>('courses');
  const [userProgress, setUserProgress] = useState<UserProgress>({});
  const [courses, setCourses] = useState<CourseWithLevels[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cargar cursos al inicializar
  useEffect(() => {
    const loadCourses = async () => {
      try {
        setLoading(true);
        setError(null);
        const coursesData = await getUIFormattedCourses();
        setCourses(coursesData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar cursos');
      } finally {
        setLoading(false);
      }
    };
    loadCourses();
  }, []);

  useEffect(() => {
    const savedProgress = localStorage.getItem('learningProgress');
    if (savedProgress) {
      try {
        setUserProgress(JSON.parse(savedProgress));
      } catch (error) {
        console.error('Error parsing saved progress:', error);
        setUserProgress({});
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('learningProgress', JSON.stringify(userProgress));
  }, [userProgress]);

  const getTotalStars = (courseId: string) => {
    const courseProgress = userProgress[courseId] || {};
    return Object.values(courseProgress).reduce((total, level) => total + (level?.stars || 0), 0);
  };

  const getCompletedLevels = (courseId: string) => {
    const courseProgress = userProgress[courseId] || {};
    return Object.values(courseProgress).filter(level => level?.completed).length;
  };

  const handleSelectCourse = (course: CourseWithLevels) => {
    setSelectedCourse(course);
    setViewMode('levels');
  };

  const handleSelectLevel = (level: Level) => {
    setSelectedLevel(level);
    setViewMode('lesson');
  };

  const handleBackToCourses = () => {
    setSelectedCourse(null);
    setSelectedLevel(null);
    setViewMode('courses');
  };

  const handleBackToLevels = () => {
    setSelectedLevel(null);
    setViewMode('levels');
  };

  const completeLevel = (courseId: string, levelId: string, stars: number) => {
    setUserProgress(prev => ({
      ...prev,
      [courseId]: {
        ...prev[courseId],
        [levelId]: { completed: true, stars, score: stars * 10 }
      }
    }));
    setSelectedLevel(null);
    setViewMode('levels');
  };

  const handleGoToProfile = () => {
    setViewMode('profile');
  };

  const handleBackFromProfile = () => {
    setViewMode('courses');
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-duo-background flex items-center justify-center z-50 p-4">
        <div className="max-w-md w-full p-10 text-center">
          <div className="relative inline-flex mb-6">
            <Loader className="w-16 h-16 animate-spin text-duo-blue" strokeWidth={3} />
          </div>
          <h3 className="text-3xl font-black text-duo-text mb-3">
            Rimanaq
          </h3>
          <p className="text-duo-gray-dark font-bold text-lg">
            Preparando tu lección...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    const handleRetry = () => {
      setError(null);
      setLoading(true);
      // Reintentar cargar cursos
      const loadCourses = async () => {
        try {
          const coursesData = await getUIFormattedCourses();
          setCourses(coursesData);
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Error al cargar cursos');
        } finally {
          setLoading(false);
        }
      };
      loadCourses();
    };

    return (
      <div className="fixed inset-0 bg-duo-background flex items-center justify-center z-50 p-4">
        <div className="card-duo max-w-md w-full p-10 text-center">
          <div className="w-20 h-20 bg-duo-red/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <X className="w-12 h-12 text-duo-red" strokeWidth={3} />
          </div>
          <h3 className="text-2xl font-black text-duo-text mb-3 uppercase">
            ¡Upps!
          </h3>
          <p className="text-duo-text mb-8 font-bold leading-relaxed">{error}</p>
          <button
            onClick={handleRetry}
            className="btn-duo-blue w-full"
          >
            Intentar de nuevo
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-duo-background-soft">
      <Header 
        selectedCourse={selectedCourse}
        onBackToCourses={handleBackToCourses}
        onGoToProfile={handleGoToProfile}
        totalStars={selectedCourse ? getTotalStars(selectedCourse.id) : 0}
        completedLevels={selectedCourse ? getCompletedLevels(selectedCourse.id) : 0}
        totalLevels={selectedCourse?.levels?.length || 0}
      />
      
      {/* Contenido principal */}
      {viewMode === 'profile' ? (
        <Profile onBack={handleBackFromProfile} />
      ) : (
        <main className="container mx-auto px-4 py-6">
          {viewMode === 'courses' && (
            <CourseSelection 
              courses={courses}
              onSelectCourse={handleSelectCourse}
              userProgress={userProgress}
            />
          )}

          {viewMode === 'levels' && selectedCourse && (
            <LevelMap
              course={selectedCourse}
              userProgress={userProgress}
              onSelectLevel={handleSelectLevel}
            />
          )}
        </main>
      )}

      {/* Modal de lección */}
      {viewMode === 'lesson' && selectedLevel && selectedCourse && (
        <LessonModal 
          level={selectedLevel}
          course={selectedCourse}
          onClose={handleBackToLevels}
          onComplete={completeLevel}
          currentProgress={userProgress[selectedCourse.id]?.[selectedLevel.id] ? {
            completed: userProgress[selectedCourse.id][selectedLevel.id].completed,
            stars: userProgress[selectedCourse.id][selectedLevel.id].stars || 0
          } : undefined}
        />
      )}
    </div>
  );
}

// Componente que maneja la autenticación
function AppWithAuth() {
  const { isAuthenticated, loading, login } = useAuth();

  const handleLoginSuccess = () => {
    // Obtener el usuario guardado después del login exitoso
    const user = authService.getUser();
    if (user) {
      login(user); // Actualizar el contexto con el usuario
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-duo-background flex items-center justify-center z-50 p-4">
        <div className="max-w-md w-full p-10 text-center">
          <div className="relative inline-flex mb-6">
            <div className="text-6xl relative">🤟</div>
          </div>
          <h3 className="text-2xl font-black text-duo-text mb-3">
            VERIFICANDO...
          </h3>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthScreen onAuthSuccess={handleLoginSuccess} />;
  }

  return <AuthenticatedApp />;
}

// Componente principal que envuelve todo con el AuthProvider
function App() {
  return (
    <AuthProvider>
      <AppWithAuth />
    </AuthProvider>
  );
}

export default App;