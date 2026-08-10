"use client";

import { Contact, Loader2, Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";
import { toast } from "sonner";
import { updateCustomerGeneralAction } from "@/app/dashboard/customer/_actions/customer-actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { UICustomerDetail } from "@/services/api-main/customer-general";
import type { CustomerActionResult } from "../../_components/types/customer-dashboard-types";

interface CustomerIdentitySectionProps {
  customer: UICustomerDetail;
}

interface IdentityValues {
  name: string;
  phone: string;
  whatsapp: string;
  email: string;
}

function toValues(customer: UICustomerDetail): IdentityValues {
  return {
    name: customer.name,
    phone: customer.phone,
    whatsapp: customer.whatsapp,
    email: customer.email,
  };
}

export function CustomerIdentitySection({
  customer,
}: CustomerIdentitySectionProps) {
  const router = useRouter();
  const [values, setValues] = useState<IdentityValues>(() =>
    toValues(customer),
  );
  const [errors, setErrors] = useState<Record<string, string[] | undefined>>(
    {},
  );
  const [saving, setSaving] = useState(false);

  const setField = <Key extends keyof IdentityValues>(
    field: Key,
    value: IdentityValues[Key],
  ) => {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setErrors({});
    try {
      const result: CustomerActionResult = await updateCustomerGeneralAction({
        customerId: customer.id,
        name: values.name,
        phone: values.phone,
        whatsapp: values.whatsapp,
        email: values.email,
        imagePath: customer.imagePath ?? "",
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
      setSaving(false);
    }
  };

  const field = (
    name: keyof IdentityValues,
    label: string,
    options: {
      type?: string;
      maxLength?: number;
      required?: boolean;
    } = {},
  ) => (
    <div className="space-y-1">
      <Label htmlFor={`customer-identity-${name}`}>
        {label}
        {options.required ? " *" : ""}
      </Label>
      <Input
        id={`customer-identity-${name}`}
        type={options.type}
        value={values[name]}
        maxLength={options.maxLength}
        required={options.required}
        disabled={saving}
        aria-invalid={Boolean(errors[name]?.[0])}
        onChange={(event) => setField(name, event.target.value)}
      />
      {errors[name]?.[0] && (
        <p className="text-destructive text-xs">{errors[name]?.[0]}</p>
      )}
    </div>
  );

  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Contact className="size-5" />
          Conta e identificação
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              {field("name", "Nome", { maxLength: 300, required: true })}
            </div>
            {field("phone", "Telefone", { maxLength: 100 })}
            {field("whatsapp", "WhatsApp", { maxLength: 100 })}
            <div className="sm:col-span-2">
              {field("email", "E-mail", { type: "email", maxLength: 100 })}
            </div>
          </div>
          <Button type="submit" disabled={saving}>
            {saving ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Save className="size-4" />
            )}
            {saving ? "Salvando..." : "Salvar dados gerais"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
