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
    <div className="flex min-w-0 items-start gap-3">
      <SellerImage
        name={seller.name}
        imagePath={seller.imagePath}
        viewMode="list"
      />
      <div className="min-w-0">
        <h1 className="break-words text-xl font-bold sm:text-2xl">
          {seller.name}
        </h1>
        <div className="text-muted-foreground flex min-w-0 items-center gap-2 overflow-x-auto whitespace-nowrap text-sm">
          <span className="tabular-nums">ID: #{seller.id}</span>
          <Badge variant="secondary">
            {seller.accountStatus || "Status não informado"}
          </Badge>
          <span aria-hidden="true">·</span>
          <span>{seller.accountType || "Tipo não informado"}</span>
        </div>
      </div>
    </div>
  );
}
