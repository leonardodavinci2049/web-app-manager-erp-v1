export type CarrierViewMode = "grid" | "list";
export type CarrierStatus = "all" | "active" | "inactive";
export type CarrierSort = "id" | "name";
export type CarrierOrder = "asc" | "desc";
export type CarrierPageLimit = 25 | 50 | 100;

export const DEFAULT_CARRIER_LIMIT: CarrierPageLimit = 50;

export interface CarrierSearchParams {
  search: string;
  status: CarrierStatus;
  sort: CarrierSort;
  order: CarrierOrder;
  page: number;
  limit: CarrierPageLimit;
}

export interface CarrierFormValues {
  typePersonId: number;
  name: string;
  phone: string;
  whatsapp: string;
  email: string;
  website: string;
  cnpj: string;
  companyName: string;
  responsibleName: string;
  cpf: string;
  imagePath: string;
  notes: string;
}

export interface CarrierActionResult {
  success: boolean;
  message: string;
  carrierId?: number;
  fieldErrors?: Record<string, string[]>;
}
