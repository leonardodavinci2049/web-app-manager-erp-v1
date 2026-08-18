import type { LucideIcon } from "lucide-react";

interface AuthFormHeaderProps {
  description: string;
  icon: LucideIcon;
  title: string;
}

export function AuthFormHeader({
  description,
  icon: Icon,
  title,
}: AuthFormHeaderProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex size-11 items-center justify-center rounded-xl border bg-muted/70 shadow-sm">
        <Icon aria-hidden="true" className="size-5" />
      </div>

      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-balance sm:text-3xl">
          {title}
        </h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground text-pretty">
          {description}
        </p>
      </div>
    </div>
  );
}
