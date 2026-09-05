"use client";

import { RegistryEntityImage } from "@/app/dashboard/_components/registry";
import { BrandImageUpload } from "./brand-image-upload";

const DEFAULT_IMAGE = "/default-images/brand.webp";

interface BrandImageProps {
  name: string;
  imagePath?: string;
  brandId?: number;
  viewMode: "grid" | "list";
  size?: "sm" | "md";
  compact?: boolean;
  eager?: boolean;
  className?: string;
}

/**
 * Imagem da marca (Client). Delega a exibicao padronizada ao componente
 * compartilhado, preservando a imagem padrao da marca. Quando `brandId`
 * e' fornecido (listagem), o gatilho de upload funcional substitui o stub.
 */
export function BrandImage({
  name,
  imagePath,
  brandId,
  viewMode,
  size = "md",
  compact = false,
  eager = false,
  className,
}: BrandImageProps) {
  const uploadTrigger = brandId ? (
    <BrandImageUpload
      brandId={brandId}
      viewMode={viewMode}
      compact={size === "sm" ? true : compact}
    />
  ) : undefined;

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
      uploadTrigger={uploadTrigger}
    />
  );
}
