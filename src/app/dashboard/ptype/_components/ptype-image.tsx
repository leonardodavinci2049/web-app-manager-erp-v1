"use client";

import Image from "next/image";
import { useState } from "react";
import { getValidImageUrl } from "@/utils/image-utils";

const PRODUCT_FALLBACK = "/images/product/no-image.jpeg";
const DEFAULT_IMAGE = "/default-images/ptype.webp";

interface PtypeImageProps {
  name: string;
  imagePath?: string;
  size?: "sm" | "md" | "lg";
}

const SIZE_CLASSES = {
  sm: "size-10 text-xs",
  md: "size-12 text-sm",
  lg: "size-24 text-lg",
} as const;

/**
 * Imagem do tipo de produto (Client). Ainda nao existe `imagePath` neste
 * cadastro, portanto exibe a imagem padrao do tipo de produto. Quando o
 * campo for integrado, passara a exibi-lo com fallback automatico.
 */
export function PtypeImage({ name, imagePath, size = "md" }: PtypeImageProps) {
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
        alt={`Imagem do tipo de produto ${name}`}
        fill
        sizes={size === "lg" ? "96px" : size === "md" ? "48px" : "40px"}
        className="object-cover"
        onError={() => setHasError(true)}
      />
    </div>
  );
}
