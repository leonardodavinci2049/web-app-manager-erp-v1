import "server-only";

import { serverEnvs } from "@/core/config/envs.server";
import { CHECK_ENDPOINTS } from "@/core/constants/api-constants";
import { createLogger } from "@/core/logger";
import { BaseApiService } from "@/lib/axios/base-api-service";

import type {
  CheckTermRequest,
  CheckTermResponse,
  StoredProcedureResponse,
} from "./types/check-types";
import { CheckError } from "./types/check-types";
import { CheckTermSchema } from "./validation/check-schemas";

const logger = createLogger("CheckServiceApi");

export class CheckServiceApi extends BaseApiService {
  private buildBasePayload(
    additionalData: Record<string, unknown> = {},
  ): Record<string, unknown> {
    return {
      pe_app_id: serverEnvs.APP_ID,
      pe_store_id: serverEnvs.STORE_ID,
      ...additionalData,
      pe_system_client_id: serverEnvs.SYSTEM_CLIENT_ID,
      pe_organization_id: serverEnvs.ORGANIZATION_ID,
    };
  }

  private async checkTerm(
    params: CheckTermRequest,
    endpoint: string,
    context: string,
  ): Promise<CheckTermResponse> {
    try {
      const validatedParams = CheckTermSchema.parse(params);
      const requestBody = this.buildBasePayload(validatedParams);

      const response = await this.post<CheckTermResponse>(
        endpoint,
        requestBody,
      );

      this.checkStoredProcedureError(response, context);
      return response;
    } catch (error) {
      logger.error(`Erro ao verificar ${context}`, error);
      throw error;
    }
  }

  async checkIfEmailExists(
    params: CheckTermRequest,
  ): Promise<CheckTermResponse> {
    return this.checkTerm(params, CHECK_ENDPOINTS.EMAIL, "e-mail");
  }

  async checkIfCpfExists(params: CheckTermRequest): Promise<CheckTermResponse> {
    return this.checkTerm(params, CHECK_ENDPOINTS.CPF, "CPF");
  }

  async checkIfCnpjExists(
    params: CheckTermRequest,
  ): Promise<CheckTermResponse> {
    return this.checkTerm(params, CHECK_ENDPOINTS.CNPJ, "CNPJ");
  }

  async checkIfTaxonomyNameExists(
    params: CheckTermRequest,
  ): Promise<CheckTermResponse> {
    return this.checkTerm(
      params,
      CHECK_ENDPOINTS.TAXONOMY_NAME,
      "nome de taxonomia",
    );
  }

  async checkIfTaxonomySlugExists(
    params: CheckTermRequest,
  ): Promise<CheckTermResponse> {
    return this.checkTerm(
      params,
      CHECK_ENDPOINTS.TAXONOMY_SLUG,
      "slug de taxonomia",
    );
  }

  async checkIfProductNameExists(
    params: CheckTermRequest,
  ): Promise<CheckTermResponse> {
    return this.checkTerm(
      params,
      CHECK_ENDPOINTS.PRODUCT_NAME,
      "nome de produto",
    );
  }

  async checkIfProductSlugExists(
    params: CheckTermRequest,
  ): Promise<CheckTermResponse> {
    return this.checkTerm(
      params,
      CHECK_ENDPOINTS.PRODUCT_SLUG,
      "slug de produto",
    );
  }

  private checkStoredProcedureError(
    response: CheckTermResponse,
    context: string,
  ): void {
    const spResponse = response.data?.[0] as StoredProcedureResponse;
    if (spResponse && spResponse.sp_error_id !== 0) {
      throw new CheckError(
        spResponse.sp_message || `Erro ao verificar ${context}`,
        "CHECK_OPERATION_ERROR",
        spResponse.sp_error_id,
      );
    }
  }

  extractCheckResult(
    response: CheckTermResponse,
  ): StoredProcedureResponse | null {
    return response.data?.[0] ?? null;
  }

  isTermAvailable(response: CheckTermResponse): boolean {
    const result = this.extractCheckResult(response);
    return result !== null && result.sp_return_id === 0;
  }
}

export const checkServiceApi = new CheckServiceApi();
