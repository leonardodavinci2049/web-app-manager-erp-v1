import { Contact, UserRound } from "lucide-react";
import { RegistryEntityImage } from "@/app/dashboard/_components/registry";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { UIOrdersManagerSeller } from "@/services/api-main/order_manager";
import { OrderDetailField } from "../detail-field";

const DEFAULT_SELLER_IMAGE = "/default-images/seller.webp";

export function OrderSellerSection({
  seller,
}: {
  seller: UIOrdersManagerSeller | null;
}) {
  if (!seller) {
    return (
      <Card>
        <CardContent className="py-10 text-center">
          <UserRound
            className="text-muted-foreground mx-auto size-9"
            aria-hidden="true"
          />
          <p className="mt-3 font-medium">Vendedor não informado.</p>
          <p className="text-muted-foreground mt-1 text-sm">
            O endpoint não retornou os dados do vendedor deste pedido.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="gap-4 py-4 sm:gap-6 sm:py-6">
      <CardHeader className="px-4 sm:px-6">
        <CardTitle className="flex items-center gap-2 text-base">
          <Contact className="size-4" aria-hidden="true" />
          Dados do vendedor
        </CardTitle>
      </CardHeader>
      <CardContent className="px-4 sm:px-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
          <RegistryEntityImage
            name={seller.name}
            imagePath={seller.imagePath}
            defaultImage={DEFAULT_SELLER_IMAGE}
            entityLabel="do vendedor"
            viewMode="list"
          />
          <dl className="grid min-w-0 flex-1 gap-4 sm:grid-cols-2">
            <OrderDetailField label="ID do vendedor">
              {seller.sellerId}
            </OrderDetailField>
            <OrderDetailField label="Nome">{seller.name}</OrderDetailField>
            <OrderDetailField label="Telefone">{seller.phone}</OrderDetailField>
            <OrderDetailField label="WhatsApp">
              {seller.whatsapp}
            </OrderDetailField>
            <OrderDetailField label="E-mail" className="sm:col-span-2">
              {seller.email}
            </OrderDetailField>
          </dl>
        </div>
      </CardContent>
    </Card>
  );
}
