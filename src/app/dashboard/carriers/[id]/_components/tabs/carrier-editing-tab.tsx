"use client";

import { Loader2, Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";
import { toast } from "sonner";
import { updateCarrierAction } from "@/app/dashboard/carriers/_actions/carrier-actions";
import { CarrierFormFields } from "@/app/dashboard/carriers/_components/carrier-form-fields";
import type { CarrierFormValues } from "@/app/dashboard/carriers/_components/types/carrier-dashboard-types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { UICarrier } from "@/services/api-main/carrier";

interface CarrierEditingTabProps {
  carrier: UICarrier;
}

function toFormValues(carrier: UICarrier): CarrierFormValues {
  return {
    typePersonId: carrier.typePersonId || 0,
    name: carrier.name,
    phone: carrier.phone ?? "",
    whatsapp: carrier.whatsapp ?? "",
    email: carrier.email ?? "",
    website: carrier.website ?? "",
    cnpj: carrier.cnpj ?? "",
    companyName: carrier.companyName ?? "",
    responsibleName: carrier.responsibleName ?? "",
    cpf: carrier.cpf ?? "",
    imagePath: carrier.imagePath ?? "",
    notes: carrier.notes ?? "",
  };
}

export function CarrierEditingTab({ carrier }: CarrierEditingTabProps) {
  const router = useRouter();
  const [values, setValues] = useState<CarrierFormValues>(() =>
    toFormValues(carrier),
  );
  const [errors, setErrors] = useState<Record<string, string[] | undefined>>(
    {},
  );
  const [isSaving, setIsSaving] = useState(false);

  const setField = <Key extends keyof CarrierFormValues>(
    field: Key,
    value: CarrierFormValues[Key],
  ) => {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSaving(true);
    setErrors({});
    try {
      const result = await updateCarrierAction({
        carrierId: carrier.id,
        ...values,
      });
      if (!result.success) {
        setErrors(result.fieldErrors ?? {});
        toast.error(result.message);
        return;
      }
      toast.success(result.message);
      router.refresh();
    } catch {
      toast.error("Não foi possível concluir a comunicação com o servidor.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card className="gap-4 py-4 sm:gap-6 sm:py-6">
      <CardHeader className="px-4 sm:px-6">
        <CardTitle className="text-base">
          Editar dados da transportadora
        </CardTitle>
      </CardHeader>
      <CardContent className="px-4 sm:px-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <CarrierFormFields
            values={values}
            errors={errors}
            disabled={isSaving}
            idPrefix="carrier-detail"
            notesAreWriteOnly={false}
            onChange={setField}
          />
          <Button
            type="submit"
            disabled={
              isSaving ||
              values.name.trim() === "" ||
              values.notes.length > 2000
            }
          >
            {isSaving ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Save className="size-4" />
            )}
            {isSaving ? "Salvando..." : "Salvar alterações"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
