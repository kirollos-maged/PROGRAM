import { cn } from "@/lib/utils";

export function Input({ className, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      className={cn(
        "h-11 w-full rounded-xl border border-zinc-300 bg-white px-3 text-sm outline-none ring-orange-400 transition focus:ring-2 dark:border-zinc-700 dark:bg-zinc-950",
        className
      )}
      {...props}
    />
  );
}

