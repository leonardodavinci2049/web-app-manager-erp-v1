"use client";

import { Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { deleteTaxonomyRelationship } from "@/app/actions/action-taxonomy";
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

interface DeleteCategoryButtonProps {
  taxonomyId: number;
  taxonomyName: string;
  productId: number;
  onSuccess?: () => void;
}

/**
 * DeleteCategoryButton Component
 *
 * Button with confirmation dialog to delete a category relationship from a product.
 * Uses Dialog component to avoid issues with AlertDialog in Next.js.
 */
export function DeleteCategoryButton({
  taxonomyId,
  taxonomyName,
  productId,
  onSuccess,
}: DeleteCategoryButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDelete() {
    setIsDeleting(true);

    try {
      const result = await deleteTaxonomyRelationship(taxonomyId, productId);

      if (result.success) {
        toast.success(result.message);
        setIsOpen(false);
        onSuccess?.();
      } else {
        toast.error(result.message);
      }
    } catch {
      toast.error("Erro inesperado ao remover categoria");
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-destructive"
          title="Remover categoria"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Remover Categoria</DialogTitle>
          <DialogDescription>
            Tem certeza que deseja remover a categoria{" "}
            <strong>{taxonomyName}</strong> deste produto? Esta ação não pode
            ser desfeita.
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
            {isDeleting ? "Removendo..." : "Remover"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
