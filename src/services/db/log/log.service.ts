import { MESSAGES } from "@/core/constants/globalConstants";

import dbService from "@/database/dbConnection";
import { processProcedureResultMutation } from "@/database/utils/process-procedure-result.mutation";
import { processProcedureResultQueryWithoutId } from "@/database/utils/process-procedure-result.query";
import { ResultModel } from "@/database/utils/result.model";
import { validateLogLoginCreateDto } from "./dto/log_login_create.dto";
import { validateLogLoginFindAllDto } from "./dto/log_login_find_all.dto";
import { validateLogOperationCreateDto } from "./dto/log_operation_create.dto";
import { validateLogOperationFindAllDto } from "./dto/log_operation_find_all.dto";
import { LogLoginCreateQuery } from "./query/log_login_create.query";
import { LogLoginFindAllQuery } from "./query/log_login_find_all.query";
import { LogOperationCreateQuery } from "./query/log_operation_create.query";
import { LogOperationFindAllQuery } from "./query/log_operation_find_all.query";
import type {
  SpResultRecordCreateType,
  SpResultRecordLoginFindAllType,
  SpResultRecordOperationFindAllType,
  TblLogLoginFindAll,
  TblLoglogOperationFindAll,
} from "./types/log.type";

export class LogService {
  async execLogLoginCreateQuery(dataJsonDto: unknown): Promise<ResultModel> {
    try {
      const validatedDto = validateLogLoginCreateDto(dataJsonDto);

      const queryString = await LogLoginCreateQuery(validatedDto);

      const resultData = (await dbService.selectExecute(
        queryString,
      )) as unknown as SpResultRecordCreateType;

      return processProcedureResultMutation(
        resultData as unknown[],
        "Login log creation failed",
      );
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : MESSAGES.UNKNOWN_ERROR;
      return new ResultModel(100404, errorMessage, "", []);
    }
  }

  async execLogLoginFindAllQuery(dataJsonDto: unknown): Promise<ResultModel> {
    try {
      const validatedDto = validateLogLoginFindAllDto(dataJsonDto);

      const queryString = await LogLoginFindAllQuery(validatedDto);

      const resultData = (await dbService.selectExecute(
        queryString,
      )) as unknown as SpResultRecordLoginFindAllType;

      return processProcedureResultQueryWithoutId<TblLogLoginFindAll>(
        resultData as unknown[],
        "Login logs not found",
      );
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : MESSAGES.UNKNOWN_ERROR;
      return new ResultModel(100404, errorMessage, "", []);
    }
  }

  async execLogOperationCreateQuery(
    dataJsonDto: unknown,
  ): Promise<ResultModel> {
    try {
      const validatedDto = validateLogOperationCreateDto(dataJsonDto);

      const queryString = await LogOperationCreateQuery(validatedDto);

      const resultData = (await dbService.selectExecute(
        queryString,
      )) as unknown as SpResultRecordCreateType;

      return processProcedureResultMutation(
        resultData as unknown[],
        "Operation log creation failed",
      );
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : MESSAGES.UNKNOWN_ERROR;
      return new ResultModel(100404, errorMessage, "", []);
    }
  }

  async execLogOperationFindAllQuery(
    dataJsonDto: unknown,
  ): Promise<ResultModel> {
    try {
      const validatedDto = validateLogOperationFindAllDto(dataJsonDto);

      const queryString = await LogOperationFindAllQuery(validatedDto);

      const resultData = (await dbService.selectExecute(
        queryString,
      )) as unknown as SpResultRecordOperationFindAllType;

      return processProcedureResultQueryWithoutId<TblLoglogOperationFindAll>(
        resultData as unknown[],
        "Operation logs not found",
      );
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : MESSAGES.UNKNOWN_ERROR;
      return new ResultModel(100404, errorMessage, "", []);
    }
  }
}

const logService = new LogService();
export default logService;
