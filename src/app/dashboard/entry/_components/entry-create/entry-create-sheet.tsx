"use client";

import { Plus, TriangleAlert } from "lucide-react";
import { useState } from "react";
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
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import type { EntryCreateOptionDto } from "../types/entry-dashboard-types";
import { EntryCreateForm } from "./entry-create-form";

interface EntryCreateSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (entryId: number) => void;
  supplierOptions: EntryCreateOptionDto[];
  carrierOptions: EntryCreateOptionDto[];
}

export function EntryCreateSheet({
  open,
  onOpenChange,
  onCreated,
  supplierOptions,
  carrierOptions,
}: EntryCreateSheetProps) {
  const [isDirty, setIsDirty] = useState(false);
  const [isDiscardDialogOpen, setIsDiscardDialogOpen] = useState(false);
  const [formKey, setFormKey] = useState(0);

  const resetAndClose = () => {
    setIsDirty(false);
    setFormKey((current) => current + 1);
    onOpenChange(false);
  };

  const requestOpenChange = (nextOpen: boolean) => {
    if (!nextOpen && isDirty) {
      setIsDiscardDialogOpen(true);
      return;
    }

    if (nextOpen) {
      onOpenChange(true);
      return;
    }

    resetAndClose();
  };

  const handleCreated = (entryId: number) => {
    resetAndClose();
    onCreated(entryId);
  };

  return (
    <>
      <Sheet open={open} onOpenChange={requestOpenChange}>
        <SheetContent
          side="right"
          className="flex w-[96vw] max-w-[96vw] flex-col gap-0 p-0 sm:w-[96vw] sm:max-w-4xl"
        >
          <SheetHeader className="shrink-0 border-b p-4 pr-12 sm:px-6 sm:py-5 sm:pr-14">
            <SheetTitle className="flex items-center gap-2 text-lg">
              <Plus className="text-primary size-5" aria-hidden="true" />
              Nova entrada
            </SheetTitle>
            <SheetDescription>
              Preencha os dados principais, financeiros e fiscais da entrada.
            </SheetDescription>
          </SheetHeader>

          <EntryCreateForm
            key={formKey}
            supplierOptions={supplierOptions}
            carrierOptions={carrierOptions}
            onCancel={() => requestOpenChange(false)}
            onCreated={handleCreated}
            onDirtyChange={setIsDirty}
          />
        </SheetContent>
      </Sheet>

      <AlertDialog
        open={isDiscardDialogOpen}
        onOpenChange={setIsDiscardDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogMedia>
              <TriangleAlert aria-hidden="true" />
            </AlertDialogMedia>
            <AlertDialogTitle>Descartar entrada não salva?</AlertDialogTitle>
            <AlertDialogDescription>
              Os dados digitados serão perdidos se você fechar este painel.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Continuar preenchendo</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() => {
                setIsDiscardDialogOpen(false);
                resetAndClose();
              }}
            >
              Descartar dados
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
