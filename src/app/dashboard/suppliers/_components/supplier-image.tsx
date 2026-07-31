"use client";

import { RegistryEntityImage } from "@/components/registry";

const DEFAULT_IMAGE = "/default-images/supplier.webp";

interface SupplierImageProps {
  name: string;
  imagePath?: string;
  viewMode: "grid" | "list";
  size?: "sm" | "md";
  compact?: boolean;
  eager?: boolean;
  className?: string;
}

/**
 * Imagem do fornecedor (Client). Delega a exibicao padronizada ao componente
 * compartilhado, preservando a imagem padrao do fornecedor. Ainda nao ha
 * `imagePath` neste cadastro, portanto exibe o fallback ate a integracao.
 */
export function SupplierImage({
  name,
  imagePath,
  viewMode,
  size = "md",
  compact = false,
  eager = false,
  className,
}: SupplierImageProps) {
  return (
    <RegistryEntityImage
      name={name}
      imagePath={imagePath}
      defaultImage={DEFAULT_IMAGE}
      entityLabel="do fornecedor"
      viewMode={viewMode}
      size={size}
      compact={compact}
      eager={eager}
      className={className}
    />
  );
}
