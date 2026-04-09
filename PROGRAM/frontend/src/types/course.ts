export interface Lesson {
  id: number;
  title: string;
  duration?: string;
  videoUrl?: string | null;
  lessonType?: string;
}

export interface CourseSection {
  id: number;
  title: string;
  lessons: Lesson[];
}

export interface Course {
  id: number;
  title: string;
  description: string;
  categoryId?: number;
  level: "beginner" | "intermediate" | "advanced" | "all";
  price: number;
  thumbnail?: string | null;
  instructorId?: number;
  sections?: CourseSection[];
}
