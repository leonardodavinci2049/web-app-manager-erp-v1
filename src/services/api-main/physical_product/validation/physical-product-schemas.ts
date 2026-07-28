import { z } from "zod";

const baseContextSchema = {
  pe_user_id: z.string().max(200).optional(),
  pe_user_name: z.string().max(200).optional(),
  pe_user_role: z.string().max(200).optional(),
  pe_person_id: z.number().int().optional(),
};

export const PhysicalProductFindAllSchema = z.object({
  ...baseContextSchema,
  pe_product_id: z.number().int().optional(),
  pe_stock_flag: z.number().int().optional(),
  pe_limit: z.number().int().optional(),
});

export const OrderItemFindAllCustomerSchema = z.object({
  ...baseContextSchema,
  pe_customer_id: z.number().int(),
  pe_search: z.string().max(300).optional(),
  pe_limit: z.number().int().optional(),
});

export const OrderItemFindIdCustomerSchema = z.object({
  ...baseContextSchema,
  pe_customer_id: z.number().int(),
  pe_movement_id: z.number().int().optional(),
});

export const PhysicalProductWarrantyIdSchema = z.object({
  ...baseContextSchema,
  pe_physical_id: z.number().int().optional(),
});

export const PhysicalProductWarrantyIdCustomerSchema = z.object({
  ...baseContextSchema,
  pe_customer_id: z.number().int(),
  pe_physical_id: z.number().int().optional(),
});

export const PhysicalProductWarrantyMovSchema = z.object({
  ...baseContextSchema,
  pe_movement_id: z.number().int().optional(),
  pe_product_id: z.number().int().optional(),
  pe_limit: z.number().int().optional(),
});

export const PhysicalProductWarrantyMovCustomerSchema = z.object({
  ...baseContextSchema,
  pe_customer_id: z.number().int(),
  pe_movement_id: z.number().int().optional(),
  pe_product_id: z.number().int().optional(),
  pe_limit: z.number().int().optional(),
});

export const PhysicalProductWarrantySearchSchema = z.object({
  ...baseContextSchema,
  pe_customer_id: z.number().int().optional(),
  PE_search: z.string().max(300).optional(),
  pe_limit: z.number().int().optional(),
});

export type PhysicalProductFindAllInput = z.infer<
  typeof PhysicalProductFindAllSchema
>;
export type OrderItemFindAllCustomerInput = z.infer<
  typeof OrderItemFindAllCustomerSchema
>;
export type OrderItemFindIdCustomerInput = z.infer<
  typeof OrderItemFindIdCustomerSchema
>;
export type PhysicalProductWarrantyIdInput = z.infer<
  typeof PhysicalProductWarrantyIdSchema
>;
export type PhysicalProductWarrantyIdCustomerInput = z.infer<
  typeof PhysicalProductWarrantyIdCustomerSchema
>;
export type PhysicalProductWarrantyMovInput = z.infer<
  typeof PhysicalProductWarrantyMovSchema
>;
export type PhysicalProductWarrantyMovCustomerInput = z.infer<
  typeof PhysicalProductWarrantyMovCustomerSchema
>;
export type PhysicalProductWarrantySearchInput = z.infer<
  typeof PhysicalProductWarrantySearchSchema
>;
