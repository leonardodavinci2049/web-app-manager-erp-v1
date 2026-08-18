import { isRedirectError } from "next/dist/client/components/redirect-error";
import { headers } from "next/headers";
import Image from "next/image";
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
    <div className="flex items-center justify-center p-4">
      {/* Card para telas grandes com formulário e imagem */}
      <Card className="bg-card/50 hidden w-full max-w-5xl overflow-hidden border-0 shadow-2xl backdrop-blur-sm lg:grid lg:h-[600px] lg:grid-cols-2">
        <div className="flex flex-col gap-4 p-6 md:p-10">
          <div className="flex flex-1 items-center justify-center">
            <div className="w-full max-w-sm">
              <LoginForm />
            </div>
          </div>
        </div>
        <div className="relative flex items-center justify-center">
          <Image
            src="/images/auth/logo-winerp-banner-auth.png"
            alt="WinERP Gestor"
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-contain object-center"
            priority
          />
        </div>
      </Card>

      {/* Formulário simples para telas menores */}
      <div className="w-full max-w-sm lg:hidden">
        <LoginForm />
      </div>

      <Suspense fallback={null}>
        <SessionGate />
      </Suspense>
    </div>
  );
}
