// Tipos que coinciden con la API de Laravel
export interface Course {
  id: number;
  name: string;
  description: string;
  image_path: string | null;
  color: string;
  created_at: string;
  updated_at: string;
  lessons?: Lesson[];
  progress?: Progress[];
}

export interface Lesson {
  id: number;
  course_id: number;
  name: string;
  level_number: number;
  description: string;
  difficulty: 'fácil' | 'medio' | 'difícil';
  time_minutes: number;
  created_at: string;
  updated_at: string;
  course?: {
    id: number;
    name: string;
  };
  gestures?: Gesture[];
  progress?: Progress[];
}

export interface Gesture {
  id: number;
  lesson_id: number;
  name: string;
  description: string;
  video_url?: string;
  image_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Progress {
  id: number;
  user_id: number;
  course_id: number;
  lesson_id?: number;
  completed: boolean;
  score?: number;
  created_at: string;
  updated_at: string;
}

// Tipos para la respuesta de la API
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

export interface CoursesListResponse {
  success: boolean;
  data: Course[];
  message: string;
}

export interface CourseDetailResponse {
  success: boolean;
  data: Course;
  message: string;
}

export interface LessonsListResponse {
  success: boolean;
  data: Lesson[];
}

export interface LessonDetailResponse {
  success: boolean;
  data: Lesson;
}

// Tipos para el estado de la aplicación (mantenemos algunos tipos originales para compatibilidad)
export interface UserProgress {
  [courseId: string]: {
    [levelId: string]: {
      completed: boolean;
      score: number;
      stars?: number;
    };
  };
}

export interface LessonProgress {
  completed: boolean;
  score: number;
}

// Tipos para compatibilidad con el diseño actual
export interface LevelProgress {
  completed: boolean;
  stars: number;
}

export interface Level {
  id: string;
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  estimatedTime: number;
  content: LessonContent[];
}

// Tipos para el diseño de UI (conversión de API a diseño)
export interface CourseWithLevels {
  id: string;
  title: string;
  description: string;
  color: string;
  icon: string;
  levels: Level[];
}

// Tipos para componentes de UI
export interface LessonContent {
  type: 'text' | 'quiz' | 'exercise' | 'video';
  content: string;
  options?: string[];
  correctAnswer?: number;
}

// Tipos para autenticación
export interface User {
  id: number;
  name: string;
  email: string;
  email_verified_at?: string;
  created_at: string;
  updated_at: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
}

export interface AuthResponse {
  success: boolean;
  data: {
    user: User;
    token: string;
  };
  message: string;
}