import { isRedirectError } from "next/dist/client/components/redirect-error";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";
import { Card } from "@/components/ui/card";
import { auth } from "@/lib/auth/auth";
import { createLogger } from "@/lib/logger";
import { LoginForm } from "./LoginForm";

const logger = createLogger("sign-in-page");

async function SessionGate() {
  await connection();

  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    // Redirect authenticated users straight to the dashboard.
    if (session?.user) {
      return redirect("/dashboard");
    }
  } catch (error) {
    // Preserve Next.js redirects thrown during session routing.
    if (isRedirectError(error)) {
      throw error;
    }

    // Keep the sign-in form available when session validation fails.
    logger.error("Session validation error", error);
  }

  return null;
}

export default function LoginPage() {
  return (
    <div className="flex w-full items-center justify-center px-4 py-8 sm:px-6 sm:py-12">
      <Card className="w-full max-w-md gap-8 border-white/70 bg-card/95 p-6 shadow-[0_18px_40px_rgba(15,23,42,0.14)] backdrop-blur-sm sm:p-8 dark:border-border">
        <LoginForm />
      </Card>

      <Suspense fallback={null}>
        <SessionGate />
      </Suspense>
    </div>
  );
}
