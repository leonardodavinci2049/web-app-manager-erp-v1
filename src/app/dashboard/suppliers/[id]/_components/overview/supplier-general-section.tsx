import { Phone } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { UISupplier } from "@/services/api-main/supplier";
import { SupplierDetailField } from "../supplier-detail-field";

interface SupplierGeneralSectionProps {
  supplier: UISupplier;
}

export function SupplierGeneralSection({
  supplier,
}: SupplierGeneralSectionProps) {
  return (
    <Card className="gap-4 py-4 sm:gap-6 sm:py-6">
      <CardHeader className="px-4 sm:px-6">
        <CardTitle className="flex items-center gap-2 text-base">
          <Phone className="size-4" aria-hidden="true" />
          Geral
        </CardTitle>
      </CardHeader>
      <CardContent className="px-4 sm:px-6">
        <dl className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <SupplierDetailField label="Nome" value={supplier.name} />
          </div>
          <SupplierDetailField label="Telefone" value={supplier.phone} />
          <SupplierDetailField label="WhatsApp" value={supplier.whatsapp} />
          <SupplierDetailField label="Contato" value={supplier.contact} />
          <SupplierDetailField label="Setor" value={supplier.sector} />
          <div className="sm:col-span-2">
            <SupplierDetailField label="E-mail" value={supplier.email} />
          </div>
        </dl>
      </CardContent>
    </Card>
  );
}
