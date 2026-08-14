export interface SellerActionResult {
  success: boolean;
  message: string;
  sellerId?: number;
  fieldErrors?: Record<string, string[]>;
}
