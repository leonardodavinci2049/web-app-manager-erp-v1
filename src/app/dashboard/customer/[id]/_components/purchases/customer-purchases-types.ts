export interface CustomerOrderListItem {
  orderDate: string;
  orderId: number;
  itemCount: number;
  subtotalValue: string;
  freightValue: string;
  totalOrderValue: string;
  sellerName: string;
  paymentForm: string;
  orderStatus: string;
  financialStatus: string;
}

export interface CustomerPurchasedProductListItem {
  movementId: number;
  imagePath: string;
  productId: number;
  description: string;
  quantity: number;
  unitValue: string;
  subtotalValue: string;
  totalValue: string;
  orderDate: string | null;
}

export interface CustomerWarrantyListItem {
  warrantyId: number;
  warrantyStatus: string;
  productId: number | null;
  productName: string;
  brand: string;
  warrantyDays: number;
  serialNumber: string | null;
  barcode: string | null;
  orderDate: string | null;
  orderId: number;
  movementId: number;
  orderStatus: string;
}

export type CustomerPurchasesActionResult<T> =
  | {
      success: true;
      items: T[];
      hasMore: boolean;
      message: string;
    }
  | {
      success: false;
      message: string;
    };
