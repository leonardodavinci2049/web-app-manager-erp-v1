"use client";

import { TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function OrderDetailsError({ retry }: { retry: () => void }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 py-16 text-center">
      <TriangleAlert
        className="text-destructive mb-4 size-14"
        aria-hidden="true"
      />
      <h1 className="text-xl font-semibold">
        Não foi possível carregar o pedido
      </h1>
      <p className="text-muted-foreground mt-2 max-w-md text-sm">
        Ocorreu uma falha inesperada ao consultar os detalhes do pedido de
        venda. Tente novamente.
      </p>
      <Button type="button" className="mt-5" onClick={retry}>
        Tentar novamente
      </Button>
    </div>
  );
}
