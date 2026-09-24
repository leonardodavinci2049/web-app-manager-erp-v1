"use client";

import {
  ChevronLeft,
  ChevronRight,
  Crown,
  ImageOff,
  LoaderCircle,
  MoveLeft,
  MoveRight,
  Plus,
  Trash2,
  ZoomIn,
} from "lucide-react";
import Image from "next/image";
import {
  type ChangeEvent,
  type DragEvent,
  type KeyboardEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
  deleteSettingsImageAction,
  reorderSettingsImagesAction,
  setPrimarySettingsImageAction,
  uploadSettingsImageAction,
} from "../../_actions/settings-image-gallery-actions";
import {
  DEFAULT_SETTINGS_IMAGE_URL,
  SETTINGS_GALLERY_ACCEPT,
  SETTINGS_GALLERY_ACCEPTED_MIME_TYPES,
  SETTINGS_GALLERY_LIMIT,
  SETTINGS_GALLERY_MAX_FILE_SIZE,
} from "./image-gallery-constants";
import type { SettingsGalleryImage } from "./image-gallery-types";

interface SettingsImageGalleryProps {
  configId: number;
  appName: string;
  images: SettingsGalleryImage[];
  totalImages: number;
  loadError: string | null;
  selectionRequest: { imageId?: string; version: number };
  onRefresh: (preferredImageId?: string) => void;
}

type PendingMutation = "upload" | "delete" | "primary" | "reorder" | null;

function isRemoteImage(url: string): boolean {
  return url.startsWith("http://") || url.startsWith("https://");
}

export function SettingsImageGallery({
  configId,
  appName,
  images,
  totalImages,
  loadError,
  selectionRequest,
  onRefresh,
}: SettingsImageGalleryProps) {
  const [selectedImageId, setSelectedImageId] = useState<string | undefined>(
    selectionRequest.imageId ?? images[0]?.id,
  );
  const [zoomedImageId, setZoomedImageId] = useState<string | null>(null);
  const [deleteImageId, setDeleteImageId] = useState<string | null>(null);
  const [primaryImageId, setPrimaryImageId] = useState<string | null>(null);
  const [pendingMutation, setPendingMutation] = useState<PendingMutation>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());
  const [liveMessage, setLiveMessage] = useState("");

  const selectedImage = useMemo(
    () => images.find((image) => image.id === selectedImageId) ?? images[0],
    [images, selectedImageId],
  );
  const selectedImageIndex = selectedImage
    ? images.findIndex((image) => image.id === selectedImage.id)
    : -1;
  const zoomedImageIndex = images.findIndex(
    (image) => image.id === zoomedImageId,
  );
  const isBusy = pendingMutation !== null;
  const availableSlots = Math.max(0, SETTINGS_GALLERY_LIMIT - totalImages);
  const canMoveBackward =
    selectedImageIndex > 1 && selectedImage?.isPrimary === false;
  const canMoveForward =
    selectedImageIndex >= 1 && selectedImageIndex < images.length - 1;

  useEffect(() => {
    setSelectedImageId((current) => {
      if (
        selectionRequest.imageId &&
        images.some((image) => image.id === selectionRequest.imageId)
      ) {
        return selectionRequest.imageId;
      }
      if (current && images.some((image) => image.id === current)) {
        return current;
      }
      return images.find((image) => image.isPrimary)?.id ?? images[0]?.id;
    });
  }, [images, selectionRequest]);

  const markImageError = useCallback((key: string) => {
    setImageErrors((current) => new Set(current).add(key));
  }, []);

  const uploadFiles = useCallback(
    async (fileList: FileList | File[]) => {
      if (isBusy || loadError) return;
      const files = Array.from(fileList);
      if (files.length === 0) return;

      const candidates = files.slice(0, availableSlots);
      const failures: string[] = files
        .slice(availableSlots)
        .map(
          (file) => `${file.name}: limite de ${SETTINGS_GALLERY_LIMIT} imagens`,
        );

      setPendingMutation("upload");
      setLiveMessage(`Iniciando envio de ${candidates.length} imagem(ns).`);
      let lastUploadedImageId: string | undefined;
      let uploadedCount = 0;
      let warningCount = 0;

      try {
        for (const file of candidates) {
          if (
            !SETTINGS_GALLERY_ACCEPTED_MIME_TYPES.includes(
              file.type as (typeof SETTINGS_GALLERY_ACCEPTED_MIME_TYPES)[number],
            )
          ) {
            failures.push(`${file.name}: formato não aceito`);
            continue;
          }
          if (file.size <= 0 || file.size > SETTINGS_GALLERY_MAX_FILE_SIZE) {
            failures.push(`${file.name}: imagem vazia ou acima de 2 MB`);
            continue;
          }

          const formData = new FormData();
          formData.set("file", file);
          formData.set("configId", configId.toString());
          const result = await uploadSettingsImageAction(formData);
          if (result.success) {
            uploadedCount += 1;
            lastUploadedImageId = result.preferredImageId;
            toast.success(result.message);
            if (result.warning) {
              warningCount += 1;
              toast.warning(result.warning);
            }
          } else {
            failures.push(`${file.name}: ${result.error}`);
          }
        }

        if (uploadedCount > 0) onRefresh(lastUploadedImageId);
        if (failures.length > 0) {
          toast.error(
            `${failures.length} arquivo(s) não foram enviados. ${failures.join("; ")}`,
          );
        }
        setLiveMessage(
          `${uploadedCount} imagem(ns) enviada(s). ${failures.length} falha(s). ${warningCount} aviso(s).`,
        );
      } catch {
        toast.error("Não foi possível concluir o envio das imagens.");
        setLiveMessage("O envio foi interrompido por um erro.");
      } finally {
        setPendingMutation(null);
      }
    },
    [availableSlots, configId, isBusy, loadError, onRefresh],
  );

  const handleSetPrimary = async () => {
    if (!primaryImageId || isBusy) return;
    setPendingMutation("primary");
    try {
      const result = await setPrimarySettingsImageAction(
        configId,
        primaryImageId,
      );
      if (!result.success) {
        toast.error(result.error);
        setLiveMessage(result.error);
        return;
      }
      toast.success(result.message);
      if (result.warning) toast.warning(result.warning);
      setLiveMessage(result.warning ?? result.message);
      onRefresh(result.preferredImageId);
    } catch {
      toast.error("Não foi possível definir a imagem principal.");
    } finally {
      setPrimaryImageId(null);
      setPendingMutation(null);
    }
  };

  const handleDelete = async () => {
    if (!deleteImageId || isBusy) return;
    setPendingMutation("delete");
    try {
      const result = await deleteSettingsImageAction(configId, deleteImageId);
      if (!result.success) {
        toast.error(result.error);
        setLiveMessage(result.error);
        return;
      }
      toast.success(result.message);
      if (result.warning) toast.warning(result.warning);
      setLiveMessage(result.warning ?? result.message);
      onRefresh(result.preferredImageId);
    } catch {
      toast.error("Não foi possível excluir esta imagem.");
    } finally {
      setDeleteImageId(null);
      setPendingMutation(null);
    }
  };

  const handleReorder = async (direction: -1 | 1) => {
    if (!selectedImage || isBusy || selectedImage.isPrimary) return;
    const targetIndex = selectedImageIndex + direction;
    if (targetIndex < 1 || targetIndex >= images.length) return;

    const assetIds = images.map((image) => image.id);
    [assetIds[selectedImageIndex], assetIds[targetIndex]] = [
      assetIds[targetIndex],
      assetIds[selectedImageIndex],
    ];

    setPendingMutation("reorder");
    try {
      const result = await reorderSettingsImagesAction(configId, assetIds);
      if (!result.success) {
        toast.error(result.error);
        setLiveMessage(result.error);
        return;
      }
      toast.success(result.message);
      setLiveMessage(result.message);
      onRefresh(selectedImage.id);
    } catch {
      toast.error("Não foi possível reordenar as imagens.");
    } finally {
      setPendingMutation(null);
    }
  };

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

  return (
    <section
      className="w-full max-w-[500px] space-y-4"
      aria-label={`Galeria de imagens de ${appName}`}
    >
      {loadError ? (
        <p
          role="alert"
          className="rounded-lg border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive"
        >
          {loadError}
        </p>
      ) : null}

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
                  imageErrors.has(`${selectedImage.id}:preview`)
                    ? DEFAULT_SETTINGS_IMAGE_URL
                    : selectedImage.urls.preview
                }
                alt={`${appName} — ${selectedImage.originalName}`}
                fill
                priority
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 500px"
                unoptimized={isRemoteImage(selectedImage.urls.preview)}
                onError={() => markImageError(`${selectedImage.id}:preview`)}
              />
              <span className="absolute right-3 top-3 inline-flex size-11 items-center justify-center rounded-md bg-background/90 shadow-sm sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-visible:opacity-100">
                <ZoomIn className="size-5" aria-hidden="true" />
              </span>
              {images.length > 1 ? (
                <Badge className="absolute left-3 top-3" variant="secondary">
                  {selectedImageIndex + 1} de {images.length}
                </Badge>
              ) : null}
            </button>
          ) : (
            <div className="relative flex aspect-square flex-col items-center justify-center gap-3 bg-muted p-6 text-center text-muted-foreground">
              <Image
                src={DEFAULT_SETTINGS_IMAGE_URL}
                alt="Aplicativo sem imagem"
                fill
                priority
                className="object-cover opacity-20"
                sizes="(max-width: 1024px) 100vw, 500px"
              />
              <ImageOff className="relative size-10" aria-hidden="true" />
              <p className="relative text-sm font-medium">Galeria vazia</p>
              <p className="relative text-xs">
                Envie a primeira imagem do aplicativo.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
        {images.map((image, index) => (
          <button
            key={image.id}
            type="button"
            className="relative aspect-square overflow-hidden rounded-lg border bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            aria-pressed={selectedImage?.id === image.id}
            aria-label={`Selecionar ${image.originalName}, imagem ${index + 1} de ${images.length}${image.isPrimary ? ", principal" : ""}`}
            onClick={() => setSelectedImageId(image.id)}
          >
            <Image
              src={
                imageErrors.has(`${image.id}:thumbnail`)
                  ? DEFAULT_SETTINGS_IMAGE_URL
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
            {image.isPrimary ? (
              <Badge className="absolute left-1 top-1 gap-1 bg-amber-500 text-white">
                <Crown className="size-3" aria-hidden="true" /> Principal
              </Badge>
            ) : null}
          </button>
        ))}

        {availableSlots > 0 && !loadError ? (
          <label
            className={`relative flex aspect-square min-h-11 cursor-pointer flex-col items-center justify-center gap-1 overflow-hidden rounded-lg border-2 border-dashed bg-muted p-2 text-center text-xs text-muted-foreground transition-colors focus-within:ring-2 focus-within:ring-ring focus-within:ring-inset ${isDragOver ? "border-primary bg-primary/10" : "border-border"}`}
            onDragOver={(event) => {
              event.preventDefault();
              setIsDragOver(true);
            }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={(event: DragEvent<HTMLLabelElement>) => {
              event.preventDefault();
              setIsDragOver(false);
              void uploadFiles(event.dataTransfer.files);
            }}
          >
            <input
              type="file"
              multiple
              accept={SETTINGS_GALLERY_ACCEPT}
              className="sr-only"
              disabled={isBusy}
              onChange={(event: ChangeEvent<HTMLInputElement>) => {
                if (event.target.files) void uploadFiles(event.target.files);
                event.target.value = "";
              }}
              aria-label={`Adicionar imagens. ${availableSlots} vaga(s) disponível(is)`}
            />
            {pendingMutation === "upload" ? (
              <LoaderCircle
                className="size-6 animate-spin"
                aria-hidden="true"
              />
            ) : (
              <Plus className="size-6" aria-hidden="true" />
            )}
            <span>{isDragOver ? "Solte aqui" : "Adicionar"}</span>
            <span>{availableSlots} vaga(s)</span>
          </label>
        ) : null}
      </div>

      {selectedImage ? (
        <fieldset className="flex flex-wrap gap-2">
          <legend className="sr-only">Ações da imagem selecionada</legend>
          {!selectedImage.isPrimary ? (
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={isBusy}
              onClick={() => setPrimaryImageId(selectedImage.id)}
            >
              <Crown className="size-4" aria-hidden="true" />
              Definir como principal
            </Button>
          ) : null}
          <Button
            type="button"
            size="icon-sm"
            variant="outline"
            disabled={isBusy || !canMoveBackward}
            aria-label="Mover imagem para a posição anterior"
            onClick={() => void handleReorder(-1)}
          >
            <MoveLeft className="size-4" aria-hidden="true" />
          </Button>
          <Button
            type="button"
            size="icon-sm"
            variant="outline"
            disabled={isBusy || !canMoveForward}
            aria-label="Mover imagem para a próxima posição"
            onClick={() => void handleReorder(1)}
          >
            <MoveRight className="size-4" aria-hidden="true" />
          </Button>
          <Button
            type="button"
            size="sm"
            variant="destructive"
            disabled={isBusy || images.length <= 1}
            onClick={() => setDeleteImageId(selectedImage.id)}
          >
            <Trash2 className="size-4" aria-hidden="true" />
            Excluir
          </Button>
          {pendingMutation === "reorder" ? (
            <span className="text-muted-foreground inline-flex items-center gap-1 text-xs">
              <LoaderCircle className="size-3.5 animate-spin" /> Reordenando...
            </span>
          ) : null}
        </fieldset>
      ) : null}

      <p className="text-muted-foreground text-xs">
        JPEG, PNG, GIF ou WebP. Até 2 MB por arquivo e {SETTINGS_GALLERY_LIMIT}{" "}
        imagens. A imagem principal permanece na primeira posição.
      </p>
      <p className="sr-only" aria-live="polite" aria-atomic="true">
        {liveMessage}
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
            <DialogTitle>{appName}</DialogTitle>
          </DialogHeader>
          <div className="relative min-h-0 flex-1 bg-black">
            {zoomedImageIndex >= 0 && images[zoomedImageIndex] ? (
              <Image
                src={
                  imageErrors.has(`${images[zoomedImageIndex].id}:original`)
                    ? DEFAULT_SETTINGS_IMAGE_URL
                    : images[zoomedImageIndex].urls.original
                }
                alt={`${appName} — ${images[zoomedImageIndex].originalName}`}
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
            ) : null}
            {images.length > 1 ? (
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
            ) : null}
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={deleteImageId !== null}
        onOpenChange={(open) => !open && setDeleteImageId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir imagem?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Se esta for a principal, a
              próxima imagem será promovida automaticamente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isBusy}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={isBusy}
              onClick={(event) => {
                event.preventDefault();
                void handleDelete();
              }}
            >
              {pendingMutation === "delete" ? (
                <LoaderCircle className="animate-spin" aria-hidden="true" />
              ) : null}
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={primaryImageId !== null}
        onOpenChange={(open) => !open && setPrimaryImageId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Definir como principal?</AlertDialogTitle>
            <AlertDialogDescription>
              A imagem principal atual continuará na galeria como secundária.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isBusy}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              disabled={isBusy}
              onClick={(event) => {
                event.preventDefault();
                void handleSetPrimary();
              }}
            >
              {pendingMutation === "primary" ? (
                <LoaderCircle className="animate-spin" aria-hidden="true" />
              ) : null}
              Definir como principal
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
}
