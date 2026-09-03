import type { UICarrier } from "@/services/api-main/carrier";

export type CarrierPersonTypeId = 1 | 2;

export function formatCarrierDetailDate(value?: string): string {
  if (!value) return "Não informada";
  const timestamp = Date.parse(value.replace(" ", "T"));
  if (Number.isNaN(timestamp)) return value;
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "long",
  }).format(timestamp);
}

export function resolveCarrierPersonTypeId(
  carrier: UICarrier,
): CarrierPersonTypeId | undefined {
  if (carrier.typePersonId === 1 || carrier.typePersonId === 2) {
    return carrier.typePersonId;
  }
  return undefined;
}

export function resolveCarrierPersonTypeLabel(carrier: UICarrier): string {
  if (carrier.typePerson) return carrier.typePerson;
  if (carrier.typePersonId === 1) return "Pessoa Física";
  if (carrier.typePersonId === 2) return "Pessoa Jurídica";
  return "Tipo de pessoa não informado";
}
