import { ArrowLeft } from "lucide-react";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";
import { auth } from "@/lib/auth/auth";
import { createLogger } from "@/lib/logger";
import { AuthPageCard } from "../components/auth-page-card";
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
    <div className="grid gap-6">
      <AuthPageCard>
        <LoginForm />
      </AuthPageCard>

      <Link
        href="/"
        className="group flex w-fit max-w-full items-start gap-2 px-1 text-sm leading-6 text-muted-foreground transition-colors hover:text-foreground focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
      >
        <ArrowLeft
          aria-hidden="true"
          className="mt-1 size-4 shrink-0 transition-transform group-hover:-translate-x-0.5"
        />
        <span>Ir para a Home</span>
      </Link>

      <Suspense fallback={null}>
        <SessionGate />
      </Suspense>
    </div>
  );
}
