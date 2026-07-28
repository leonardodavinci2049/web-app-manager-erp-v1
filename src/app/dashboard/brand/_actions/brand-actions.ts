"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createLogger } from "@/core/logger";
import { getAuthContext } from "@/server/auth-context";
import { brandServiceApi } from "@/services/api-main/brand";
import { getBrandById } from "@/services/api-main/brand/brand-service-api";
import { getProductsManager } from "@/services/api-main/product-manager/product-manager-service-api";
import type { BrandActionResult } from "../_components/types/brand-dashboard-types";

const logger = createLogger("BrandDashboardActions");
const BRAND_PATH = "/dashboard/brand";

const brandIdSchema = z.number().int().positive();

const createSchema = z.object({
  name: z.string().trim().min(1, "Informe o nome da marca.").max(100),
});

const updateSchema = z.object({
  brandId: brandIdSchema,
  name: z.string().trim().min(1, "Informe o nome da marca.").max(100),
  notes: z.string().trim().max(2000),
});

function safeFailure(
  message: string,
  error?: unknown,
  fieldErrors?: Record<string, string[]>,
): BrandActionResult {
  if (error) logger.error(message, error);
  return { success: false, message, fieldErrors };
}

/**
 * Cria uma marca ativa usando somente o nome. O ID e' gerado pela API e o
 * status inicial permanece ativo pelo comportamento do endpoint. Revalida a
 * rota somente apos sucesso e devolve o ID para abrir o novo detalhe.
 */
export async function createBrandAction(input: {
  name: string;
}): Promise<BrandActionResult> {
  const parsed = createSchema.safeParse(input);
  if (!parsed.success) {
    return safeFailure(
      "Revise os campos informados.",
      undefined,
      z.flattenError(parsed.error).fieldErrors,
    );
  }

  try {
    const { apiContext } = await getAuthContext();

    const response = await brandServiceApi.createBrand({
      pe_brand: parsed.data.name,
      ...apiContext,
    });

    const result = brandServiceApi.extractStoredProcedureResult(response);
    const brandId = result?.sp_return_id || response.recordId;

    if (!brandId || brandId <= 0) {
      return safeFailure(
        "Não foi possível confirmar a criação da marca. Tente novamente.",
      );
    }

    revalidatePath(BRAND_PATH);
    return {
      success: true,
      message: "Marca criada com sucesso.",
      brandId,
    };
  } catch (error) {
    return safeFailure("Não foi possível criar a marca.", error);
  }
}

/**
 * Atualiza nome e observacoes em uma unica submissao. Re-busca a marca com o
 * contexto autenticado para recusar registro inexistente ou inacessivel.
 * Preserva o imagePath existente e nao altera o status (slug nao e' editavel
 * pelo contrato atual da API).
 */
export async function updateBrandAction(
  input: z.input<typeof updateSchema>,
): Promise<BrandActionResult> {
  const parsed = updateSchema.safeParse(input);
  if (!parsed.success) {
    return safeFailure(
      "Revise os campos destacados.",
      undefined,
      z.flattenError(parsed.error).fieldErrors,
    );
  }

  try {
    const { apiContext } = await getAuthContext();
    const current = await getBrandById(parsed.data.brandId, apiContext);
    if (!current) {
      return safeFailure("Marca não encontrada.");
    }

    await brandServiceApi.updateBrand({
      pe_brand_id: parsed.data.brandId,
      pe_brand: parsed.data.name,
      pe_notes: parsed.data.notes,
      pe_image_path: current.imagePath ?? "",
      ...apiContext,
    });

    revalidatePath(BRAND_PATH);
    return { success: true, message: "Marca atualizada com sucesso." };
  } catch (error) {
    return safeFailure("Não foi possível atualizar a marca.", error);
  }
}

/**
 * Exclui a marca apos confirmar existencia e ausencia de produtos relacionados.
 * Reconsulta os produtos no servidor para cobrir chamadas diretas e concorrencia;
 * a API permanece a autoridade final para rejeitar conflitos.
 */
export async function deleteBrandAction(
  brandId: number,
): Promise<BrandActionResult> {
  if (!brandIdSchema.safeParse(brandId).success) {
    return safeFailure("Marca inválida.");
  }

  try {
    const { apiContext } = await getAuthContext();
    const current = await getBrandById(brandId, apiContext);
    if (!current) {
      return safeFailure("Marca não encontrada.");
    }

    const { total } = await getProductsManager({
      brandId,
      recordsQuantity: 1,
      pageId: 0,
      ...apiContext,
    });

    if (total > 0) {
      return safeFailure(
        "Esta marca possui produtos relacionados e não pode ser excluída.",
      );
    }

    await brandServiceApi.deleteBrand({
      pe_brand_id: brandId,
      ...apiContext,
    });

    revalidatePath(BRAND_PATH);
    return { success: true, message: "Marca excluída com sucesso." };
  } catch (error) {
    return safeFailure("Não foi possível excluir a marca.", error);
  }
}
