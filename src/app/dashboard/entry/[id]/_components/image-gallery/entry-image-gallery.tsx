"use client";

import {
  ChevronLeft,
  ChevronRight,
  Crown,
  ImageOff,
  TriangleAlert,
  ZoomIn,
} from "lucide-react";
import Image from "next/image";
import { type KeyboardEvent, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DEFAULT_ENTRY_GALLERY_IMAGE_URL,
  ENTRY_GALLERY_LIMIT,
} from "./image-gallery-constants";
import type { EntryGalleryInitialState } from "./image-gallery-types";

interface EntryImageGalleryProps {
  supplierName: string;
  initialState: EntryGalleryInitialState;
}

function isRemoteImage(url: string): boolean {
  return url.startsWith("http://") || url.startsWith("https://");
}

/**
 * Galeria de imagens do fornecedor da entrada (Client, somente leitura).
 * Exibe a imagem selecionada com zoom opcional e a grade de miniaturas. Nao
 * ha' upload, promocao de principal ou exclusao — a galeria pertence ao
 * cadastro do fornecedor.
 */
export function EntryImageGallery({
  supplierName,
  initialState,
}: EntryImageGalleryProps) {
  const images = initialState.status === "ready" ? initialState.images : [];
  const [selectedImageId, setSelectedImageId] = useState<string | undefined>(
    images[0]?.id,
  );
  const [zoomedImageId, setZoomedImageId] = useState<string | null>(null);
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());

  const selectedImage = useMemo(
    () => images.find((image) => image.id === selectedImageId) ?? images[0],
    [images, selectedImageId],
  );
  const zoomedImageIndex = images.findIndex(
    (image) => image.id === zoomedImageId,
  );

  const markImageError = (key: string) =>
    setFailedImages((current) => new Set(current).add(key));

  const navigateZoom = (direction: -1 | 1) => {
    if (images.length < 2) return;
    const currentIndex = zoomedImageIndex >= 0 ? zoomedImageIndex : 0;
    const nextIndex =
      (currentIndex + direction + images.length) % images.length;
    setZoomedImageId(images[nextIndex]?.id ?? null);
  };

  const handleZoomKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      navigateZoom(-1);
    }
    if (event.key === "ArrowRight") {
      event.preventDefault();
      navigateZoom(1);
    }
  };

  if (initialState.status === "error") {
    return (
      <section
        className="w-full max-w-[500px] space-y-4"
        aria-label={`Galeria de imagens de ${supplierName}`}
      >
        <Card className="py-0">
          <CardContent className="flex aspect-square flex-col items-center justify-center gap-3 p-6 text-center text-muted-foreground">
            <TriangleAlert className="text-destructive size-10" />
            <p className="text-sm font-medium">
              Não foi possível carregar a galeria
            </p>
            <p className="text-xs">{initialState.error}</p>
          </CardContent>
        </Card>
      </section>
    );
  }

  if (initialState.status === "empty") {
    return (
      <section
        className="w-full max-w-[500px] space-y-4"
        aria-label={`Galeria de imagens de ${supplierName}`}
      >
        <Card className="overflow-hidden py-0">
          <CardContent className="p-0">
            <div className="relative flex aspect-square flex-col items-center justify-center gap-3 bg-muted p-6 text-center text-muted-foreground">
              <Image
                src={DEFAULT_ENTRY_GALLERY_IMAGE_URL}
                alt="Fornecedor sem imagem"
                fill
                priority
                className="object-cover opacity-20"
                sizes="(max-width: 1024px) 100vw, 500px"
              />
              <ImageOff className="relative size-10" aria-hidden="true" />
              <p className="relative text-sm font-medium">Galeria vazia</p>
              <p className="relative text-xs">
                O fornecedor desta entrada ainda não possui imagens.
              </p>
            </div>
          </CardContent>
        </Card>
      </section>
    );
  }

  return (
    <section
      className="w-full max-w-[500px] space-y-4"
      aria-label={`Galeria de imagens de ${supplierName}`}
    >
      <Card className="overflow-hidden py-0">
        <CardContent className="p-0">
          {selectedImage ? (
            <button
              type="button"
              className="group relative block aspect-square w-full cursor-zoom-in bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
              onClick={() => setZoomedImageId(selectedImage.id)}
              aria-label={`Ampliar ${selectedImage.originalName}`}
            >
              <Image
                src={
                  failedImages.has(`${selectedImage.id}:preview`)
                    ? DEFAULT_ENTRY_GALLERY_IMAGE_URL
                    : selectedImage.urls.preview
                }
                alt={`${supplierName} — ${selectedImage.originalName}`}
                fill
                priority
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 500px"
                unoptimized={isRemoteImage(selectedImage.urls.preview)}
                onError={() => markImageError(`${selectedImage.id}:preview`)}
              />
              <span className="absolute right-3 top-3 inline-flex size-11 items-center justify-center rounded-md bg-background/90 opacity-100 shadow-sm sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-visible:opacity-100">
                <ZoomIn className="size-5" aria-hidden="true" />
              </span>
              {images.length > 1 && (
                <Badge className="absolute left-3 top-3" variant="secondary">
                  {images.findIndex((image) => image.id === selectedImage.id) +
                    1}{" "}
                  de {images.length}
                </Badge>
              )}
            </button>
          ) : (
            <div className="flex aspect-square items-center justify-center bg-muted text-muted-foreground">
              <ImageOff className="size-10" aria-hidden="true" />
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
        {images.slice(0, ENTRY_GALLERY_LIMIT).map((image, index) => (
          <div
            key={image.id}
            className="relative aspect-square overflow-hidden rounded-lg border bg-muted"
          >
            <button
              type="button"
              className="relative block size-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
              aria-pressed={selectedImage?.id === image.id}
              aria-label={`Selecionar ${image.originalName}, imagem ${index + 1} de ${images.length}${image.isPrimary ? ", principal" : ""}`}
              onClick={() => setSelectedImageId(image.id)}
            >
              <Image
                src={
                  failedImages.has(`${image.id}:thumbnail`)
                    ? DEFAULT_ENTRY_GALLERY_IMAGE_URL
                    : image.urls.thumbnail
                }
                alt=""
                fill
                className="object-cover"
                sizes="125px"
                unoptimized={isRemoteImage(image.urls.thumbnail)}
                onError={() => markImageError(`${image.id}:thumbnail`)}
              />
              <span
                className={`absolute inset-0 border-2 ${selectedImage?.id === image.id ? "border-primary" : "border-transparent"}`}
              />
            </button>
            {image.isPrimary && (
              <Badge className="absolute left-1 top-1 gap-1 bg-amber-500 text-white">
                <Crown className="size-3" aria-hidden="true" /> Principal
              </Badge>
            )}
          </div>
        ))}
      </div>

      <p className="text-xs text-muted-foreground">
        Galeria somente leitura do fornecedor {supplierName}.
      </p>

      <Dialog
        open={zoomedImageId !== null}
        onOpenChange={(open) => !open && setZoomedImageId(null)}
      >
        <DialogContent
          className="flex h-[min(80vh,760px)] w-[calc(100%-2rem)] max-w-4xl flex-col gap-0 overflow-hidden p-0 sm:max-w-4xl"
          onKeyDown={handleZoomKeyDown}
        >
          <DialogHeader className="border-b px-6 py-4 pr-12">
            <DialogTitle>{supplierName}</DialogTitle>
          </DialogHeader>
          <div className="relative min-h-0 flex-1 bg-black">
            {zoomedImageIndex >= 0 && images[zoomedImageIndex] && (
              <Image
                src={
                  failedImages.has(`${images[zoomedImageIndex].id}:original`)
                    ? DEFAULT_ENTRY_GALLERY_IMAGE_URL
                    : images[zoomedImageIndex].urls.original
                }
                alt={`${supplierName} — ${images[zoomedImageIndex].originalName}`}
                fill
                priority
                className="object-contain"
                sizes="100vw"
                unoptimized={isRemoteImage(
                  images[zoomedImageIndex].urls.original,
                )}
                onError={() =>
                  markImageError(`${images[zoomedImageIndex].id}:original`)
                }
              />
            )}
            {images.length > 1 && (
              <>
                <Button
                  type="button"
                  size="icon"
                  variant="secondary"
                  className="absolute left-3 top-1/2 size-11 -translate-y-1/2"
                  aria-label="Imagem anterior"
                  onClick={() => navigateZoom(-1)}
                >
                  <ChevronLeft className="size-5" aria-hidden="true" />
                </Button>
                <Button
                  type="button"
                  size="icon"
                  variant="secondary"
                  className="absolute right-3 top-1/2 size-11 -translate-y-1/2"
                  aria-label="Próxima imagem"
                  onClick={() => navigateZoom(1)}
                >
                  <ChevronRight className="size-5" aria-hidden="true" />
                </Button>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}
