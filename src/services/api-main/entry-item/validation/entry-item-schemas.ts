import { z } from "zod";

const ISO_DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;
const COLUMN_NAME_REGEX = /^[A-Za-z0-9_]+$/;

const EntryItemRequestContextSchema = z.object({
  pe_system_client_id: z.number().int().min(0).optional(),
  pe_organization_id: z.string().max(200).optional(),
  pe_user_id: z.string().max(200).optional(),
  pe_user_name: z.string().max(200).optional(),
  pe_user_role: z.string().max(200).optional(),
  pe_person_id: z.number().optional(),
});

export const EntryItemFindAllSchema = EntryItemRequestContextSchema.extend({
  pe_search: z.string().max(300).optional(),
  pe_type_id: z.number().int().min(0).optional(),
  pe_qt_records: z.number().int().min(1).max(1000).optional(),
  pe_page_id: z.number().int().min(0).optional(),
  pe_column_id: z.number().int().min(1).max(3).optional(),
  pe_order_id: z.number().int().min(1).max(2).optional(),
});

export const EntryItemFindEntryIdSchema = EntryItemRequestContextSchema.extend({
  pe_entry_id: z.number().int().positive(),
  pe_limit: z.number().int().min(1).max(1000).optional(),
});

export const EntryItemFindByIdSchema = EntryItemRequestContextSchema.extend({
  pe_item_movement_id: z.number().int().positive(),
});

export const EntryItemSearchSchema = EntryItemRequestContextSchema.extend({
  pe_search: z.string().max(300).optional(),
  pe_limit: z.number().int().min(1).max(1000).optional(),
});

export const EntryItemProductSearchSchema =
  EntryItemRequestContextSchema.extend({
    pe_supplier_id: z.number().int().optional(),
    pe_search: z.string().max(300).optional(),
    pe_limit: z.number().int().min(1).max(1000).optional(),
  });

export const EntryItemCreateSchema = EntryItemRequestContextSchema.extend({
  pe_member_id: z.string().max(200).optional(),
  pe_entry_id: z.number().int().positive(),
  pe_product_id: z.number().int().positive(),
});

export const EntryItemDeleteSchema = EntryItemRequestContextSchema.extend({
  pe_item_movement_id: z.number().int().positive(),
});

export const EntryItemUpdateDollarValueSchema =
  EntryItemRequestContextSchema.extend({
    pe_item_movement_id: z.number().int().positive(),
    pe_dollar_exchange_rate: z.number().positive(),
  });

export const EntryItemUpdateGeneralFieldSchema =
  EntryItemRequestContextSchema.extend({
    pe_register_id: z.number().int().positive(),
    pe_field_type: z.number().int().min(1).max(4),
    pe_field: z.string().max(200).regex(COLUMN_NAME_REGEX),
    pe_value_str: z.string().nullable().optional(),
    pe_value_int: z.number().int().nullable().optional(),
    pe_value_numeric: z.number().nullable().optional(),
    pe_value_date: z.string().regex(ISO_DATE_REGEX).nullable().optional(),
  });

export const EntryItemUpdateMainSchema = EntryItemRequestContextSchema.extend({
  pe_item_movement_id: z.number().int().positive(),
  pe_qt_comprada: z.number().int().min(0),
  pe_qt_recebida: z.number().int().min(0),
  pe_vl_unit_real: z.number(),
  pe_vl_frete_real: z.number(),
  pe_vl_nota: z.number(),
});

export const EntryItemUpdateNotesSchema = EntryItemRequestContextSchema.extend({
  pe_item_movement_id: z.number().int().positive(),
  pe_notes: z.string(),
});

export const EntryItemUpdateProductCostSchema =
  EntryItemRequestContextSchema.extend({
    pe_item_movement_id: z.number().int().positive(),
    pe_vl_custo: z.number().min(0),
  });

export const EntryItemUpdateProductPriceSchema =
  EntryItemRequestContextSchema.extend({
    pe_item_movement_id: z.number().int().positive(),
    pe_preco_venda_atac: z.number().min(0.1),
    pe_preco_venda_corporativo: z.number().min(0.1),
    pe_preco_venda_vare: z.number().min(0.1),
  });

export const EntryItemUpdateTaxCodesSchema =
  EntryItemRequestContextSchema.extend({
    pe_item_movement_id: z.number().int().positive(),
    pe_cst: z.string().max(100),
    pe_cfop: z.string().max(100),
    pe_ncm: z.string().max(100),
  });

export const EntryItemUpdateTaxRatesSchema =
  EntryItemRequestContextSchema.extend({
    pe_item_movement_id: z.number().int().positive(),
    pe_vl_icms: z.number(),
    pe_vl_ipi: z.number(),
    pe_vl_st: z.number(),
    pe_vl_ibs: z.number(),
    pe_vl_cbs: z.number(),
    pe_base_icms: z.number(),
    pe_base_st: z.number(),
    pe_base_ipi: z.number(),
    pe_base_ibs: z.number(),
    pe_base_cbs: z.number(),
  });

export type EntryItemFindAllInput = z.infer<typeof EntryItemFindAllSchema>;
export type EntryItemFindEntryIdInput = z.infer<
  typeof EntryItemFindEntryIdSchema
>;
export type EntryItemFindByIdInput = z.infer<typeof EntryItemFindByIdSchema>;
export type EntryItemSearchInput = z.infer<typeof EntryItemSearchSchema>;
export type EntryItemProductSearchInput = z.infer<
  typeof EntryItemProductSearchSchema
>;
export type EntryItemCreateInput = z.infer<typeof EntryItemCreateSchema>;
export type EntryItemDeleteInput = z.infer<typeof EntryItemDeleteSchema>;
export type EntryItemUpdateDollarValueInput = z.infer<
  typeof EntryItemUpdateDollarValueSchema
>;
export type EntryItemUpdateGeneralFieldInput = z.infer<
  typeof EntryItemUpdateGeneralFieldSchema
>;
export type EntryItemUpdateMainInput = z.infer<
  typeof EntryItemUpdateMainSchema
>;
export type EntryItemUpdateNotesInput = z.infer<
  typeof EntryItemUpdateNotesSchema
>;
export type EntryItemUpdateProductCostInput = z.infer<
  typeof EntryItemUpdateProductCostSchema
>;
export type EntryItemUpdateProductPriceInput = z.infer<
  typeof EntryItemUpdateProductPriceSchema
>;
export type EntryItemUpdateTaxCodesInput = z.infer<
  typeof EntryItemUpdateTaxCodesSchema
>;
export type EntryItemUpdateTaxRatesInput = z.infer<
  typeof EntryItemUpdateTaxRatesSchema
>;
