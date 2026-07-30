"use client";

import { ImageOff } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { getValidImageUrl } from "@/utils/image-utils";

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

export function CustomerImage({
  name,
  imagePath,
  size = "md",
}: CustomerImageProps) {
  const [hasError, setHasError] = useState(false);
  const initials = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word.charAt(0).toLocaleUpperCase("pt-BR"))
    .join("");
  const containerClass = `bg-muted text-muted-foreground relative flex shrink-0 items-center justify-center overflow-hidden rounded-xl font-semibold ${SIZE_CLASSES[size]}`;

  if (!imagePath?.trim() || hasError) {
    return (
      <div className={containerClass} aria-hidden="true">
        {initials || <ImageOff className="size-5 opacity-60" />}
      </div>
    );
  }

  return (
    <div className={containerClass}>
      <Image
        src={getValidImageUrl(imagePath)}
        alt={`Imagem do cliente ${name}`}
        fill
        sizes={size === "lg" ? "96px" : size === "md" ? "56px" : "40px"}
        className="object-cover"
        onError={() => setHasError(true)}
      />
    </div>
  );
}
