import { MapPin } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { UISupplier } from "@/services/api-main/supplier";
import { SupplierDetailField } from "../supplier-detail-field";

interface SupplierAddressTabProps {
  supplier: UISupplier;
}

export function SupplierAddressTab({ supplier }: SupplierAddressTabProps) {
  return (
    <Card className="gap-4 py-4 sm:gap-6 sm:py-6">
      <CardHeader className="px-4 sm:px-6">
        <CardTitle className="flex items-center gap-2 text-base">
          <MapPin className="size-4" aria-hidden="true" />
          Endereço
        </CardTitle>
      </CardHeader>
      <CardContent className="px-4 sm:px-6">
        <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <SupplierDetailField label="CEP" value={supplier.zipCode} />
          <SupplierDetailField label="Endereço" value={supplier.address} />
          <SupplierDetailField label="Número" value={supplier.addressNumber} />
          <SupplierDetailField
            label="Complemento"
            value={supplier.complement}
          />
          <SupplierDetailField label="Bairro" value={supplier.neighborhood} />
          <SupplierDetailField label="Cidade" value={supplier.city} />
          <SupplierDetailField label="UF" value={supplier.state} />
          <SupplierDetailField label="País" value={supplier.country} />
          <SupplierDetailField
            label="Código do município"
            value={supplier.cityCode}
          />
          <SupplierDetailField
            label="Código da UF"
            value={supplier.stateCode}
          />
        </dl>
      </CardContent>
    </Card>
  );
}
