import "server-only";

import type {
  AxiosError,
  AxiosInstance,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";
import axios from "axios";
import { serverEnvs } from "@/core/config/envs.server";
import {
  API_TIMEOUTS,
  DEFAULT_HEADERS,
  EXTERNAL_API_BASE_URL,
  RETRY_CONFIG,
} from "@/core/constants/api-constants";
import { createLogger } from "@/core/logger";

const logger = createLogger("ServerAxiosClient");

type AxiosConfigWithRetry = InternalAxiosRequestConfig & {
  _retryCount?: number;
};

/**
 * Cliente Axios configurado para uso no servidor (Server Components e API Routes)
 * Usa API_KEY do projeto para autenticação
 */
class ServerAxiosClient {
  private baseURL: string;
  private apiKey: string;

  constructor() {
    this.baseURL = EXTERNAL_API_BASE_URL;
    this.apiKey = serverEnvs.API_KEY || "";

    if (!this.apiKey && typeof window === "undefined") {
      logger.warn("API_KEY não configurada no servidor");
    }
  }

  private createInstance(): AxiosInstance {
    const instance = axios.create({
      baseURL: this.baseURL,
      timeout: API_TIMEOUTS.SERVER_DEFAULT,
      headers: {
        ...DEFAULT_HEADERS,
        Accept: "application/json",
        "Cache-Control": "no-cache",
        "User-Agent": "NextJS-Server/1.0",
      },
    });

    this.setupInterceptors(instance);
    return instance;
  }

  private setupInterceptors(instance: AxiosInstance): void {
    instance.interceptors.request.use(
      (config) => {
        if (this.apiKey) {
          config.headers.Authorization = `Bearer ${this.apiKey}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      },
    );

    instance.interceptors.response.use(
      (response: AxiosResponse) => {
        return response;
      },
      async (error: AxiosError) => {
        logger.error("Erro na requisição da API", {
          status: error.response?.status,
          message: error.message,
          url: error.config?.url,
          method: error.config?.method?.toUpperCase(),
          data: error.response?.data,
        });

        const currentRetryCount =
          (error.config as AxiosConfigWithRetry)?._retryCount || 0;
        const shouldRetry =
          error.config &&
          currentRetryCount < RETRY_CONFIG.MAX_RETRIES &&
          this.shouldRetryRequest(error);

        if (shouldRetry && error.config) {
          (error.config as AxiosConfigWithRetry)._retryCount =
            currentRetryCount + 1;
          const delay = RETRY_CONFIG.RETRY_DELAY * 2 ** currentRetryCount;

          logger.warn(
            `Retry ${currentRetryCount + 1}/${RETRY_CONFIG.MAX_RETRIES} em ${delay}ms para ${error.config.url}`,
          );

          await new Promise((resolve) => setTimeout(resolve, delay));
          return instance.request(error.config);
        }

        return Promise.reject(error);
      },
    );
  }

  public get<T = unknown>(
    url: string,
    config?: Record<string, unknown>,
  ): Promise<AxiosResponse<T>> {
    const instance = this.createInstance();
    return instance.get<T>(url, config);
  }

  public post<T = unknown>(
    url: string,
    data?: unknown,
    config?: Record<string, unknown>,
  ): Promise<AxiosResponse<T>> {
    const instance = this.createInstance();
    return instance.post<T>(url, data, config);
  }

  public put<T = unknown>(
    url: string,
    data?: unknown,
    config?: Record<string, unknown>,
  ): Promise<AxiosResponse<T>> {
    const instance = this.createInstance();
    return instance.put<T>(url, data, config);
  }

  public patch<T = unknown>(
    url: string,
    data?: unknown,
    config?: Record<string, unknown>,
  ): Promise<AxiosResponse<T>> {
    const instance = this.createInstance();
    return instance.patch<T>(url, data, config);
  }

  public delete<T = unknown>(
    url: string,
    config?: Record<string, unknown>,
  ): Promise<AxiosResponse<T>> {
    const instance = this.createInstance();
    return instance.delete<T>(url, config);
  }

  public isApiKeyConfigured(): boolean {
    return Boolean(this.apiKey && this.apiKey.length > 0);
  }

  private shouldRetryRequest(error: AxiosError): boolean {
    const idempotentMethods = ["GET", "HEAD", "OPTIONS", "PUT", "DELETE"];
    const method = error.config?.method?.toUpperCase();

    if (!method || !idempotentMethods.includes(method)) {
      return false;
    }

    if (!error.response) {
      return true;
    }

    const status = error.response.status;
    return (RETRY_CONFIG.RETRY_CODES as readonly number[]).includes(status);
  }
}

const serverAxiosClient = new ServerAxiosClient();

export default serverAxiosClient;
export { ServerAxiosClient };
