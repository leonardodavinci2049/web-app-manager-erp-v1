"use client";

import { Upload } from "lucide-react";
import { toast } from "sonner";

interface RegistryImageUploadStubProps {
  viewMode: "grid" | "list";
  entityLabel: string;
  compact?: boolean;
}

/**
 * Gatilho visual de upload de imagem (Client): botao compacto posicionado no
 * canto superior direito do container de imagem. Reproduz fielmente o estilo do
 * gatilho de upload do catalogo de produtos, mas e' um stub puramente visual —
 * nao implementa envio, persistencia nem logica de back-end. Ao acionado,
 * apenas informa o usuario de que a funcionalidade ainda nao esta disponivel.
 */
export function RegistryImageUploadStub({
  viewMode,
  entityLabel,
  compact = false,
}: RegistryImageUploadStubProps) {
  const isList = viewMode === "list";

  const buttonClass = isList
    ? compact
      ? "top-0.5 right-0.5 h-5 w-5"
      : "top-1 right-1 h-6 w-6"
    : "top-1.5 right-1.5 h-7 w-7 sm:top-2 sm:right-2 sm:h-8 sm:w-8";

  const iconClass = isList
    ? compact
      ? "h-3 w-3"
      : "h-3.5 w-3.5"
    : "h-3.5 w-3.5 sm:h-4 sm:w-4";

  return (
    <button
      type="button"
      aria-label={`Enviar imagem ${entityLabel}`}
      title="Adicionar imagem"
      className={`absolute z-20 flex items-center justify-center rounded-full bg-black/55 text-white backdrop-blur-sm transition-all duration-200 hover:scale-105 hover:bg-black/75 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1 ${buttonClass}`}
      onClick={() =>
        toast.info(
          "O envio de imagem para este cadastro ainda não está disponível.",
        )
      }
    >
      <Upload className={iconClass} />
    </button>
  );
}
