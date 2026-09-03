import { Building2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { UISupplier } from "@/services/api-main/supplier";
import { SupplierDetailField } from "../supplier-detail-field";
import { formatSupplierDetailDate } from "../supplier-detail-utils";

interface SupplierBusinessSectionProps {
  supplier: UISupplier;
}

export function SupplierBusinessSection({
  supplier,
}: SupplierBusinessSectionProps) {
  return (
    <Card className="gap-4 py-4 sm:gap-6 sm:py-6">
      <CardHeader className="px-4 sm:px-6">
        <CardTitle className="flex items-center gap-2 text-base">
          <Building2 className="size-4" aria-hidden="true" />
          Pessoa Jurídica
        </CardTitle>
      </CardHeader>
      <CardContent className="px-4 sm:px-6">
        <dl className="grid gap-4 sm:grid-cols-2">
          <SupplierDetailField
            label="Razão social"
            value={supplier.legalName}
          />
          <SupplierDetailField label="CNPJ" value={supplier.cnpj} />
          <SupplierDetailField
            label="Inscrição estadual"
            value={supplier.stateRegistration}
          />
          <SupplierDetailField
            label="Inscrição municipal"
            value={supplier.municipalRegistration}
          />
          <SupplierDetailField
            label="Nome fantasia"
            value={supplier.tradeName}
          />
          <SupplierDetailField
            label="Data do CNPJ"
            value={formatSupplierDetailDate(supplier.cnpjDate)}
          />
        </dl>
      </CardContent>
    </Card>
  );
}
