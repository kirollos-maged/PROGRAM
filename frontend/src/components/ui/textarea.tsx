import { cn } from "@/lib/utils";

export function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      className={cn(
        "min-h-[120px] w-full rounded-xl border border-zinc-300 bg-white px-3 py-3 text-sm outline-none ring-orange-400 transition focus:ring-2 dark:border-zinc-700 dark:bg-zinc-950",
        className
      )}
      {...props}
    />
  );
}
