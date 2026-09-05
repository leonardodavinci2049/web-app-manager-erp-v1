import type { ReactNode } from "react";

interface RegistryPageShellProps {
  title: string;
  description: string;
  children: ReactNode;
}

export function RegistryPageShell({
  title,
  description,
  children,
}: RegistryPageShellProps) {
  return (
    <main className="flex min-w-0 flex-1 flex-col">
      <div className="@container/main flex min-w-0 flex-1 flex-col">
        <div className="flex min-w-0 flex-col gap-4 px-3 py-4 md:py-6 lg:px-6">
          <div className="space-y-1">
            <h1 className="text-xl font-bold tracking-tight sm:text-2xl">
              {title}
            </h1>
            <p className="text-muted-foreground max-w-3xl text-sm">
              {description}
            </p>
          </div>
          {children}
        </div>
      </div>
    </main>
  );
}
