"use client";

import { Building2, TriangleAlert } from "lucide-react";
import { type FormEvent, useState } from "react";
import { toast } from "sonner";
import { createSupplierAction } from "@/app/dashboard/suppliers/_actions/supplier-actions";
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

interface SupplierCreateSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (supplierId: number) => void;
}

export function SupplierCreateSheet({
  open,
  onOpenChange,
  onCreated,
}: SupplierCreateSheetProps) {
  const [name, setName] = useState("");
  const [error, setError] = useState<string>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDiscardOpen, setIsDiscardOpen] = useState(false);
  const isDirty = name.trim() !== "";

  const resetAndClose = () => {
    setName("");
    setError(undefined);
    onOpenChange(false);
  };

  const requestOpenChange = (nextOpen: boolean) => {
    if (!nextOpen && isDirty) {
      setIsDiscardOpen(true);
      return;
    }
    if (nextOpen) onOpenChange(true);
    else resetAndClose();
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) {
      setError("Informe o nome do fornecedor.");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await createSupplierAction({ name: trimmedName });
      if (!result.success || !result.supplierId) {
        setError(result.fieldErrors?.name?.[0]);
        toast.error(result.message);
        return;
      }
      toast.success(result.message);
      const supplierId = result.supplierId;
      setName("");
      setError(undefined);
      onOpenChange(false);
      onCreated(supplierId);
    } catch {
      toast.error("Não foi possível concluir a comunicação com o servidor.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Sheet open={open} onOpenChange={requestOpenChange}>
        <SheetContent
          side="right"
          className="flex w-[92vw] max-w-md flex-col gap-0 p-0 sm:max-w-md"
        >
          <SheetHeader className="shrink-0 border-b p-5 pr-12">
            <SheetTitle className="flex items-center gap-2">
              <Building2 className="text-primary size-5" />
              Adicionar fornecedor
            </SheetTitle>
          </SheetHeader>

          <form
            onSubmit={handleSubmit}
            className="flex min-h-0 flex-1 flex-col"
          >
            <fieldset
              disabled={isSubmitting}
              className="min-h-0 flex-1 space-y-5 overflow-y-auto p-5"
            >
              <div className="space-y-2">
                <Label htmlFor="supplier-create-name">
                  Nome
                  <span className="text-destructive" aria-hidden="true">
                    *
                  </span>
                </Label>
                <Input
                  id="supplier-create-name"
                  value={name}
                  onChange={(event) => {
                    setName(event.target.value);
                    setError(undefined);
                  }}
                  maxLength={100}
                  autoFocus
                  autoComplete="off"
                  placeholder="Ex.: Distribuidora Acme"
                  aria-invalid={Boolean(error)}
                  aria-describedby={
                    error ? "supplier-create-name-error" : undefined
                  }
                />
                {error && (
                  <p
                    id="supplier-create-name-error"
                    className="text-destructive text-sm"
                  >
                    {error}
                  </p>
                )}
                <p className="text-muted-foreground text-xs">
                  O identificador e o slug serão gerados automaticamente.
                </p>
              </div>
            </fieldset>

            <SheetFooter className="shrink-0 border-t p-4 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => requestOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Criando..." : "Criar fornecedor"}
              </Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>

      <AlertDialog open={isDiscardOpen} onOpenChange={setIsDiscardOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogMedia>
              <TriangleAlert />
            </AlertDialogMedia>
            <AlertDialogTitle>Descartar cadastro não salvo?</AlertDialogTitle>
            <AlertDialogDescription>
              O nome digitado será perdido ao fechar o painel.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Continuar preenchendo</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() => {
                setIsDiscardOpen(false);
                resetAndClose();
              }}
            >
              Descartar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
