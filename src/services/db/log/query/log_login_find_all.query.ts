import { envs } from "@/core/config";
import type { LogLoginFindAllDto } from "../dto/log_login_find_all.dto";

export function LogLoginFindAllQuery(dataJsonDto: LogLoginFindAllDto): string {
  const PE_APP_ID = envs.APP_ID;
  const PE_ORGANIZATION_ID = dataJsonDto.PE_ORGANIZATION_ID || "";
  const PE_USER_ID = dataJsonDto.PE_USER_ID || "";
  const PE_SEARCH_USER = dataJsonDto.PE_SEARCH_USER || "";
  const PE_LIMIT = dataJsonDto.PE_LIMIT || 50;

  const queryString = ` call sp_log_login_find_all_v2(
        ${PE_APP_ID},
        '${PE_ORGANIZATION_ID}',
        '${PE_USER_ID}',
        '${PE_SEARCH_USER}',
         ${PE_LIMIT}
        ) `;

  return queryString;
}
