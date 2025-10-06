export interface Course {
  id: string;
  title: string;
  description: string;
  color: string;
  icon: string;
  levels: Level[];
}

export interface Level {
  id: string;
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  estimatedTime: number;
  content: LessonContent[];
}

export interface LessonContent {
  type: 'text' | 'quiz' | 'exercise';
  content: string;
  options?: string[];
  correctAnswer?: number;
}

export interface UserProgress {
  [courseId: string]: {
    [levelId: string]: {
      completed: boolean;
      stars: number;
    };
  };
}

export interface LevelProgress {
  completed: boolean;
  stars: number;
}