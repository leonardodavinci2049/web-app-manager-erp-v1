"use client";

import { RegistryEntityImage } from "@/components/registry";

const DEFAULT_IMAGE = "/default-images/supplier.webp";

interface EntryImageProps {
  name: string;
  imagePath?: string;
  viewMode: "grid" | "list";
  size?: "sm" | "md";
  compact?: boolean;
  eager?: boolean;
  className?: string;
}

/**
 * Imagem da entrada (Client). Delega a exibicao padronizada ao componente
 * compartilhado; a imagem do card vem do `PATH_IMAGEM` herdado do fornecedor,
 * por isso o fallback e' a imagem padrao de fornecedor.
 */
export function EntryImage({
  name,
  imagePath,
  viewMode,
  size = "md",
  compact = false,
  eager = false,
  className,
}: EntryImageProps) {
  return (
    <RegistryEntityImage
      name={name}
      imagePath={imagePath}
      defaultImage={DEFAULT_IMAGE}
      entityLabel="da entrada"
      viewMode={viewMode}
      size={size}
      compact={compact}
      eager={eager}
      className={className}
    />
  );
}
