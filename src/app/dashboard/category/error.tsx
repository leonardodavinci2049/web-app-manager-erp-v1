"use client";

import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CategoryDashboardError({
  reset,
}: {
  reset: () => void;
}) {
  return (
    <div className="flex flex-1 items-center justify-center p-8 text-center">
      <div>
        <AlertTriangle className="mx-auto mb-3 size-10 text-destructive" />
        <h1 className="text-lg font-semibold">
          Não foi possível abrir as categorias
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Tente carregar a central novamente.
        </p>
        <Button className="mt-4" onClick={reset}>
          Tentar novamente
        </Button>
      </div>
    </div>
  );
}
