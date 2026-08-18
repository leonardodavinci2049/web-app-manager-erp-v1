"use client";

import { LogIn } from "lucide-react";
import Form from "next/form";
import { useActionState, useEffect, useId } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
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
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="flex items-center justify-center gap-2 text-2xl font-semibold tracking-tight">
          <LogIn aria-hidden="true" className="size-5" />
          Entrar na conta
        </h1>
        <p className="text-muted-foreground text-sm text-balance">
          Digite seus dados de acesso abaixo
        </p>
      </div>

      <div className="grid gap-7">
        <Form action={formAction} className="grid gap-7">
          <div className="grid gap-3">
            <Label htmlFor={`email-${formId}`}>Email</Label>
            <Input
              id={`email-${formId}`}
              name="email"
              type="email"
              placeholder="seu@email.com"
              required
              autoComplete="email"
              className={cn(
                "h-11 bg-muted/60 shadow-inner",
                state?.errors?.email &&
                  "border-destructive focus-visible:ring-destructive",
              )}
            />
            {state?.errors?.email && (
              <p className="text-destructive text-sm">{state.errors.email}</p>
            )}
          </div>

          <div className="grid gap-3">
            <Label htmlFor={`password-${formId}`}>Senha</Label>
            <Input
              id={`password-${formId}`}
              name="password"
              type="password"
              placeholder="••••••••"
              required
              autoComplete="current-password"
              className={cn(
                "h-11 bg-muted/60 shadow-inner",
                state?.errors?.password &&
                  "border-destructive focus-visible:ring-destructive",
              )}
            />
            {state?.errors?.password && (
              <p className="text-destructive text-sm">
                {state.errors.password}
              </p>
            )}
            <div className="text-right">
              <a
                href="/forgot-password"
                className="text-muted-foreground hover:text-foreground text-sm underline-offset-4 hover:underline"
              >
                Esqueceu a senha?
              </a>
            </div>
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
