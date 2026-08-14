"use client";

import { Contact, Loader2, Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { UISellerDetail } from "@/services/api-main/seller";
import { updateSellerGeneralAction } from "../../_actions/seller-actions";
import type { SellerActionResult } from "../types/seller-detail-types";

interface SellerIdentitySectionProps {
  seller: UISellerDetail;
}

interface IdentityValues {
  name: string;
  phone: string;
  whatsapp: string;
  email: string;
}

function toValues(seller: UISellerDetail): IdentityValues {
  return {
    name: seller.name,
    phone: seller.phone ?? "",
    whatsapp: seller.whatsapp ?? "",
    email: seller.email ?? "",
  };
}

export function SellerIdentitySection({ seller }: SellerIdentitySectionProps) {
  const router = useRouter();
  const [values, setValues] = useState<IdentityValues>(() => toValues(seller));
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
      const result: SellerActionResult = await updateSellerGeneralAction({
        sellerId: seller.id,
        name: values.name,
        phone: values.phone,
        whatsapp: values.whatsapp,
        email: values.email,
        imagePath: seller.imagePath ?? "",
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
      <Label htmlFor={`seller-identity-${name}`}>
        {label}
        {options.required ? " *" : ""}
      </Label>
      <Input
        id={`seller-identity-${name}`}
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
    <Card className="gap-4 py-4 sm:gap-6 sm:py-6">
      <CardHeader className="px-4 sm:px-6">
        <CardTitle className="flex items-center gap-2">
          <Contact className="size-5" />
          Conta e identificação
        </CardTitle>
      </CardHeader>
      <CardContent className="px-4 sm:px-6">
        <form className="space-y-3 sm:space-y-4" onSubmit={handleSubmit}>
          <div className="grid gap-3 sm:grid-cols-2 sm:gap-4">
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
