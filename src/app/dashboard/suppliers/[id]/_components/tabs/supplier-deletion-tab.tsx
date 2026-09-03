"use client";

import { Loader2, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { DetailDeletionCard } from "@/app/dashboard/_components/detail-page";
import { deleteSupplierAction } from "@/app/dashboard/suppliers/_actions/supplier-actions";
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
import { Separator } from "@/components/ui/separator";
import type { UISupplier } from "@/services/api-main/supplier";

interface SupplierDeletionTabProps {
  supplier: Pick<UISupplier, "id" | "name">;
  returnTo: string;
}

export function SupplierDeletionTab({
  supplier,
  returnTo,
}: SupplierDeletionTabProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const result = await deleteSupplierAction(supplier.id);
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
          A API validará relações existentes antes de aceitar a exclusão.
        </p>
        <Separator />
        <Button
          type="button"
          variant="destructive"
          disabled={isDeleting}
          onClick={() => setIsOpen(true)}
        >
          <Trash2 className="size-4" />
          Excluir fornecedor
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
            <AlertDialogTitle>Excluir “{supplier.name}”?</AlertDialogTitle>
            <AlertDialogDescription>
              A API validará possíveis vínculos antes da exclusão. Esta ação não
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
