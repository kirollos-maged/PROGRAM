import { apiClient } from "./axios";
import type { Course, CourseSection, Lesson } from "@/types/course";

type CourseRow = {
  course_id: number;
  instructor_id: number;
  category_id: number;
  title: string;
  description: string | null;
  level: "beginner" | "intermediate" | "advanced" | "all" | null;
  price: string | number;
  thumbnail_url: string | null;
};

type SectionRow = { section_id: number; title: string };
type LessonRow = {
  lesson_id: number;
  title: string;
  lesson_type?: string;
  duration_minutes?: number | null;
  video_url?: string | null;
};

const mapLesson = (row: LessonRow): Lesson => ({
  id: row.lesson_id,
  title: row.title,
  lessonType: row.lesson_type,
  duration: row.duration_minutes ? `${row.duration_minutes} min` : undefined,
  videoUrl: row.video_url ?? null,
});

const mapCourse = (row: CourseRow): Course => ({
  id: row.course_id,
  instructorId: row.instructor_id,
  categoryId: row.category_id,
  title: row.title,
  description: row.description ?? "",
  level: row.level ?? "all",
  price: Number(row.price ?? 0),
  thumbnail: row.thumbnail_url,
});

export interface CourseFilters {
  search?: string;
  level?: string;
  page?: number;
  limit?: number;
}

export const coursesApi = {
  list: async (filters: CourseFilters) => {
    const limit = filters.limit ?? 9;
    const offset = ((filters.page ?? 1) - 1) * limit;
    const { data } = await apiClient.get<{ items: CourseRow[]; total: number }>("/courses", {
      params: { limit, offset },
    });
    const mapped = data.items.map(mapCourse).filter((course) => {
      const search = filters.search?.toLowerCase();
      const level = filters.level?.toLowerCase();
      const searchOk = !search || course.title.toLowerCase().includes(search) || course.description.toLowerCase().includes(search);
      const levelOk = !level || course.level === level;
      return searchOk && levelOk;
    });
    return { items: mapped, total: data.total };
  },

  details: async (id: string) => {
    const { data } = await apiClient.get<CourseRow>(`/courses/${id}`);
    const course = mapCourse(data);
    const sectionsResult = await coursesApi.sections(id);
    const sectionsWithLessons: CourseSection[] = await Promise.all(
      sectionsResult.items.map(async (section) => {
        const lessons = await coursesApi.lessons(id, String(section.id));
        return { ...section, lessons: lessons.items };
      })
    );
    return { ...course, sections: sectionsWithLessons };
  },

  enroll: async (courseId: string | number) => {
    const { data } = await apiClient.post<{ courseId: string; userId: number }>(`/courses/${courseId}/enroll`);
    return data;
  },

  sections: async (courseId: string | number) => {
    const { data } = await apiClient.get<{ items: SectionRow[]; total: number }>(`/courses/${courseId}/sections`);
    return {
      total: data.total,
      items: data.items.map((item) => ({ id: item.section_id, title: item.title, lessons: [] })),
    };
  },

  lessons: async (courseId: string | number, sectionId: string | number) => {
    const { data } = await apiClient.get<{ items: LessonRow[]; total: number }>(
      `/courses/${courseId}/sections/${sectionId}/lessons`
    );
    return { total: data.total, items: data.items.map(mapLesson) };
  },

  create: async (payload: { title: string; description?: string; price: number; categoryId: number; level?: string; thumbnailUrl?: string }) => {
    const { data } = await apiClient.post<CourseRow>("/courses", payload);
    return mapCourse(data);
  },

  publish: async (courseId: string | number) => {
    const { data } = await apiClient.post<CourseRow>(`/courses/${courseId}/publish`);
    return mapCourse(data);
  },
};
