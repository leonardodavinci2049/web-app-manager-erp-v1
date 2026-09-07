import type { RegistryPageLimit } from "@/app/dashboard/_components/registry";

export type OrderSort =
  | "default"
  | "id-asc"
  | "id-desc"
  | "total-asc"
  | "total-desc";

export type OrderStatusId =
  | 0
  | 11
  | 12
  | 13
  | 14
  | 21
  | 22
  | 31
  | 33
  | 34
  | 35
  | 38
  | 39
  | 74
  | 77
  | 89
  | 109;
export type OrderFinancialStatusId = 0 | 17 | 18;
export type OrderDeliveryStatusId = 0 | 17 | 18;
export type OrderLocationId = 0 | 1 | 4;

export interface OrderFilterOption {
  id: number;
  label: string;
}

export interface OrderSearchParams {
  search: string;
  startDate: string;
  endDate: string;
  customerId: number;
  sellerId: number;
  orderStatusId: OrderStatusId;
  financialStatusId: OrderFinancialStatusId;
  deliveryStatusId: OrderDeliveryStatusId;
  locationId: OrderLocationId;
  limit: RegistryPageLimit;
  page: number;
  accum: number;
  sort: OrderSort;
}

export type OrderPanelFilter = Exclude<
  keyof OrderSearchParams,
  "search" | "page" | "accum"
>;

export const ORDER_STATUS_OPTIONS: ReadonlyArray<{
  value: OrderStatusId;
  label: string;
}> = [
  { value: 0, label: "Todos" },
  { value: 14, label: "Venda" },
  { value: 22, label: "Orçamento" },
  { value: 11, label: "Estorno" },
  { value: 33, label: "Crédito RMA" },
  { value: 35, label: "Débito" },
  { value: 34, label: "Crédito" },
  { value: 13, label: "Troca" },
  { value: 39, label: "Devolução cliente" },
  { value: 12, label: "Pedido" },
  { value: 74, label: "Entrada" },
  { value: 21, label: "Liberação" },
  { value: 38, label: "Crédito defeito" },
  { value: 77, label: "RMA aberto" },
  { value: 109, label: "NFE - RMA" },
  { value: 31, label: "Balanço" },
  { value: 89, label: "Garantia" },
];

export const ORDER_FINANCIAL_STATUS_OPTIONS: ReadonlyArray<{
  value: OrderFinancialStatusId;
  label: string;
}> = [
  { value: 0, label: "Todos" },
  { value: 17, label: "Concluído" },
  { value: 18, label: "Em aberto" },
];

export const ORDER_DELIVERY_STATUS_OPTIONS: ReadonlyArray<{
  value: OrderDeliveryStatusId;
  label: string;
}> = [
  { value: 0, label: "Todos" },
  { value: 17, label: "Entregue" },
  { value: 18, label: "Em aberto" },
];

export const ORDER_LOCATION_OPTIONS: ReadonlyArray<{
  value: OrderLocationId;
  label: string;
}> = [
  { value: 0, label: "Todos" },
  { value: 1, label: "Loja" },
  { value: 4, label: "APP" },
];
