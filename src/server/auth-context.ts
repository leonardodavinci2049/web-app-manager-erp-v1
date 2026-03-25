import "server-only";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/auth";

export async function getAuthContext() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/sign-in");

  return {
    session,
    apiContext: {
      pe_system_client_id: session.session?.systemId ?? 0,
      pe_organization_id: session.session?.activeOrganizationId ?? "0",
      pe_user_id: session.user.id ?? "0",
      pe_user_name: session.user.name ?? "",
      pe_user_role: session.user.role ?? "admin",
      pe_person_id: session.session?.personId ?? 0,
    },
  };
}
