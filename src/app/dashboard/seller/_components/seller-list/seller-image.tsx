"use client";

import { RegistryEntityImage } from "@/app/dashboard/_components/registry";
import { SellerImageUpload } from "./seller-image-upload";

const DEFAULT_IMAGE = "/default-images/seller.webp";

interface SellerImageProps {
  name: string;
  imagePath?: string;
  sellerId?: number;
  viewMode: "grid" | "list";
  size?: "sm" | "md";
  compact?: boolean;
  eager?: boolean;
  className?: string;
}

/**
 * Imagem do vendedor (Client). Delega a exibicao padronizada ao componente
 * compartilhado, preservando a imagem padrao do vendedor. Quando `sellerId`
 * e' fornecido (listagem), o gatilho de upload funcional substitui o stub.
 */
export function SellerImage({
  name,
  imagePath,
  sellerId,
  viewMode,
  size = "md",
  compact = false,
  eager = false,
  className,
}: SellerImageProps) {
  const uploadTrigger = sellerId ? (
    <SellerImageUpload
      sellerId={sellerId}
      viewMode={viewMode}
      compact={size === "sm" ? true : compact}
    />
  ) : undefined;

  return (
    <RegistryEntityImage
      name={name}
      imagePath={imagePath}
      defaultImage={DEFAULT_IMAGE}
      entityLabel="do vendedor"
      viewMode={viewMode}
      size={size}
      compact={compact}
      eager={eager}
      className={className}
      uploadTrigger={uploadTrigger}
    />
  );
}
