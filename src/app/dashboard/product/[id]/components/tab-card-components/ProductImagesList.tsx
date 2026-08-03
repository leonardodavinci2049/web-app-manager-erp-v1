"use client";

import {
  Check,
  ExternalLink,
  Image as ImageIcon,
  RefreshCw,
  Save,
} from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { updateProductImagePath } from "@/app/actions/action-product-updates";
import { getEntityGalleryAction } from "@/app/actions/action-test-assets";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { GalleryImage } from "@/types/api-assets";
import { DEFAULT_PRODUCT_IMAGE_URL } from "../ProductImageGallery/product-image-gallery-constants";

interface ProductImagesListProps {
  productId: number;
  initialProductImagePath: string;
}

const ProductImagesList = ({
  productId,
  initialProductImagePath,
}: ProductImagesListProps) => {
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());
  const [productImagePath, setProductImagePath] = useState(
    initialProductImagePath,
  );
  const [hasProductImageError, setHasProductImageError] = useState(false);
  const [updatingImageId, setUpdatingImageId] = useState<string | null>(null);

  // Fetch gallery images
  const fetchGallery = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setImageErrors(new Set());

    try {
      const response = await getEntityGalleryAction({
        entityType: "PRODUCT",
        entityId: productId.toString(),
      });

      if (!response.success) {
        setError(response.error || "Erro ao carregar galeria");
        setGalleryImages([]);
      } else {
        setGalleryImages(response.data?.images || []);
      }
    } catch (_err) {
      setError("Erro ao conectar com a API de assets");
      setGalleryImages([]);
    } finally {
      setIsLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    fetchGallery();
  }, [fetchGallery]);

  useEffect(() => {
    setProductImagePath(initialProductImagePath);
    setHasProductImageError(false);
  }, [initialProductImagePath]);

  const handleUpdateProductImagePath = useCallback(
    async (image: GalleryImage) => {
      const originalUrl = image.urls.original.trim();

      if (productImagePath.trim() === originalUrl) {
        toast.info("Esta imagem já está cadastrada no campo PATH_IMAGEM");
        return;
      }

      setUpdatingImageId(image.id);

      try {
        const result = await updateProductImagePath(productId, image.id);

        if (!result.success) {
          toast.error(result.error || "Erro ao atualizar PATH_IMAGEM");
          return;
        }

        if (result.alreadyExists) {
          setProductImagePath(result.imagePath ?? originalUrl);
          toast.info("Esta imagem já está cadastrada no campo PATH_IMAGEM");
          return;
        }

        setProductImagePath(result.imagePath ?? originalUrl);
        setHasProductImageError(false);
        toast.success("Campo PATH_IMAGEM atualizado com sucesso");
      } catch (_error) {
        toast.error("Erro ao conectar com o servidor");
      } finally {
        setUpdatingImageId(null);
      }
    },
    [productId, productImagePath],
  );

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <ImageIcon className="h-5 w-5" />
            Imagem cadastrada no produto
          </CardTitle>
        </CardHeader>
        <CardContent>
          {productImagePath ? (
            <div className="flex items-start gap-3 rounded-md border p-3">
              <div className="relative size-24 shrink-0 overflow-hidden rounded-md bg-muted sm:size-32">
                <Image
                  src={
                    hasProductImageError
                      ? DEFAULT_PRODUCT_IMAGE_URL
                      : productImagePath
                  }
                  alt="Imagem cadastrada no produto"
                  fill
                  className="object-cover"
                  sizes="(min-width: 640px) 128px, 96px"
                  onError={() => setHasProductImageError(true)}
                  unoptimized={!hasProductImageError}
                />
              </div>

              <div className="min-w-0 flex-1 space-y-2">
                <Badge variant="secondary" className="font-mono text-xs">
                  PATH_IMAGEM
                </Badge>
                <code className="block break-all text-xs text-muted-foreground">
                  {productImagePath}
                </code>
                <a
                  href={productImagePath}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                >
                  <ExternalLink className="h-3 w-3" />
                  Abrir imagem em nova aba
                </a>
              </div>
            </div>
          ) : (
            <p className="py-4 text-sm italic text-muted-foreground">
              Nenhuma URL cadastrada no campo PATH_IMAGEM.
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <ImageIcon className="h-5 w-5" />
              Galeria de Imagens (Assets API)
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchGallery}
              disabled={isLoading}
            >
              <RefreshCw
                className={`h-4 w-4 mr-1 ${isLoading ? "animate-spin" : ""}`}
              />
              Atualizar
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
              <span className="ml-2 text-sm text-muted-foreground">
                Carregando galeria...
              </span>
            </div>
          ) : error ? (
            <div className="rounded-md bg-destructive/10 p-4">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          ) : galleryImages.length === 0 ? (
            <p className="text-sm text-muted-foreground italic py-4">
              Nenhuma imagem na galeria do Assets API para este produto
            </p>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-sm font-medium text-muted-foreground">
                  Total de imagens:
                </span>
                <Badge variant="secondary">{galleryImages.length}</Badge>
              </div>

              <Separator />

              <div className="space-y-4 mt-3">
                {galleryImages.map((image, index) => (
                  <div
                    key={image.id}
                    className="flex items-start gap-3 rounded-md border p-3"
                  >
                    <div className="relative size-24 shrink-0 overflow-hidden rounded-md bg-muted sm:size-32">
                      <Image
                        src={
                          imageErrors.has(image.id)
                            ? DEFAULT_PRODUCT_IMAGE_URL
                            : (image.urls.medium ??
                              image.urls.preview ??
                              image.urls.original)
                        }
                        alt={image.originalName || `Imagem ${index + 1}`}
                        fill
                        className="object-cover"
                        sizes="(min-width: 640px) 128px, 96px"
                        onError={() =>
                          setImageErrors((previousErrors) =>
                            new Set(previousErrors).add(image.id),
                          )
                        }
                        unoptimized={!imageErrors.has(image.id)}
                      />
                    </div>

                    <div className="min-w-0 flex-1 space-y-2">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            #{index + 1}
                          </Badge>
                          {image.isPrimary && (
                            <Badge className="bg-amber-500 text-xs text-white">
                              Principal
                            </Badge>
                          )}
                          <span className="text-xs text-muted-foreground">
                            Ordem: {image.displayOrder}
                          </span>
                        </div>
                        <span className="font-mono text-xs text-muted-foreground">
                          ID: {image.id.slice(0, 8)}...
                        </span>
                      </div>

                      <code className="block break-all text-xs text-muted-foreground">
                        {image.urls.preview ?? image.urls.original}
                      </code>

                      <a
                        href={image.urls.preview ?? image.urls.original}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                      >
                        <ExternalLink className="h-3 w-3" />
                        Abrir preview em nova aba
                      </a>

                      <div>
                        <Button
                          type="button"
                          variant={
                            productImagePath.trim() ===
                            image.urls.original.trim()
                              ? "secondary"
                              : "outline"
                          }
                          size="sm"
                          disabled={updatingImageId !== null}
                          onClick={() => handleUpdateProductImagePath(image)}
                        >
                          {updatingImageId === image.id ? (
                            <RefreshCw className="mr-1 h-3 w-3 animate-spin" />
                          ) : productImagePath.trim() ===
                            image.urls.original.trim() ? (
                            <Check className="mr-1 h-3 w-3" />
                          ) : (
                            <Save className="mr-1 h-3 w-3" />
                          )}
                          {productImagePath.trim() ===
                          image.urls.original.trim()
                            ? "Já cadastrada"
                            : "Usar no PATH_IMAGEM"}
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ProductImagesList;
