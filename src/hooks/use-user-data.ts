"use client";

import { useSyncExternalStore } from "react";
import { authClient } from "@/lib/auth/auth-client";

const subscribeToHydration = () => () => {};
const getClientHydrationSnapshot = () => true;
const getServerHydrationSnapshot = () => false;

interface UserData {
  name: string;
  email: string;
  avatar: string;
  id?: string;
  role?: string;
}

export function useUserData(): {
  user: UserData | null;
  isLoading: boolean;
  error: string | null;
} {
  // Better Auth may already have session data during client-side navigation.
  // Keep the first client render aligned with the server-rendered loading state.
  const isHydrated = useSyncExternalStore(
    subscribeToHydration,
    getClientHydrationSnapshot,
    getServerHydrationSnapshot,
  );
  const { data: session, isPending } = authClient.useSession();

  const user: UserData | null = session?.user
    ? {
        name: session.user.name || "User",
        email: session.user.email || "",
        avatar:
          session.user.image ||
          `https://ui-avatars.com/api/?name=${encodeURIComponent(session.user.name || "User")}&background=0f172a&color=fff`,
        id: session.user.id,
      }
    : null;

  const error: string | null = isPending
    ? null
    : !session
      ? "No active session"
      : !session.user
        ? "Invalid session data"
        : null;

  return {
    user: isHydrated ? user : null,
    isLoading: !isHydrated || isPending,
    error: isHydrated ? error : null,
  };
}
