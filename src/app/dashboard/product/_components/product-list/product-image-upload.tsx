"use client";

import { Loader2, Upload } from "lucide-react";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { uploadProductListImageAction } from "../../_actions/product-list-image-actions";

const MAX_FILE_SIZE = 2 * 1024 * 1024;

interface ProductImageUploadProps {
  productId: string;
  productName: string;
  viewMode: "grid" | "list";
  compact?: boolean;
  onUploadSuccess?: () => void | Promise<void>;
}

/**
 * Gatilho de upload de imagem (Client): botao compacto posicionado no canto
 * superior direito do container de imagem do produto. Mantem toda a logica de
 * validacao, envio (Server Action) e drag-and-drop. Visivel apenas quando o
 * produto exibe a imagem padrao de fallback (controlado pelo componente pai).
 */
export function ProductImageUpload({
  productId,
  productName,
  viewMode,
  compact = false,
  onUploadSuccess,
}: ProductImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  const inputId =
    viewMode === "grid"
      ? `file-input-${productId}`
      : `file-input-list-${productId}`;

  const handleImageUpload = useCallback(
    async (files: FileList | null) => {
      if (!files || files.length === 0) return;

      const file = files[0];

      if (!file.type.startsWith("image/")) {
        toast.error("Por favor, selecione apenas arquivos de imagem");
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
        formData.append("productId", productId);
        formData.append("description", `${productName} - Imagem principal`);
        formData.append("altText", `Imagem do produto ${productName}`);

        const result = await uploadProductListImageAction(formData);

        if (result.success) {
          toast.success(result.message);
          if (result.warning) toast.warning(result.warning);
          await onUploadSuccess?.();
        } else {
          toast.error(result.error || "Erro ao enviar imagem");
        }
      } catch (error) {
        console.error("Error uploading image:", error);
        toast.error("Erro ao enviar imagem");
      } finally {
        setIsUploading(false);
      }
    },
    [productId, productName, onUploadSuccess],
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
      aria-label="Enviar imagem do produto"
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
        accept="image/*"
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
