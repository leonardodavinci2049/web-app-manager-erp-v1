"use client";

import { RegistryEntityImage } from "@/components/registry";

const DEFAULT_IMAGE = "/default-images/customer.webp";

interface CustomerImageProps {
  name: string;
  imagePath?: string;
  viewMode: "grid" | "list";
  size?: "sm" | "md";
  compact?: boolean;
  eager?: boolean;
  className?: string;
}

/**
 * Imagem do cliente (Client). Delega a exibicao padronizada ao componente
 * compartilhado, preservando a imagem padrao do cliente.
 */
export function CustomerImage({
  name,
  imagePath,
  viewMode,
  size = "md",
  compact = false,
  eager = false,
  className,
}: CustomerImageProps) {
  return (
    <RegistryEntityImage
      name={name}
      imagePath={imagePath}
      defaultImage={DEFAULT_IMAGE}
      entityLabel="do cliente"
      viewMode={viewMode}
      size={size}
      compact={compact}
      eager={eager}
      className={className}
    />
  );
}
