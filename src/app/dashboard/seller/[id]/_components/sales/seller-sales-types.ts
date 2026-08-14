export interface SellerOrderListItem {
  orderDate: string;
  orderId: number;
  itemCount: number;
  subtotalValue: string;
  freightValue: string;
  totalOrderValue: string;
  customerName: string;
  paymentForm: string;
  orderStatus: string;
  financialStatus: string;
}

export type SellerSalesActionResult<T> =
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
