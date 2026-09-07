import { DetailRecordHeading } from "@/app/dashboard/_components/detail-page";
import { RegistryEntityImage } from "@/app/dashboard/_components/registry";
import { Badge } from "@/components/ui/badge";
import type {
  UIOrdersManagerCustomer,
  UIOrdersManagerOrderData,
  UIOrdersManagerSeller,
} from "@/services/api-main/order_manager";
import { formatOrderCount, formatOrderMoney } from "../lib/format";

const DEFAULT_SELLER_IMAGE = "/default-images/seller.webp";

interface OrderIdentityProps {
  order: Pick<UIOrdersManagerOrderData, "id" | "itemsCount" | "total">;
  customer: Pick<UIOrdersManagerCustomer, "name"> | null;
  seller: Pick<UIOrdersManagerSeller, "name" | "imagePath" | "sellerId"> | null;
}

export function OrderIdentity({ order, customer, seller }: OrderIdentityProps) {
  const sellerName = seller?.name.trim() || "Vendedor não informado";

  return (
    <DetailRecordHeading
      mobileImage={
        <RegistryEntityImage
          name={sellerName}
          imagePath={seller?.imagePath}
          defaultImage={DEFAULT_SELLER_IMAGE}
          entityLabel="do vendedor"
          viewMode="list"
          size="sm"
        />
      }
      title={
        <>
          <h1 className="break-words text-xl font-bold sm:text-2xl">
            Pedido #{order.id}
          </h1>
          <p className="text-muted-foreground mt-1 break-words text-sm">
            {customer?.name.trim() || "Cliente não informado"}
          </p>
          <p className="text-muted-foreground break-words text-sm">
            Vendedor: {sellerName}
          </p>
        </>
      }
      metadata={
        <>
          <Badge variant="secondary">
            {formatOrderCount(order.itemsCount)}{" "}
            {order.itemsCount === 1 ? "item" : "itens"}
          </Badge>
          <Badge variant="outline">{formatOrderMoney(order.total)}</Badge>
        </>
      }
    />
  );
}
