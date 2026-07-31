"use client";

import Image from "next/image";
import { useState } from "react";
import { getValidImageUrl } from "@/utils/image-utils";

const PRODUCT_FALLBACK = "/images/product/no-image.jpeg";
const DEFAULT_IMAGE = "/default-images/supplier.webp";

interface SupplierImageProps {
  name: string;
  imagePath?: string;
  size?: "sm" | "md" | "lg";
}

const SIZE_CLASSES = {
  sm: "size-11 text-xs",
  md: "size-12 text-sm",
  lg: "size-24 text-lg",
} as const;

/**
 * Imagem do fornecedor (Client). Ainda nao existe `imagePath` neste cadastro,
 * portanto exibe a imagem padrao do fornecedor. Quando o campo for integrado,
 * passara a exibi-lo com fallback automatico.
 */
export function SupplierImage({
  name,
  imagePath,
  size = "md",
}: SupplierImageProps) {
  const [hasError, setHasError] = useState(false);
  const containerClass = `relative flex shrink-0 items-center justify-center overflow-hidden rounded-xl bg-muted ${SIZE_CLASSES[size]}`;
  const hasRealImage =
    !!imagePath &&
    imagePath.trim() !== "" &&
    imagePath !== PRODUCT_FALLBACK &&
    !hasError;
  const src = hasRealImage ? getValidImageUrl(imagePath) : DEFAULT_IMAGE;

  return (
    <div className={containerClass}>
      <Image
        src={src}
        alt={`Imagem do fornecedor ${name}`}
        fill
        sizes={size === "lg" ? "96px" : size === "md" ? "48px" : "44px"}
        className="object-cover"
        onError={() => setHasError(true)}
      />
    </div>
  );
}
