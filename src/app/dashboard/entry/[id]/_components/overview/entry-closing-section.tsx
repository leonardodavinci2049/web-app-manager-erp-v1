"use client";

import {
  CheckCircle2,
  Loader2,
  LockKeyhole,
  MessageCircle,
  Printer,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import type { EntryActionResult } from "@/app/dashboard/entry/_components/types/entry-dashboard-types";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { UIEntryDetail } from "@/services/api-main/entry";
import { processEntryInventoryAction } from "../../_actions/entry-detail-actions";
import { getEntryClosingBlockers } from "../entry-closing-requirements";
import { EntrySectionCard } from "../entry-section-card";

interface EntryClosingSectionProps {
  entry: Pick<
    UIEntryDetail,
    | "id"
    | "invoiceNumber"
    | "model"
    | "freightValue"
    | "totalInvoice"
    | "summary"
    | "isStockClosed"
  >;
}

export function EntryClosingSection({ entry }: EntryClosingSectionProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isFinalizing, setIsFinalizing] = useState(false);
  const [serverBlockers, setServerBlockers] = useState<string[]>([]);
  const clientBlockers = getEntryClosingBlockers(entry);
  const blockers = serverBlockers.length > 0 ? serverBlockers : clientBlockers;

  const handleOpenChange = (open: boolean) => {
    if (isFinalizing) return;
    setIsOpen(open);
    if (!open) setServerBlockers([]);
  };

  const handleOpen = () => {
    setServerBlockers([]);
    setIsOpen(true);
  };

  const handleFinalize = async () => {
    setIsFinalizing(true);
    try {
      const result: EntryActionResult = await processEntryInventoryAction({
        entryId: entry.id,
      });

      if (!result.success) {
        setServerBlockers(result.fieldErrors?.closing ?? []);
        toast.error(result.message);
        router.refresh();
        return;
      }

      toast.success(result.message);
      setIsOpen(false);
      router.refresh();
    } catch {
      toast.error("Não foi possível concluir a comunicação com o servidor.");
    } finally {
      setIsFinalizing(false);
    }
  };

  return (
    <>
      <EntrySectionCard
        icon={<LockKeyhole className="size-4" />}
        title="Fechamento da entrada"
        action={
          entry.isStockClosed ? (
            <Badge variant="secondary">Nota fechada</Badge>
          ) : undefined
        }
      >
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <Button type="button" variant="outline" disabled>
              <Printer className="size-4" aria-hidden="true" />
              Imprimir
            </Button>
            <Button type="button" variant="outline" disabled>
              <MessageCircle className="size-4" aria-hidden="true" />
              Enviar para WhatsApp
            </Button>
          </div>
          <Button
            type="button"
            className="w-full"
            disabled={entry.isStockClosed || isFinalizing}
            onClick={handleOpen}
          >
            <CheckCircle2 className="size-4" aria-hidden="true" />
            Finalizar a entrada
          </Button>
        </div>
      </EntrySectionCard>

      <AlertDialog open={isOpen} onOpenChange={handleOpenChange}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {blockers.length > 0
                ? "Não é possível finalizar a entrada"
                : "Deseja finalizar esta entrada?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {blockers.length > 0
                ? "Corrija as pendências abaixo antes de finalizar."
                : "A entrada será processada no estoque e permanecerá neste detalhe após a conclusão."}
            </AlertDialogDescription>
          </AlertDialogHeader>

          {blockers.length > 0 ? (
            <ul className="list-disc space-y-1 pl-5 text-sm">
              {blockers.map((blocker) => (
                <li key={blocker}>{blocker}</li>
              ))}
            </ul>
          ) : null}

          <AlertDialogFooter>
            <AlertDialogCancel disabled={isFinalizing}>
              {blockers.length > 0 ? "Entendi" : "Cancelar"}
            </AlertDialogCancel>
            {blockers.length === 0 ? (
              <Button
                type="button"
                disabled={isFinalizing}
                onClick={handleFinalize}
              >
                {isFinalizing ? (
                  <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                ) : (
                  <CheckCircle2 className="size-4" aria-hidden="true" />
                )}
                {isFinalizing ? "Finalizando..." : "Finalizar"}
              </Button>
            ) : null}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
