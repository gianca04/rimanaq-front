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
      <div className="fixed inset-0 bg-gradient-to-br from-black/60 to-black/40 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
        <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-10 text-center transform animate-in zoom-in-95 duration-300">
          <div className="relative inline-flex mb-6">
            <div className="absolute inset-0 bg-blue-400 rounded-full blur-xl opacity-40 animate-pulse"></div>
            <Loader className="w-14 h-14 animate-spin text-blue-600 relative" strokeWidth={2.5} />
          </div>
          <h3 className="text-2xl font-bold text-slate-800 mb-3">
            Cargando cursos
          </h3>
          <p className="text-slate-500 text-sm">
            Preparando el contenido...
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
      <div className="fixed inset-0 bg-gradient-to-br from-black/60 to-black/40 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
        <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-10 text-center transform animate-in zoom-in-95 duration-300">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <X className="w-10 h-10 text-red-600" strokeWidth={2.5} />
          </div>
          <h3 className="text-2xl font-bold text-slate-800 mb-3">
            Error al cargar
          </h3>
          <p className="text-slate-600 mb-8 text-sm leading-relaxed">{error}</p>
          <button
            onClick={handleRetry}
            className="w-full px-6 py-3.5 bg-slate-100 text-slate-700 rounded-xl font-semibold hover:bg-slate-200 active:scale-[0.98] transition-all duration-200"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500">
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
      <div className="fixed inset-0 bg-gradient-to-br from-black/60 to-black/40 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
        <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-10 text-center transform animate-in zoom-in-95 duration-300">
          <div className="relative inline-flex mb-6">
            <div className="absolute inset-0 bg-purple-400 rounded-full blur-xl opacity-40 animate-pulse"></div>
            <div className="text-5xl relative animate-bounce">🤟</div>
          </div>
          <h3 className="text-2xl font-bold text-slate-800 mb-3">
            Verificando autenticación
          </h3>
          <p className="text-slate-500 text-sm">
            Validando credenciales...
          </p>
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