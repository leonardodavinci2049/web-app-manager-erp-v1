import { Suspense } from "react";
import { DetailPageLayout } from "@/app/dashboard/_components/detail-page";
import type {
  UIOrdersManagerCustomer,
  UIOrdersManagerOrderData,
  UIOrdersManagerOrderItem,
  UIOrdersManagerSeller,
  UIOrdersManagerStatusHistory,
} from "@/services/api-main/order_manager";
import {
  OrderSellerGallery,
  OrderSellerGalleryServer,
  OrderSellerGallerySkeleton,
} from "./image-gallery";
import { OrderIdentity } from "./overview/order-identity";
import { OrderTotalsOverview } from "./overview/order-totals-overview";
import { OrderCustomerSection } from "./sections/order-customer-section";
import { OrderItemsSection } from "./sections/order-items-section";
import { OrderSellerSection } from "./sections/order-seller-section";
import { OrderStatusHistorySection } from "./sections/order-status-history-section";
import { OrderDetailTabs } from "./tabs/order-detail-tabs";

interface OrderDetailLayoutProps {
  order: UIOrdersManagerOrderData;
  items: UIOrdersManagerOrderItem[];
  statusHistory: UIOrdersManagerStatusHistory | null;
  customer: UIOrdersManagerCustomer | null;
  seller: UIOrdersManagerSeller | null;
  returnTo: string;
}

export function OrderDetailLayout({
  order,
  items,
  statusHistory,
  customer,
  seller,
  returnTo,
}: OrderDetailLayoutProps) {
  const sellerName = seller?.name.trim() || "Vendedor não informado";
  const imageGallery =
    seller && seller.sellerId > 0 ? (
      <Suspense fallback={<OrderSellerGallerySkeleton />}>
        <OrderSellerGalleryServer
          sellerId={seller.sellerId}
          sellerName={sellerName}
        />
      </Suspense>
    ) : (
      <OrderSellerGallery
        sellerName={sellerName}
        initialState={{ status: "unavailable", images: [], totalImages: 0 }}
      />
    );

  return (
    <DetailPageLayout
      returnTo={returnTo}
      backLinkLabel="Voltar aos pedidos"
      imageGallery={imageGallery}
      heading={
        <OrderIdentity order={order} customer={customer} seller={seller} />
      }
      overview={
        <OrderTotalsOverview order={order} statusHistory={statusHistory} />
      }
      sectionsTitle="Informações do pedido"
      sectionsDescription="Consulte os itens, o histórico e os participantes deste pedido de venda."
    >
      <OrderDetailTabs
        items={<OrderItemsSection items={items} />}
        history={<OrderStatusHistorySection statusHistory={statusHistory} />}
        customer={<OrderCustomerSection customer={customer} />}
        seller={<OrderSellerSection seller={seller} />}
        imageGallery={imageGallery}
        sellerName={sellerName}
      />
    </DetailPageLayout>
  );
}
