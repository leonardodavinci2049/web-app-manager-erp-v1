"use client";

import { Loader2, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { deleteCarrierAction } from "@/app/dashboard/carriers/_actions/carrier-actions";
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
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { UICarrier } from "@/services/api-main/carrier";

interface CarrierDeletionTabProps {
  carrier: Pick<UICarrier, "id" | "name">;
  returnTo: string;
}

export function CarrierDeletionTab({
  carrier,
  returnTo,
}: CarrierDeletionTabProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const result = await deleteCarrierAction(carrier.id);
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
      <Card className="gap-4 border-destructive/40 bg-destructive/5 py-4 sm:gap-6 sm:py-6">
        <CardHeader className="px-4 sm:px-6">
          <CardTitle className="text-destructive text-base">
            Zona de exclusão
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 px-4 sm:px-6">
          <p className="text-muted-foreground text-sm">
            A API validará eventuais vínculos antes de aceitar a exclusão.
          </p>
          <Button
            type="button"
            variant="destructive"
            disabled={isDeleting}
            onClick={() => setIsOpen(true)}
          >
            <Trash2 className="size-4" />
            Excluir transportadora
          </Button>
        </CardContent>
      </Card>

      <AlertDialog
        open={isOpen}
        onOpenChange={(open) => {
          if (!isDeleting) setIsOpen(open);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir “{carrier.name}”?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. A API verificará se o cadastro
              pode ser removido.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={isDeleting}
              onClick={(event) => {
                event.preventDefault();
                handleDelete();
              }}
            >
              {isDeleting && <Loader2 className="size-4 animate-spin" />}
              {isDeleting ? "Excluindo..." : "Excluir definitivamente"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
