import "server-only";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/auth";
import { getMemberPersonId } from "@/server/organizations";

export async function getAuthContext() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/sign-in");

  const activeOrganizationId = session.session?.activeOrganizationId;

  let personId = 0;
  if (activeOrganizationId) {
    const resolved = await getMemberPersonId(
      session.user.id,
      activeOrganizationId,
    );
    if (resolved !== null) {
      personId = resolved;
    }
  }

  return {
    session,
    apiContext: {
      pe_system_client_id: session.session?.systemId ?? 0,
      pe_organization_id: activeOrganizationId ?? "0",
      pe_user_id: session.user.id ?? "0",
      pe_user_name: session.user.name ?? "",
      pe_user_role: session.user.role ?? "admin",
      pe_person_id: personId,
    },
  };
}
