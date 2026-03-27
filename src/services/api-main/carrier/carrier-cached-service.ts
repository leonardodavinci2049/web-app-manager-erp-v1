import "server-only";

import { cacheLife, cacheTag } from "next/cache";
import { CACHE_TAGS } from "@/lib/cache-config";

import { carrierServiceApi } from "./carrier-service-api";
import {
  transformCarrier,
  transformCarrierList,
  type UICarrier,
} from "./transformers/transformers";

export async function getCarriers(
  params: {
    search?: string;
    limit?: number;
    pe_system_client_id?: number;
    pe_organization_id?: string;
    pe_user_id?: string;
    pe_user_name?: string;
    pe_user_role?: string;
    pe_person_id?: number;
  } = {},
): Promise<UICarrier[]> {
  "use cache";
  cacheLife("seconds");
  cacheTag(CACHE_TAGS.carriers);

  if (!params.pe_system_client_id) {
    return [];
  }

  const response = await carrierServiceApi.findAllCarriers({
    pe_search: params.search,
    pe_limit: params.limit,
    pe_system_client_id: params.pe_system_client_id,
    pe_organization_id: params.pe_organization_id,
    pe_user_id: params.pe_user_id,
    pe_user_name: params.pe_user_name,
    pe_user_role: params.pe_user_role,
    pe_person_id: params.pe_person_id,
  });

  const carriers = carrierServiceApi.extractCarriers(response);
  return transformCarrierList(carriers);
}

export async function getCarrierById(
  id: number,
  params: {
    pe_system_client_id?: number;
    pe_organization_id?: string;
    pe_user_id?: string;
    pe_user_name?: string;
    pe_user_role?: string;
    pe_person_id?: number;
  } = {},
): Promise<UICarrier | undefined> {
  "use cache";
  cacheLife("hours");
  cacheTag(CACHE_TAGS.carrier(String(id)), CACHE_TAGS.carriers);

  if (!params.pe_system_client_id) {
    return undefined;
  }

  const response = await carrierServiceApi.findCarrierById({
    pe_carrier_id: id,
    pe_system_client_id: params.pe_system_client_id,
    pe_organization_id: params.pe_organization_id,
    pe_user_id: params.pe_user_id,
    pe_user_name: params.pe_user_name,
    pe_user_role: params.pe_user_role,
    pe_person_id: params.pe_person_id,
  });

  const carrier = carrierServiceApi.extractCarrierById(response);
  if (!carrier) {
    return undefined;
  }

  return transformCarrier(carrier) ?? undefined;
}
