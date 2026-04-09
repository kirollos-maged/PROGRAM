"use client";

import { useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function StudentProfilePage() {
  const user = useAuthStore((state) => state.user);
  const [displayName, setDisplayName] = useState(user?.email.split("@")[0] ?? "");
  const [bio, setBio] = useState("");
  const [status, setStatus] = useState("");

  return (
    <main className="mx-auto max-w-4xl space-y-6 px-4 py-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Student Profile</h1>
        <p className="text-sm text-zinc-500">Manage your account details, personal information, and student settings.</p>
      </div>

      <Card className="p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold">Account Summary</h2>
            <p className="text-sm text-zinc-500">Your account information is used for login and to personalize your learning experience.</p>
          </div>
          <Badge>{user?.role ?? "student"}</Badge>
        </div>
        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <p className="text-sm text-zinc-500">Email</p>
            <div className="rounded-2xl border border-zinc-200 bg-zinc-100 px-4 py-3 text-sm dark:border-zinc-800 dark:bg-zinc-900">{user?.email ?? "-"}</div>
          </div>
          <div className="space-y-2">
            <p className="text-sm text-zinc-500">Member since</p>
            <div className="rounded-2xl border border-zinc-200 bg-zinc-100 px-4 py-3 text-sm dark:border-zinc-800 dark:bg-zinc-900">Pending connection</div>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-xl font-semibold">Personal Details</h2>
        <div className="mt-4 space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium">Display Name</label>
              <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Enter a display name" />
            </div>
            <div>
              <label className="text-sm font-medium">Role</label>
              <Input value={user?.role ?? "student"} disabled />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium">Bio</label>
            <Textarea value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Write a short bio" rows={4} />
          </div>
          <div className="flex items-center justify-between gap-4">
            <p className="text-sm text-zinc-500">This form is a profile scaffold. Use it to plan student account details and save local preferences.</p>
            <Button
              onClick={() => {
                setStatus("Profile updated successfully.");
              }}
            >
              Save Profile
            </Button>
          </div>
          {status && <p className="text-sm text-green-500">{status}</p>}
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-xl font-semibold">Learning Preferences</h2>
        <p className="mt-2 text-sm text-zinc-500">Customize your student view and course recommendations.</p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-zinc-200 p-4 dark:border-zinc-800">
            <p className="text-sm font-medium">Notifications</p>
            <p className="mt-2 text-sm text-zinc-500">Receive email updates for course progress and assignments.</p>
          </div>
          <div className="rounded-2xl border border-zinc-200 p-4 dark:border-zinc-800">
            <p className="text-sm font-medium">Study mode</p>
            <p className="mt-2 text-sm text-zinc-500">Dark mode is available throughout the platform.</p>
          </div>
        </div>
      </Card>
    </main>
  );
}
