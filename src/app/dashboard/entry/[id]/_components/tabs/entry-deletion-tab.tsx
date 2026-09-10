"use client";

import { Loader2, LockKeyhole, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { DetailDeletionCard } from "@/app/dashboard/_components/detail-page";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import type { UIEntryDetail } from "@/services/api-main/entry";
import { deleteEntryAction } from "../../_actions/entry-detail-actions";
import { getEntryDeletionBlocker } from "../entry-deletion-requirements";

interface EntryDeletionTabProps {
  entry: Pick<
    UIEntryDetail,
    "id" | "invoiceNumber" | "isStockClosed" | "summary"
  >;
  returnTo: string;
}

export function EntryDeletionTab({ entry, returnTo }: EntryDeletionTabProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const deletionBlocker = getEntryDeletionBlocker(entry);
  const entryLabel = entry.invoiceNumber.trim()
    ? `nota “${entry.invoiceNumber}”`
    : `entrada #${entry.id}`;

  const handleDelete = async () => {
    if (deletionBlocker || isDeleting) return;

    setIsDeleting(true);
    try {
      const result = await deleteEntryAction({ entryId: entry.id });
      if (!result.success) {
        toast.error(result.message);
        return;
      }

      toast.success(result.message);
      setIsOpen(false);
      router.replace(returnTo);
    } catch {
      toast.error(
        "Não foi possível concluir a comunicação com o servidor. Tente novamente.",
      );
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <DetailDeletionCard
        titleIcon={<LockKeyhole className="size-4" aria-hidden="true" />}
        badge={
          deletionBlocker ? (
            <Badge variant="secondary">Exclusão bloqueada</Badge>
          ) : undefined
        }
      >
        <p className="text-muted-foreground text-sm">
          A entrada só pode ser excluída antes da conclusão e enquanto não
          possuir movimentações de itens.
        </p>
        {deletionBlocker && (
          <p className="text-destructive text-sm">{deletionBlocker}</p>
        )}
        <Separator />
        <Button
          type="button"
          variant="destructive"
          disabled={Boolean(deletionBlocker) || isDeleting}
          onClick={() => setIsOpen(true)}
        >
          <Trash2 className="size-4" aria-hidden="true" />
          Excluir entrada
        </Button>
      </DetailDeletionCard>

      <AlertDialog
        open={isOpen}
        onOpenChange={(open) => {
          if (!isDeleting) setIsOpen(open);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogMedia>
              <Trash2 className="text-destructive" aria-hidden="true" />
            </AlertDialogMedia>
            <AlertDialogTitle>Excluir a {entryLabel}?</AlertDialogTitle>
            <AlertDialogDescription>
              A nota de entrada será removida permanentemente. Esta ação não
              pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>
              Cancelar
            </AlertDialogCancel>
            <Button
              type="button"
              variant="destructive"
              disabled={isDeleting}
              onClick={() => void handleDelete()}
            >
              {isDeleting && (
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              )}
              {isDeleting ? "Excluindo..." : "Excluir definitivamente"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
