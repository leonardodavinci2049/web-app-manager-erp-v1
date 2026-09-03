import type { UISupplier } from "@/services/api-main/supplier";

export type SupplierPersonTypeId = 1 | 2;

export function formatSupplierDetailDate(value?: string): string {
  if (!value) return "Não informada";
  const timestamp = Date.parse(value.replace(" ", "T"));
  if (Number.isNaN(timestamp)) return value;
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "long",
  }).format(timestamp);
}

export function resolveSupplierPersonTypeId(
  supplier: UISupplier,
): SupplierPersonTypeId | undefined {
  if (supplier.typePersonId === 1 || supplier.typePersonId === 2) {
    return supplier.typePersonId;
  }

  const legacyType = supplier.legalPhysicalType?.trim().toUpperCase();
  if (legacyType === "F") return 1;
  if (legacyType === "J") return 2;
  return undefined;
}

export function resolveSupplierPersonTypeLabel(supplier: UISupplier): string {
  if (supplier.typePerson) return supplier.typePerson;
  const personTypeId = resolveSupplierPersonTypeId(supplier);
  if (personTypeId === 1) return "Pessoa Física";
  if (personTypeId === 2) return "Pessoa Jurídica";
  return "Tipo de pessoa não informado";
}
