"use client";

import { useQuery } from "@tanstack/react-query";
import { CourseFilters, coursesApi } from "@/lib/api/courses.api";

export function useCourses(filters: CourseFilters) {
  return useQuery({
    queryKey: ["courses", filters],
    queryFn: () => coursesApi.list(filters),
  });
}

export function useCourseDetails(id: string) {
  return useQuery({
    queryKey: ["course", id],
    queryFn: () => coursesApi.details(id),
    enabled: Boolean(id),
  });
}

