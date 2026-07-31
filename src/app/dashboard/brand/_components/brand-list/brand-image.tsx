"use client";

import Image from "next/image";
import { useState } from "react";
import { getValidImageUrl } from "@/utils/image-utils";

const PRODUCT_FALLBACK = "/images/product/no-image.jpeg";
const DEFAULT_IMAGE = "/default-images/brand.webp";

interface BrandImageProps {
  name: string;
  imagePath?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
  eager?: boolean;
}

const SIZE_CLASSES: Record<NonNullable<BrandImageProps["size"]>, string> = {
  sm: "h-10 w-10 text-xs",
  md: "h-14 w-14 sm:h-16 sm:w-16 text-sm",
  lg: "h-24 w-24 text-base",
};

/**
 * Imagem da marca (Client). Exibe `imagePath` quando valido e a imagem
 * padrao da marca quando ausente, invalida ou em erro de carregamento.
 */
export function BrandImage({
  name,
  imagePath,
  size = "md",
  className,
  eager = false,
}: BrandImageProps) {
  const [hasError, setHasError] = useState(false);
  const hasRealImage =
    !!imagePath &&
    imagePath.trim() !== "" &&
    imagePath !== PRODUCT_FALLBACK &&
    !hasError;
  const src = hasRealImage ? getValidImageUrl(imagePath) : DEFAULT_IMAGE;

  const containerClass = `relative flex shrink-0 items-center justify-center overflow-hidden rounded-md bg-muted ${SIZE_CLASSES[size]} ${className ?? ""}`;

  return (
    <div className={containerClass}>
      <Image
        src={src}
        alt={`Imagem da marca ${name}`}
        fill
        className="object-cover"
        sizes="64px"
        loading={eager ? "eager" : "lazy"}
        onError={() => setHasError(true)}
      />
    </div>
  );
}
