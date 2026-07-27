"use client";

import { PackagePlus, TriangleAlert } from "lucide-react";
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
import type { UIBrand } from "@/services/api-main/brand/transformers/transformers";
import type { UIPtype } from "@/services/api-main/ptype/transformers/transformers";
import { NewProductForm } from "./new-product-form";

interface NewProductSheetProps {
  open: boolean;
  brands: UIBrand[];
  ptypes: UIPtype[];
  onOpenChange: (open: boolean) => void;
  onCreated: (productId: number) => void;
}

export function NewProductSheet({
  open,
  brands,
  ptypes,
  onOpenChange,
  onCreated,
}: NewProductSheetProps) {
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

  const handleCreated = (productId: number) => {
    resetAndClose();
    onCreated(productId);
  };

  return (
    <>
      <Sheet open={open} onOpenChange={requestOpenChange}>
        <SheetContent
          side="right"
          className="flex w-[90vw] max-w-[90vw] flex-col gap-0 p-0 sm:w-[90vw] sm:max-w-3xl"
        >
          <SheetHeader className="shrink-0 border-b p-4 pr-12 sm:p-6 sm:pr-14">
            <SheetTitle className="flex items-center gap-2 text-lg">
              <PackagePlus className="text-primary size-5" aria-hidden="true" />
              Adicionar produto
            </SheetTitle>

          </SheetHeader>

          <NewProductForm
            key={formKey}
            brands={brands}
            ptypes={ptypes}
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
            <AlertDialogTitle>Descartar produto não salvo?</AlertDialogTitle>
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
