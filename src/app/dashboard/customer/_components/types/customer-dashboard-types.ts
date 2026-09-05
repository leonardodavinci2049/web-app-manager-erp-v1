export type CustomerViewMode = "grid" | "list";
export type CustomerTriState = 0 | 1 | 2;
export type CustomerOperation = 0 | 1 | 2 | 3 | 6 | 7;
export type CustomerSort = "id" | "name" | "last-purchase";
export type CustomerOrder = "asc" | "desc";
export type CustomerPageLimit = 25 | 50 | 100;

export const DEFAULT_CUSTOMER_LIMIT: CustomerPageLimit = 50;

export interface CustomerSearchParams {
  search: string;
  categoryId: number;
  clientType: number;
  personType: number;
  noImage: boolean;
  approved: CustomerTriState;
  gender: CustomerTriState;
  restricted: CustomerTriState;
  enabled: CustomerTriState;
  statusId: number;
  operation: CustomerOperation;
  startDate: string;
  endDate: string;
  sort: CustomerSort;
  order: CustomerOrder;
  page: number;
  limit: CustomerPageLimit;
  /** Extra batches appended by "Carregar mais" on top of `page`. */
  accum: number;
}

export interface CustomerActionResult {
  success: boolean;
  message: string;
  customerId?: number;
  fieldErrors?: Record<string, string[]>;
}

export interface CustomerListingImageResult {
  success: boolean;
  message?: string;
  error?: string;
  warning?: string;
}

export interface CustomerCreateValues {
  name: string;
  email: string;
  personTypeId: number;
  cnpj: string;
  companyName: string;
  cpf: string;
  phone: string;
  whatsapp: string;
  image: string;
  zipCode: string;
  address: string;
  addressNumber: string;
  complement: string;
  neighborhood: string;
  city: string;
  state: string;
  notes: string;
}
