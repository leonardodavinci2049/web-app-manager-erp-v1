"use client";

import {
  CircleAlert,
  ExternalLink,
  Image as ImageIcon,
  RefreshCw,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState, useTransition } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { DEFAULT_SELLER_IMAGE_URL } from "./image-gallery-constants";
import type { SellerGalleryImage } from "./image-gallery-types";

interface SellerImagesListProps {
  initialSellerImagePath: string;
  initialGalleryImages: SellerGalleryImage[];
  initialGalleryError: string | null;
}

export function SellerImagesList({
  initialSellerImagePath,
  initialGalleryImages,
  initialGalleryError,
}: SellerImagesListProps) {
  const router = useRouter();
  const [isRefreshing, startRefreshTransition] = useTransition();
  const [galleryImages, setGalleryImages] =
    useState<SellerGalleryImage[]>(initialGalleryImages);
  const [error, setError] = useState<string | null>(initialGalleryError);
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());
  const [hasSellerImageError, setHasSellerImageError] = useState(false);
  const sellerImagePath = initialSellerImagePath;

  const refreshGallery = useCallback(() => {
    setImageErrors(new Set());
    startRefreshTransition(() => router.refresh());
  }, [router]);

  useEffect(() => {
    setGalleryImages(initialGalleryImages);
    setError(initialGalleryError);
  }, [initialGalleryError, initialGalleryImages]);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <ImageIcon className="h-5 w-5" />
            Imagem cadastrada no vendedor
          </CardTitle>
        </CardHeader>
        <CardContent>
          {sellerImagePath ? (
            <div className="flex items-start gap-3 rounded-md border p-3">
              <div className="relative size-24 shrink-0 overflow-hidden rounded-md bg-muted sm:size-32">
                <Image
                  src={
                    hasSellerImageError
                      ? DEFAULT_SELLER_IMAGE_URL
                      : sellerImagePath
                  }
                  alt="Imagem cadastrada no vendedor"
                  fill
                  className="object-cover"
                  sizes="(min-width: 640px) 128px, 96px"
                  onError={() => setHasSellerImageError(true)}
                  unoptimized={!hasSellerImageError}
                />
              </div>

              <div className="min-w-0 flex-1 space-y-2">
                <Badge variant="secondary" className="font-mono text-xs">
                  PATH_IMAGEM
                </Badge>
                <code className="block break-all text-xs text-muted-foreground">
                  {sellerImagePath}
                </code>
                <a
                  href={sellerImagePath}
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
              onClick={refreshGallery}
              disabled={isRefreshing}
            >
              <RefreshCw
                className={`h-4 w-4 mr-1 ${isRefreshing ? "animate-spin" : ""}`}
              />
              Atualizar
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {error ? (
            <div className="rounded-md bg-destructive/10 p-4">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          ) : galleryImages.length === 0 ? (
            <p className="text-sm text-muted-foreground italic py-4">
              Nenhuma imagem na galeria do Assets API para este vendedor
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

              <p className="flex items-start gap-2 rounded-md border border-amber-500/40 bg-amber-500/10 p-3 text-xs text-amber-700 dark:text-amber-400">
                <CircleAlert
                  className="mt-0.5 size-4 shrink-0"
                  aria-hidden="true"
                />
                A atualização de PATH_IMAGEM está pendente de um método
                específico na API de vendedores.
              </p>

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
                            ? DEFAULT_SELLER_IMAGE_URL
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
                          variant="outline"
                          size="sm"
                          disabled
                        >
                          <CircleAlert className="mr-1 h-3 w-3" />
                          {sellerImagePath.trim() === image.urls.original.trim()
                            ? "Já cadastrada"
                            : "Usar no PATH_IMAGEM — API pendente"}
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
}
