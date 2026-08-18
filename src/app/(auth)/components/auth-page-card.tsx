import type { ComponentProps } from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function AuthPageCard({
  className,
  ...props
}: ComponentProps<typeof Card>) {
  return (
    <Card
      className={cn(
        "gap-0 rounded-2xl border-border/70 bg-card/95 p-6 shadow-xl shadow-stone-950/5 backdrop-blur-sm sm:p-8 dark:shadow-black/20",
        className,
      )}
      {...props}
    />
  );
}
