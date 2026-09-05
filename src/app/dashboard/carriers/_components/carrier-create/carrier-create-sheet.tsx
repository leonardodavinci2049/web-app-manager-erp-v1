"use client";

import { TriangleAlert, Truck } from "lucide-react";
import { type FormEvent, useState } from "react";
import { toast } from "sonner";
import { createCarrierAction } from "@/app/dashboard/carriers/_actions/carrier-actions";
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
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { CarrierFormFields } from "../carrier-form-fields";
import type { CarrierFormValues } from "../types/carrier-dashboard-types";

const EMPTY_VALUES: CarrierFormValues = {
  typePersonId: 0,
  name: "",
  phone: "",
  whatsapp: "",
  email: "",
  website: "",
  cnpj: "",
  companyName: "",
  responsibleName: "",
  cpf: "",
  imagePath: "",
  notes: "",
};

interface CarrierCreateSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (carrierId: number) => void;
}

export function CarrierCreateSheet({
  open,
  onOpenChange,
  onCreated,
}: CarrierCreateSheetProps) {
  const [values, setValues] = useState<CarrierFormValues>(EMPTY_VALUES);
  const [errors, setErrors] = useState<Record<string, string[] | undefined>>(
    {},
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDiscardOpen, setIsDiscardOpen] = useState(false);
  const isDirty =
    values.typePersonId !== 0 ||
    Object.entries(values).some(
      ([key, value]) => key !== "typePersonId" && String(value).trim() !== "",
    );

  const resetAndClose = () => {
    setValues(EMPTY_VALUES);
    setErrors({});
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

  const setField = <Key extends keyof CarrierFormValues>(
    field: Key,
    value: CarrierFormValues[Key],
  ) => {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setErrors({});
    try {
      const result = await createCarrierAction(values);
      if (!result.success || !result.carrierId) {
        setErrors(result.fieldErrors ?? {});
        toast.error(result.message);
        return;
      }
      toast.success(result.message);
      const carrierId = result.carrierId;
      setValues(EMPTY_VALUES);
      onOpenChange(false);
      onCreated(carrierId);
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
          className="flex w-[96vw] max-w-2xl flex-col gap-0 p-0 sm:max-w-2xl"
        >
          <SheetHeader className="shrink-0 border-b p-5 pr-12">
            <SheetTitle className="flex items-center gap-2">
              <Truck className="text-primary size-5" />
              Adicionar transportadora
            </SheetTitle>
          </SheetHeader>
          <form
            onSubmit={handleSubmit}
            className="flex min-h-0 flex-1 flex-col"
          >
            <fieldset
              disabled={isSubmitting}
              className="min-h-0 flex-1 overflow-y-auto p-5"
            >
              <CarrierFormFields
                values={values}
                errors={errors}
                disabled={isSubmitting}
                idPrefix="carrier-create"
                onChange={setField}
              />
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
                {isSubmitting ? "Criando..." : "Criar transportadora"}
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
              Os dados preenchidos serão perdidos ao fechar o painel.
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
