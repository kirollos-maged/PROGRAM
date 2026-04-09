"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AuthForm } from "@/components/shared/auth-form";
import { useLogin } from "@/lib/hooks/useAuth";
import { BookOpen, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

export default function LoginPage() {
  const router = useRouter();
  const login = useLogin();
  const [error, setError] = useState("");

  const footer = (
    <div className="mt-6 flex flex-col items-center gap-2 text-sm">
      <Link href="/forgot-password" className="text-orange-500 hover:text-orange-600 dark:text-orange-400 dark:hover:text-orange-300 transition-colors font-medium">
        Forgot your password?
      </Link>
      <p className="text-zinc-500 dark:text-zinc-400">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="text-zinc-900 dark:text-white hover:underline font-semibold">
          Sign up
        </Link>
      </p>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-zinc-50/50 dark:bg-black/50">
      {/* Left panel: Branding / Visuals */}
      <div className="hidden lg:flex flex-col flex-1 relative bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 overflow-hidden text-white p-12 justify-between">
        {/* Animated Background */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-[10%] -left-[10%] w-[40vw] h-[40vw] bg-orange-500/20 rounded-full blur-[100px] animate-blob mix-blend-screen" />
          <div className="absolute top-[40%] -right-[10%] w-[30vw] h-[30vw] bg-amber-500/20 rounded-full blur-[100px] animate-blob animation-delay-2000 mix-blend-screen" />
        </div>

        {/* Content */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="bg-orange-500 rounded-xl p-2.5">
            <BookOpen className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-bold tracking-tight">PROGRAM</span>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="relative z-10 max-w-lg"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 mb-6 rounded-full bg-white/10 border border-white/20 text-sm font-medium backdrop-blur-md">
            <Sparkles className="w-4 h-4 text-orange-400" />
            Empowering your career
          </div>
          <h1 className="text-5xl font-extrabold tracking-tight mb-6 leading-[1.1]">
            Learn the skills you <br />
            need to <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-300">succeed.</span>
          </h1>
          <p className="text-zinc-400 text-lg leading-relaxed">
            Gain unlimited access to premium courses, interactive labs, and expert instructors in our state-of-the-art online learning environment.
          </p>
        </motion.div>
        
        <div className="relative z-10">
          <p className="text-sm text-zinc-500">© {new Date().getFullYear()} PROGRAM platform.</p>
        </div>
      </div>

      {/* Right panel: Login Form */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-12">
        <Link href="/" className="lg:hidden mb-8 flex items-center gap-2 group">
          <div className="bg-orange-500 rounded-lg p-2 transition-transform group-hover:scale-105">
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-zinc-900 dark:text-white">PROGRAM</span>
        </Link>
        <div className="w-full max-w-md">
          <AuthForm
            className="border-transparent shadow-none dark:bg-transparent"
            title="Welcome back"
            description="Sign in to continue your learning journey"
            buttonText="Sign in"
            fields={[
              { name: "email", label: "Email address", type: "email", placeholder: "you@example.com" },
              { name: "password", label: "Password", type: "password", placeholder: "••••••••" },
            ]}
            loading={login.isPending}
            error={error}
            footer={footer}
            onSubmit={async (values) => {
              setError("");
              try {
                const data = await login.mutateAsync({ email: values.email, password: values.password });
                const destination = data.user.role === "admin"
                  ? "/admin"
                  : data.user.role === "instructor"
                    ? "/dashboard/instructor"
                    : "/dashboard/student";
                router.push(destination);
              } catch (e) {
                setError((e as Error).message);
              }
            }}
          />
        </div>
      </div>
    </div>
  );
}
