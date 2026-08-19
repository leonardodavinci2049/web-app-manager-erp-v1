"use client";

import { RegistryEntityImage } from "@/components/registry";
import { CustomerImageUpload } from "./customer-image-upload";

const DEFAULT_IMAGE = "/default-images/customer.webp";

interface CustomerImageProps {
  name: string;
  imagePath?: string;
  customerId?: number;
  viewMode: "grid" | "list";
  size?: "sm" | "md";
  compact?: boolean;
  eager?: boolean;
  className?: string;
}

/**
 * Imagem do cliente (Client). Delega a exibicao padronizada ao componente
 * compartilhado, preservando a imagem padrao do cliente. Quando `customerId`
 * e' fornecido (listagem), o gatilho de upload funcional substitui o stub.
 */
export function CustomerImage({
  name,
  imagePath,
  customerId,
  viewMode,
  size = "md",
  compact = false,
  eager = false,
  className,
}: CustomerImageProps) {
  const uploadTrigger = customerId ? (
    <CustomerImageUpload
      customerId={customerId}
      viewMode={viewMode}
      compact={size === "sm" ? true : compact}
    />
  ) : undefined;

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
      uploadTrigger={uploadTrigger}
    />
  );
}
