"use client";

import { RegistryEntityImage } from "@/components/registry";

const DEFAULT_IMAGE = "/default-images/brand.webp";

interface BrandImageProps {
  name: string;
  imagePath?: string;
  viewMode: "grid" | "list";
  size?: "sm" | "md";
  compact?: boolean;
  eager?: boolean;
  className?: string;
}

/**
 * Imagem da marca (Client). Delega a exibicao padronizada ao componente
 * compartilhado, preservando a imagem padrao da marca.
 */
export function BrandImage({
  name,
  imagePath,
  viewMode,
  size = "md",
  compact = false,
  eager = false,
  className,
}: BrandImageProps) {
  return (
    <RegistryEntityImage
      name={name}
      imagePath={imagePath}
      defaultImage={DEFAULT_IMAGE}
      entityLabel="da marca"
      viewMode={viewMode}
      size={size}
      compact={compact}
      eager={eager}
      className={className}
    />
  );
}
