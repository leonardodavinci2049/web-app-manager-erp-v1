import { resultQueryData } from "./procedure.result";
import type { ResultModel } from "./result.model";

interface SpDefaultFeedback {
  sp_return_id?: string;
  sp_message?: string;
  sp_error_id?: number;
}

export function processProcedureResultQuery<T extends { id: string }>(
  resultData: unknown[] | [unknown[], unknown[]],
  notFoundMessage: string,
): ResultModel {
  const firstResultSet = resultData[0] as unknown[];
  const secondResultSet = resultData[1] as unknown[];

  // Verifica se o primeiro array é na verdade o feedback (isso acontece quando não há registros e a procedure "pula" o SELECT)
  const isFirstResultFeedback =
    firstResultSet.length > 0 &&
    typeof firstResultSet[0] === "object" &&
    firstResultSet[0] !== null &&
    "sp_error_id" in firstResultSet[0];

  let tblRecords: T[] = [];
  let DefaultFeedback: SpDefaultFeedback[] = [];

  if (isFirstResultFeedback) {
    tblRecords = [];
    DefaultFeedback = firstResultSet as SpDefaultFeedback[];
  } else {
    tblRecords = firstResultSet as T[];
    DefaultFeedback = (secondResultSet as SpDefaultFeedback[]) || [];
  }

  const qtRecords: number = tblRecords.length;
  const tblRecord = tblRecords[0] || null;
  const recordId: string = tblRecord?.id ?? "";

  const errorId: number = DefaultFeedback[0]?.sp_error_id ?? 0;
  let Feedback = DefaultFeedback[0]?.sp_message || "";

  if (qtRecords === 0 && errorId === 0) {
    Feedback = notFoundMessage;
  }

  return resultQueryData<T[]>(
    0,
    recordId,
    errorId,
    Feedback,
    tblRecords,
    qtRecords,
    "",
  );
}

export function processProcedureResultQueryWithoutId<T>(
  resultData: unknown[] | [unknown[], unknown[]],
  notFoundMessage: string,
): ResultModel {
  const firstResultSet = resultData[0] as unknown[];
  const secondResultSet = resultData[1] as unknown[];

  const isFirstResultFeedback =
    firstResultSet.length > 0 &&
    typeof firstResultSet[0] === "object" &&
    firstResultSet[0] !== null &&
    "sp_error_id" in firstResultSet[0];

  let tblRecords: T[] = [];
  let DefaultFeedback: SpDefaultFeedback[] = [];

  if (isFirstResultFeedback) {
    tblRecords = [];
    DefaultFeedback = firstResultSet as SpDefaultFeedback[];
  } else {
    tblRecords = firstResultSet as T[];
    DefaultFeedback = (secondResultSet as SpDefaultFeedback[]) || [];
  }

  const qtRecords: number = tblRecords.length;
  const recordId: string = qtRecords > 0 ? String(tblRecords.length) : "";

  const errorId: number = DefaultFeedback[0]?.sp_error_id ?? 0;
  let Feedback = DefaultFeedback[0]?.sp_message || "";

  if (qtRecords === 0 && errorId === 0) {
    Feedback = notFoundMessage;
  }

  return resultQueryData<T[]>(
    0,
    recordId,
    errorId,
    Feedback,
    tblRecords,
    qtRecords,
    "",
  );
}
