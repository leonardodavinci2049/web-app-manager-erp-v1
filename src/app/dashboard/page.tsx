import { isRedirectError } from "next/dist/client/components/redirect-error";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { createLogger } from "@/core/logger";
import { auth } from "@/lib/auth/auth";

const logger = createLogger("DashboardPage");

export default async function DashboardPage() {
  await connection();

  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    redirect(session?.user ? "/dashboard/catalog" : "/sign-in");
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }

    logger.error("Failed to validate the dashboard session:", error);
    redirect("/sign-in");
  }
}
