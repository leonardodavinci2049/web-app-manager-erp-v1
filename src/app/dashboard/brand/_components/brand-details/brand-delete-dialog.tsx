"use client";

import { Loader2, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { deleteBrandAction } from "@/app/dashboard/brand/_actions/brand-actions";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

interface BrandDeleteDialogProps {
  brandId: number;
  brandName: string;
  blocked: boolean;
  blockedReason?: string;
  onSuccess: () => void;
}

/**
 * Confirmacao de exclusao de marca (Client). Exige AlertDialog citando o nome
 * da marca. Quando bloqueada (produtos relacionados), desabilita a acao e
 * explica o impedimento. A Server Action reconsulta os vinculos antes de
 * excluir para cobrir chamadas diretas e concorrencia.
 */
export function BrandDeleteDialog({
  brandId,
  brandName,
  blocked,
  blockedReason,
  onSuccess,
}: BrandDeleteDialogProps) {
  const [open, setOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);

  const handleConfirm = async () => {
    setIsPending(true);
    try {
      const result = await deleteBrandAction(brandId);
      if (!result.success) {
        toast.error(result.message ?? "Não foi possível excluir a marca.");
        setOpen(false);
        return;
      }
      toast.success(result.message ?? "Marca excluída com sucesso.");
      setOpen(false);
      onSuccess();
    } catch {
      toast.error(
        "Não foi possível concluir a comunicação com o servidor. Tente novamente.",
      );
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="space-y-2">
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogTrigger asChild>
          <Button
            type="button"
            variant="destructive"
            className="w-full gap-2"
            disabled={blocked}
          >
            <Trash2 className="size-4" aria-hidden="true" />
            Excluir marca
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir a marca “{brandName}”?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. A marca{" "}
              <strong>{brandName}</strong> (ID: {brandId}) será removida
              permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={(e) => {
                e.preventDefault();
                handleConfirm();
              }}
              disabled={isPending}
            >
              {isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Excluindo...
                </>
              ) : (
                "Excluir definitivamente"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      {blocked && blockedReason && (
        <p className="text-destructive text-xs">{blockedReason}</p>
      )}
    </div>
  );
}
