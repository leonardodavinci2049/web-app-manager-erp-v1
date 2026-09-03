"use client";

import { CheckCircle2, CircleOff, Loader2, TriangleAlert } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { setSupplierStatusAction } from "@/app/dashboard/suppliers/_actions/supplier-actions";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { UISupplier } from "@/services/api-main/supplier";
import { SupplierDetailField } from "../supplier-detail-field";

type StatusConfirmation = "activate" | "deactivate";

interface SupplierStatusTabProps {
  supplier: UISupplier;
}

export function SupplierStatusTab({ supplier }: SupplierStatusTabProps) {
  const router = useRouter();
  const [confirmation, setConfirmation] = useState<StatusConfirmation>();
  const [isMutating, setIsMutating] = useState(false);

  const executeConfirmation = async () => {
    if (!confirmation) return;
    setIsMutating(true);

    try {
      const result = await setSupplierStatusAction({
        supplierId: supplier.id,
        inactive: confirmation === "deactivate",
      });
      if (!result.success) {
        toast.error(result.message);
        return;
      }
      toast.success(result.message);
      setConfirmation(undefined);
      router.refresh();
    } catch {
      toast.error("Não foi possível concluir a comunicação com o servidor.");
    } finally {
      setIsMutating(false);
    }
  };

  const confirmationCopy =
    confirmation === "deactivate"
      ? {
          title: "Marcar fornecedor como inativo?",
          description:
            "Confirme que deseja definir explicitamente este fornecedor como inativo.",
          action: "Marcar como inativo",
        }
      : {
          title: "Marcar fornecedor como ativo?",
          description:
            "Confirme que deseja definir explicitamente este fornecedor como ativo.",
          action: "Marcar como ativo",
        };

  return (
    <>
      <Card className="gap-4 py-4 sm:gap-6 sm:py-6">
        <CardHeader className="flex-row items-center justify-between px-4 sm:px-6">
          <CardTitle className="text-base">Status</CardTitle>
          <Badge variant={supplier.inactive ? "destructive" : "secondary"}>
            {supplier.inactive ? "Inativo" : "Ativo"}
          </Badge>
        </CardHeader>
        <CardContent className="space-y-4 px-4 sm:px-6">
          <dl className="grid gap-4 sm:grid-cols-2">
            <SupplierDetailField
              label="Fretador"
              value={
                supplier.freightForwarder === undefined
                  ? undefined
                  : supplier.freightForwarder
                    ? "Sim"
                    : "Não"
              }
            />
            <SupplierDetailField
              label="Status do cadastro"
              value={supplier.inactive ? "Inativo" : "Ativo"}
            />
          </dl>
          <Separator />
          <p className="text-muted-foreground text-xs">
            Confirme a operação para definir explicitamente o status deste
            fornecedor.
          </p>
          <div className="grid gap-2 sm:grid-cols-2">
            <Button
              type="button"
              variant="outline"
              disabled={isMutating || !supplier.inactive}
              onClick={() => setConfirmation("activate")}
            >
              <CheckCircle2 className="size-4" />
              Marcar como ativo
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={isMutating || supplier.inactive}
              onClick={() => setConfirmation("deactivate")}
            >
              <CircleOff className="size-4" />
              Marcar como inativo
            </Button>
          </div>
        </CardContent>
      </Card>

      <AlertDialog
        open={Boolean(confirmation)}
        onOpenChange={(open) => {
          if (!open && !isMutating) setConfirmation(undefined);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogMedia>
              <TriangleAlert />
            </AlertDialogMedia>
            <AlertDialogTitle>{confirmationCopy.title}</AlertDialogTitle>
            <AlertDialogDescription>
              {confirmationCopy.description}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isMutating}>
              Cancelar
            </AlertDialogCancel>
            <Button
              type="button"
              disabled={isMutating}
              onClick={executeConfirmation}
            >
              {isMutating && <Loader2 className="size-4 animate-spin" />}
              {confirmationCopy.action}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
