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
  content?: LessonContentStep[] | null;
  difficulty_label?: string;
  formatted_duration?: string;
  progress_count?: number;
  course?: {
    id: number;
    name: string;
    description?: string;
    image_path?: string;
    color?: string;
    created_at?: string;
    updated_at?: string;
  };
  gestures?: Gesture[];
  progress?: Progress[];
}

export interface Gesture {
  id: number;
  lesson_id: number;
  name?: string;
  description?: string;
  video_url?: string;
  image_url?: string;
  gesture_data: GestureData;
  created_at: string;
  updated_at: string;
}

export interface GestureData {
  name: string;
  frames: GestureFrame[];
  frameCount: number;
  isSequential: boolean;
}

export interface GestureFrame {
  id: number;
  timestamp: string;
  landmarks: unknown[];
  landmarksNormalizados: unknown[];
  handedness: unknown[];
  gestureName: string;
  frameIndex: number;
  sequenceMetadata: Record<string, unknown>;
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
  image_path?: string; // Nueva propiedad para la imagen del curso
  levels: Level[];
}

// Tipos para componentes de UI (legacy - mantener por compatibilidad)
export interface LessonContent {
  type: 'text' | 'quiz' | 'exercise' | 'video';
  content: string;
  options?: string[];
  correctAnswer?: number;
}

// Nuevos tipos para el contenido dinámico de lecciones
export interface LessonContentStep {
  index: number;
  titulo: string;
  descripcion: string;
  contenido: string;
  media: LessonMedia;
}

export interface LessonMedia {
  tipo: 'image' | 'video';
  url: string;
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

// Tipos para perfil de usuario
export interface UserProfile {
  name: string;
  email: string;
  current_password?: string;
  new_password?: string;
  new_password_confirmation?: string;
}

export interface UpdateProfileRequest {
  name: string;
  email: string;
  current_password?: string;
  new_password?: string;
  new_password_confirmation?: string;
}

export interface UpdateProfileResponse {
  success: boolean;
  data: {
    user: User;
  };
  message: string;
}