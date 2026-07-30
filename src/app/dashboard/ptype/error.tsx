"use client";

import { TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PtypeError({ reset }: { reset: () => void }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 py-16 text-center">
      <TriangleAlert className="text-destructive mb-4 size-14" />
      <h1 className="text-xl font-semibold">
        Não foi possível abrir esta tela
      </h1>
      <p className="text-muted-foreground mt-2 max-w-md text-sm">
        Ocorreu uma falha inesperada. Tente carregar a central de tipos de
        produtos novamente.
      </p>
      <Button type="button" className="mt-5" onClick={reset}>
        Tentar novamente
      </Button>
    </div>
  );
}
