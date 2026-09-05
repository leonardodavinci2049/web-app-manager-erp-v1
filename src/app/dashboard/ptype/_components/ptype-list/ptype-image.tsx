"use client";

import { RegistryEntityImage } from "@/app/dashboard/_components/registry";
import { PtypeImageUpload } from "./ptype-image-upload";

const DEFAULT_IMAGE = "/default-images/ptype.webp";

interface PtypeImageProps {
  name: string;
  imagePath?: string;
  ptypeId?: number;
  viewMode: "grid" | "list";
  size?: "sm" | "md";
  compact?: boolean;
  eager?: boolean;
  className?: string;
}

/**
 * Imagem do tipo de produto (Client). Delega a exibicao padronizada ao
 * componente compartilhado, preservando a imagem padrao do tipo de produto
 * quando `imagePath` nao estiver disponivel. Quando `ptypeId` e' fornecido
 * (listagem), o gatilho de upload funcional substitui o stub.
 */
export function PtypeImage({
  name,
  imagePath,
  ptypeId,
  viewMode,
  size = "md",
  compact = false,
  eager = false,
  className,
}: PtypeImageProps) {
  const uploadTrigger = ptypeId ? (
    <PtypeImageUpload
      ptypeId={ptypeId}
      viewMode={viewMode}
      compact={size === "sm" ? true : compact}
    />
  ) : undefined;

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
      uploadTrigger={uploadTrigger}
    />
  );
}
