"use server";

import { AuthService } from "@/services/db/auth/auth.service";
import { getCurrentUser } from "./users";

export async function getOrganizations() {
  const { currentUser } = await getCurrentUser();

  // Usando método otimizado que faz JOIN internamente
  const response = await AuthService.findUserOrganizations({
    userId: currentUser.id,
  });

  if (!response.success || !response.data) {
    console.error(response.error);
    return [];
  }

  return response.data;
}

export async function getActiveOrganization(userId: string) {
  // Usando método otimizado que faz JOIN internamente
  const response = await AuthService.findActiveOrganization({ userId });

  if (!response.success) {
    console.error(response.error);
    return null;
  }

  return response.data;
}

export async function getOrganizationBySlug(slug: string) {
  const response = await AuthService.findOrganizationBySlugWithMembers({
    slug,
  });

  if (!response.success) {
    console.error(response.error);
    return null;
  }

  return response.data;
}

export async function getMemberPersonId(
  userId: string,
  organizationId: string,
): Promise<number | null> {
  const response = await AuthService.findMemberPersonId({
    userId,
    organizationId,
  });

  if (!response.success || response.data === null) {
    return null;
  }

  return response.data;
}
