"use client";

import { Building2, Loader2, Save, UserRound } from "lucide-react";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";
import { toast } from "sonner";
import {
  updateCustomerBusinessAction,
  updateCustomerPersonalAction,
} from "@/app/dashboard/customer/_actions/customer-actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { UICustomerDetail } from "@/services/api-main/customer-general";
import type { CustomerActionResult } from "../../_components/types/customer-dashboard-types";

type SavingSection = "person" | "business" | null;

interface CustomerPersonBusinessSectionsProps {
  customer: UICustomerDetail;
  personTypeId: number;
}

function SectionButton({ saving, label }: { saving: boolean; label: string }) {
  return (
    <Button type="submit" disabled={saving}>
      {saving ? (
        <Loader2 className="size-4 animate-spin" />
      ) : (
        <Save className="size-4" />
      )}
      {saving ? "Salvando..." : label}
    </Button>
  );
}

export function CustomerPersonBusinessSections({
  customer,
  personTypeId,
}: CustomerPersonBusinessSectionsProps) {
  const router = useRouter();
  const [personValues, setPersonValues] = useState({
    cpf: customer.cpf,
    firstName: customer.firstName ?? "",
    lastName: customer.lastName ?? "",
    birthDate: customer.birthDate?.slice(0, 10) ?? "",
  });
  const [businessValues, setBusinessValues] = useState({
    cnpj: customer.cnpj,
    companyName: customer.companyName,
    stateRegistration: customer.stateRegistration ?? "",
    municipalRegistration: customer.municipalRegistration ?? "",
    responsibleName: customer.responsibleName ?? "",
    mainActivity: customer.mainActivity ?? "",
  });
  const [errors, setErrors] = useState<Record<string, string[] | undefined>>(
    {},
  );
  const [savingSection, setSavingSection] = useState<SavingSection>(null);

  const runAction = async (
    section: "person" | "business",
    action: Promise<CustomerActionResult>,
  ) => {
    setSavingSection(section);
    setErrors({});
    try {
      const result = await action;
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
      setSavingSection(null);
    }
  };

  const setPersonField = <Key extends keyof typeof personValues>(
    field: Key,
    value: (typeof personValues)[Key],
  ) => {
    setPersonValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  };

  const setBusinessField = <Key extends keyof typeof businessValues>(
    field: Key,
    value: (typeof businessValues)[Key],
  ) => {
    setBusinessValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  };

  const personField = (
    name: keyof typeof personValues,
    label: string,
    options: { type?: string; maxLength?: number; required?: boolean } = {},
  ) => (
    <div className="space-y-1">
      <Label htmlFor={`customer-person-${name}`}>
        {label}
        {options.required ? " *" : ""}
      </Label>
      <Input
        id={`customer-person-${name}`}
        type={options.type}
        value={personValues[name]}
        maxLength={options.maxLength}
        required={options.required}
        disabled={savingSection !== null}
        aria-invalid={Boolean(errors[name]?.[0])}
        onChange={(event) => setPersonField(name, event.target.value)}
      />
      {errors[name]?.[0] && (
        <p className="text-destructive text-xs">{errors[name]?.[0]}</p>
      )}
    </div>
  );

  const businessField = (
    name: keyof typeof businessValues,
    label: string,
    options: { type?: string; maxLength?: number; required?: boolean } = {},
  ) => (
    <div className="space-y-1">
      <Label htmlFor={`customer-business-${name}`}>
        {label}
        {options.required ? " *" : ""}
      </Label>
      <Input
        id={`customer-business-${name}`}
        type={options.type}
        value={businessValues[name]}
        maxLength={options.maxLength}
        required={options.required}
        disabled={savingSection !== null}
        aria-invalid={Boolean(errors[name]?.[0])}
        onChange={(event) => setBusinessField(name, event.target.value)}
      />
      {errors[name]?.[0] && (
        <p className="text-destructive text-xs">{errors[name]?.[0]}</p>
      )}
    </div>
  );

  return (
    <>
      {personTypeId === 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <UserRound className="size-4" />
              Pessoa Física
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form
              className="space-y-4"
              onSubmit={(event: FormEvent<HTMLFormElement>) => {
                event.preventDefault();
                runAction(
                  "person",
                  updateCustomerPersonalAction({
                    customerId: customer.id,
                    cpf: personValues.cpf,
                    firstName: personValues.firstName,
                    lastName: personValues.lastName,
                    birthDate: personValues.birthDate,
                    imagePath: customer.imagePath ?? "",
                  }),
                );
              }}
            >
              <div className="grid gap-4 sm:grid-cols-2">
                {personField("cpf", "CPF", { maxLength: 100 })}
                {personField("birthDate", "Data de nascimento", {
                  type: "date",
                })}
                {personField("firstName", "Primeiro nome", { maxLength: 300 })}
                {personField("lastName", "Sobrenome", { maxLength: 100 })}
              </div>
              <SectionButton
                saving={savingSection === "person"}
                label="Salvar dados pessoais"
              />
            </form>
          </CardContent>
        </Card>
      )}

      {personTypeId === 2 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Building2 className="size-4" />
              Pessoa Jurídica
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form
              className="space-y-4"
              onSubmit={(event: FormEvent<HTMLFormElement>) => {
                event.preventDefault();
                runAction(
                  "business",
                  updateCustomerBusinessAction({
                    customerId: customer.id,
                    cnpj: businessValues.cnpj,
                    companyName: businessValues.companyName,
                    stateRegistration: businessValues.stateRegistration,
                    municipalRegistration: businessValues.municipalRegistration,
                    responsibleName: businessValues.responsibleName,
                    mainActivity: businessValues.mainActivity,
                  }),
                );
              }}
            >
              <div className="grid gap-4 sm:grid-cols-2">
                {businessField("cnpj", "CNPJ", {
                  maxLength: 100,
                  required: true,
                })}
                {businessField("companyName", "Razão social", {
                  maxLength: 300,
                  required: true,
                })}
                {businessField("stateRegistration", "Inscrição estadual", {
                  maxLength: 100,
                })}
                {businessField("municipalRegistration", "Inscrição municipal", {
                  maxLength: 100,
                })}
                {businessField("responsibleName", "Nome do responsável", {
                  maxLength: 300,
                })}
                {businessField("mainActivity", "Atividade principal", {
                  maxLength: 300,
                })}
              </div>
              <SectionButton
                saving={savingSection === "business"}
                label="Salvar dados empresariais"
              />
            </form>
          </CardContent>
        </Card>
      )}
    </>
  );
}
