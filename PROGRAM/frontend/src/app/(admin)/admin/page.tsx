"use client";

import { useEffect, useState } from "react";
import { adminApi, type AdminCourse, type AdminStats, type AdminUser, type FeatureFlag, type SecurityEvent } from "@/lib/api/admin.api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function AdminPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [courses, setCourses] = useState<AdminCourse[]>([]);
  const [featureFlags, setFeatureFlags] = useState<FeatureFlag[]>([]);
  const [events, setEvents] = useState<SecurityEvent[]>([]);
  const [flagKey, setFlagKey] = useState("new-feature");
  const [flagEnabled, setFlagEnabled] = useState(true);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  const loadAdminData = async () => {
    setLoading(true);
    setStatus("");
    try {
      const [statsData, usersData, coursesData, flagsData, eventsData] = await Promise.all([
        adminApi.getStats(),
        adminApi.getUsers(10, 0),
        adminApi.getCourses(10, 0),
        adminApi.getFeatureFlags(),
        adminApi.securityEvents(),
      ]);

      setStats(statsData);
      setUsers(usersData.items);
      setCourses(coursesData.items);
      setFeatureFlags(flagsData.items);
      setEvents(eventsData.items.slice(0, 8));
      setStatus("Admin dashboard loaded successfully.");
    } catch (error) {
      setStatus((error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const refreshFeatureFlags = async () => {
    try {
      const data = await adminApi.getFeatureFlags();
      setFeatureFlags(data.items);
    } catch (error) {
      setStatus((error as Error).message);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  return (
    <main className="mx-auto max-w-7xl space-y-6 px-4 py-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Admin Panel</h1>
          <p className="text-sm text-zinc-500">Manage platform metrics, users, courses, feature flags, and security events.</p>
        </div>
        <Button variant="outline" onClick={loadAdminData} disabled={loading}>
          {loading ? "Refreshing..." : "Refresh dashboard"}
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card className="p-6">
          <p className="text-sm uppercase tracking-[0.2em] text-zinc-500">Users</p>
          <p className="mt-3 text-3xl font-semibold">{stats?.totalUsers ?? "--"}</p>
          <p className="text-sm text-zinc-500">Students {stats?.totalStudents ?? "--"}</p>
        </Card>
        <Card className="p-6">
          <p className="text-sm uppercase tracking-[0.2em] text-zinc-500">Instructors</p>
          <p className="mt-3 text-3xl font-semibold">{stats?.totalInstructors ?? "--"}</p>
          <p className="text-sm text-zinc-500">Admins {stats?.totalAdmins ?? "--"}</p>
        </Card>
        <Card className="p-6">
          <p className="text-sm uppercase tracking-[0.2em] text-zinc-500">Courses</p>
          <p className="mt-3 text-3xl font-semibold">{stats?.totalCourses ?? "--"}</p>
          <p className="text-sm text-zinc-500">Published {stats?.publishedCourses ?? "--"}</p>
        </Card>
        <Card className="p-6">
          <p className="text-sm uppercase tracking-[0.2em] text-zinc-500">Events</p>
          <p className="mt-3 text-3xl font-semibold">{stats?.totalActivityEvents ?? "--"}</p>
          <p className="text-sm text-zinc-500">Drafts {stats?.draftCourses ?? "--"}</p>
        </Card>
      </div>

      <section className="rounded-2xl border border-zinc-200 p-4 dark:border-zinc-800">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold">Security Events</h2>
            <p className="text-sm text-zinc-500">Latest admin and security actions across the platform.</p>
          </div>
          <Button variant="outline" onClick={loadAdminData} disabled={loading}>
            Reload
          </Button>
        </div>
        <div className="space-y-2 text-sm">
          {events.map((event, index) => (
            <div key={`${event.created_at}-${index}`} className="flex justify-between rounded-lg bg-zinc-100 p-3 dark:bg-zinc-900">
              <span>{event.event_type}</span>
              <span>{new Date(event.created_at).toLocaleString()}</span>
            </div>
          ))}
          {events.length === 0 && <p className="text-zinc-500">No recent security events are available.</p>}
        </div>
      </section>

      <section className="rounded-2xl border border-zinc-200 p-4 dark:border-zinc-800">
        <h2 className="mb-4 text-xl font-semibold">Feature Flags</h2>
        <div className="grid gap-3 md:grid-cols-[1fr_auto_auto]">
          <Input value={flagKey} onChange={(e) => setFlagKey(e.target.value)} placeholder="Feature key" />
          <Button variant={flagEnabled ? "default" : "outline"} onClick={() => setFlagEnabled((v) => !v)}>
            {flagEnabled ? "Enabled" : "Disabled"}
          </Button>
          <Button
            onClick={async () => {
              try {
                await adminApi.upsertFeatureFlag({ key: flagKey, enabled: flagEnabled, description: "Updated from dashboard" });
                setStatus("Feature flag updated");
                refreshFeatureFlags();
              } catch (error) {
                setStatus((error as Error).message);
              }
            }}
          >
            Save Flag
          </Button>
        </div>

        <div className="mt-5 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-700">
                <th className="py-2 font-medium">Key</th>
                <th className="py-2 font-medium">Enabled</th>
                <th className="py-2 font-medium">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {featureFlags.map((flag) => (
                <tr key={flag.key}>
                  <td className="py-2">{flag.key}</td>
                  <td className="py-2">{flag.enabled ? "Yes" : "No"}</td>
                  <td className="py-2 text-zinc-500">{flag.description ?? "—"}</td>
                </tr>
              ))}
              {featureFlags.length === 0 && (
                <tr>
                  <td colSpan={3} className="py-3 text-zinc-500">
                    No feature flags configured yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(0,1.2fr)]">
        <section className="rounded-2xl border border-zinc-200 p-4 dark:border-zinc-800">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Users</h2>
              <p className="text-sm text-zinc-500">View the latest registered accounts and roles.</p>
            </div>
            <Badge variant="secondary">{users.length}</Badge>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-zinc-200 dark:border-zinc-700">
                  <th className="py-2 font-medium">Email</th>
                  <th className="py-2 font-medium">Role</th>
                  <th className="py-2 font-medium">Verified</th>
                  <th className="py-2 font-medium">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {users.map((user) => (
                  <tr key={user.user_id}>
                    <td className="py-2">{user.email}</td>
                    <td className="py-2 capitalize">{user.role}</td>
                    <td className="py-2">{user.is_email_verified ? "Yes" : "No"}</td>
                    <td className="py-2 text-zinc-500">{new Date(user.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-3 text-zinc-500">
                      No users to display.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="rounded-2xl border border-zinc-200 p-4 dark:border-zinc-800">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Courses</h2>
              <p className="text-sm text-zinc-500">Monitor the latest course submissions and their statuses.</p>
            </div>
            <Badge variant="secondary">{courses.length}</Badge>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-zinc-200 dark:border-zinc-700">
                  <th className="py-2 font-medium">Title</th>
                  <th className="py-2 font-medium">Instructor</th>
                  <th className="py-2 font-medium">Status</th>
                  <th className="py-2 font-medium">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {courses.map((course) => (
                  <tr key={course.course_id}>
                    <td className="py-2">{course.title}</td>
                    <td className="py-2">{course.instructor_email ?? "Unknown"}</td>
                    <td className="py-2 capitalize">{course.status}</td>
                    <td className="py-2 text-zinc-500">{new Date(course.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
                {courses.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-3 text-zinc-500">
                      No courses to display.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {status && <p className="text-sm text-zinc-500">{status}</p>}
    </main>
  );
}
