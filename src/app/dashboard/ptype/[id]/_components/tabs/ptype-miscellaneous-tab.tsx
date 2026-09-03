"use client";

import {
  CalendarDays,
  CheckCircle2,
  CircleOff,
  Loader2,
  TriangleAlert,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
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
import { setPtypeStatusAction } from "../../_actions/ptype-detail-actions";

interface PtypeMiscellaneousTabProps {
  ptypeId: number;
  inactive?: boolean;
  createdAt?: string;
}

function formatDate(value?: string): string {
  if (!value) return "Não informada";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "long" }).format(date);
}

export function PtypeMiscellaneousTab({
  ptypeId,
  inactive,
  createdAt,
}: PtypeMiscellaneousTabProps) {
  const router = useRouter();
  const [confirmation, setConfirmation] = useState<"activate" | "deactivate">();
  const [isMutating, setIsMutating] = useState(false);

  const confirmationCopy =
    confirmation === "deactivate"
      ? {
          title: "Marcar como inativo?",
          description:
            "Confirme que deseja definir explicitamente este tipo como inativo.",
          action: "Marcar como inativo",
        }
      : {
          title: "Marcar como ativo?",
          description:
            "Confirme que deseja definir explicitamente este tipo como ativo.",
          action: "Marcar como ativo",
        };

  const executeConfirmation = async () => {
    if (!confirmation) return;
    setIsMutating(true);
    try {
      const result = await setPtypeStatusAction({
        ptypeId,
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

  return (
    <>
      <div className="space-y-4">
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="text-base">Status do cadastro</CardTitle>
            <Badge variant={inactive ? "destructive" : "secondary"}>
              {inactive ? "Inativo" : "Ativo"}
            </Badge>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-muted-foreground text-xs">
              Confirme a operação para definir explicitamente o status deste
              tipo de produto.
            </p>
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => setConfirmation("activate")}
              disabled={isMutating}
            >
              <CheckCircle2 className="size-4" />
              Marcar como ativo
            </Button>
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => setConfirmation("deactivate")}
              disabled={isMutating}
            >
              <CircleOff className="size-4" />
              Marcar como inativo
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <CalendarDays className="size-4" aria-hidden="true" />
              Cadastro
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-xs">Data de cadastro</p>
            <p className="mt-1 text-sm font-medium">{formatDate(createdAt)}</p>
          </CardContent>
        </Card>
      </div>

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
              onClick={executeConfirmation}
              disabled={isMutating}
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
