"use client";

import { Plane, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import type { UIProductPdv } from "@/services/api-main/product-pdv/transformers/transformers";
import {
  createImageErrorHandler,
  getValidImageUrl,
} from "../../../../../utils/image-utils";
import { ProductImageUpload } from "./ProductImageUpload";

interface ProductCardClientProps {
  product: UIProductPdv;
  viewMode: "grid" | "list";
  productDetailsHref?: string;
  onImageUploadSuccess?: () => void;
  hasPromotion?: boolean;
}

interface ProductImageSectionProps {
  product: UIProductPdv;
  viewMode: "grid" | "list";
  productDetailsHref?: string;
  onImageUploadSuccess?: () => void;
  hasPromotion?: boolean;
}

function ProductImageSection({
  product,
  viewMode,
  productDetailsHref,
  onImageUploadSuccess,
  hasPromotion = false,
}: ProductImageSectionProps) {
  const [imageError, setImageError] = useState(false);
  const isOutOfStock = product.storeStock === 0;

  const imageUrl = getValidImageUrl(product.imagePath);
  const imageErrorHandler = createImageErrorHandler();
  const detailsHref = productDetailsHref ?? `/dashboard/product/${product.id}`;

  const hasRealImage =
    product.imagePath &&
    product.imagePath.trim() !== "" &&
    product.imagePath !== "/images/product/no-image.jpeg" &&
    !imageError;

  if (!hasRealImage) {
    return (
      <ProductImageUpload
        productId={String(product.id)}
        productName={product.name}
        viewMode={viewMode}
        onUploadSuccess={onImageUploadSuccess}
      />
    );
  }

  if (viewMode === "list") {
    const imageContent = (
      <div className="relative h-24 w-24 flex-shrink-0">
        <Image
          src={imageUrl}
          alt={`Imagem do produto ${product.name}`}
          fill
          className="rounded-md object-cover"
          sizes="(max-width: 96px) 100vw, 96px"
          loading="lazy"
          onError={(e) => {
            setImageError(true);
            imageErrorHandler.onError(e);
          }}
          onLoad={() => setImageError(false)}
        />
        {isOutOfStock && (
          <div className="absolute inset-0 flex items-center justify-center rounded-md bg-black/50">
            <Badge variant="destructive" className="text-xs">
              Esgotado
            </Badge>
          </div>
        )}
      </div>
    );

    return <Link href={detailsHref}>{imageContent}</Link>;
  }

  const gridImageContent = (
    <div className="relative aspect-square overflow-hidden rounded-md">
      <Image
        src={imageUrl}
        alt={`Imagem do produto ${product.name}`}
        fill
        className="object-cover transition-transform duration-200 group-hover:scale-105"
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
        loading="lazy"
        onError={(e) => {
          setImageError(true);
          imageErrorHandler.onError(e);
        }}
        onLoad={() => setImageError(false)}
      />

      <div className="absolute top-2 left-2 flex flex-col gap-1">
        {hasPromotion && (
          <Badge className="bg-red-500 text-xs hover:bg-red-600">
            Promoção
          </Badge>
        )}
        {product.launch && (
          <Badge className="bg-blue-500 text-xs hover:bg-blue-600">
            <Star className="h-3 w-3 mr-1" />
            Novo
          </Badge>
        )}
        {product.imported && (
          <Badge variant="secondary" className="text-xs">
            <Plane className="h-3 w-3 mr-1" />
            Importado
          </Badge>
        )}
      </div>

      {isOutOfStock && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <Badge variant="destructive">Esgotado</Badge>
        </div>
      )}
    </div>
  );

  return <Link href={detailsHref}>{gridImageContent}</Link>;
}

export function ProductCardClient({
  product,
  viewMode,
  productDetailsHref,
  onImageUploadSuccess,
  hasPromotion,
}: ProductCardClientProps) {
  return (
    <ProductImageSection
      product={product}
      viewMode={viewMode}
      productDetailsHref={productDetailsHref}
      onImageUploadSuccess={onImageUploadSuccess}
      hasPromotion={hasPromotion}
    />
  );
}
