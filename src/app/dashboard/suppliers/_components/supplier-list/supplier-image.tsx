"use client";

import { RegistryEntityImage } from "@/app/dashboard/_components/registry";
import { SupplierImageUpload } from "./supplier-image-upload";

const DEFAULT_IMAGE = "/default-images/supplier.webp";

interface SupplierImageProps {
  name: string;
  imagePath?: string;
  supplierId?: number;
  viewMode: "grid" | "list";
  size?: "sm" | "md";
  compact?: boolean;
  eager?: boolean;
  className?: string;
}

/**
 * Imagem do fornecedor (Client). Delega a exibicao padronizada ao componente
 * compartilhado, preservando a imagem padrao do fornecedor quando `imagePath`
 * nao estiver disponivel. Quando `supplierId` e' fornecido (listagem), o
 * gatilho de upload funcional substitui o stub.
 */
export function SupplierImage({
  name,
  imagePath,
  supplierId,
  viewMode,
  size = "md",
  compact = false,
  eager = false,
  className,
}: SupplierImageProps) {
  const uploadTrigger = supplierId ? (
    <SupplierImageUpload
      supplierId={supplierId}
      viewMode={viewMode}
      compact={size === "sm" ? true : compact}
    />
  ) : undefined;

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
      uploadTrigger={uploadTrigger}
    />
  );
}
