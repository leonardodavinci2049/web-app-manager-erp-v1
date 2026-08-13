"use client";

import { Copy, UserRound } from "lucide-react";
import { type FormEvent, useState } from "react";
import { toast } from "sonner";
import { updateCustomerAddressAction } from "@/app/dashboard/customer/_actions/customer-actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { UICustomerDetail } from "@/services/api-main/customer-general";
import { CustomerField } from "./customer-field";
import { useCustomerSectionAction } from "./customer-section-action";
import { CustomerSectionButton } from "./customer-section-button";

interface AddressValues {
  address: string;
  addressNumber: string;
  city: string;
  cityCode: string;
  complement: string;
  neighborhood: string;
  state: string;
  stateCode: string;
  zipCode: string;
}

interface CustomerAddressTabProps {
  customer: UICustomerDetail;
}

function toAddressValues(customer: UICustomerDetail): AddressValues {
  return {
    address: customer.address,
    addressNumber: customer.addressNumber,
    city: customer.city,
    cityCode: customer.cityCode ? String(customer.cityCode) : "",
    complement: customer.complement,
    neighborhood: customer.neighborhood,
    state: customer.state,
    stateCode: customer.stateCode ? String(customer.stateCode) : "",
    zipCode: customer.zipCode,
  };
}

function buildAddressSummary(values: AddressValues, customerName: string) {
  const normalize = (value: string) => value.trim();
  const normalizedCustomerName = normalize(customerName);
  const address = normalize(values.address);
  const addressNumber = normalize(values.addressNumber);
  const complement = normalize(values.complement);
  const neighborhood = normalize(values.neighborhood);
  const city = normalize(values.city);
  const state = normalize(values.state);
  const zipCode = normalize(values.zipCode);
  const cityCode = normalize(values.cityCode);
  const stateCode = normalize(values.stateCode);

  const primaryLine = [
    [address, addressNumber ? `nº ${addressNumber}` : ""]
      .filter(Boolean)
      .join(", "),
    complement ? `Complemento: ${complement}` : "",
  ]
    .filter(Boolean)
    .join(" · ");
  const localityLine = [
    neighborhood ? `Bairro: ${neighborhood}` : "",
    [city, state].filter(Boolean).join(" / "),
  ]
    .filter(Boolean)
    .join(" · ");
  const referenceLine = [
    zipCode ? `CEP: ${zipCode}` : "",
    cityCode ? `Código do município: ${cityCode}` : "",
    stateCode ? `Código da UF: ${stateCode}` : "",
  ]
    .filter(Boolean)
    .join(" · ");
  const addressLines = [primaryLine, localityLine, referenceLine].filter(
    Boolean,
  );
  const titleLine = normalizedCustomerName
    ? `Endereço de ${normalizedCustomerName}.`
    : "Endereço do cliente.";

  return {
    clipboardText: [titleLine, ...addressLines].join("\n"),
    hasAddressData: addressLines.length > 0,
    localityLine,
    primaryLine,
    referenceLine,
    titleLine,
  };
}

export function CustomerAddressTab({ customer }: CustomerAddressTabProps) {
  const [values, setValues] = useState(() => toAddressValues(customer));
  const { clearError, errors, runAction, saving } = useCustomerSectionAction();
  const addressSummary = buildAddressSummary(values, customer.name);

  const setField = (field: keyof AddressValues, value: string) => {
    setValues((current) => ({ ...current, [field]: value }));
    clearError(field);
  };

  const copyAddressToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(addressSummary.clipboardText);
      toast.success("Endereço copiado para a área de transferência.");
    } catch {
      toast.error("Não foi possível copiar o endereço.");
    }
  };

  const field = (
    name: keyof AddressValues,
    label: string,
    options: { maxLength?: number } = {},
  ) => (
    <CustomerField
      id={`customer-detail-${name}`}
      label={label}
      value={values[name]}
      maxLength={options.maxLength}
      disabled={saving}
      error={errors[name]}
      onChange={(value) => setField(name, value)}
    />
  );

  return (
    <div className="space-y-3 sm:space-y-4">
      <form
        className="space-y-3 rounded-lg border p-3 sm:space-y-4 sm:p-4"
        onSubmit={(event: FormEvent<HTMLFormElement>) => {
          event.preventDefault();
          runAction(
            updateCustomerAddressAction({
              customerId: customer.id,
              zipCode: values.zipCode,
              address: values.address,
              addressNumber: values.addressNumber,
              complement: values.complement,
              neighborhood: values.neighborhood,
              city: values.city,
              state: values.state,
              cityCode: values.cityCode,
              stateCode: values.stateCode,
            }),
          );
        }}
      >
        <div className="grid gap-3 sm:grid-cols-2 sm:gap-4">
          {field("zipCode", "CEP", { maxLength: 100 })}
          {field("state", "UF", { maxLength: 100 })}
          <div className="sm:col-span-2">
            {field("address", "Endereço", { maxLength: 300 })}
          </div>
          {field("addressNumber", "Número", { maxLength: 100 })}
          {field("complement", "Complemento", { maxLength: 100 })}
          {field("neighborhood", "Bairro", { maxLength: 300 })}
          {field("city", "Cidade", { maxLength: 300 })}
          {field("cityCode", "Código do município", { maxLength: 100 })}
          {field("stateCode", "Código da UF", { maxLength: 100 })}
        </div>
        <CustomerSectionButton saving={saving} label="Salvar endereço" />
      </form>
      <Card className="gap-4 py-4 sm:gap-6 sm:py-6">
        <CardHeader className="px-4 sm:px-6">
          <CardTitle className="flex items-center gap-2">
            <UserRound className="size-5" />
            Localização resumida
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 px-4 sm:px-6">
          <div className="space-y-1">
            <p className="text-sm font-medium">{addressSummary.titleLine}</p>
            <p className="text-sm">
              {addressSummary.primaryLine || "Endereço não informado"}
            </p>
            <p className="text-muted-foreground text-xs">
              {addressSummary.localityLine || "Localidade não informada"}
            </p>
            {addressSummary.referenceLine && (
              <p className="text-muted-foreground text-xs">
                {addressSummary.referenceLine}
              </p>
            )}
          </div>
          <Button
            type="button"
            variant="outline"
            disabled={!addressSummary.hasAddressData}
            onClick={copyAddressToClipboard}
          >
            <Copy className="size-4" />
            Copiar endereço
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
