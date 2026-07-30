"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createLogger } from "@/core/logger";
import { getAuthContext } from "@/server/auth-context";
import {
  getSupplierById,
  SupplierError,
  SupplierNotFoundError,
  supplierServiceApi,
} from "@/services/api-main/supplier";
import type { SupplierActionResult } from "../_components/types/supplier-dashboard-types";

const logger = createLogger("SupplierDashboardActions");
const SUPPLIER_PATH = "/dashboard/suppliers";

const supplierIdSchema = z.number().int().positive();
const createSchema = z.object({
  name: z.string().trim().min(1, "Informe o nome do fornecedor.").max(100),
});
const updateSchema = z.object({
  supplierId: supplierIdSchema,
  name: z.string().trim().min(1, "Informe o nome do fornecedor.").max(100),
  notes: z.string().trim().max(2000),
});
const statusSchema = z.object({
  supplierId: supplierIdSchema,
  inactive: z.boolean(),
});

function slugify(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function safeFailure(
  message: string,
  error?: unknown,
  fieldErrors?: Record<string, string[]>,
): SupplierActionResult {
  if (error) logger.error(message, error);
  return { success: false, message, fieldErrors };
}

function getSafeOperationMessage(error: unknown, fallback: string): string {
  if (
    error instanceof SupplierError &&
    error.code === "SUPPLIER_OPERATION_ERROR"
  ) {
    const message = error.message.trim().slice(0, 300);
    if (message) return message;
  }
  return fallback;
}

async function getExistingSupplier(
  supplierId: number,
): Promise<
  | { apiContext: Awaited<ReturnType<typeof getAuthContext>>["apiContext"] }
  | SupplierActionResult
> {
  const { apiContext } = await getAuthContext();
  try {
    const supplier = await getSupplierById(supplierId, apiContext);
    if (!supplier) return safeFailure("Fornecedor não encontrado.");
    return { apiContext };
  } catch (error) {
    if (error instanceof SupplierNotFoundError) {
      return safeFailure("Fornecedor não encontrado.");
    }
    throw error;
  }
}

function revalidateSupplier(supplierId?: number): void {
  revalidatePath(SUPPLIER_PATH);
  if (supplierId) revalidatePath(`${SUPPLIER_PATH}/${supplierId}`);
}

export async function createSupplierAction(input: {
  name: string;
}): Promise<SupplierActionResult> {
  const parsed = createSchema.safeParse(input);
  if (!parsed.success) {
    return safeFailure(
      "Revise os campos informados.",
      undefined,
      z.flattenError(parsed.error).fieldErrors,
    );
  }

  const slug = slugify(parsed.data.name);
  if (!slug) {
    return safeFailure("Informe um nome que possa gerar um slug válido.");
  }

  try {
    const { apiContext } = await getAuthContext();
    const response = await supplierServiceApi.createSupplier({
      pe_supplier_name: parsed.data.name,
      pe_slug: slug,
      ...apiContext,
    });
    const operation = supplierServiceApi.extractStoredProcedureResult(response);
    const supplierId = operation?.sp_return_id || response.recordId;

    if (!supplierId || supplierId <= 0) {
      return safeFailure("Não foi possível confirmar a criação do fornecedor.");
    }

    revalidateSupplier();
    return {
      success: true,
      message: "Fornecedor criado com sucesso.",
      supplierId,
    };
  } catch (error) {
    return safeFailure(
      getSafeOperationMessage(error, "Não foi possível criar o fornecedor."),
      error,
    );
  }
}

export async function updateSupplierAction(
  input: z.input<typeof updateSchema>,
): Promise<SupplierActionResult> {
  const parsed = updateSchema.safeParse(input);
  if (!parsed.success) {
    return safeFailure(
      "Revise os campos destacados.",
      undefined,
      z.flattenError(parsed.error).fieldErrors,
    );
  }

  try {
    const context = await getExistingSupplier(parsed.data.supplierId);
    if ("success" in context) return context;

    await supplierServiceApi.updateSupplier({
      pe_supplier_id: parsed.data.supplierId,
      pe_supplier: parsed.data.name,
      pe_notes: parsed.data.notes,
      ...context.apiContext,
    });

    revalidateSupplier(parsed.data.supplierId);
    return { success: true, message: "Fornecedor atualizado com sucesso." };
  } catch (error) {
    return safeFailure(
      getSafeOperationMessage(
        error,
        "Não foi possível atualizar o fornecedor.",
      ),
      error,
    );
  }
}

export async function setSupplierStatusAction(
  input: z.input<typeof statusSchema>,
): Promise<SupplierActionResult> {
  const parsed = statusSchema.safeParse(input);
  if (!parsed.success) return safeFailure("Operação de status inválida.");

  try {
    const context = await getExistingSupplier(parsed.data.supplierId);
    if ("success" in context) return context;

    await supplierServiceApi.updateSupplier({
      pe_supplier_id: parsed.data.supplierId,
      pe_inactive: parsed.data.inactive ? 1 : 0,
      ...context.apiContext,
    });

    revalidateSupplier(parsed.data.supplierId);
    return {
      success: true,
      message: parsed.data.inactive
        ? "Fornecedor marcado como inativo."
        : "Fornecedor marcado como ativo.",
    };
  } catch (error) {
    return safeFailure(
      getSafeOperationMessage(
        error,
        "Não foi possível alterar o status do fornecedor.",
      ),
      error,
    );
  }
}

export async function deleteSupplierAction(
  supplierId: number,
): Promise<SupplierActionResult> {
  if (!supplierIdSchema.safeParse(supplierId).success) {
    return safeFailure("Fornecedor inválido.");
  }

  try {
    const context = await getExistingSupplier(supplierId);
    if ("success" in context) return context;

    await supplierServiceApi.deleteSupplier({
      pe_supplier_id: supplierId,
      ...context.apiContext,
    });

    revalidateSupplier(supplierId);
    return { success: true, message: "Fornecedor excluído com sucesso." };
  } catch (error) {
    return safeFailure(
      getSafeOperationMessage(error, "Não foi possível excluir o fornecedor."),
      error,
    );
  }
}
