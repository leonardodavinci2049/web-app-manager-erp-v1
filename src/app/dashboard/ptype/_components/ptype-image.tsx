"use client";

import { RegistryEntityImage } from "@/components/registry";

const DEFAULT_IMAGE = "/default-images/ptype.webp";

interface PtypeImageProps {
  name: string;
  imagePath?: string;
  viewMode: "grid" | "list";
  size?: "sm" | "md";
  compact?: boolean;
  eager?: boolean;
  className?: string;
}

/**
 * Imagem do tipo de produto (Client). Delega a exibicao padronizada ao
 * componente compartilhado, preservando a imagem padrao do tipo de produto.
 * Ainda nao ha `imagePath` neste cadastro, portanto exibe o fallback ate a
 * integracao do campo.
 */
export function PtypeImage({
  name,
  imagePath,
  viewMode,
  size = "md",
  compact = false,
  eager = false,
  className,
}: PtypeImageProps) {
  return (
    <RegistryEntityImage
      name={name}
      imagePath={imagePath}
      defaultImage={DEFAULT_IMAGE}
      entityLabel="do tipo de produto"
      viewMode={viewMode}
      size={size}
      compact={compact}
      eager={eager}
      className={className}
    />
  );
}
