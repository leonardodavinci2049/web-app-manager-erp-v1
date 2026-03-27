import type { RowDataPacket } from "mysql2";

// Login feedback information

export interface SpDefaultFeedback extends RowDataPacket {
  sp_return_id: string;
  sp_message: string;
  sp_error_id: number;
}

// Database operation result
export interface SpOperationResult {
  fieldCount: number;
  affectedRows: number;
  insertId: number;
  info: string;
  serverStatus: number;
  warningStatus: number;
  changedRows: number;
}

export interface TblLogLoginFindAll extends RowDataPacket {
  log_id: number;
  app_id: number;
  app_name: string;
  organization_Id: string;
  organization_name: string;
  user_id: string;
  user_name: string;
  user_email: string;
  module_id: string;
  record_id: string;
  log: string;
  note: string;
  createdAt: Date;
}

export interface TblLoglogOperationFindAll extends RowDataPacket {
  log_id: number;
  app_id: number;
  app_name: string;
  organization_Id: string;
  organization_name: string;
  user_id: string;
  user_name: string;
  module_id: string;
  record_id: string;
  log: string;
  note: string;
  createdAt: Date;
}

export type SpResultRecordCreateType = [SpDefaultFeedback[], SpOperationResult];
export type SpResultRecordUpdateType = [SpDefaultFeedback[], SpOperationResult];
export type SpResultRecordDeleteType = [SpDefaultFeedback[], SpOperationResult];
export type SpResultRecordCheckExistType = [
  SpDefaultFeedback[],
  SpOperationResult,
];
// Or keep the tuple type and create a related interface
export type SpResultRecordLoginFindAllType = [
  TblLogLoginFindAll[], // Primeiro item: array de usuários
  SpDefaultFeedback[], // Terceiro item: resultado SQL
  SpOperationResult, // Segundo item: array de feedbacks
];

export type SpResultRecordOperationFindAllType = [
  TblLoglogOperationFindAll[], // Primeiro item: array de usuários
  SpDefaultFeedback[], // Terceiro item: resultado SQL
  SpOperationResult, // Segundo item: array de feedbacks
];
