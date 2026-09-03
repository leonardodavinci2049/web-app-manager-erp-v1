import { UserRound } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { UISupplier } from "@/services/api-main/supplier";
import { SupplierDetailField } from "../supplier-detail-field";
import { formatSupplierDetailDate } from "../supplier-detail-utils";

interface SupplierPersonalSectionProps {
  supplier: UISupplier;
}

export function SupplierPersonalSection({
  supplier,
}: SupplierPersonalSectionProps) {
  return (
    <Card className="gap-4 py-4 sm:gap-6 sm:py-6">
      <CardHeader className="px-4 sm:px-6">
        <CardTitle className="flex items-center gap-2 text-base">
          <UserRound className="size-4" aria-hidden="true" />
          Pessoa Física
        </CardTitle>
      </CardHeader>
      <CardContent className="px-4 sm:px-6">
        <dl className="grid gap-4 sm:grid-cols-2">
          <SupplierDetailField label="CPF" value={supplier.cpf} />
          <SupplierDetailField label="RG" value={supplier.rg} />
          <SupplierDetailField
            label="Data de nascimento"
            value={formatSupplierDetailDate(supplier.birthDate)}
          />
        </dl>
      </CardContent>
    </Card>
  );
}
