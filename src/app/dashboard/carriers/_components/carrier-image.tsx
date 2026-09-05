"use client";

import { RegistryEntityImage } from "@/app/dashboard/_components/registry";
import { CarrierImageUpload } from "./carrier-image-upload";

const DEFAULT_IMAGE = "/default-images/carrier.webp";

interface CarrierImageProps {
  name: string;
  imagePath?: string;
  carrierId?: number;
  viewMode: "grid" | "list";
  size?: "sm" | "md";
  compact?: boolean;
  eager?: boolean;
  className?: string;
}

/**
 * Imagem da transportadora (Client). Delega a exibicao padronizada ao
 * componente compartilhado, preservando a imagem padrao da transportadora.
 * Quando `carrierId` e' fornecido (listagem), o gatilho de upload funcional
 * substitui o stub.
 */
export function CarrierImage({
  name,
  imagePath,
  carrierId,
  viewMode,
  size = "md",
  compact = false,
  eager = false,
  className,
}: CarrierImageProps) {
  const uploadTrigger = carrierId ? (
    <CarrierImageUpload
      carrierId={carrierId}
      viewMode={viewMode}
      compact={size === "sm" ? true : compact}
    />
  ) : undefined;

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
      uploadTrigger={uploadTrigger}
    />
  );
}
