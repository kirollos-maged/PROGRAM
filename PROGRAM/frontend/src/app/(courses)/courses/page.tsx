"use client";

import Link from "next/link";
import { useState } from "react";
import { useCourses } from "@/lib/hooks/useCourses";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";

export default function CoursesPage() {
  const [search, setSearch] = useState("");
  const [level, setLevel] = useState("");
  const [page, setPage] = useState(1);

  const { data, isLoading } = useCourses({ search, level, page });

  return (
    <main className="mx-auto max-w-7xl space-y-6 px-4 py-8">
      <h1 className="text-3xl font-bold">Courses</h1>
      <div className="grid gap-3 md:grid-cols-3">
        <Input placeholder="Search courses..." value={search} onChange={(e) => setSearch(e.target.value)} />
        <select className="h-11 rounded-xl border border-zinc-300 bg-transparent px-3 dark:border-zinc-700" value={level} onChange={(e) => setLevel(e.target.value)}>
          <option value="">All levels</option>
          <option value="beginner">Beginner</option>
          <option value="intermediate">Intermediate</option>
          <option value="advanced">Advanced</option>
        </select>
        <Button onClick={() => setPage(1)}>Apply Filters</Button>
      </div>

      {isLoading && <p className="text-zinc-500">Loading courses...</p>}

      <div className="grid gap-4 md:grid-cols-3">
        {data?.items?.map((course) => (
          <Card key={course.id} className="space-y-3 p-6 hover:shadow-lg transition-shadow">
            <div className="aspect-video bg-gradient-to-br from-orange-100 to-orange-200 dark:from-orange-900/20 dark:to-orange-800/20 rounded-lg flex items-center justify-center">
              <span className="text-4xl">📚</span>
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold line-clamp-2">{course.title}</h3>
              <p className="line-clamp-2 text-sm text-zinc-500">{course.description}</p>
              <div className="flex items-center justify-between">
                <Badge variant="secondary">{course.level}</Badge>
                <span className="font-semibold text-orange-500">{formatCurrency(course.price)}</span>
              </div>
            </div>
            <div className="flex gap-2">
              <Link href={`/courses/${course.id}`}><Button className="flex-1">View Details</Button></Link>
              <Link href={`/courses/${course.id}`}><Button variant="outline">Enroll</Button></Link>
            </div>
          </Card>
        ))}
      </div>

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={() => setPage((p) => Math.max(1, p - 1))}>Prev</Button>
        <Button onClick={() => setPage((p) => p + 1)}>Next</Button>
      </div>
    </main>
  );
}

