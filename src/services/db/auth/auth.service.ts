import "server-only";

import { z } from "zod";
import dbService, {
  ErroConexaoBancoDados,
  ErroExecucaoConsulta,
} from "@/services/db/dbConnection";

import {
  AUTH_TABLES,
  AuthValidationError,
  type Member,
  type MemberEntity,
  type MemberWithUserEntity,
  type ModifyResponse,
  mapMemberEntityToDto,
  mapMemberWithUserEntityToDto,
  mapOrganizationEntityToDto,
  mapSubscriptionEntityToDto,
  mapUserEntityToDto,
  type Organization,
  type OrganizationEntity,
  type OrganizationWithMembers,
  type ServiceResponse,
  type Subscription,
  type SubscriptionEntity,
  type User,
  type UserEntity,
} from "./types/auth.types";

// ============================================================================
// Validation Schemas (Zod)
// ============================================================================

const IdSchema = z
  .string()
  .min(1, "ID é obrigatório")
  .max(128, "ID muito longo");
const IdArraySchema = z.array(IdSchema);
const SlugSchema = z
  .string()
  .min(1, "Slug é obrigatório")
  .max(255, "Slug muito longo")
  .regex(/^[a-z0-9-]+$/, "Slug inválido");

// ============================================================================
// Private Utility Functions
// ============================================================================

/**
 * Validates if the provided ID is valid
 */
function validateId(id: string, fieldName: string): void {
  const result = IdSchema.safeParse(id);
  if (!result.success) {
    throw new AuthValidationError(
      `${fieldName}: ${result.error.issues[0].message}`,
      fieldName,
    );
  }
}

/**
 * Validates if the ID array is valid
 */
function validateIdArray(ids: string[], fieldName: string): void {
  const result = IdArraySchema.safeParse(ids);
  if (!result.success) {
    throw new AuthValidationError(
      `${fieldName}: ${result.error.issues[0].message}`,
      fieldName,
    );
  }
}

/**
 * Validates if the provided slug is valid
 */
function validateSlug(slug: string, fieldName: string): void {
  const result = SlugSchema.safeParse(slug);
  if (!result.success) {
    throw new AuthValidationError(
      `${fieldName}: ${result.error.issues[0].message}`,
      fieldName,
    );
  }
}

/**
 * Handles errors and returns a standardized response
 */
function handleError<T>(error: unknown, operation: string): ServiceResponse<T> {
  console.error(`[AuthService] Erro em ${operation}:`, error);

  if (error instanceof AuthValidationError) {
    return {
      success: false,
      data: null,
      error: error.message,
    };
  }

  if (error instanceof ErroConexaoBancoDados) {
    return {
      success: false,
      data: null,
      error: "Erro de conexão com o banco de dados",
    };
  }

  if (error instanceof ErroExecucaoConsulta) {
    // Sanitization: Do not expose technical query or database details in production
    return {
      success: false,
      data: null,
      error: "Erro ao processar a consulta no banco de dados",
    };
  }

  return {
    success: false,
    data: null,
    error: "Ocorreu um erro interno inesperado",
  };
}

/**
 * Handles errors for modification operations
 */
function handleModifyError(error: unknown, operation: string): ModifyResponse {
  console.error(`[AuthService] Erro em ${operation}:`, error);

  if (error instanceof AuthValidationError) {
    return {
      success: false,
      affectedRows: 0,
      error: error.message,
    };
  }

  return {
    success: false,
    affectedRows: 0,
    error: "Erro ao realizar operação de modificação",
  };
}

// ============================================================================
// User Methods
// ============================================================================

/**
 * Finds a user by ID
 *
 *
 * @example
 * ```typescript
 * const response = await AuthService.findUserById({ userId: "user-123" });
 * if (response.success && response.data) {
 *   console.log(response.data.name);
 * }
 * ```
 */
async function findUserById(params: {
  userId: string;
}): Promise<ServiceResponse<User>> {
  try {
    validateId(params.userId, "userId");

    const query = `
      SELECT 
        id, name, email, emailVerified, image, 
        createdAt, updatedAt, twoFactorEnabled, 
        role, banned, banReason, banExpires
      FROM ${AUTH_TABLES.USER}
      WHERE id = ?
      LIMIT 1
    `;

    const results = await dbService.selectExecute<UserEntity>(query, [
      params.userId,
    ]);

    if (results.length === 0) {
      return {
        success: true,
        data: null,
        error: null,
      };
    }

    return {
      success: true,
      data: mapUserEntityToDto(results[0]),
      error: null,
    };
  } catch (error) {
    return handleError<User>(error, "findUserById");
  }
}

/**
 * Finds all users excluding specific IDs
 *
 *
 * @example
 * ```typescript
 * const response = await AuthService.findUsersExcludingIds({
 *   excludeUserIds: ["user-1", "user-2"]
 * });
 * ```
 */
async function findUsersExcludingIds(params: {
  excludeUserIds: string[];
}): Promise<ServiceResponse<User[]>> {
  try {
    validateIdArray(params.excludeUserIds, "excludeUserIds");

    // If the array is empty, return all users
    if (params.excludeUserIds.length === 0) {
      const query = `
        SELECT 
          id, name, email, emailVerified, image, 
          createdAt, updatedAt, twoFactorEnabled, 
          role, banned, banReason, banExpires
        FROM ${AUTH_TABLES.USER}
        ORDER BY name ASC
      `;

      const results = await dbService.selectExecute<UserEntity>(query);
      return {
        success: true,
        data: results.map(mapUserEntityToDto),
        error: null,
      };
    }

    // Create placeholders for the IDs to be excluded
    const placeholders = params.excludeUserIds.map(() => "?").join(", ");

    const query = `
      SELECT 
        id, name, email, emailVerified, image, 
        createdAt, updatedAt, twoFactorEnabled, 
        role, banned, banReason, banExpires
      FROM ${AUTH_TABLES.USER}
      WHERE id NOT IN (${placeholders})
      ORDER BY name ASC
    `;

    const results = await dbService.selectExecute<UserEntity>(
      query,
      params.excludeUserIds,
    );

    return {
      success: true,
      data: results.map(mapUserEntityToDto),
      error: null,
    };
  } catch (error) {
    return handleError<User[]>(error, "findUsersExcludingIds");
  }
}

// ============================================================================
// Member Methods
// ============================================================================

/**
 * Finds all members of an organization
 *
 *
 * @example
 * ```typescript
 * const response = await AuthService.findMembersByOrganization({
 *   organizationId: "org-123"
 * });
 * ```
 */
async function findMembersByOrganization(params: {
  organizationId: string;
}): Promise<ServiceResponse<Member[]>> {
  try {
    validateId(params.organizationId, "organizationId");

    const query = `
      SELECT 
        id, organizationId, userId, role, createdAt, updatedAt
      FROM ${AUTH_TABLES.MEMBER}
      WHERE organizationId = ?
      ORDER BY createdAt ASC
    `;

    const results = await dbService.selectExecute<MemberEntity>(query, [
      params.organizationId,
    ]);

    return {
      success: true,
      data: results.map(mapMemberEntityToDto),
      error: null,
    };
  } catch (error) {
    return handleError<Member[]>(error, "findMembersByOrganization");
  }
}

/**
 * Finds the first member of a user
 *
 * Replaces: prisma.member.findFirst({ where: { userId } })
 *
 * @example
 * ```typescript
 * const response = await AuthService.findFirstMemberByUser({
 *   userId: "user-123"
 * });
 * ```
 */
async function findFirstMemberByUser(params: {
  userId: string;
}): Promise<ServiceResponse<Member | null>> {
  try {
    validateId(params.userId, "userId");

    const query = `
      SELECT 
        id, organizationId, userId, role, createdAt, updatedAt
      FROM ${AUTH_TABLES.MEMBER}
      WHERE userId = ?
      ORDER BY createdAt ASC
      LIMIT 1
    `;

    const results = await dbService.selectExecute<MemberEntity>(query, [
      params.userId,
    ]);

    if (results.length === 0) {
      return {
        success: true,
        data: null,
        error: null,
      };
    }

    return {
      success: true,
      data: mapMemberEntityToDto(results[0]),
      error: null,
    };
  } catch (error) {
    return handleError<Member | null>(error, "findFirstMemberByUser");
  }
}

/**
 * Finds all members of a user
 *
 * Replaces: prisma.member.findMany({ where: { userId } })
 *
 * @example
 * ```typescript
 * const response = await AuthService.findMembersByUser({
 *   userId: "user-123"
 * });
 * ```
 */
async function findMembersByUser(params: {
  userId: string;
}): Promise<ServiceResponse<Member[]>> {
  try {
    validateId(params.userId, "userId");

    const query = `
      SELECT 
        id, organizationId, userId, role, createdAt, updatedAt
      FROM ${AUTH_TABLES.MEMBER}
      WHERE userId = ?
      ORDER BY createdAt ASC
    `;

    const results = await dbService.selectExecute<MemberEntity>(query, [
      params.userId,
    ]);

    return {
      success: true,
      data: results.map(mapMemberEntityToDto),
      error: null,
    };
  } catch (error) {
    return handleError<Member[]>(error, "findMembersByUser");
  }
}

/**
 * Finds a member by userId and organizationId
 *
 * Replaces: prisma.member.findFirst({ where: { userId, organizationId } })
 *
 * @example
 * ```typescript
 * const response = await AuthService.findMemberByUserAndOrganization({
 *   userId: "user-123",
 *   organizationId: "org-123"
 * });
 * ```
 */
async function findMemberByUserAndOrganization(params: {
  userId: string;
  organizationId: string;
}): Promise<ServiceResponse<Member | null>> {
  try {
    validateId(params.userId, "userId");
    validateId(params.organizationId, "organizationId");

    const query = `
      SELECT
        id, organizationId, userId, role, personId, createdAt, updatedAt
      FROM ${AUTH_TABLES.MEMBER}
      WHERE userId = ? AND organizationId = ?
      LIMIT 1
    `;

    const results = await dbService.selectExecute<MemberEntity>(query, [
      params.userId,
      params.organizationId,
    ]);

    if (results.length === 0) {
      return {
        success: true,
        data: null,
        error: null,
      };
    }

    return {
      success: true,
      data: mapMemberEntityToDto(results[0]),
      error: null,
    };
  } catch (error) {
    return handleError<Member | null>(error, "findMemberByUserAndOrganization");
  }
}

/**
 * Deletes a member by ID
 *
 * Replaces: prisma.member.delete({ where: { id } })
 *
 * @example
 * ```typescript
 * const result = await AuthService.deleteMember({ memberId: "member-456" });
 * if (result.success) {
 *   console.log(`Affected rows: ${result.affectedRows}`);
 * }
 * ```
 */
async function deleteMember(params: {
  memberId: string;
}): Promise<ModifyResponse> {
  try {
    validateId(params.memberId, "memberId");

    const query = `
      DELETE FROM ${AUTH_TABLES.MEMBER}
      WHERE id = ?
    `;

    const result = await dbService.ModifyExecute(query, [params.memberId]);

    return {
      success: result.affectedRows > 0,
      affectedRows: result.affectedRows,
      error:
        result.affectedRows === 0
          ? "Membro não encontrado ou já deletado"
          : null,
    };
  } catch (error) {
    return handleModifyError(error, "deleteMember");
  }
}

// ============================================================================
// Organization Methods
// ============================================================================

/**
 * Finds an organization by ID
 *
 * Replaces: prisma.organization.findFirst({ where: { id } })
 *
 * @example
 * ```typescript
 * const response = await AuthService.findOrganizationById({
 *   organizationId: "org-123"
 * });
 * ```
 */
async function findOrganizationById(params: {
  organizationId: string;
}): Promise<ServiceResponse<Organization | null>> {
  try {
    validateId(params.organizationId, "organizationId");

    const query = `
      SELECT 
        id, name, slug, logo, createdAt, metadata, system_id
      FROM ${AUTH_TABLES.ORGANIZATION}
      WHERE id = ?
      LIMIT 1
    `;

    const results = await dbService.selectExecute<OrganizationEntity>(query, [
      params.organizationId,
    ]);

    if (results.length === 0) {
      return {
        success: true,
        data: null,
        error: null,
      };
    }

    return {
      success: true,
      data: mapOrganizationEntityToDto(results[0]),
      error: null,
    };
  } catch (error) {
    return handleError<Organization | null>(error, "findOrganizationById");
  }
}

/**
 * Finds organizations by IDs
 *
 * Replaces: prisma.organization.findMany({ where: { id: { in: ids } } })
 *
 * @example
 * ```typescript
 * const response = await AuthService.findOrganizationsByIds({
 *   organizationIds: ["org-1", "org-2"]
 * });
 * ```
 */
async function findOrganizationsByIds(params: {
  organizationIds: string[];
}): Promise<ServiceResponse<Organization[]>> {
  try {
    validateIdArray(params.organizationIds, "organizationIds");

    if (params.organizationIds.length === 0) {
      return {
        success: true,
        data: [],
        error: null,
      };
    }

    const placeholders = params.organizationIds.map(() => "?").join(", ");

    const query = `
      SELECT 
        id, name, slug, logo, createdAt, metadata, system_id
      FROM ${AUTH_TABLES.ORGANIZATION}
      WHERE id IN (${placeholders})
      ORDER BY name ASC
    `;

    const results = await dbService.selectExecute<OrganizationEntity>(
      query,
      params.organizationIds,
    );

    return {
      success: true,
      data: results.map(mapOrganizationEntityToDto),
      error: null,
    };
  } catch (error) {
    return handleError<Organization[]>(error, "findOrganizationsByIds");
  }
}

/**
 * Finds an organization by slug
 *
 * Replaces: prisma.organization.findFirst({ where: { slug } })
 *
 * @example
 * ```typescript
 * const response = await AuthService.findOrganizationBySlug({
 *   slug: "my-organization"
 * });
 * ```
 */
async function findOrganizationBySlug(params: {
  slug: string;
}): Promise<ServiceResponse<Organization | null>> {
  try {
    validateSlug(params.slug, "slug");

    const query = `
      SELECT 
        id, name, slug, logo, createdAt, metadata, system_id
      FROM ${AUTH_TABLES.ORGANIZATION}
      WHERE slug = ?
      LIMIT 1
    `;

    const results = await dbService.selectExecute<OrganizationEntity>(query, [
      params.slug,
    ]);

    if (results.length === 0) {
      return {
        success: true,
        data: null,
        error: null,
      };
    }

    return {
      success: true,
      data: mapOrganizationEntityToDto(results[0]),
      error: null,
    };
  } catch (error) {
    return handleError<Organization | null>(error, "findOrganizationBySlug");
  }
}

/**
 * Finds an organization by slug including members and their users
 *
 * Replaces: prisma.organization.findFirst({
 *   where: { slug },
 *   include: { member: { include: { user: true } } }
 * })
 *
 * @example
 * ```typescript
 * const response = await AuthService.findOrganizationBySlugWithMembers({
 *   slug: "my-organization"
 * });
 * if (response.success && response.data) {
 *   console.log(response.data.member); // Array of members with users
 * }
 * ```
 */
async function findOrganizationBySlugWithMembers(params: {
  slug: string;
}): Promise<ServiceResponse<OrganizationWithMembers | null>> {
  try {
    validateSlug(params.slug, "slug");

    // First find the organization
    const orgQuery = `
      SELECT 
        id, name, slug, logo, createdAt, metadata, system_id
      FROM ${AUTH_TABLES.ORGANIZATION}
      WHERE slug = ?
      LIMIT 1
    `;

    const orgResults = await dbService.selectExecute<OrganizationEntity>(
      orgQuery,
      [params.slug],
    );

    if (orgResults.length === 0) {
      return {
        success: true,
        data: null,
        error: null,
      };
    }

    const organization = mapOrganizationEntityToDto(orgResults[0]);

    // Then find the members with users
    const membersQuery = `
      SELECT 
        m.id, m.organizationId, m.userId, m.role, m.createdAt, m.updatedAt,
        u.id as user_id, u.name as user_name, u.email as user_email,
        u.emailVerified as user_emailVerified, u.image as user_image,
        u.createdAt as user_createdAt, u.updatedAt as user_updatedAt,
        u.twoFactorEnabled as user_twoFactorEnabled, u.role as user_role,
        u.banned as user_banned, u.banReason as user_banReason,
        u.banExpires as user_banExpires
      FROM ${AUTH_TABLES.MEMBER} m
      INNER JOIN ${AUTH_TABLES.USER} u ON m.userId = u.id
      WHERE m.organizationId = ?
      ORDER BY m.createdAt ASC
    `;

    const memberResults = await dbService.selectExecute<MemberWithUserEntity>(
      membersQuery,
      [organization.id],
    );

    const membersWithUsers = memberResults.map(mapMemberWithUserEntityToDto);

    return {
      success: true,
      data: {
        ...organization,
        member: membersWithUsers,
      },
      error: null,
    };
  } catch (error) {
    return handleError<OrganizationWithMembers | null>(
      error,
      "findOrganizationBySlugWithMembers",
    );
  }
}

// ============================================================================
// Subscription Methods
// ============================================================================

/**
 * Creates a new subscription for a user
 *
 * Replaces: prisma.subscription.create({ data: { userId, plan, status } })
 *
 * @example
 * ```typescript
 * const result = await AuthService.createSubscription({
 *   userId: "user-123",
 *   plan: "premium",
 *   status: "active"
 * });
 * ```
 */
async function createSubscription(params: {
  userId: string;
  plan: string;
  status: string;
  approvedAt?: Date;
}): Promise<ServiceResponse<Subscription>> {
  try {
    validateId(params.userId, "userId");

    if (!params.plan || params.plan.trim().length === 0) {
      throw new AuthValidationError("Plan é obrigatório", "plan");
    }

    if (!params.status || params.status.trim().length === 0) {
      throw new AuthValidationError("Status é obrigatório", "status");
    }

    const id = `sub_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const now = new Date();

    const query = `
      INSERT INTO ${AUTH_TABLES.SUBSCRIPTION}
        (id, userId, plan, status, approvedAt, createdAt)
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    await dbService.ModifyExecute(query, [
      id,
      params.userId,
      params.plan,
      params.status,
      params.approvedAt || null,
      now,
    ]);

    return {
      success: true,
      data: {
        id,
        userId: params.userId,
        plan: params.plan,
        status: params.status,
        approvedAt: params.approvedAt || null,
        createdAt: now,
      },
      error: null,
    };
  } catch (error) {
    return handleError<Subscription>(error, "createSubscription");
  }
}

/**
 * Finds a subscription by user ID
 *
 * Replaces: prisma.subscription.findFirst({ where: { userId } })
 *
 * @example
 * ```typescript
 * const response = await AuthService.findSubscriptionByUserId({
 *   userId: "user-123"
 * });
 * ```
 */
async function findSubscriptionByUserId(params: {
  userId: string;
}): Promise<ServiceResponse<Subscription | null>> {
  try {
    validateId(params.userId, "userId");

    const query = `
      SELECT 
        id, userId, plan, status, approvedAt, createdAt
      FROM ${AUTH_TABLES.SUBSCRIPTION}
      WHERE userId = ?
      ORDER BY createdAt DESC
      LIMIT 1
    `;

    const results = await dbService.selectExecute<SubscriptionEntity>(query, [
      params.userId,
    ]);

    if (results.length === 0) {
      return {
        success: true,
        data: null,
        error: null,
      };
    }

    return {
      success: true,
      data: mapSubscriptionEntityToDto(results[0]),
      error: null,
    };
  } catch (error) {
    return handleError<Subscription | null>(error, "findSubscriptionByUserId");
  }
}

/**
 * Finds a subscription by ID
 *
 * Replaces: prisma.subscription.findUnique({ where: { id } })
 *
 * @example
 * ```typescript
 * const response = await AuthService.findSubscriptionById({
 *   subscriptionId: "sub-123"
 * });
 * ```
 */
async function findSubscriptionById(params: {
  subscriptionId: string;
}): Promise<ServiceResponse<Subscription | null>> {
  try {
    validateId(params.subscriptionId, "subscriptionId");

    const query = `
      SELECT 
        id, userId, plan, status, approvedAt, createdAt
      FROM ${AUTH_TABLES.SUBSCRIPTION}
      WHERE id = ?
      LIMIT 1
    `;

    const results = await dbService.selectExecute<SubscriptionEntity>(query, [
      params.subscriptionId,
    ]);

    if (results.length === 0) {
      return {
        success: true,
        data: null,
        error: null,
      };
    }

    return {
      success: true,
      data: mapSubscriptionEntityToDto(results[0]),
      error: null,
    };
  } catch (error) {
    return handleError<Subscription | null>(error, "findSubscriptionById");
  }
}

/**
 * Updates a subscription
 *
 * Replaces: prisma.subscription.update({ where: { id }, data: { ... } })
 *
 * @example
 * ```typescript
 * const result = await AuthService.updateSubscription({
 *   subscriptionId: "sub-123",
 *   plan: "premium",
 *   status: "active"
 * });
 * ```
 */
async function updateSubscription(params: {
  subscriptionId: string;
  plan?: string;
  status?: string;
  approvedAt?: Date | null;
}): Promise<ModifyResponse> {
  try {
    validateId(params.subscriptionId, "subscriptionId");

    const updates: string[] = [];
    const values: (string | Date | null)[] = [];

    if (params.plan !== undefined) {
      if (params.plan.trim().length === 0) {
        throw new AuthValidationError("Plan não pode ser vazio", "plan");
      }
      updates.push("plan = ?");
      values.push(params.plan);
    }

    if (params.status !== undefined) {
      if (params.status.trim().length === 0) {
        throw new AuthValidationError("Status não pode ser vazio", "status");
      }
      updates.push("status = ?");
      values.push(params.status);
    }

    if (params.approvedAt !== undefined) {
      updates.push("approvedAt = ?");
      values.push(params.approvedAt);
    }

    if (updates.length === 0) {
      return {
        success: false,
        affectedRows: 0,
        error: "Nenhum campo para atualizar",
      };
    }

    values.push(params.subscriptionId);

    const query = `
      UPDATE ${AUTH_TABLES.SUBSCRIPTION}
      SET ${updates.join(", ")}
      WHERE id = ?
    `;

    const result = await dbService.ModifyExecute(query, values);

    return {
      success: result.affectedRows > 0,
      affectedRows: result.affectedRows,
      error:
        result.affectedRows === 0
          ? "Subscription não encontrada ou já atualizada"
          : null,
    };
  } catch (error) {
    return handleModifyError(error, "updateSubscription");
  }
}

/**
 * Deletes a subscription by ID
 *
 * Replaces: prisma.subscription.delete({ where: { id } })
 *
 * @example
 * ```typescript
 * const result = await AuthService.deleteSubscription({ subscriptionId: "sub-123" });
 * if (result.success) {
 *   console.log(`Affected rows: ${result.affectedRows}`);
 * }
 * ```
 */
async function deleteSubscription(params: {
  subscriptionId: string;
}): Promise<ModifyResponse> {
  try {
    validateId(params.subscriptionId, "subscriptionId");

    const query = `
      DELETE FROM ${AUTH_TABLES.SUBSCRIPTION}
      WHERE id = ?
    `;

    const result = await dbService.ModifyExecute(query, [
      params.subscriptionId,
    ]);

    return {
      success: result.affectedRows > 0,
      affectedRows: result.affectedRows,
      error:
        result.affectedRows === 0
          ? "Subscription não encontrada ou já deletada"
          : null,
    };
  } catch (error) {
    return handleModifyError(error, "deleteSubscription");
  }
}

// ============================================================================
// Compound Methods (for complex operations)
// ============================================================================

/**
 * Finds a user's organizations through their memberships
 *
 * Combines:
 * - prisma.member.findMany({ where: { userId } })
 * - prisma.organization.findMany({ where: { id: { in: organizationIds } } })
 *
 * @example
 * ```typescript
 * const response = await AuthService.findUserOrganizations({
 *   userId: "user-123"
 * });
 * ```
 */
async function findUserOrganizations(params: {
  userId: string;
}): Promise<ServiceResponse<Organization[]>> {
  try {
    validateId(params.userId, "userId");

    // Optimized query with JOIN
    const query = `
      SELECT DISTINCT
        o.id, o.name, o.slug, o.logo, o.createdAt, o.metadata, o.system_id
      FROM ${AUTH_TABLES.ORGANIZATION} o
      INNER JOIN ${AUTH_TABLES.MEMBER} m ON o.id = m.organizationId
      WHERE m.userId = ?
      ORDER BY o.name ASC
    `;

    const results = await dbService.selectExecute<OrganizationEntity>(query, [
      params.userId,
    ]);

    return {
      success: true,
      data: results.map(mapOrganizationEntityToDto),
      error: null,
    };
  } catch (error) {
    return handleError<Organization[]>(error, "findUserOrganizations");
  }
}

/**
 * Finds the active organization of a user (first organization found)
 *
 * Combines:
 * - prisma.member.findFirst({ where: { userId } })
 * - prisma.organization.findFirst({ where: { id: memberUser.organizationId } })
 *
 * @example
 * ```typescript
 * const response = await AuthService.findActiveOrganization({
 *   userId: "user-123"
 * });
 * ```
 */
async function findActiveOrganization(params: {
  userId: string;
}): Promise<ServiceResponse<Organization | null>> {
  try {
    validateId(params.userId, "userId");

    // Optimized query with JOIN
    const query = `
      SELECT 
        o.id, o.name, o.slug, o.logo, o.createdAt, o.metadata, o.system_id
      FROM ${AUTH_TABLES.ORGANIZATION} o
      INNER JOIN ${AUTH_TABLES.MEMBER} m ON o.id = m.organizationId
      WHERE m.userId = ?
      ORDER BY m.createdAt ASC
      LIMIT 1
    `;

    const results = await dbService.selectExecute<OrganizationEntity>(query, [
      params.userId,
    ]);

    if (results.length === 0) {
      return {
        success: true,
        data: null,
        error: null,
      };
    }

    return {
      success: true,
      data: mapOrganizationEntityToDto(results[0]),
      error: null,
    };
  } catch (error) {
    return handleError<Organization | null>(error, "findActiveOrganization");
  }
}

/**
 * Finds users who are not members of an organization
 *
 * Combines:
 * - prisma.member.findMany({ where: { organizationId } })
 * - prisma.user.findMany({ where: { id: { notIn: memberUserIds } } })
 *
 * @example
 * ```typescript
 * const response = await AuthService.findNonMemberUsers({
 *   organizationId: "org-123"
 * });
 * ```
 */
async function findNonMemberUsers(params: {
  organizationId: string;
}): Promise<ServiceResponse<User[]>> {
  try {
    validateId(params.organizationId, "organizationId");

    // Optimized query with subquery
    const query = `
      SELECT 
        u.id, u.name, u.email, u.emailVerified, u.image, 
        u.createdAt, u.updatedAt, u.twoFactorEnabled, 
        u.role, u.banned, u.banReason, u.banExpires
      FROM ${AUTH_TABLES.USER} u
      WHERE u.id NOT IN (
        SELECT m.userId 
        FROM ${AUTH_TABLES.MEMBER} m 
        WHERE m.organizationId = ?
      )
      ORDER BY u.name ASC
    `;

    const results = await dbService.selectExecute<UserEntity>(query, [
      params.organizationId,
    ]);

    return {
      success: true,
      data: results.map(mapUserEntityToDto),
      error: null,
    };
  } catch (error) {
    return handleError<User[]>(error, "findNonMemberUsers");
  }
}

// ============================================================================
// Namespace Export - AuthService
// ============================================================================

/**
 * AuthService - Database access service for authentication operations
 *
 * This namespace serves as a bridge between server actions and the MySQL database,
 * replacing Prisma operations with direct queries using mysql2.
 *
 * @example
 * ```typescript
 * import { AuthService } from "@/services/db/auth/auth.service";
 *
 * // Find user by ID
 * const response = await AuthService.findUserById({ userId: "user-123" });
 *
 * // Find user organizations
 * const orgs = await AuthService.findUserOrganizations({ userId: "user-123" });
 *
 * // Delete member
 * const result = await AuthService.deleteMember({ memberId: "member-456" });
 * ```
 */
/**
 * Finds the personId for a member by userId and organizationId
 */
async function findMemberPersonId(params: {
  userId: string;
  organizationId: string;
}): Promise<ServiceResponse<number | null>> {
  try {
    validateId(params.userId, "userId");
    validateId(params.organizationId, "organizationId");

    const query = `
      SELECT personId 
      FROM ${AUTH_TABLES.MEMBER} 
      WHERE userId = ? AND organizationId = ? 
      LIMIT 1
    `;

    const results = await dbService.selectExecute<
      { personId: number | null } & import("mysql2/promise").RowDataPacket
    >(query, [params.userId, params.organizationId]);

    if (results.length === 0) {
      return { success: true, data: null, error: null };
    }

    return { success: true, data: results[0].personId, error: null };
  } catch (error) {
    return handleError<number | null>(error, "findMemberPersonId");
  }
}

export const AuthService = {
  // User Methods
  findUserById,
  findUsersExcludingIds,

  // Member Methods
  findMembersByOrganization,
  findFirstMemberByUser,
  findMembersByUser,
  findMemberByUserAndOrganization,
  findMemberPersonId,
  deleteMember,

  // Organization Methods
  findOrganizationById,
  findOrganizationsByIds,
  findOrganizationBySlug,
  findOrganizationBySlugWithMembers,

  // Compound Methods
  findUserOrganizations,
  findActiveOrganization,
  findNonMemberUsers,

  // Subscription Methods
  createSubscription,
  findSubscriptionByUserId,
  findSubscriptionById,
  updateSubscription,
  deleteSubscription,
} as const;

// Export default for easier import
export default AuthService;

// Re-export types for easier use
export type {
  Member,
  MemberWithUser,
  ModifyResponse,
  Organization,
  OrganizationWithMembers,
  ServiceResponse,
  Subscription,
  User,
} from "./types/auth.types";
