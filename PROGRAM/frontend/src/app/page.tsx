import { Navbar } from "@/components/layout/navbar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Image from "next/image";
import Link from "next/link";

const featured = ["Full-Stack Web", "Data Science", "UI/UX Design"];

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-12">
        <section className="relative grid gap-2 overflow-hidden rounded-3xl p-10 text-center" style={{ border: 'var(--section-border)', boxShadow: 'var(--section-box-shadow)' }}>
          <Image src="/program-logo.png" alt="PROGRAM watermark" width={900} height={900} className="pointer-events-none absolute inset-0 m-auto mt-12 opacity-10 w-[700px]" />
          <Image src="/program-logo.png" alt="PROGRAM" width={300} height={300} className="mx-auto w-72 h-auto mb-2" priority />
          <h1 className="text-4xl font-bold md:text-6xl">Upgrade Your Skills. Build Your Future</h1>
          <p className="mx-auto max-w-2xl">Modern online learning platform with role-based dashboards, interactive lessons, and enterprise-grade performance.</p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/courses"><Button size="lg">Browse Courses</Button></Link>
            <Link href="/register"><Button size="lg" variant="outline">Start Learning</Button></Link>
          </div>
        </section>

        <section className="mt-12 grid gap-4 md:grid-cols-3">
          {featured.map((item) => (
            <Card key={item}><h3 className="font-semibold">{item}</h3><p className="mt-2 text-sm">High-demand tracks with guided roadmaps.</p></Card>
          ))}
        </section>
      </main>
      <footer className="border-t border-zinc-200/50 py-6 text-center text-sm dark:border-zinc-800">© {new Date().getFullYear()} PROGRAM. All rights reserved.</footer>
    </div>
  );
}

