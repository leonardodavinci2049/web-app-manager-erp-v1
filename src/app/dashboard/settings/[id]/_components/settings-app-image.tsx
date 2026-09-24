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
}

export function SettingsAppImage({
  appName,
  imagePath,
}: SettingsAppImageProps) {
  const [failedImagePath, setFailedImagePath] = useState<string | null>(null);
  const resolvedImagePath = getValidImageUrl(imagePath);
  const hasValidImagePath = resolvedImagePath !== DEFAULT_PRODUCT_IMAGE;
  const hasAppImage =
    hasValidImagePath && failedImagePath !== imagePath && imagePath !== null;
  const src = hasAppImage ? resolvedImagePath : DEFAULT_APP_CONFIG_IMAGE;

  return (
    <div className="relative size-14 shrink-0 overflow-hidden rounded-lg border bg-muted sm:size-16">
      <Image
        src={src}
        alt={`Imagem do aplicativo ${appName?.trim() || "sem nome"}`}
        fill
        className="object-cover"
        sizes="64px"
        unoptimized={isLocalAssetsImage(src)}
        onError={hasAppImage ? () => setFailedImagePath(imagePath) : undefined}
        onLoad={hasAppImage ? () => setFailedImagePath(null) : undefined}
      />
    </div>
  );
}
