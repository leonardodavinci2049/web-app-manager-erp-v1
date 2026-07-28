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
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { BrandCreateForm } from "./brand-create-form";

interface BrandCreateSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (brandId: number) => void;
}

export function BrandCreateSheet({
  open,
  onOpenChange,
  onCreated,
}: BrandCreateSheetProps) {
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

  const handleCreated = (brandId: number) => {
    resetAndClose();
    onCreated(brandId);
  };

  return (
    <>
      <Sheet open={open} onOpenChange={requestOpenChange}>
        <SheetContent
          side="right"
          className="flex w-[90vw] max-w-md flex-col gap-0 p-0 sm:max-w-md"
        >
          <SheetHeader className="shrink-0 border-b p-4 pr-12 sm:p-6 sm:pr-14">
            <SheetTitle className="flex items-center gap-2 text-lg">
              <Plus className="text-primary size-5" aria-hidden="true" />
              Adicionar marca
            </SheetTitle>
          </SheetHeader>

          <BrandCreateForm
            key={formKey}
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
            <AlertDialogTitle>Descartar marca não salva?</AlertDialogTitle>
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
