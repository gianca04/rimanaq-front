import { Course, Lesson, CoursesListResponse, CourseDetailResponse, LessonsListResponse, LessonDetailResponse, CourseWithLevels, Level, LessonContent } from '../types';

const API_BASE_URL = 'http://localhost:8000/api';

// Configuración básica para fetch
const fetchConfig: RequestInit = {
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
};

/**
 * Servicio para interactuar con la API de cursos de Laravel
 */
export class CourseService {
  /**
   * Obtiene todos los cursos disponibles
   * @returns Promise<Course[]>
   */
  static async getAllCourses(): Promise<Course[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/courses`, fetchConfig);
      
      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status} - ${response.statusText}`);
      }
      
      const apiResponse: CoursesListResponse = await response.json();
      
      if (!apiResponse.success) {
        throw new Error(apiResponse.message || 'Error al obtener los cursos');
      }
      
      return apiResponse.data;
    } catch (error) {
      console.error('Error al obtener los cursos:', error);
      throw new Error('No se pudieron cargar los cursos. Verifica tu conexión a internet.');
    }
  }

  /**
   * Obtiene un curso específico por su ID
   * @param id - ID del curso
   * @returns Promise<Course>
   */
  static async getCourseById(id: number): Promise<Course> {
    try {
      const response = await fetch(`${API_BASE_URL}/courses/${id}`, fetchConfig);
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Curso no encontrado');
        }
        throw new Error(`Error HTTP: ${response.status} - ${response.statusText}`);
      }
      
      const apiResponse: CourseDetailResponse = await response.json();
      
      if (!apiResponse.success) {
        throw new Error(apiResponse.message || 'Error al obtener el curso');
      }
      
      return apiResponse.data;
    } catch (error) {
      console.error(`Error al obtener el curso con ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Obtiene todas las lecciones disponibles
   * @returns Promise<Lesson[]>
   */
  static async getAllLessons(): Promise<Lesson[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/lessons`, fetchConfig);
      
      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status} - ${response.statusText}`);
      }
      
      const apiResponse: LessonsListResponse = await response.json();
      
      if (!apiResponse.success) {
        throw new Error('Error al obtener las lecciones');
      }
      
      return apiResponse.data;
    } catch (error) {
      console.error('Error al obtener las lecciones:', error);
      throw new Error('No se pudieron cargar las lecciones. Verifica tu conexión a internet.');
    }
  }

  /**
   * Obtiene las lecciones de un curso específico
   * @param courseId - ID del curso
   * @returns Promise<Lesson[]>
   */
  static async getLessonsByCourse(courseId: number): Promise<Lesson[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/courses/${courseId}/lessons`, fetchConfig);
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Curso no encontrado');
        }
        throw new Error(`Error HTTP: ${response.status} - ${response.statusText}`);
      }
      
      const apiResponse: LessonsListResponse = await response.json();
      
      if (!apiResponse.success) {
        throw new Error('Error al obtener las lecciones del curso');
      }
      
      return apiResponse.data;
    } catch (error) {
      console.error(`Error al obtener las lecciones del curso ${courseId}:`, error);
      throw error;
    }
  }

  /**
   * Obtiene una lección específica por su ID
   * @param id - ID de la lección
   * @returns Promise<Lesson>
   */
  static async getLessonById(id: number): Promise<Lesson> {
    try {
      const response = await fetch(`${API_BASE_URL}/lessons/${id}`, fetchConfig);
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Lección no encontrada');
        }
        throw new Error(`Error HTTP: ${response.status} - ${response.statusText}`);
      }
      
      const apiResponse: LessonDetailResponse = await response.json();
      
      if (!apiResponse.success) {
        throw new Error('Error al obtener la lección');
      }
      
      return apiResponse.data;
    } catch (error) {
      console.error(`Error al obtener la lección con ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Verifica si la API está disponible
   * @returns Promise<boolean>
   */
  static async checkApiHealth(): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/courses`, {
        ...fetchConfig,
        method: 'HEAD', // Solo verificar headers, no necesitamos el contenido
      });
      
      return response.ok;
    } catch (error) {
      console.error('Error al verificar la salud de la API:', error);
      return false;
    }
  }
}

/**
 * Funciones de conversión entre API y tipos de UI
 */

// Conversión de difficulty de API a UI
const convertDifficulty = (difficulty: string): 'easy' | 'medium' | 'hard' => {
  switch (difficulty) {
    case 'fácil': return 'easy';
    case 'medio': return 'medium';
    case 'difícil': return 'hard';
    default: return 'easy';
  }
};

// Conversión de Lesson a Level
const convertLessonToLevel = (lesson: Lesson): Level => {
  // Generar contenido básico para la lección
  const content: LessonContent[] = [
    {
      type: 'text',
      content: lesson.description
    }
  ];

  return {
    id: lesson.id.toString(),
    title: lesson.name,
    description: lesson.description,
    difficulty: convertDifficulty(lesson.difficulty),
    estimatedTime: lesson.time_minutes,
    content: content
  };
};

// Conversión de Course a CourseWithLevels
export const convertCourseToUI = async (course: Course): Promise<CourseWithLevels> => {
  // Obtener las lecciones del curso
  const lessons = await CourseService.getLessonsByCourse(course.id);
  
  // Convertir lessons a levels
  const levels = lessons.map(convertLessonToLevel);

  return {
    id: course.id.toString(),
    title: course.name,
    description: course.description,
    color: course.color,
    icon: '🤟', // Icono por defecto para LSP
    levels: levels
  };
};

// Función para obtener cursos convertidos al formato UI
export const getUIFormattedCourses = async (): Promise<CourseWithLevels[]> => {
  const courses = await CourseService.getAllCourses();
  const convertedCourses = await Promise.all(
    courses.map(course => convertCourseToUI(course))
  );
  return convertedCourses;
};

/**
 * Hook personalizado para manejar el estado de carga de cursos
 */
export const useCourses = () => {
  const [courses, setCourses] = React.useState<Course[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      setError(null);
      const coursesData = await CourseService.getAllCourses();
      setCourses(coursesData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchCourses();
  }, []);

  return {
    courses,
    loading,
    error,
    refetch: fetchCourses
  };
};

/**
 * Hook personalizado para manejar un curso específico
 */
export const useCourse = (id: number | null) => {
  const [course, setCourse] = React.useState<Course | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const fetchCourse = async (courseId: number) => {
    try {
      setLoading(true);
      setError(null);
      const courseData = await CourseService.getCourseById(courseId);
      setCourse(courseData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    if (id !== null) {
      fetchCourse(id);
    }
  }, [id]);

  return {
    course,
    loading,
    error,
    refetch: id ? () => fetchCourse(id) : undefined
  };
};

/**
 * Hook personalizado para manejar lecciones de un curso
 */
export const useLessonsByCourse = (courseId: number | null) => {
  const [lessons, setLessons] = React.useState<Lesson[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const fetchLessons = async (id: number) => {
    try {
      setLoading(true);
      setError(null);
      const lessonsData = await CourseService.getLessonsByCourse(id);
      setLessons(lessonsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    if (courseId !== null) {
      fetchLessons(courseId);
    }
  }, [courseId]);

  return {
    lessons,
    loading,
    error,
    refetch: courseId ? () => fetchLessons(courseId) : undefined
  };
};

/**
 * Hook personalizado para manejar una lección específica
 */
export const useLesson = (id: number | null) => {
  const [lesson, setLesson] = React.useState<Lesson | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const fetchLesson = async (lessonId: number) => {
    try {
      setLoading(true);
      setError(null);
      const lessonData = await CourseService.getLessonById(lessonId);
      setLesson(lessonData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    if (id !== null) {
      fetchLesson(id);
    }
  }, [id]);

  return {
    lesson,
    loading,
    error,
    refetch: id ? () => fetchLesson(id) : undefined
  };
};

// Importamos React para los hooks
import React from 'react';