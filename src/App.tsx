import { useState, useEffect } from 'react';
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
      <div className="min-h-screen bg-gradient-to-br from-blue-500 via-teal-400 to-green-400 flex items-center justify-center">
        <div className="text-white text-2xl">Cargando cursos...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-500 via-teal-400 to-green-400 flex items-center justify-center">
        <div className="text-white text-2xl">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 via-teal-400 to-green-400">
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
      <div className="min-h-screen bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center">
        <div className="text-white text-2xl">🤟 Verificando autenticación...</div>
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