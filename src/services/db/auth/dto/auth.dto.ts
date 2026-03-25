/**
 * DTO para usuário
 */
export interface User {
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
 * DTO para membro
 */
export interface Member {
  id: string;
  organizationId: string;
  userId: string;
  role: string;
  createdAt: Date;
  updatedAt: Date;
  personId: number | null;
}

/**
 * DTO para membro com dados do usuário
 */
export interface MemberWithUser extends Member {
  user: User;
}

/**
 * DTO para organização
 */
export interface Organization {
  id: string;
  name: string;
  slug: string | null;
  logo: string | null;
  createdAt: Date | null;
  metadata: string | null;
  systemId: number | null;
}

/**
 * DTO para organização com membros
 */
export interface OrganizationWithMembers extends Organization {
  member: MemberWithUser[];
}

/**
 * DTO para sessão
 */
export interface Session {
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
 * DTO para conta de autenticação
 */
export interface Account {
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
 * DTO para convite
 */
export interface Invitation {
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
 * DTO para convite com dados do convidador
 */
export interface InvitationWithInviter extends Invitation {
  inviter: {
    id: string;
    name: string;
    email: string;
    image: string | null;
  };
}

/**
 * DTO para verificação
 */
export interface Verification {
  id: string;
  identifier: string | null;
  value: string | null;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * DTO para autenticação de dois fatores
 */
export interface TwoFactor {
  id: string;
  userId: string;
  secret: string | null;
  backupCodes: string;
}

/**
 * DTO para time
 */
export interface Team {
  id: string;
  name: string | null;
  organizationId: string;
  createdAt: Date | null;
  updatedAt: Date | null;
}

/**
 * DTO para time com organização
 */
export interface TeamWithOrganization extends Team {
  organization: Organization;
}

/**
 * DTO para membro de time
 */
export interface TeamMember {
  id: string;
  teamId: string;
  userId: string;
  createdAt: Date | null;
}

/**
 * DTO para membro de time com dados do usuário
 */
export interface TeamMemberWithUser extends TeamMember {
  user: User;
}

/**
 * DTO para role customizada de organização
 */
export interface OrganizationRole {
  id: string;
  organizationId: string;
  organizationRolecol: string | null;
  role: string | null;
  permission: string | null;
  createdAt: Date | null;
  updatedAt: Date | null;
}

/**
 * DTO para subscription (assinatura do usuário)
 */
export interface Subscription {
  id: string;
  userId: string;
  plan: string;
  status: string;
  approvedAt: Date | null;
  createdAt: Date | null;
}
