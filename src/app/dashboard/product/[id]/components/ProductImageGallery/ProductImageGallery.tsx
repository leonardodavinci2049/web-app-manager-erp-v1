"use client";

import {
  ChevronLeft,
  ChevronRight,
  Crown,
  Plus,
  X,
  ZoomIn,
} from "lucide-react";
import Image from "next/image";
import React, { useCallback, useState } from "react";
import { toast } from "sonner";
import {
  deleteProductImageAction,
  setPrimaryImageAction,
  uploadProductImageAction,
} from "@/app/actions/action-product-images";
// Comentado temporariamente até o componente AlertDialog ser criado
// import {
//   AlertDialog,
//   AlertDialogAction,
//   AlertDialogCancel,
//   AlertDialogContent,
//   AlertDialogDescription,
//   AlertDialogFooter,
//   AlertDialogHeader,
//   AlertDialogTitle,
// } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export interface GalleryImageWithId {
  id: string;
  url: string;
  originalUrl?: string;
  mediumUrl?: string;
  previewUrl?: string;
  isPrimary?: boolean;
}

interface ProductImageGalleryProps {
  images: GalleryImageWithId[];
  productName: string;
  productId: number;
  fallbackImage?: string; // Fallback image URL (from PATH_IMAGEM)
  onImageUploadSuccess?: () => void | Promise<void>;
}

export function ProductImageGallery({
  images,
  productName,
  productId,
  fallbackImage,
  onImageUploadSuccess,
}: ProductImageGalleryProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isZoomModalOpen, setIsZoomModalOpen] = useState(false);
  const [zoomedImageIndex, setZoomedImageIndex] = useState(0);
  const [imageErrors, setImageErrors] = useState<Set<number>>(new Set());
  const [fallbackAttempted, setFallbackAttempted] = useState<Set<number>>(
    new Set(),
  );
  const [isUploading, setIsUploading] = useState(false);
  const [deleteImageIndex, setDeleteImageIndex] = useState<number | null>(null);
  const [setPrimaryImageIndex, setSetPrimaryImageIndex] = useState<
    number | null
  >(null);
  const [isDragOver, setIsDragOver] = useState(false);

  // Get the image URL with fallback logic
  const getImageUrl = useCallback(
    (
      index: number,
      size: "original" | "medium" | "preview" = "preview",
    ): string => {
      const currentImage = images[index];

      // If no image at this index, use fallback or default
      if (!currentImage) {
        return fallbackImage || "/images/product/no-image.jpeg";
      }

      // If this is already a fallback image (id = "fallback"), return as-is
      if (currentImage.id === "fallback") {
        return currentImage.url;
      }

      // If gallery image has error and we have PATH_IMAGEM fallback and haven't tried it yet
      if (
        imageErrors.has(index) &&
        fallbackImage &&
        !fallbackAttempted.has(index)
      ) {
        return fallbackImage;
      }

      // If both gallery and fallback failed, use default image
      if (imageErrors.has(index) && fallbackAttempted.has(index)) {
        return "/images/product/no-image.jpeg";
      }

      // Return requested size or fallback to default url
      if (size === "original") {
        return currentImage.originalUrl || currentImage.url;
      }
      if (size === "medium") {
        return (
          currentImage.mediumUrl || currentImage.previewUrl || currentImage.url
        );
      }

      // Default to preview
      return currentImage.previewUrl || currentImage.url;
    },
    [images, imageErrors, fallbackImage, fallbackAttempted],
  );

  // Handle image loading errors with fallback logic
  const handleImageError = useCallback(
    (index: number) => {
      setImageErrors((prev) => new Set(prev).add(index));

      // If we have a PATH_IMAGEM fallback and haven't tried it yet, mark as attempted
      if (fallbackImage && !fallbackAttempted.has(index)) {
        setFallbackAttempted((prev) => new Set(prev).add(index));
      }
    },
    [fallbackImage, fallbackAttempted],
  );

  // Handle image upload via drag & drop or file input
  const handleImageUpload = useCallback(
    async (files: FileList | null) => {
      if (!files || files.length === 0) return;

      setIsUploading(true);

      try {
        // Process each file
        for (let i = 0; i < files.length; i++) {
          const file = files[i];

          // Validate file type
          if (!file.type.startsWith("image/")) {
            toast.error(
              `${file.name} não é uma imagem válida. Por favor, selecione apenas imagens.`,
            );
            continue;
          }

          // Validate file size (10MB limit)
          if (file.size > 10 * 1024 * 1024) {
            toast.error(
              `${file.name} é muito grande. O limite é 10MB por arquivo.`,
            );
            continue;
          }

          // Create FormData for upload
          const formData = new FormData();
          formData.append("file", file);
          formData.append("productId", productId.toString());
          // Don't send tags to match the working test page pattern

          // Call server action to upload
          const result = await uploadProductImageAction(formData);

          if (result.success) {
            toast.success(`${file.name} enviada com sucesso!`);
          } else {
            toast.error(`Erro ao enviar ${file.name}: ${result.error}`);
          }
        }

        // After all uploads complete, trigger refresh callback
        if (onImageUploadSuccess) {
          await onImageUploadSuccess();
        }
      } catch (error) {
        console.error("Error uploading images:", error);
        toast.error("Erro ao fazer upload das imagens");
      } finally {
        setIsUploading(false);
      }
    },
    [productId, onImageUploadSuccess],
  );

  // Handle drag events
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);

      const files = e.dataTransfer.files;
      handleImageUpload(files);
    },
    [handleImageUpload],
  );

  // Handle file input change
  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      handleImageUpload(files);

      // Reset input value so the same file can be selected again
      e.target.value = "";
    },
    [handleImageUpload],
  );

  // Handle image deletion
  const handleDeleteImage = useCallback(
    async (index: number) => {
      try {
        const imageToDelete = images[index];
        if (!imageToDelete) {
          toast.error("Imagem não encontrada");
          return;
        }

        // Special handling for primary image deletion
        if (imageToDelete.isPrimary && images.length > 1) {
          toast.success(
            "Imagem principal removida! A próxima imagem será promovida automaticamente.",
          );
        }

        // Call server action to delete the image
        // Pass productId and wasPrimary flag to update PATH_IMAGEM if needed
        const result = await deleteProductImageAction(
          imageToDelete.id,
          productId.toString(),
          imageToDelete.isPrimary,
        );

        if (result.success) {
          if (!imageToDelete.isPrimary) {
            toast.success("Imagem removida com sucesso!");
          }

          // If we're deleting the currently selected image, select the first one
          if (index === selectedImageIndex && images.length > 1) {
            setSelectedImageIndex(0);
          }

          // Refresh gallery after deletion
          if (onImageUploadSuccess) {
            await onImageUploadSuccess();
          }
        } else {
          toast.error(result.error || "Erro ao remover imagem");
        }
      } catch (error) {
        console.error("Error deleting image:", error);
        toast.error("Erro ao remover imagem");
      } finally {
        setDeleteImageIndex(null);
      }
    },
    [selectedImageIndex, images, onImageUploadSuccess, productId],
  );

  // Handle setting image as primary
  const handleSetPrimary = useCallback(
    async (index: number) => {
      try {
        const imageToPromote = images[index];
        if (!imageToPromote) {
          toast.error("Imagem não encontrada");
          return;
        }

        if (imageToPromote.isPrimary) {
          toast.info("Esta imagem já é a principal");
          return;
        }

        // Call server action to set as primary
        const result = await setPrimaryImageAction(
          productId.toString(),
          imageToPromote.id,
        );

        if (result.success) {
          toast.success("Nova imagem principal definida com sucesso!");

          // Refresh gallery after promotion
          if (onImageUploadSuccess) {
            await onImageUploadSuccess();
          }
        } else {
          toast.error(result.error || "Erro ao definir imagem principal");
        }
      } catch (error) {
        console.error("Error setting primary image:", error);
        toast.error("Erro ao definir imagem principal");
      } finally {
        setSetPrimaryImageIndex(null);
      }
    },
    [images, productId, onImageUploadSuccess],
  );

  // Navigation functions for zoom modal
  const navigateZoomedImage = useCallback(
    (direction: "prev" | "next") => {
      if (direction === "prev") {
        setZoomedImageIndex((prev) =>
          prev === 0 ? images.length - 1 : prev - 1,
        );
      } else {
        setZoomedImageIndex((prev) =>
          prev === images.length - 1 ? 0 : prev + 1,
        );
      }
    },
    [images.length],
  );

  // Keyboard navigation for zoom modal
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!isZoomModalOpen) return;

      switch (e.key) {
        case "ArrowLeft":
          e.preventDefault();
          navigateZoomedImage("prev");
          break;
        case "ArrowRight":
          e.preventDefault();
          navigateZoomedImage("next");
          break;
        case "Escape":
          e.preventDefault();
          setIsZoomModalOpen(false);
          break;
      }
    },
    [isZoomModalOpen, navigateZoomedImage],
  );

  // Add keyboard event listener
  React.useEffect(() => {
    if (isZoomModalOpen) {
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }
  }, [isZoomModalOpen, handleKeyDown]);

  const openZoomModal = useCallback((index: number) => {
    setZoomedImageIndex(index);
    setIsZoomModalOpen(true);
  }, []);

  return (
    <div className="space-y-4">
      {/* Main Image Display */}
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <button
            type="button"
            className="relative aspect-square bg-muted group cursor-zoom-in w-full"
            onClick={() => openZoomModal(selectedImageIndex)}
          >
            {!imageErrors.has(selectedImageIndex) ||
            (fallbackImage && !fallbackAttempted.has(selectedImageIndex)) ? (
              <>
                <Image
                  src={getImageUrl(selectedImageIndex, "preview")}
                  alt={`${productName} - Imagem principal`}
                  fill
                  className="object-cover transition-transform duration-300"
                  priority
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 50vw"
                  onError={() => handleImageError(selectedImageIndex)}
                  unoptimized={
                    getImageUrl(selectedImageIndex, "preview").startsWith(
                      "http://",
                    ) ||
                    getImageUrl(selectedImageIndex, "preview").startsWith(
                      "https://",
                    )
                  }
                />

                {/* Zoom button - appears on hover */}
                <Button
                  variant="secondary"
                  size="icon"
                  className="absolute right-3 top-3 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => openZoomModal(selectedImageIndex)}
                >
                  <ZoomIn className="h-4 w-4" />
                </Button>

                {/* Image counter badge */}
                {images.length > 1 && (
                  <Badge variant="secondary" className="absolute left-3 top-3">
                    {selectedImageIndex + 1} de {images.length}
                  </Badge>
                )}
              </>
            ) : (
              <div className="flex h-full items-center justify-center">
                <Image
                  src="/images/product/no-image.jpeg"
                  alt="Imagem não disponível"
                  fill
                  className="object-cover opacity-50"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              </div>
            )}
          </button>
        </CardContent>
      </Card>

      {/* Image Gallery Grid */}
      <div className="grid grid-cols-4 gap-2">
        {images.map((image, index) => (
          <Card
            key={`product-gallery-${image.id}`}
            className={`cursor-pointer overflow-hidden transition-all hover:ring-2 hover:ring-primary ${
              selectedImageIndex === index ? "ring-2 ring-primary" : ""
            } ${imageErrors.has(index) ? "opacity-50" : ""}`}
            onClick={() =>
              !imageErrors.has(index) && setSelectedImageIndex(index)
            }
          >
            <CardContent className="p-0 relative">
              <div className="relative aspect-square bg-muted">
                {!imageErrors.has(index) ||
                (fallbackImage && !fallbackAttempted.has(index)) ? (
                  <>
                    <Image
                      src={getImageUrl(index, "medium")}
                      alt={`${productName} - ${index + 1}`}
                      fill
                      className="object-cover"
                      sizes="100px"
                      onError={() => handleImageError(index)}
                      unoptimized={
                        getImageUrl(index, "medium").startsWith("http://") ||
                        getImageUrl(index, "medium").startsWith("https://")
                      }
                    />

                    {/* Primary indicator badge - positioned at top left with higher z-index */}
                    {image.isPrimary && (
                      <div className="absolute left-0 top-0 bg-amber-500 text-white px-1.5 py-0.5 rounded-br-md text-xs font-semibold flex items-center gap-1 z-20 shadow-lg">
                        <Crown className="h-3 w-3" />
                        Principal
                      </div>
                    )}

                    {/* Delete button - positioned to not overlap with primary badge */}
                    <Button
                      variant={image.isPrimary ? "outline" : "destructive"}
                      size="icon"
                      className="absolute right-1 top-1 h-7 w-7 opacity-80 hover:opacity-100 transition-opacity z-10"
                      onClick={(e) => {
                        e.stopPropagation();
                        // Check if it's the only image
                        if (images.length === 1) {
                          toast.error(
                            "Não é possível excluir a única imagem do produto",
                          );
                          return;
                        }

                        setDeleteImageIndex(index);
                      }}
                      title={
                        image.isPrimary
                          ? "Excluir imagem principal (próxima será promovida)"
                          : "Excluir imagem"
                      }
                    >
                      <X className="h-4 w-4" />
                    </Button>

                    {/* Set as Primary button - only for non-primary images, positioned at top left with same size as delete button */}
                    {!image.isPrimary && (
                      <Button
                        variant="secondary"
                        size="icon"
                        className="absolute left-1 top-1 h-7 w-7 opacity-80 hover:opacity-100 transition-opacity z-10 bg-amber-500 hover:bg-amber-600 text-white border-none"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSetPrimaryImageIndex(index);
                        }}
                        title="Definir como imagem principal"
                      >
                        <Crown className="h-4 w-4" />
                      </Button>
                    )}
                  </>
                ) : (
                  <Image
                    src="/images/product/no-image.jpeg"
                    alt="Imagem não disponível"
                    fill
                    className="object-cover opacity-50"
                    sizes="100px"
                  />
                )}
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Add Image Button with Drag & Drop */}
        <Card
          className={`cursor-pointer overflow-hidden border-dashed border-2 transition-colors ${
            isDragOver ? "border-primary bg-primary/10" : "hover:border-primary"
          } ${isUploading ? "pointer-events-none opacity-50" : ""}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <CardContent className="p-0">
            <div className="relative aspect-square bg-muted flex items-center justify-center">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileInputChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                disabled={isUploading}
              />

              <div className="flex flex-col items-center gap-1 text-muted-foreground pointer-events-none">
                {isUploading ? (
                  <>
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    <span className="text-xs">Enviando...</span>
                  </>
                ) : (
                  <>
                    <Plus className="h-6 w-6" />
                    <span className="text-xs text-center">
                      {isDragOver ? "Soltar aqui" : "Adicionar"}
                    </span>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Zoom Modal */}
      <Dialog open={isZoomModalOpen} onOpenChange={setIsZoomModalOpen}>
        <DialogContent className="max-w-5xl h-[80vh] p-0">
          <DialogHeader className="px-6 py-4 border-b">
            <DialogTitle className="flex items-center justify-between">
              <span>
                {productName} - Imagem {zoomedImageIndex + 1} de {images.length}
              </span>
              <Badge variant="secondary">
                Use ← → para navegar | ESC para fechar
              </Badge>
            </DialogTitle>
          </DialogHeader>

          <div className="relative flex-1 bg-black">
            {!imageErrors.has(zoomedImageIndex) ||
            (fallbackImage && !fallbackAttempted.has(zoomedImageIndex)) ? (
              <Image
                src={getImageUrl(zoomedImageIndex, "original")}
                alt={`${productName} - Ampliada`}
                fill
                className="object-contain"
                priority
                sizes="(max-width: 1200px) 100vw, 80vw"
                onError={() => handleImageError(zoomedImageIndex)}
                unoptimized={
                  getImageUrl(zoomedImageIndex, "original").startsWith(
                    "http://",
                  ) ||
                  getImageUrl(zoomedImageIndex, "original").startsWith(
                    "https://",
                  )
                }
              />
            ) : (
              <div className="flex h-full items-center justify-center">
                <Image
                  src="/images/product/no-image.jpeg"
                  alt="Imagem não disponível"
                  fill
                  className="object-contain opacity-50"
                  sizes="(max-width: 1200px) 100vw, 80vw"
                />
              </div>
            )}

            {/* Navigation Buttons */}
            {images.length > 1 && (
              <>
                <Button
                  variant="secondary"
                  size="icon"
                  className="absolute left-4 top-1/2 -translate-y-1/2"
                  onClick={() => navigateZoomedImage("prev")}
                >
                  <ChevronLeft className="h-6 w-6" />
                </Button>

                <Button
                  variant="secondary"
                  size="icon"
                  className="absolute right-4 top-1/2 -translate-y-1/2"
                  onClick={() => navigateZoomedImage("next")}
                >
                  <ChevronRight className="h-6 w-6" />
                </Button>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteImageIndex !== null}
        onOpenChange={() => setDeleteImageIndex(null)}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
          </DialogHeader>

          <div className="py-4">
            {deleteImageIndex !== null &&
            images[deleteImageIndex]?.isPrimary ? (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Esta é a <strong>imagem principal</strong> do produto.
                </p>
                <p className="text-sm text-muted-foreground">
                  Ao removê-la, a próxima imagem será automaticamente promovida
                  para imagem principal.
                </p>
                <p className="text-sm font-medium text-amber-600">
                  Tem certeza que deseja continuar? Esta ação não pode ser
                  desfeita.
                </p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Tem certeza que deseja remover esta imagem? Esta ação não pode
                ser desfeita.
              </p>
            )}
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setDeleteImageIndex(null)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={() =>
                deleteImageIndex !== null && handleDeleteImage(deleteImageIndex)
              }
            >
              <X className="mr-2 h-4 w-4" />
              Excluir
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Set Primary Confirmation Dialog */}
      <Dialog
        open={setPrimaryImageIndex !== null}
        onOpenChange={() => setSetPrimaryImageIndex(null)}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Confirmar Nova Imagem Principal</DialogTitle>
          </DialogHeader>

          <div className="py-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Deseja definir esta imagem como a{" "}
                <strong>nova imagem principal</strong> do produto?
              </p>
              <p className="text-sm text-muted-foreground">
                A imagem principal atual será automaticamente promovida para
                imagem secundária.
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setSetPrimaryImageIndex(null)}
            >
              Cancelar
            </Button>
            <Button
              variant="default"
              onClick={() =>
                setPrimaryImageIndex !== null &&
                handleSetPrimary(setPrimaryImageIndex)
              }
            >
              <Crown className="mr-2 h-4 w-4" />
              Definir como Principal
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
