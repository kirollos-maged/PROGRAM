"use client";

import { FormEvent, useEffect, useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { coursesApi } from "@/lib/api/courses.api";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/store/toastStore";
import type { Course } from "@/types/course";

interface InstructorCourse extends Course {
  enrolledCount: number;
  status: "draft" | "published";
}

export default function InstructorDashboardPage() {
  const user = useAuthStore((state) => state.user);
  const { toast } = useToast();
  const [courses, setCourses] = useState<InstructorCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newCourse, setNewCourse] = useState({
    title: "",
    description: "",
    level: "beginner",
    price: 0,
  });
  const [status, setStatus] = useState("");

  useEffect(() => {
    loadCourses();
  }, [user]);

  const loadCourses = async () => {
    setLoading(true);
    setStatus("");
    try {
      const result = await coursesApi.list({ limit: 20 });
      const instructorCourses = result.items
        .filter((course) => user?.userId && course.instructorId === user.userId)
        .map((course) => ({
          ...course,
          enrolledCount: 0,
          status: "published" as const,
        }));
      setCourses(instructorCourses.length ? instructorCourses : []);
    } catch (error) {
      toast.error("Failed to load courses");
      setStatus((error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCourse = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus("");
    try {
      const created = await coursesApi.create({
        title: newCourse.title,
        description: newCourse.description,
        price: newCourse.price,
        categoryId: 1,
        level: newCourse.level,
      });
      setCourses([
        ...courses,
        {
          ...created,
          enrolledCount: 0,
          status: "draft",
        },
      ]);
      setNewCourse({ title: "", description: "", level: "beginner", price: 0 });
      setShowCreateForm(false);
      toast.success("Course created successfully!");
    } catch (error) {
      toast.error("Failed to create course");
      setStatus((error as Error).message);
    }
  };

  const toggleCourseStatus = async (courseId: number) => {
    try {
      await coursesApi.publish(courseId);
      setCourses(courses.map((course) =>
        course.id === courseId
          ? { ...course, status: course.status === "published" ? "draft" : "published" }
          : course
      ));
      toast.success("Course status updated!");
    } catch (error) {
      toast.error("Failed to update course status");
      setStatus((error as Error).message);
    }
  };

  if (loading) {
    return (
      <main className="mx-auto max-w-7xl space-y-6 px-4 py-8">
        <div className="h-8 w-64 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
        <div className="grid gap-6 md:grid-cols-2">
          <div className="h-64 animate-pulse rounded-lg bg-zinc-200 dark:bg-zinc-800" />
          <div className="h-64 animate-pulse rounded-lg bg-zinc-200 dark:bg-zinc-800" />
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-7xl space-y-6 px-4 py-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Instructor Dashboard</h1>
          <p className="text-sm text-zinc-500">Create courses, manage content, and review your student reach.</p>
        </div>
        <Button onClick={() => setShowCreateForm(!showCreateForm)}>
          {showCreateForm ? "Cancel" : "Create Course"}
        </Button>
      </div>

      {showCreateForm && (
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Create New Course</h2>
          <form onSubmit={handleCreateCourse} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Title</label>
                <Input
                  value={newCourse.title}
                  onChange={(e) => setNewCourse({ ...newCourse, title: e.target.value })}
                  placeholder="Course title"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Level</label>
                <select
                  className="w-full h-10 rounded-md border border-zinc-300 bg-transparent px-3 dark:border-zinc-700"
                  value={newCourse.level}
                  onChange={(e) => setNewCourse({ ...newCourse, level: e.target.value })}
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                  <option value="all">All Levels</option>
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <Textarea
                value={newCourse.description}
                onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })}
                placeholder="Course description"
                rows={4}
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Price ($)</label>
              <Input
                type="number"
                value={newCourse.price}
                onChange={(e) => setNewCourse({ ...newCourse, price: Number(e.target.value) })}
                placeholder="0.00"
                min="0"
                step="0.01"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Button type="submit">Create Course</Button>
              <Button type="button" variant="outline" onClick={() => setShowCreateForm(false)}>
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="p-6">
          <h3 className="text-lg font-semibold">My Courses</h3>
          <p className="mt-4 text-3xl font-bold text-orange-500">{courses.length}</p>
        </Card>
        <Card className="p-6">
          <h3 className="text-lg font-semibold">Published</h3>
          <p className="mt-4 text-3xl font-bold text-green-500">{courses.filter((c) => c.status === "published").length}</p>
        </Card>
        <Card className="p-6">
          <h3 className="text-lg font-semibold">Total Reach</h3>
          <p className="mt-4 text-3xl font-bold text-blue-500">{courses.reduce((sum, course) => sum + course.enrolledCount, 0)}</p>
        </Card>
      </div>

      <Card className="p-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">Your Courses</h2>
            <p className="text-sm text-zinc-500">Manage content, publish new updates, and review enrollment.</p>
          </div>
          {status && <span className="text-sm text-orange-500">{status}</span>}
        </div>
        <div className="space-y-4">
          {courses.length === 0 ? (
            <p className="text-sm text-zinc-500">No instructor courses found yet. Create your first course above.</p>
          ) : (
            courses.map((course) => (
              <div key={course.id} className="flex flex-col gap-4 rounded-2xl border border-zinc-200 p-4 dark:border-zinc-800 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="text-lg font-semibold">{course.title}</h3>
                  <p className="text-sm text-zinc-500">{course.description}</p>
                  <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
                    <Badge variant="secondary">{course.level}</Badge>
                    <span>${course.price.toFixed(2)}</span>
                    <span>{course.enrolledCount} students</span>
                    <Badge>{course.status}</Badge>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" size="sm">
                    Edit
                  </Button>
                  <Button variant={course.status === "published" ? "outline" : "default"} size="sm" onClick={() => toggleCourseStatus(course.id)}>
                    {course.status === "published" ? "Unpublish" : "Publish"}
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
    </main>
  );
}
