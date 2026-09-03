"use client";

import { Loader2, Trash2 } from "lucide-react";
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
import { Button } from "@/components/ui/button";
import { deletePtypeAction } from "../../_actions/ptype-detail-actions";

interface PtypeDeletionTabProps {
  ptypeId: number;
  ptypeName: string;
  returnTo: string;
}

export function PtypeDeletionTab({
  ptypeId,
  ptypeName,
  returnTo,
}: PtypeDeletionTabProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const result = await deletePtypeAction(ptypeId);
      if (!result.success) {
        toast.error(result.message);
        return;
      }
      toast.success(result.message);
      setIsOpen(false);
      router.replace(returnTo);
    } catch {
      toast.error("Não foi possível concluir a comunicação com o servidor.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <DetailDeletionCard>
        <p className="text-muted-foreground text-sm">
          A API verificará vínculos existentes e informará quando a exclusão não
          for permitida.
        </p>
        <Button
          type="button"
          variant="destructive"
          disabled={isDeleting}
          onClick={() => setIsOpen(true)}
        >
          <Trash2 className="size-4" />
          Excluir tipo de produto
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
              <Trash2 className="text-destructive" />
            </AlertDialogMedia>
            <AlertDialogTitle>Excluir tipo de produto?</AlertDialogTitle>
            <AlertDialogDescription>
              A API validará se “{ptypeName}” pode ser excluído. Esta ação não
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
              onClick={handleDelete}
            >
              {isDeleting && <Loader2 className="size-4 animate-spin" />}
              {isDeleting ? "Excluindo..." : "Excluir definitivamente"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
