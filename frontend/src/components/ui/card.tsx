import { cn } from "@/lib/utils";

export function Card({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-white/10 p-5 shadow-xl backdrop-blur-xl",
        className
      )}
      style={{ background: 'var(--card-bg)' }}
      {...props}
    />
  );
}

