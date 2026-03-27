import { envs } from "@/core/config";
import type { LogLoginCreateDto } from "../dto/log_login_create.dto";

export function LogLoginCreateQuery(dataJsonDto: LogLoginCreateDto): string {
  const PE_APP_ID = envs.APP_ID;
  const PE_ORGANIZATION_ID = dataJsonDto.PE_ORGANIZATION_ID || "";
  const PE_USER_ID = dataJsonDto.PE_USER_ID || "";
  const PE_MODULE_ID = dataJsonDto.PE_MODULE_ID || 0;
  const PE_RECORD_ID = dataJsonDto.PE_RECORD_ID || "";
  const PE_LOG = dataJsonDto.PE_LOG || "";
  const PE_NOTE = dataJsonDto.PE_NOTE || "";

  const queryString = ` call sp_log_login_create_v1(
        ${PE_APP_ID},
        '${PE_ORGANIZATION_ID}',
        '${PE_USER_ID}',
        ${PE_MODULE_ID},
        ${PE_RECORD_ID},
        '${PE_LOG}',
        '${PE_NOTE}'
        ) `;

  return queryString;
}
