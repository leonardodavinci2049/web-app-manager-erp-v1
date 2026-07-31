"use client";

import { RegistryEntityImage } from "@/components/registry";

const DEFAULT_IMAGE = "/default-images/carrier.webp";

interface CarrierImageProps {
  name: string;
  imagePath?: string;
  viewMode: "grid" | "list";
  size?: "sm" | "md";
  compact?: boolean;
  eager?: boolean;
  className?: string;
}

/**
 * Imagem da transportadora (Client). Delega a exibicao padronizada ao
 * componente compartilhado, preservando a imagem padrao da transportadora.
 */
export function CarrierImage({
  name,
  imagePath,
  viewMode,
  size = "md",
  compact = false,
  eager = false,
  className,
}: CarrierImageProps) {
  return (
    <RegistryEntityImage
      name={name}
      imagePath={imagePath}
      defaultImage={DEFAULT_IMAGE}
      entityLabel="da transportadora"
      viewMode={viewMode}
      size={size}
      compact={compact}
      eager={eager}
      className={className}
    />
  );
}
