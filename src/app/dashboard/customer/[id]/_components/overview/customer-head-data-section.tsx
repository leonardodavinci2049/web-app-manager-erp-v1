import { DetailRecordHeading } from "@/app/dashboard/_components/detail-page";
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
    <DetailRecordHeading
      image={
        <CustomerImage
          name={customer.name}
          imagePath={customer.imagePath}
          viewMode="list"
        />
      }
      title={
        <h1 className="break-words text-xl font-bold sm:text-2xl">
          {customer.name}
        </h1>
      }
      metadata={
        <>
          <span className="tabular-nums">ID: #{customer.id}</span>
          <Badge variant="secondary">
            {customer.accountStatus || "Status não informado"}
          </Badge>
          <span aria-hidden="true">·</span>
          <span>{customer.accountType || "Tipo Não Informado"}</span>
        </>
      }
    />
  );
}
