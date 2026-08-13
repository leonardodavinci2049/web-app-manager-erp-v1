import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface BackToCatalogButtonProps {
  returnTo: string;
}

/**
 * BackToCatalogButton (Server Component)
 *
 * Volta para a origem validada (catalogo ou detalhe de marca) preservando os
 * filtros/estado da listagem. A URL de retorno e validada no Server Component
 * da pagina antes de chegar aqui.
 */
export function BackToCatalogButton({ returnTo }: BackToCatalogButtonProps) {
  return (
    <Button
      asChild
      variant="outline"
      size="sm"
      className="h-8 px-2 text-xs sm:h-9 sm:px-3 sm:text-sm"
    >
      <Link href={returnTo}>
        <ArrowLeft className="size-4" />
        Voltar ao Catálogo
      </Link>
    </Button>
  );
}
