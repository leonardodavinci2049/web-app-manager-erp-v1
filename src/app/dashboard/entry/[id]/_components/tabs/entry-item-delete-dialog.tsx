"use client";

import { Loader2, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { deleteEntryItemAction } from "../../_actions/entry-item-actions";
import type { EntryItemViewModel } from "./entry-items-tab";

interface EntryItemDeleteDialogProps {
  entryId: number;
  item: EntryItemViewModel | null;
  onOpenChange: (open: boolean) => void;
}

export function EntryItemDeleteDialog({
  entryId,
  item,
  onOpenChange,
}: EntryItemDeleteDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleConfirm = async () => {
    if (!item || isDeleting) return;

    setIsDeleting(true);
    try {
      const result = await deleteEntryItemAction({
        entryId,
        itemId: item.id,
      });
      if (result.success) {
        toast.success(result.message);
        onOpenChange(false);
      } else {
        toast.error(result.message);
      }
    } catch {
      toast.error(
        "Não foi possível comunicar com o servidor. Tente novamente.",
      );
    }
    setIsDeleting(false);
  };

  const handleOpenChange = (open: boolean) => {
    if (isDeleting) return;
    onOpenChange(open);
  };

  return (
    <AlertDialog open={item !== null} onOpenChange={handleOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogMedia>
            <Trash2 aria-hidden="true" />
          </AlertDialogMedia>
          <AlertDialogTitle>Excluir item da entrada?</AlertDialogTitle>
          <AlertDialogDescription>
            {item ? (
              <>
                O item #{item.id} — {item.productName} (Produto #
                {item.productId}) será removido desta entrada. Esta ação não
                pode ser desfeita.
              </>
            ) : (
              "Esta ação não pode ser desfeita."
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            disabled={isDeleting}
            onClick={(event) => {
              event.preventDefault();
              void handleConfirm();
            }}
          >
            {isDeleting ? (
              <>
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                Excluindo...
              </>
            ) : (
              "Excluir item"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
