import { Banknote, ReceiptText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type {
  UIOrdersManagerOrderData,
  UIOrdersManagerStatusHistory,
} from "@/services/api-main/order_manager";
import { OrderDetailField } from "../detail-field";
import {
  formatOrderCount,
  formatOrderDateTime,
  formatOrderMoney,
} from "../lib/format";

interface OrderTotalsOverviewProps {
  order: UIOrdersManagerOrderData;
  statusHistory: UIOrdersManagerStatusHistory | null;
}

export function OrderTotalsOverview({
  order,
  statusHistory,
}: OrderTotalsOverviewProps) {
  return (
    <div className="grid gap-3 xl:grid-cols-2">
      <Card className="gap-4 py-4 sm:gap-6 sm:py-6">
        <CardHeader className="px-4 sm:px-6">
          <CardTitle className="flex items-center gap-2 text-base">
            <ReceiptText className="size-4" aria-hidden="true" />
            Resumo do pedido
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 sm:px-6">
          <dl className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
            <OrderDetailField label="ID do pedido">{order.id}</OrderDetailField>
            <OrderDetailField label="Quantidade de itens">
              {formatOrderCount(order.itemsCount)}
            </OrderDetailField>
            <OrderDetailField
              label="Data do orçamento"
              className="sm:col-span-2 xl:col-span-1 2xl:col-span-2"
            >
              {formatOrderDateTime(statusHistory?.quoteAt)}
            </OrderDetailField>
            <OrderDetailField
              label="Total do pedido"
              className="sm:col-span-2 xl:col-span-1 2xl:col-span-2"
            >
              <span className="text-base font-semibold">
                {formatOrderMoney(order.total)}
              </span>
            </OrderDetailField>
          </dl>
        </CardContent>
      </Card>

      <Card className="gap-4 py-4 sm:gap-6 sm:py-6">
        <CardHeader className="px-4 sm:px-6">
          <CardTitle className="flex items-center gap-2 text-base">
            <Banknote className="size-4" aria-hidden="true" />
            Composição financeira
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 sm:px-6">
          <dl className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
            <OrderDetailField label="Subtotal">
              {formatOrderMoney(order.subtotal)}
            </OrderDetailField>
            <OrderDetailField label="Acréscimo">
              {formatOrderMoney(order.addition)}
            </OrderDetailField>
            <OrderDetailField label="Seguro">
              {formatOrderMoney(order.insurance)}
            </OrderDetailField>
            <OrderDetailField label="Frete">
              {formatOrderMoney(order.freight)}
            </OrderDetailField>
            <OrderDetailField label="Desconto">
              {formatOrderMoney(order.discount)}
            </OrderDetailField>
            <OrderDetailField label="Base de comissão">
              {formatOrderMoney(order.commissionBase)}
            </OrderDetailField>
            <OrderDetailField
              label="Comissão do vendedor"
              className="sm:col-span-2 xl:col-span-1 2xl:col-span-2"
            >
              {formatOrderMoney(order.sellerCommission)}
            </OrderDetailField>
          </dl>
        </CardContent>
      </Card>
    </div>
  );
}
