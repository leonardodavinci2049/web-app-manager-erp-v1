"use client";

import Image from "next/image";
import { useState } from "react";
import {
  DEFAULT_PRODUCT_IMAGE,
  getValidImageUrl,
  isLocalAssetsImage,
} from "@/utils/image-utils";

const DEFAULT_APP_CONFIG_IMAGE = "/default-images/app-config.png";

interface SettingsAppImageProps {
  appName: string | null;
  imagePath: string | null;
  variant?: "detail" | "grid" | "list" | "table";
  eager?: boolean;
}

const VARIANT_CLASS = {
  detail: "size-14 rounded-lg border bg-muted sm:size-16",
  grid: "aspect-[3/2] w-full rounded-lg border bg-muted",
  list: "size-20 rounded-lg border bg-muted",
  table: "size-12 rounded-md bg-muted sm:size-14",
} as const;

export function SettingsAppImage({
  appName,
  imagePath,
  variant = "detail",
  eager = false,
}: SettingsAppImageProps) {
  const [failedImagePath, setFailedImagePath] = useState<string | null>(null);
  const normalizedImagePath = imagePath?.trim() || null;
  const resolvedImagePath = getValidImageUrl(normalizedImagePath);
  const hasValidImagePath = resolvedImagePath !== DEFAULT_PRODUCT_IMAGE;
  const hasAppImage =
    hasValidImagePath && failedImagePath !== normalizedImagePath;
  const src = hasAppImage ? resolvedImagePath : DEFAULT_APP_CONFIG_IMAGE;

  return (
    <div
      className={`relative shrink-0 overflow-hidden ${VARIANT_CLASS[variant]}`}
    >
      <Image
        src={src}
        alt={`Imagem do aplicativo ${appName?.trim() || "sem nome"}`}
        fill
        className="object-cover transition-transform duration-200 group-hover:scale-105"
        sizes={
          variant === "grid"
            ? "(max-width: 640px) 45vw, (max-width: 768px) 30vw, (max-width: 1200px) 25vw, 20vw"
            : variant === "list"
              ? "80px"
              : "64px"
        }
        loading={eager ? "eager" : "lazy"}
        unoptimized={isLocalAssetsImage(src)}
        onError={
          hasAppImage
            ? () => setFailedImagePath(normalizedImagePath)
            : undefined
        }
        onLoad={hasAppImage ? () => setFailedImagePath(null) : undefined}
      />
    </div>
  );
}
