"use client";

import Link from "next/link";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/shared/logo";

export function Navbar() {
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = resolvedTheme === "dark";

  return (
    <header className={`sticky top-0 z-40 border-b transition-colors duration-300 ${isDark ? 'border-zinc-800 bg-black' : 'border-zinc-200 bg-white'}`}>
      <nav className={`mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 ${isDark ? 'text-white' : 'text-black'}`}>
        <Link href="/" className="flex items-center gap-3 font-semibold transition-transform duration-300 hover:scale-105">
          <div className="h-30 w-30 flex items-center justify-center transition-all duration-500">
            <Logo />
          </div>
        </Link>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
            className={`${isDark ? 'text-white hover:bg-white/10' : 'text-black hover:bg-black/10'} transition-all duration-300`}
          >
            {mounted && (
              isDark ? (
                <Sun size={18} className="transition-transform duration-300 rotate-0" />
              ) : (
                <Moon size={18} className="transition-transform duration-300 rotate-0" />
              )
            )}
          </Button>
          <Link href="/login">
            <Button
              variant="outline"
              className={`${isDark ? 'text-white border-white/20 hover:bg-white/10' : 'text-black border-zinc-300 hover:bg-zinc-100'} transition-all duration-300`}
            >
              Login
            </Button>
          </Link>
          <Link href="/register">
            <Button
              className={`${isDark ? 'text-white hover:bg-white/10' : 'text-black hover:bg-zinc-100'} transition-all duration-300 hover:shadow-lg`}
            >
              Get Started
            </Button>
          </Link>
        </div>
      </nav>
    </header>
  );
}

