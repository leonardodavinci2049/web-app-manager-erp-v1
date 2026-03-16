import "server-only";

import type { ResultSetHeader, RowDataPacket } from "mysql2/promise";
import type {
  Account,
  Invitation,
  InvitationWithInviter,
  Member,
  MemberWithUser,
  Organization,
  OrganizationRole,
  OrganizationWithMembers,
  Session,
  Subscription,
  Team,
  TeamMember,
  TeamMemberWithUser,
  TeamWithOrganization,
  TwoFactor,
  User,
  Verification,
} from "../dto/auth.dto";

export type {
  Account,
  Invitation,
  InvitationWithInviter,
  Member,
  MemberWithUser,
  Organization,
  OrganizationRole,
  OrganizationWithMembers,
  Session,
  Subscription,
  Team,
  TeamMember,
  TeamMemberWithUser,
  TeamWithOrganization,
  TwoFactor,
  User,
  Verification,
};

// ============================================================================
// Enums e Constantes
// ============================================================================

export const AUTH_TABLES = {
  USER: "user",
  MEMBER: "member",
  ORGANIZATION: "organization",
  SESSION: "session",
  ACCOUNT: "account",
  INVITATION: "invitation",
  VERIFICATION: "verification",
  TWO_FACTOR: "twofactor",
  TEAM: "team",
  TEAM_MEMBER: "teammember",
  ORGANIZATION_ROLE: "organizationrole",
  SUBSCRIPTION: "subscription",
} as const;

export type AuthTable = (typeof AUTH_TABLES)[keyof typeof AUTH_TABLES];

// ============================================================================
// Tipos Base - Entidades do Banco de Dados
// ============================================================================

/**
 * Representa um usuário no sistema de autenticação
 */
export interface UserEntity extends RowDataPacket {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image: string | null;
  createdAt: Date;
  updatedAt: Date;
  twoFactorEnabled: boolean;
  role: string | null;
  banned: boolean | null;
  banReason: string | null;
  banExpires: Date | null;
}

/**
 * Representa um membro de uma organização
 */
export interface MemberEntity extends RowDataPacket {
  id: string;
  organizationId: string;
  userId: string;
  role: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Membro com dados do usuário incluídos (JOIN)
 */
export interface MemberWithUserEntity extends MemberEntity {
  user_id: string;
  user_name: string;
  user_email: string;
  user_emailVerified: boolean;
  user_image: string | null;
  user_createdAt: Date;
  user_updatedAt: Date;
  user_twoFactorEnabled: boolean;
  user_role: string | null;
  user_banned: boolean | null;
  user_banReason: string | null;
  user_banExpires: Date | null;
}

/**
 * Representa uma organização
 */
export interface OrganizationEntity extends RowDataPacket {
  id: string;
  name: string;
  slug: string | null;
  logo: string | null;
  createdAt: Date | null;
  metadata: string | null;
  system_id: number | null;
}

/**
 * Organização com membros e usuários incluídos (JOIN)
 */
export interface OrganizationWithMembersEntity extends OrganizationEntity {
  members?: MemberWithUser[];
}

/**
 * Representa uma sessão de usuário
 */
export interface SessionEntity extends RowDataPacket {
  id: string;
  expiresAt: Date;
  token: string | null;
  createdAt: Date;
  updatedAt: Date;
  ipAddress: string | null;
  userAgent: string | null;
  userId: string;
  impersonatedBy: string | null;
  activeOrganizationId: string | null;
  activeTeamId: string | null;
}

/**
 * Representa uma conta de autenticação (OAuth, credentials, etc.)
 */
export interface AccountEntity extends RowDataPacket {
  id: string;
  accountId: string;
  providerId: string;
  userId: string;
  accessToken: string | null;
  refreshToken: string | null;
  idToken: string | null;
  accessTokenExpiresAt: Date | null;
  refreshTokenExpiresAt: Date | null;
  scope: string | null;
  password: string | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Representa um convite para uma organização
 */
export interface InvitationEntity extends RowDataPacket {
  id: string;
  organizationId: string;
  teamId: string | null;
  email: string;
  role: string | null;
  status: string;
  expiresAt: Date;
  inviterId: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Convite com dados do usuário convidador (JOIN)
 */
export interface InvitationWithInviterEntity extends InvitationEntity {
  inviter_id: string;
  inviter_name: string;
  inviter_email: string;
  inviter_image: string | null;
}

/**
 * Representa uma verificação (email, reset password, etc.)
 */
export interface VerificationEntity extends RowDataPacket {
  id: string;
  identifier: string | null;
  value: string | null;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Representa a configuração de autenticação de dois fatores
 */
export interface TwoFactorEntity extends RowDataPacket {
  id: string;
  userId: string;
  secret: string | null;
  backupCodes: string;
}

/**
 * Representa um time dentro de uma organização
 */
export interface TeamEntity extends RowDataPacket {
  id: string;
  name: string | null;
  organizationId: string;
  createdAt: Date | null;
  updatedAt: Date | null;
}

/**
 * Time com dados da organização (JOIN)
 */
export interface TeamWithOrganizationEntity extends TeamEntity {
  organization_id: string;
  organization_name: string;
  organization_slug: string | null;
}

/**
 * Representa um membro de um time
 */
export interface TeamMemberEntity extends RowDataPacket {
  id: string;
  teamId: string;
  userId: string;
  createdAt: Date | null;
}

/**
 * Membro de time com dados do usuário (JOIN)
 */
export interface TeamMemberWithUserEntity extends TeamMemberEntity {
  user_id: string;
  user_name: string;
  user_email: string;
  user_image: string | null;
}

/**
 * Representa uma role customizada de organização
 */
export interface OrganizationRoleEntity extends RowDataPacket {
  id: string;
  organizationId: string;
  organizationRolecol: string | null;
  role: string | null;
  permission: string | null;
  createdAt: Date | null;
  updatedAt: Date | null;
}

/**
 * Representa uma subscription (assinatura do usuário)
 */
export interface SubscriptionEntity extends RowDataPacket {
  id: string;
  userId: string;
  plan: string;
  status: string;
  approvedAt: Date | null;
  createdAt: Date | null;
}

// ============================================================================
// Tipos de Request/Response
// ============================================================================

/**
 * Parâmetros para buscar usuário por ID
 */
export interface FindUserByIdParams {
  userId: string;
}

/**
 * Parâmetros para buscar membros por organização
 */
export interface FindMembersByOrganizationParams {
  organizationId: string;
}

/**
 * Parâmetros para buscar membro por usuário
 */
export interface FindMemberByUserParams {
  userId: string;
}

/**
 * Parâmetros para deletar membro
 */
export interface DeleteMemberParams {
  memberId: string;
}

/**
 * Parâmetros para buscar organização por slug
 */
export interface FindOrganizationBySlugParams {
  slug: string;
}

/**
 * Parâmetros para buscar organizações por IDs
 */
export interface FindOrganizationsByIdsParams {
  organizationIds: string[];
}

/**
 * Parâmetros para buscar usuários excluindo IDs específicos
 */
export interface FindUsersExcludingIdsParams {
  excludeUserIds: string[];
}

// ============================================================================
// Tipos de Resposta do Serviço
// ============================================================================

/**
 * Resposta genérica do serviço
 */
export interface ServiceResponse<T> {
  success: boolean;
  data: T | null;
  error: string | null;
}

/**
 * Resposta de operação de modificação (INSERT, UPDATE, DELETE)
 */
export interface ModifyResponse {
  success: boolean;
  affectedRows: number;
  error: string | null;
}

// ============================================================================
// Tipos de Erro
// ============================================================================

/**
 * Erro customizado para operações de autenticação
 */
export class AuthServiceError extends Error {
  constructor(
    message: string,
    public readonly code: AuthErrorCode,
    public readonly originalError?: Error,
  ) {
    super(message);
    this.name = "AuthServiceError";
  }
}

/**
 * Erro para recursos não encontrados
 */
export class AuthNotFoundError extends AuthServiceError {
  constructor(resource: string, identifier: string) {
    super(`${resource} não encontrado: ${identifier}`, "NOT_FOUND");
    this.name = "AuthNotFoundError";
  }
}

/**
 * Erro para validação de dados
 */
export class AuthValidationError extends AuthServiceError {
  constructor(
    message: string,
    public readonly field?: string,
  ) {
    super(message, "VALIDATION_ERROR");
    this.name = "AuthValidationError";
  }
}

/**
 * Códigos de erro do serviço de autenticação
 */
export type AuthErrorCode =
  | "NOT_FOUND"
  | "VALIDATION_ERROR"
  | "DATABASE_ERROR"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "INTERNAL_ERROR";

// ============================================================================
// Type Guards
// ============================================================================

/**
 * Verifica se o resultado é um ResultSetHeader (operação de modificação)
 */
export function isResultSetHeader(result: unknown): result is ResultSetHeader {
  return (
    typeof result === "object" &&
    result !== null &&
    "affectedRows" in result &&
    "insertId" in result
  );
}

/**
 * Verifica se o resultado é um array de RowDataPacket (SELECT)
 */
export function isRowDataPacketArray(
  result: unknown,
): result is RowDataPacket[] {
  return Array.isArray(result);
}

// ============================================================================
// Utilitários de Mapeamento
// ============================================================================

/**
 * Mapeia uma entidade UserEntity para o DTO User
 */
export function mapUserEntityToDto(entity: UserEntity): User {
  return {
    id: entity.id,
    name: entity.name,
    email: entity.email,
    emailVerified: Boolean(entity.emailVerified),
    image: entity.image,
    createdAt: new Date(entity.createdAt),
    updatedAt: new Date(entity.updatedAt),
    twoFactorEnabled: Boolean(entity.twoFactorEnabled),
    role: entity.role,
    banned: entity.banned,
    banReason: entity.banReason,
    banExpires: entity.banExpires ? new Date(entity.banExpires) : null,
  };
}

/**
 * Mapeia uma entidade MemberEntity para o DTO Member
 */
export function mapMemberEntityToDto(entity: MemberEntity): Member {
  return {
    id: entity.id,
    organizationId: entity.organizationId,
    userId: entity.userId,
    role: entity.role,
    createdAt: new Date(entity.createdAt),
    updatedAt: new Date(entity.updatedAt),
  };
}

/**
 * Mapeia uma entidade MemberWithUserEntity para o DTO MemberWithUser
 */
export function mapMemberWithUserEntityToDto(
  entity: MemberWithUserEntity,
): MemberWithUser {
  return {
    id: entity.id,
    organizationId: entity.organizationId,
    userId: entity.userId,
    role: entity.role,
    createdAt: new Date(entity.createdAt),
    updatedAt: new Date(entity.updatedAt),
    user: {
      id: entity.user_id,
      name: entity.user_name,
      email: entity.user_email,
      emailVerified: Boolean(entity.user_emailVerified),
      image: entity.user_image,
      createdAt: new Date(entity.user_createdAt),
      updatedAt: new Date(entity.user_updatedAt),
      twoFactorEnabled: Boolean(entity.user_twoFactorEnabled),
      role: entity.user_role,
      banned: entity.user_banned,
      banReason: entity.user_banReason,
      banExpires: entity.user_banExpires
        ? new Date(entity.user_banExpires)
        : null,
    },
  };
}

/**
 * Mapeia uma entidade OrganizationEntity para o DTO Organization
 */
export function mapOrganizationEntityToDto(
  entity: OrganizationEntity,
): Organization {
  return {
    id: entity.id,
    name: entity.name,
    slug: entity.slug,
    logo: entity.logo,
    createdAt: entity.createdAt ? new Date(entity.createdAt) : null,
    metadata: entity.metadata,
    systemId: entity.system_id ?? null,
  };
}

/**
 * Mapeia uma entidade SessionEntity para o DTO Session
 */
export function mapSessionEntityToDto(entity: SessionEntity): Session {
  return {
    id: entity.id,
    expiresAt: new Date(entity.expiresAt),
    token: entity.token,
    createdAt: new Date(entity.createdAt),
    updatedAt: new Date(entity.updatedAt),
    ipAddress: entity.ipAddress,
    userAgent: entity.userAgent,
    userId: entity.userId,
    impersonatedBy: entity.impersonatedBy,
    activeOrganizationId: entity.activeOrganizationId,
    activeTeamId: entity.activeTeamId,
  };
}

/**
 * Mapeia uma entidade AccountEntity para o DTO Account
 */
export function mapAccountEntityToDto(entity: AccountEntity): Account {
  return {
    id: entity.id,
    accountId: entity.accountId,
    providerId: entity.providerId,
    userId: entity.userId,
    accessToken: entity.accessToken,
    refreshToken: entity.refreshToken,
    idToken: entity.idToken,
    accessTokenExpiresAt: entity.accessTokenExpiresAt
      ? new Date(entity.accessTokenExpiresAt)
      : null,
    refreshTokenExpiresAt: entity.refreshTokenExpiresAt
      ? new Date(entity.refreshTokenExpiresAt)
      : null,
    scope: entity.scope,
    password: entity.password,
    createdAt: new Date(entity.createdAt),
    updatedAt: new Date(entity.updatedAt),
  };
}

/**
 * Mapeia uma entidade InvitationEntity para o DTO Invitation
 */
export function mapInvitationEntityToDto(entity: InvitationEntity): Invitation {
  return {
    id: entity.id,
    organizationId: entity.organizationId,
    teamId: entity.teamId,
    email: entity.email,
    role: entity.role,
    status: entity.status,
    expiresAt: new Date(entity.expiresAt),
    inviterId: entity.inviterId,
    createdAt: new Date(entity.createdAt),
    updatedAt: new Date(entity.updatedAt),
  };
}

/**
 * Mapeia uma entidade InvitationWithInviterEntity para o DTO InvitationWithInviter
 */
export function mapInvitationWithInviterEntityToDto(
  entity: InvitationWithInviterEntity,
): InvitationWithInviter {
  return {
    id: entity.id,
    organizationId: entity.organizationId,
    teamId: entity.teamId,
    email: entity.email,
    role: entity.role,
    status: entity.status,
    expiresAt: new Date(entity.expiresAt),
    inviterId: entity.inviterId,
    createdAt: new Date(entity.createdAt),
    updatedAt: new Date(entity.updatedAt),
    inviter: {
      id: entity.inviter_id,
      name: entity.inviter_name,
      email: entity.inviter_email,
      image: entity.inviter_image,
    },
  };
}

/**
 * Mapeia uma entidade VerificationEntity para o DTO Verification
 */
export function mapVerificationEntityToDto(
  entity: VerificationEntity,
): Verification {
  return {
    id: entity.id,
    identifier: entity.identifier,
    value: entity.value,
    expiresAt: new Date(entity.expiresAt),
    createdAt: new Date(entity.createdAt),
    updatedAt: new Date(entity.updatedAt),
  };
}

/**
 * Mapeia uma entidade TwoFactorEntity para o DTO TwoFactor
 */
export function mapTwoFactorEntityToDto(entity: TwoFactorEntity): TwoFactor {
  return {
    id: entity.id,
    userId: entity.userId,
    secret: entity.secret,
    backupCodes: entity.backupCodes,
  };
}

/**
 * Mapeia uma entidade TeamEntity para o DTO Team
 */
export function mapTeamEntityToDto(entity: TeamEntity): Team {
  return {
    id: entity.id,
    name: entity.name,
    organizationId: entity.organizationId,
    createdAt: entity.createdAt ? new Date(entity.createdAt) : null,
    updatedAt: entity.updatedAt ? new Date(entity.updatedAt) : null,
  };
}

/**
 * Mapeia uma entidade TeamMemberEntity para o DTO TeamMember
 */
export function mapTeamMemberEntityToDto(entity: TeamMemberEntity): TeamMember {
  return {
    id: entity.id,
    teamId: entity.teamId,
    userId: entity.userId,
    createdAt: entity.createdAt ? new Date(entity.createdAt) : null,
  };
}

/**
 * Mapeia uma entidade TeamMemberWithUserEntity para o DTO TeamMemberWithUser
 */
export function mapTeamMemberWithUserEntityToDto(
  entity: TeamMemberWithUserEntity,
): TeamMemberWithUser {
  return {
    id: entity.id,
    teamId: entity.teamId,
    userId: entity.userId,
    createdAt: entity.createdAt ? new Date(entity.createdAt) : null,
    user: {
      id: entity.user_id,
      name: entity.user_name,
      email: entity.user_email,
      emailVerified: false, // Não disponível no JOIN simplificado
      image: entity.user_image,
      createdAt: new Date(),
      updatedAt: new Date(),
      twoFactorEnabled: false,
      role: null,
      banned: null,
      banReason: null,
      banExpires: null,
    },
  };
}

/**
 * Mapeia uma entidade OrganizationRoleEntity para o DTO OrganizationRole
 */
export function mapOrganizationRoleEntityToDto(
  entity: OrganizationRoleEntity,
): OrganizationRole {
  return {
    id: entity.id,
    organizationId: entity.organizationId,
    organizationRolecol: entity.organizationRolecol,
    role: entity.role,
    permission: entity.permission,
    createdAt: entity.createdAt ? new Date(entity.createdAt) : null,
    updatedAt: entity.updatedAt ? new Date(entity.updatedAt) : null,
  };
}

/**
 * Mapeia uma entidade SubscriptionEntity para o DTO Subscription
 */
export function mapSubscriptionEntityToDto(
  entity: SubscriptionEntity,
): Subscription {
  return {
    id: entity.id,
    userId: entity.userId,
    plan: entity.plan,
    status: entity.status,
    approvedAt: entity.approvedAt ? new Date(entity.approvedAt) : null,
    createdAt: entity.createdAt ? new Date(entity.createdAt) : null,
  };
}
