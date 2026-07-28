"use client";

import { ImageOff } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { getValidImageUrl } from "@/utils/image-utils";

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
 * Imagem da marca (Client). Exibe `imagePath` quando valido e um fallback com
 * as iniciais da marca quando ausente ou em erro de carregamento.
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
    imagePath &&
    imagePath.trim() !== "" &&
    imagePath !== "/images/product/no-image.jpeg";

  const initials = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word.charAt(0).toUpperCase())
    .join("");

  const containerClass = `relative flex shrink-0 items-center justify-center overflow-hidden rounded-md bg-muted font-semibold text-muted-foreground ${SIZE_CLASSES[size]} ${className ?? ""}`;

  if (!hasRealImage || hasError) {
    return (
      <div className={containerClass} aria-hidden="true">
        {initials ? (
          <span>{initials}</span>
        ) : (
          <ImageOff className="h-1/2 w-1/2 opacity-50" />
        )}
      </div>
    );
  }

  return (
    <div className={containerClass}>
      <Image
        src={getValidImageUrl(imagePath)}
        alt={`Imagem da marca ${name}`}
        fill
        className="object-cover"
        sizes="64px"
        loading={eager ? "eager" : "lazy"}
        onError={() => setHasError(true)}
        onLoad={() => setHasError(false)}
      />
    </div>
  );
}
