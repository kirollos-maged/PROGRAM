"use client";

import Image from "next/image";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function Logo() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = resolvedTheme === "dark";

const logoSrc = isDark
  ? "/program-logo-light.png"
  : "/program-logo-dark.png";

return (
  <Image
    src={logoSrc}
    alt="PROGRAM"
    width={200}
    height={200}
    className="object-contain"
  />
);
}
