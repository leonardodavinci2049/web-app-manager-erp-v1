import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { UISupplier } from "@/services/api-main/supplier";
import { SupplierDetailField } from "../supplier-detail-field";

interface SupplierNotesTabProps {
  supplier: UISupplier;
}

export function SupplierNotesTab({ supplier }: SupplierNotesTabProps) {
  return (
    <Card className="gap-4 py-4 sm:gap-6 sm:py-6">
      <CardHeader className="px-4 sm:px-6">
        <CardTitle className="text-base">Anotações</CardTitle>
      </CardHeader>
      <CardContent className="px-4 sm:px-6">
        <dl>
          <SupplierDetailField label="Anotações" value={supplier.notes} />
        </dl>
      </CardContent>
    </Card>
  );
}
