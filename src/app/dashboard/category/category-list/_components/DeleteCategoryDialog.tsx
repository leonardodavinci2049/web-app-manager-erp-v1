"use client";

/**
 * Componente de Diálogo de Confirmação de Exclusão de Categoria
 *
 * Exibe um alerta de confirmação antes de deletar uma categoria
 * Usa Server Action para realizar a exclusão
 */

import { Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { deleteCategory } from "@/app/actions/action-categories";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface DeleteCategoryDialogProps {
  categoryId: number;
  categoryName: string;
  onSuccess?: () => void;
  variant?: "default" | "outline" | "ghost" | "destructive";
  size?: "default" | "sm" | "lg" | "icon";
  showLabel?: boolean;
}

export function DeleteCategoryDialog({
  categoryId,
  categoryName,
  onSuccess,
  variant = "outline",
  size = "sm",
  showLabel = false,
}: DeleteCategoryDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  async function handleDelete() {
    setIsDeleting(true);

    // Show processing toast
    const processingToast = toast.loading("Excluindo...");

    try {
      // Call Server Action to delete category
      const result = await deleteCategory(categoryId);

      // Dismiss processing toast
      toast.dismiss(processingToast);

      // Check if deletion was successful
      if (result.success) {
        // Show API message to user
        toast.success(result.message);

        // Close dialog
        setIsOpen(false);

        // Call success callback if provided
        if (onSuccess) {
          onSuccess();
        }
      } else {
        // Operation failed
        toast.error(result.message || "Erro ao excluir categoria");
      }
    } catch (error) {
      // Dismiss processing toast
      toast.dismiss(processingToast);

      console.error("Error deleting category:", error);

      // Extract error message
      const errorMessage =
        error instanceof Error ? error.message : String(error);

      toast.error(errorMessage || "Erro ao excluir categoria");
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant={variant} size={size} className="gap-2">
          <Trash2 className="h-4 w-4" />
          {showLabel && "Excluir"}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirmar exclusão</DialogTitle>
          <DialogDescription>
            Tem certeza que deseja excluir a categoria "{categoryName}"? Esta
            ação não pode ser desfeita.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={() => setIsOpen(false)}
            disabled={isDeleting}
          >
            Cancelar
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? "Excluindo..." : "Excluir"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
