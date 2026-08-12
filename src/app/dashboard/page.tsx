import { isRedirectError } from "next/dist/client/components/redirect-error";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";
import { Spinner } from "@/components/ui/spinner";
import { createLogger } from "@/core/logger";
import { auth } from "@/lib/auth/auth";

const logger = createLogger("DashboardPage");

async function DashboardRedirect() {
  await connection();

  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    return redirect(session?.user ? "/dashboard/catalog" : "/sign-in");
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }

    logger.error("Failed to validate the dashboard session:", error);
    return redirect("/sign-in");
  }
}

function DashboardRedirectFallback() {
  return (
    <div
      className="flex flex-1 items-center justify-center gap-2 p-6 text-muted-foreground"
      role="status"
    >
      <Spinner aria-hidden="true" />
      <span className="text-sm">Redirecionando...</span>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<DashboardRedirectFallback />}>
      <DashboardRedirect />
    </Suspense>
  );
}
