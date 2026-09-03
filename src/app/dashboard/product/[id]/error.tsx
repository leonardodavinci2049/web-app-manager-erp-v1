"use client";

import { PackageX, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ProductDetailsError({ reset }: { reset: () => void }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 py-16 text-center">
      <TriangleAlert className="text-destructive mb-4 size-14" />
      <h1 className="text-xl font-semibold">
        Não foi possível carregar o produto
      </h1>
      <p className="text-muted-foreground mt-2 max-w-md text-sm">
        Ocorreu uma falha inesperada ao consultar este cadastro.
      </p>
      <Button type="button" className="mt-5" onClick={reset}>
        Tentar novamente
      </Button>
      <p className="text-muted-foreground mt-6 flex items-center gap-2 text-xs">
        <PackageX className="size-4" aria-hidden="true" />
        Verifique o identificador do produto e tente novamente.
      </p>
    </div>
  );
}
