"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { videosApi } from "@/lib/api/videos.api";
import { lessonsApi } from "@/lib/api/lessons.api";

export default function LessonLearningPage() {
  const { courseId, lessonId } = useParams<{ courseId: string; lessonId: string }>();
  const [note, setNote] = useState("");
  const [progress, setProgress] = useState<number | null>(null);
  const [status, setStatus] = useState("");

  useEffect(() => {
    videosApi
      .getProgress(lessonId)
      .then((data) => setProgress(data.watched_seconds ?? data.watchedSeconds ?? 0))
      .catch(() => setProgress(0));
  }, [lessonId]);

  return (
    <main className="mx-auto grid max-w-7xl gap-6 px-4 py-8 lg:grid-cols-[2fr_1fr]">
      <section className="space-y-4">
        <div className="aspect-video rounded-2xl border border-zinc-200 bg-black dark:border-zinc-800" />
        <h1 className="text-2xl font-bold">Course {courseId} - Lesson {lessonId}</h1>
        <p className="text-zinc-500">Watched seconds: {progress ?? "..."}</p>
        <div className="flex gap-2">
          <Button
            onClick={async () => {
              try {
                await videosApi.updateProgress(lessonId, { watchedSeconds: (progress ?? 0) + 30 });
                setProgress((p) => (p ?? 0) + 30);
                setStatus("Progress updated");
              } catch (error) {
                setStatus((error as Error).message);
              }
            }}
          >
            +30s Progress
          </Button>
          <Button
            variant="outline"
            onClick={async () => {
              try {
                await lessonsApi.complete(lessonId);
                setStatus("Lesson marked complete");
              } catch (error) {
                setStatus((error as Error).message);
              }
            }}
          >
            Mark Complete
          </Button>
        </div>
      </section>
      <aside className="space-y-4 rounded-2xl border border-zinc-200 p-4 dark:border-zinc-800">
        <h2 className="font-semibold">Notes / Bookmarks</h2>
        <textarea
          className="h-40 w-full rounded-xl border border-zinc-300 bg-transparent p-3 text-sm dark:border-zinc-700"
          placeholder="Write your notes..."
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
        <Button
          onClick={async () => {
            try {
              await videosApi.addBookmark(lessonId, { positionSeconds: progress ?? 0, note });
              setStatus("Bookmark saved");
            } catch (error) {
              setStatus((error as Error).message);
            }
          }}
        >
          Save Bookmark
        </Button>
        {status && <p className="text-sm text-zinc-500">{status}</p>}
      </aside>
    </main>
  );
}
