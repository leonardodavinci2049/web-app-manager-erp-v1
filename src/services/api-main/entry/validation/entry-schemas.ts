import { z } from "zod";

const ISO_DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;
const COLUMN_NAME_REGEX = /^[A-Za-z0-9_]+$/;

const EntryRequestContextSchema = z.object({
  pe_system_client_id: z.number().int().min(0).optional(),
  pe_organization_id: z.string().max(200).optional(),
  pe_user_id: z.string().max(200).optional(),
  pe_user_name: z.string().max(200).optional(),
  pe_user_role: z.string().max(200).optional(),
  pe_person_id: z.number().optional(),
});

export const EntryFindAllSchema = EntryRequestContextSchema.extend({
  pe_search: z.string().max(300).optional(),
  pe_flag_operation_list: z.number().int().min(0).max(3).optional(),
  pe_start_date: z.string().regex(ISO_DATE_REGEX).nullable().optional(),
  pe_end_date: z.string().regex(ISO_DATE_REGEX).nullable().optional(),
  pe_qt_records: z.number().int().min(1).max(1000).optional(),
  pe_page_id: z.number().int().min(0).optional(),
  pe_column_id: z.number().int().min(1).max(3).optional(),
  pe_order_id: z.number().int().min(1).max(2).optional(),
});

export const EntryFindByIdSchema = EntryRequestContextSchema.extend({
  pe_entry_id: z.number().int().positive(),
});

export const EntrySearchAllSchema = EntryRequestContextSchema.extend({
  pe_search: z.string().max(300).optional(),
  pe_limit: z.number().int().min(1).max(1000).optional(),
});

export const EntryCreateSchema = EntryRequestContextSchema.extend({
  pe_member_id: z.string().max(200).optional(),
  pe_supplier_id: z.number().int().positive(),
  pe_carrier_id: z.number().int().positive(),
  pe_category_id: z.number().int().positive(),
  pe_invoice_number: z.string().max(100),
  pe_model: z.string().max(100),
  pe_total_invoice_value: z.number(),
  pe_total_product_value: z.number(),
  pe_freight_value: z.number(),
  pe_freight_rate: z.number(),
  pe_exchange_rate: z.number(),
  pe_vl_icms: z.number(),
  pe_vl_ipi: z.number(),
  pe_vl_pis: z.number(),
  pe_vl_confins: z.number(),
  pe_vl_ibs: z.number(),
  pe_vl_cbs: z.number(),
  pe_notes: z.string(),
});

export const EntryDeleteSchema = EntryRequestContextSchema.extend({
  pe_entry_id: z.number().int().positive(),
});

export const EntryProcessInventorySchema = EntryRequestContextSchema.extend({
  pe_entry_id: z.number().int().positive(),
});

export const EntryUpdateCarrierSchema = EntryRequestContextSchema.extend({
  pe_entry_id: z.number().int().positive(),
  pe_carrier_id: z.number().int().positive(),
});

export const EntryUpdateGeneralFieldSchema = EntryRequestContextSchema.extend({
  pe_register_id: z.number().int().positive(),
  pe_field_type: z.number().int().min(1).max(4),
  pe_field: z.string().max(200).regex(COLUMN_NAME_REGEX),
  pe_value_str: z.string().nullable().optional(),
  pe_value_int: z.number().int().nullable().optional(),
  pe_value_numeric: z.number().nullable().optional(),
  pe_value_date: z.string().regex(ISO_DATE_REGEX).nullable().optional(),
});

export const EntryUpdateMainSchema = EntryRequestContextSchema.extend({
  pe_entry_id: z.number().int().positive(),
  pe_invoice_number: z.string().max(100),
  pe_model: z.string().max(255),
  pe_freight_value: z.number(),
  pe_freight_rate: z.number(),
  pe_exchange_rate: z.number(),
});

export const EntryUpdateNotesSchema = EntryRequestContextSchema.extend({
  pe_entry_id: z.number().int().positive(),
  pe_notes: z.string(),
});

export const EntryUpdateSupplierSchema = EntryRequestContextSchema.extend({
  pe_entry_id: z.number().int().positive(),
  pe_supplier_id: z.number().int().positive(),
});

export const EntryUpdateTaxRatesSchema = EntryRequestContextSchema.extend({
  pe_entry_id: z.number().int().positive(),
  pe_vl_icms: z.number(),
  pe_vl_ipi: z.number(),
  pe_vl_pis: z.number(),
  pe_vl_confins: z.number(),
  pe_vl_ibs: z.number(),
  pe_vl_cbs: z.number(),
});

export type EntryFindAllInput = z.infer<typeof EntryFindAllSchema>;
export type EntryFindByIdInput = z.infer<typeof EntryFindByIdSchema>;
export type EntrySearchAllInput = z.infer<typeof EntrySearchAllSchema>;
export type EntryCreateInput = z.infer<typeof EntryCreateSchema>;
export type EntryDeleteInput = z.infer<typeof EntryDeleteSchema>;
export type EntryProcessInventoryInput = z.infer<
  typeof EntryProcessInventorySchema
>;
export type EntryUpdateCarrierInput = z.infer<typeof EntryUpdateCarrierSchema>;
export type EntryUpdateGeneralFieldInput = z.infer<
  typeof EntryUpdateGeneralFieldSchema
>;
export type EntryUpdateMainInput = z.infer<typeof EntryUpdateMainSchema>;
export type EntryUpdateNotesInput = z.infer<typeof EntryUpdateNotesSchema>;
export type EntryUpdateSupplierInput = z.infer<
  typeof EntryUpdateSupplierSchema
>;
export type EntryUpdateTaxRatesInput = z.infer<
  typeof EntryUpdateTaxRatesSchema
>;
