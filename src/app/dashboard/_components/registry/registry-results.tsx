"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface RegistryResultsProps {
  pending: boolean;
  children: ReactNode;
}

export function RegistryResults({ pending, children }: RegistryResultsProps) {
  return (
    <section className="relative" aria-label="Resultados" aria-busy={pending}>
      {pending && (
        <div
          className="bg-background/70 pointer-events-none absolute inset-0 z-10 flex items-start justify-center pt-16 backdrop-blur-sm"
          role="status"
          aria-live="polite"
        >
          <span className="bg-background rounded-full border px-3 py-1.5 text-sm shadow-sm">
            Atualizando resultados...
          </span>
        </div>
      )}
      <div className={cn("transition-opacity", pending && "opacity-50")}>
        {children}
      </div>
    </section>
  );
}
