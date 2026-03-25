export type Role = "ADMIN" | "MEMBER" | "BILLING";

export type Organization = {
  id: string;
  name: string;
  slug?: string | null;
  logo?: string | null;
  createdAt?: Date | null;
  metadata?: string | null;
  systemId?: number | null;
  member?: Member[];
};

export type User = {
  id: string;
  name?: string | null;
  email?: string | null;
  emailVerified?: boolean | null;
  image?: string | null;
  createdAt?: Date | string | null;
  updatedAt?: Date | string | null;
  twoFactorEnabled?: boolean | null;
  role?: string | null;
  banned?: boolean | null;
  banReason?: string | null;
  banExpires?: Date | string | null;
};

export type Member = {
  id: string;
  organizationId?: string;
  userId?: string | null;
  role?: string | null;
  createdAt?: Date | null;
  metadata?: string | null;
  personId?: number | null;
  user: User;
};
