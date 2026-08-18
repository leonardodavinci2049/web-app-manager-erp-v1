"use client";

import { LogIn } from "lucide-react";
import Form from "next/form";
import { useActionState, useEffect, useId } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { AuthFormHeader } from "../components/auth-form-header";
import SubmitButton from "../components/SubmitButton";
import loginAction from "./login-action";

// Estado inicial do formulário
const initialState = null;

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [state, formAction] = useActionState(loginAction, initialState);

  // Gerar ID único para cada instância do componente usando useId (SSR-safe)
  const formId = useId();

  // Efeito para mostrar toast com base no estado
  useEffect(() => {
    if (state?.success) {
      toast.success(state.message);
    } else if (state?.message && !state?.success) {
      toast.error(state.message);
    }
  }, [state]);

  return (
    <div className={cn("flex flex-col gap-8", className)} {...props}>
      <AuthFormHeader
        icon={LogIn}
        title="Entrar na conta"
        description="Digite seus dados de acesso para continuar."
      />

      <div className="grid gap-6">
        <Form action={formAction} className="grid gap-6">
          <div className="grid gap-2.5">
            <Label htmlFor={`email-${formId}`}>Email</Label>
            <Input
              id={`email-${formId}`}
              name="email"
              type="email"
              placeholder="seu@email.com"
              required
              autoComplete="email"
              aria-invalid={Boolean(state?.errors?.email)}
              className={cn(
                "h-12 rounded-lg bg-background px-3.5 shadow-xs",
                state?.errors?.email &&
                  "border-destructive focus-visible:ring-destructive",
              )}
            />
            {state?.errors?.email && (
              <p className="text-destructive text-sm">{state.errors.email}</p>
            )}
          </div>

          <div className="grid gap-2.5">
            <div className="flex items-center justify-between gap-4">
              <Label htmlFor={`password-${formId}`}>Senha</Label>
              <a
                href="/forgot-password"
                className="text-sm font-medium text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
              >
                Esqueceu a senha?
              </a>
            </div>
            <Input
              id={`password-${formId}`}
              name="password"
              type="password"
              placeholder="••••••••"
              required
              autoComplete="current-password"
              aria-invalid={Boolean(state?.errors?.password)}
              className={cn(
                "h-12 rounded-lg bg-background px-3.5 shadow-xs",
                state?.errors?.password &&
                  "border-destructive focus-visible:ring-destructive",
              )}
            />
            {state?.errors?.password && (
              <p className="text-destructive text-sm">
                {state.errors.password}
              </p>
            )}
          </div>

          <SubmitButton />
        </Form>

        {/*         <div className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
          <span className="bg-background text-muted-foreground relative z-10 px-2">
            {t("auth.login.orContinueWith")}
          </span>
        </div>

        <GoogleButton /> */}
      </div>

      {/*       <div className="text-center text-sm">
        {t("auth.login.noAccount")}{" "}
        <a href="/sign-up" className="underline underline-offset-4">
          {t("auth.login.signUp")}
        </a>
      </div> */}
    </div>
  );
}
