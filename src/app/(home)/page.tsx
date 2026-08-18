import { isRedirectError } from "next/dist/client/components/redirect-error";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { Spinner } from "@/components/ui/spinner";
import { auth } from "@/lib/auth/auth";

async function HomeRedirect() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    // Redirect authenticated users to the dashboard.
    if (session?.user) {
      return redirect("/dashboard");
    }

    // Redirect unauthenticated users to the sign-in page.
    return redirect("/sign-in");
  } catch (error) {
    // Preserve Next.js redirects thrown during session routing.
    if (isRedirectError(error)) {
      throw error;
    }

    // Fall back to sign-in when session validation fails unexpectedly.
    console.error("Session validation error:", error);
    return redirect("/sign-in");
  }
}

function HomePageFallback() {
  return (
    <div
      className="flex min-h-svh items-center justify-center gap-2 text-muted-foreground"
      role="status"
    >
      <Spinner aria-hidden="true" className="size-8" />
      <span className="sr-only">Verificando sessão...</span>
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={<HomePageFallback />}>
      <HomeRedirect />
    </Suspense>
  );
}
