import { DetailRecordHeading } from "@/app/dashboard/_components/detail-page";
import { Badge } from "@/components/ui/badge";
import type { UISellerDetail } from "@/services/api-main/seller";
import { SellerImage } from "../../../_components";

interface SellerHeadDataSectionProps {
  seller: Pick<
    UISellerDetail,
    "id" | "name" | "imagePath" | "accountStatus" | "accountType"
  >;
}

export function SellerHeadDataSection({ seller }: SellerHeadDataSectionProps) {
  return (
    <DetailRecordHeading
      mobileImage={
        <SellerImage
          name={seller.name}
          imagePath={seller.imagePath}
          viewMode="list"
        />
      }
      title={
        <h1 className="break-words text-xl font-bold sm:text-2xl">
          {seller.name}
        </h1>
      }
      metadata={
        <>
          <span className="tabular-nums">ID: #{seller.id}</span>
          <Badge variant="secondary">
            {seller.accountStatus || "Status não informado"}
          </Badge>
          <span aria-hidden="true">·</span>
          <span>{seller.accountType || "Tipo não informado"}</span>
        </>
      }
    />
  );
}
