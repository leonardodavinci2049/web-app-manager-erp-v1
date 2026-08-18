import type * as React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function CustomerAreaButton({
  className,
  ...props
}: React.ComponentProps<typeof Button>) {
  return (
    <Button
      className={cn(
        "bg-success text-success-foreground hover:bg-success-hover focus-visible:border-success focus-visible:ring-success/30",
        className,
      )}
      {...props}
    />
  );
}
