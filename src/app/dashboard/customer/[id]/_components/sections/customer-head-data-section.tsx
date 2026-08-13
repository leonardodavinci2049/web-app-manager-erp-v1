import { Badge } from "@/components/ui/badge";
import type { UICustomerDetail } from "@/services/api-main/customer-general";
import { CustomerImage } from "../../../_components/customer-image";

interface CustomerHeadDataSectionProps {
  customer: Pick<
    UICustomerDetail,
    "id" | "name" | "imagePath" | "accountStatus" | "accountType"
  >;
}

export function CustomerHeadDataSection({
  customer,
}: CustomerHeadDataSectionProps) {
  return (
    <div className="flex min-w-0 items-start gap-3">
      <CustomerImage
        name={customer.name}
        imagePath={customer.imagePath}
        viewMode="list"
      />
      <div className="min-w-0">
        <h1 className="break-words text-xl font-bold sm:text-2xl">
          {customer.name}
        </h1>
        <div className="text-muted-foreground flex min-w-0 items-center gap-2 overflow-x-auto whitespace-nowrap text-sm">
          <span className="tabular-nums">ID: #{customer.id}</span>
          <Badge variant="secondary">
            {customer.accountStatus || "Status não informado"}
          </Badge>
          <span aria-hidden="true">·</span>
          <span>{customer.accountType || "Tipo Não Informado"}</span>
        </div>
      </div>
    </div>
  );
}
