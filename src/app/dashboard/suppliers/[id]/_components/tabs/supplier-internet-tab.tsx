import { Globe } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { UISupplier } from "@/services/api-main/supplier";
import { SupplierDetailField } from "../supplier-detail-field";

interface SupplierInternetTabProps {
  supplier: UISupplier;
}

export function SupplierInternetTab({ supplier }: SupplierInternetTabProps) {
  return (
    <Card className="gap-4 py-4 sm:gap-6 sm:py-6">
      <CardHeader className="px-4 sm:px-6">
        <CardTitle className="flex items-center gap-2 text-base">
          <Globe className="size-4" aria-hidden="true" />
          Internet
        </CardTitle>
      </CardHeader>
      <CardContent className="px-4 sm:px-6">
        <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <SupplierDetailField label="Website" value={supplier.website} />
          <SupplierDetailField label="Facebook" value={supplier.facebook} />
          <SupplierDetailField label="Twitter" value={supplier.twitter} />
        </dl>
      </CardContent>
    </Card>
  );
}
