"use client";

import { Loader2, Upload } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { uploadCustomerListingImageAction } from "../../_actions/customer-listing-image-actions";

const MAX_FILE_SIZE = 2 * 1024 * 1024;
const ACCEPTED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
] as const;
const ACCEPT = ACCEPTED_MIME_TYPES.join(",");

interface CustomerImageUploadProps {
  customerId: number;
  viewMode: "grid" | "list";
  compact?: boolean;
}

/**
 * Gatilho de upload de imagem do cliente na listagem (Client). Aceita clique
 * ou arrastar e soltar de um unico arquivo de imagem de ate 2 MB, mantem o
 * indicador de carregamento, exibe mensagens por toast e atualiza a listagem
 * apos o sucesso. Reproduz o estilo do gatilho do catalogo de produtos.
 */
export function CustomerImageUpload({
  customerId,
  viewMode,
  compact = false,
}: CustomerImageUploadProps) {
  const router = useRouter();
  const [isUploading, setIsUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  const inputId = `customer-image-file-${viewMode}-${customerId}${compact ? "-compact" : ""}`;

  const handleImageUpload = useCallback(
    async (files: FileList | null) => {
      if (!files || files.length === 0) return;
      const file = files[0];

      if (
        !ACCEPTED_MIME_TYPES.includes(
          file.type as (typeof ACCEPTED_MIME_TYPES)[number],
        )
      ) {
        toast.error("Por favor, selecione uma imagem JPEG, PNG, GIF ou WebP");
        return;
      }
      if (file.size > MAX_FILE_SIZE) {
        toast.error("A imagem ultrapassa o limite permitido de 2 MB.");
        return;
      }

      setIsUploading(true);
      try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("customerId", customerId.toString());

        const result = await uploadCustomerListingImageAction(formData);

        if (result.success) {
          if (result.warning) {
            toast.warning(result.warning);
          } else {
            toast.success(result.message ?? "Imagem enviada com sucesso!");
          }
          router.refresh();
        } else {
          toast.error(result.error ?? "Erro ao enviar imagem");
        }
      } catch {
        toast.error("Erro ao enviar imagem");
      } finally {
        setIsUploading(false);
      }
    },
    [customerId, router],
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(false);
      handleImageUpload(e.dataTransfer.files);
    },
    [handleImageUpload],
  );

  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      handleImageUpload(e.target.files);
      e.target.value = "";
    },
    [handleImageUpload],
  );

  const isList = viewMode === "list";
  const buttonClass = isList
    ? compact
      ? "top-0.5 right-0.5 h-5 w-5"
      : "top-1 right-1 h-6 w-6"
    : "top-1.5 right-1.5 h-7 w-7 sm:top-2 sm:right-2 sm:h-8 sm:w-8";
  const iconClass = isList
    ? compact
      ? "h-3 w-3"
      : "h-3.5 w-3.5"
    : "h-3.5 w-3.5 sm:h-4 sm:w-4";

  return (
    <button
      type="button"
      aria-label="Enviar imagem do cliente"
      title="Adicionar imagem"
      className={`absolute z-20 flex items-center justify-center rounded-full bg-black/55 text-white backdrop-blur-sm transition-all duration-200 hover:scale-105 hover:bg-black/75 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1 ${buttonClass} ${isUploading ? "pointer-events-none" : ""} ${isDragOver ? "ring-2 ring-primary ring-offset-1" : ""}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      disabled={isUploading}
      onClick={() => document.getElementById(inputId)?.click()}
    >
      <input
        id={inputId}
        type="file"
        accept={ACCEPT}
        onChange={handleFileInputChange}
        className="hidden"
        disabled={isUploading}
      />
      {isUploading ? (
        <Loader2 className={`${iconClass} animate-spin`} />
      ) : (
        <Upload className={iconClass} />
      )}
    </button>
  );
}
