import { CalendarDays } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { UISupplier } from "@/services/api-main/supplier";
import { SupplierDetailField } from "../supplier-detail-field";
import { formatSupplierDetailDate } from "../supplier-detail-utils";

interface SupplierMiscellaneousTabProps {
  supplier: UISupplier;
}

export function SupplierMiscellaneousTab({
  supplier,
}: SupplierMiscellaneousTabProps) {
  return (
    <Card className="gap-4 py-4 sm:gap-6 sm:py-6">
      <CardHeader className="px-4 sm:px-6">
        <CardTitle className="flex items-center gap-2 text-base">
          <CalendarDays className="size-4" aria-hidden="true" />
          Diversos
        </CardTitle>
      </CardHeader>
      <CardContent className="px-4 sm:px-6">
        <dl className="grid gap-4 sm:grid-cols-2">
          <SupplierDetailField
            label="Data de cadastro"
            value={formatSupplierDetailDate(supplier.createdAt)}
          />
          <SupplierDetailField
            label="Data de atualização"
            value={formatSupplierDetailDate(supplier.updatedAt)}
          />
        </dl>
      </CardContent>
    </Card>
  );
}
