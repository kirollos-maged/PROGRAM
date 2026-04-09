"use client";

import { useParams } from "next/navigation";
import { useState } from "react";
import { useCourseDetails } from "@/lib/hooks/useCourses";
import { Button } from "@/components/ui/button";
import { coursesApi } from "@/lib/api/courses.api";

export default function CourseDetailsPage() {
  const params = useParams<{ id: string }>();
  const { data, isLoading } = useCourseDetails(params.id);
  const [status, setStatus] = useState("");

  if (isLoading) return <main className="p-6">Loading course details...</main>;
  if (!data) return <main className="p-6">Course not found.</main>;

  return (
    <main className="mx-auto max-w-5xl space-y-6 px-4 py-8">
      <h1 className="text-3xl font-bold">{data.title}</h1>
      <p className="text-zinc-500">Level: {data.level} - Price: ${data.price}</p>
      <p>{data.description}</p>
      <section>
        <h2 className="mb-3 text-xl font-semibold">Sections & Lessons</h2>
        <div className="space-y-3">
          {data.sections?.map((section) => (
            <div key={section.id} className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
              <h3 className="font-medium">{section.title}</h3>
              <ul className="mt-2 list-disc pl-5 text-sm text-zinc-500">
                {section.lessons.map((lesson) => (
                  <li key={lesson.id}>{lesson.title}{lesson.duration ? ` (${lesson.duration})` : ""}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>
      <Button
        size="lg"
        onClick={async () => {
          try {
            await coursesApi.enroll(params.id);
            setStatus("Enrolled successfully.");
          } catch (error) {
            setStatus((error as Error).message);
          }
        }}
      >
        Enroll Now
      </Button>
      {status && <p className="text-sm text-zinc-500">{status}</p>}
    </main>
  );
}
