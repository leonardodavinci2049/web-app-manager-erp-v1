"use client";

import Image from "next/image";
import { useState } from "react";
import { getValidImageUrl } from "@/utils/image-utils";

const PRODUCT_FALLBACK = "/images/product/no-image.jpeg";
const DEFAULT_IMAGE = "/default-images/customer.webp";

interface CustomerImageProps {
  name: string;
  imagePath?: string;
  size?: "sm" | "md" | "lg";
}

const SIZE_CLASSES = {
  sm: "size-10 text-xs",
  md: "size-14 text-sm",
  lg: "size-24 text-lg",
} as const;

/**
 * Imagem do cliente (Client). Exibe `imagePath` quando valido e a imagem
 * padrao do cliente quando ausente, invalida ou em erro de carregamento.
 */
export function CustomerImage({
  name,
  imagePath,
  size = "md",
}: CustomerImageProps) {
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
        alt={`Imagem do cliente ${name}`}
        fill
        sizes={size === "lg" ? "96px" : size === "md" ? "56px" : "40px"}
        className="object-cover"
        onError={() => setHasError(true)}
      />
    </div>
  );
}
