"use client";

import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function OrderError({
  reset,
}: {
  reset: () => void;
}) {
  return (
    <div className="flex flex-1 items-center justify-center p-8 text-center">
      <div>
        <AlertTriangle className="text-destructive mx-auto mb-3 size-10" />
        <h1 className="text-lg font-semibold">
          Não foi possível abrir os pedidos
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Tente carregar os pedidos novamente. Seus filtros permanecem na URL.
        </p>
        <Button className="mt-4" onClick={reset}>
          Tentar novamente
        </Button>
      </div>
    </div>
  );
}
