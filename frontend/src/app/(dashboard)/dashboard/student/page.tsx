"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { coursesApi } from "@/lib/api/courses.api";
import { quizzesApi } from "@/lib/api/quizzes.api";
import { assignmentsApi } from "@/lib/api/assignments.api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function StudentDashboardPage() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const [quizId, setQuizId] = useState("");
  const [assignmentId, setAssignmentId] = useState("");
  const [status, setStatus] = useState("");
  const [recommendedCourses, setRecommendedCourses] = useState<Array<{ id: number; title: string; description: string; level: string; price: number }>>([]);
  const [loadingCourses, setLoadingCourses] = useState(true);

  useEffect(() => {
    const loadCourses = async () => {
      try {
        const result = await coursesApi.list({ limit: 5 });
        setRecommendedCourses(result.items.map((course) => ({
          id: course.id,
          title: course.title,
          description: course.description,
          level: course.level,
          price: course.price,
        })));
      } catch (error) {
        setStatus((error as Error).message);
      } finally {
        setLoadingCourses(false);
      }
    };
    loadCourses();
  }, []);

  return (
    <main className="mx-auto max-w-6xl space-y-6 px-4 py-8">
      <section className="rounded-3xl border border-zinc-200 bg-white/80 p-6 shadow-sm shadow-zinc-200/10 dark:border-zinc-800 dark:bg-zinc-950 dark:shadow-black/10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-zinc-500">Welcome back,</p>
            <h1 className="text-3xl font-bold tracking-tight">{user?.email ?? "Student"}</h1>
            <p className="text-sm text-zinc-500">Your student dashboard gives you quick access to quizzes, assignments, and your learning progress.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button onClick={() => router.push("/dashboard/student/profile")}>View Profile</Button>
            <Button variant="outline" onClick={() => router.push("/dashboard/student")}>Refresh</Button>
          </div>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="p-6">
          <p className="text-sm uppercase tracking-[0.2em] text-zinc-500">Enrolled Courses</p>
          <p className="mt-4 text-3xl font-semibold">{recommendedCourses.length}</p>
          <p className="text-sm text-zinc-500">Recommended courses for you.</p>
        </Card>
        <Card className="p-6">
          <p className="text-sm uppercase tracking-[0.2em] text-zinc-500">Upcoming quizzes</p>
          <p className="mt-4 text-3xl font-semibold">2</p>
          <p className="text-sm text-zinc-500">Stay ready for your next attempts.</p>
        </Card>
        <Card className="p-6">
          <p className="text-sm uppercase tracking-[0.2em] text-zinc-500">Pending assignments</p>
          <p className="mt-4 text-3xl font-semibold">1</p>
          <p className="text-sm text-zinc-500">Keep your coursework on track.</p>
        </Card>
      </div>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)]">
        <div className="space-y-6">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">Quick Actions</h2>
                <p className="text-sm text-zinc-500">Jump right into the most important student tools.</p>
              </div>
              <Badge variant="secondary">Fast access</Badge>
            </div>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <Button onClick={() => router.push("/quizzes")}>Browse Quizzes</Button>
              <Button variant="outline" onClick={() => router.push("/assignments")}>My Assignments</Button>
              <Button variant="outline" onClick={() => router.push("/learning")}>Continue Learning</Button>
              <Button variant="outline" onClick={() => router.push("/dashboard/student/profile")}>Edit Profile</Button>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-semibold">Start a quiz</h2>
            <p className="text-sm text-zinc-500">Enter the quiz ID to begin your next attempt.</p>
            <div className="mt-4 grid gap-4 sm:grid-cols-[1fr_auto]">
              <Input value={quizId} onChange={(e) => setQuizId(e.target.value)} placeholder="Quiz ID" />
              <Button
                onClick={async () => {
                  try {
                    const started = await quizzesApi.startAttempt(quizId);
                    setStatus(`Quiz attempt started: ${started.attempt?.attempt_id ?? "started"}`);
                  } catch (error) {
                    setStatus((error as Error).message);
                  }
                }}
              >
                Start
              </Button>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-semibold">Assignment tracking</h2>
            <p className="text-sm text-zinc-500">Check your submitted assignments and review the latest status.</p>
            <div className="mt-4 grid gap-4 sm:grid-cols-[1fr_auto]">
              <Input value={assignmentId} onChange={(e) => setAssignmentId(e.target.value)} placeholder="Assignment ID" />
              <Button
                variant="outline"
                onClick={async () => {
                  try {
                    const result = await assignmentsApi.mySubmissions(assignmentId);
                    const count = Array.isArray(result.items) ? result.items.length : result.total ?? 0;
                    setStatus(`Submissions fetched: ${count}`);
                  } catch (error) {
                    setStatus((error as Error).message);
                  }
                }}
              >
                Load
              </Button>
            </div>
          </Card>
        </div>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Recommended courses</h2>
              <p className="text-sm text-zinc-500">Courses we think you'll enjoy.</p>
            </div>
            {loadingCourses && <Badge variant="outline">Loading</Badge>}
          </div>
          <div className="mt-5 space-y-4">
            {recommendedCourses.map((course) => (
              <div key={course.id} className="rounded-2xl border border-zinc-200 p-4 dark:border-zinc-800">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h3 className="font-semibold">{course.title}</h3>
                    <p className="text-sm text-zinc-500 line-clamp-2">{course.description}</p>
                  </div>
                  <Badge>{course.level}</Badge>
                </div>
                <div className="mt-3 flex items-center justify-between text-sm text-zinc-500">
                  <span>${course.price.toFixed(2)}</span>
                  <Button variant="outline" size="sm" onClick={() => router.push(`/courses/${course.id}`)}>
                    View course
                  </Button>
                </div>
              </div>
            ))}
            {!loadingCourses && recommendedCourses.length === 0 && <p className="text-sm text-zinc-500">No courses available right now.</p>}
          </div>
        </Card>
      </section>

      {status && <p className="text-sm text-zinc-500">{status}</p>}
    </main>
  );
}
