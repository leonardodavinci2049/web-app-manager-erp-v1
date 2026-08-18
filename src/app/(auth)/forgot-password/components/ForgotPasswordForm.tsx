"use client";

import { useId, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth/auth-client";
import { cn } from "@/lib/utils";
import {
  type ForgotPasswordFormData,
  forgotPasswordSchema,
} from "../../_common-validations/validation";

export function ForgotPasswordForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Gerar ID único para cada instância do componente usando useId (SSR-safe)
  const formId = useId();

  // Função para validar o formulário
  const validateForm = (
    formData: FormData,
  ): { isValid: boolean; data?: ForgotPasswordFormData } => {
    const rawData = {
      email: formData.get("email") as string,
    };

    try {
      const validatedData = forgotPasswordSchema.parse(rawData);
      setErrors({});
      return { isValid: true, data: validatedData };
    } catch (error) {
      if (error instanceof z.ZodError) {
        const formattedErrors = error.issues.reduce(
          (acc: Record<string, string>, err) => {
            const field = err.path[0] as string;
            acc[field] = err.message;
            return acc;
          },
          {},
        );
        setErrors(formattedErrors);
        return { isValid: false };
      }

      setErrors({ general: "Erro de validação inesperado." });
      return { isValid: false };
    }
  };

  // Função onSubmit do lado do cliente
  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setErrors({});

    const formData = new FormData(event.currentTarget);
    const validation = validateForm(formData);

    if (!validation.isValid || !validation.data) {
      setIsLoading(false);
      return;
    }

    try {
      const { error } = await authClient.requestPasswordReset({
        email: validation.data.email,
        redirectTo: "/reset-password",
      });

      if (error) {
        console.error("Forgot password error:", error);

        if (
          !error.message?.includes("User not found") &&
          !error.message?.includes("Email not found")
        ) {
          toast.error("Erro interno do sistema. Tente novamente mais tarde.");
          return;
        }
      }

      toast.success(
        "Se este email estiver registrado, você receberá instruções de recuperação em breve.",
      );

      (event.target as HTMLFormElement).reset();
    } catch (error) {
      console.error("Forgot password error:", error);
      toast.error("Erro interno do sistema. Tente novamente mais tarde.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-8", className)} {...props}>
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">
          Recuperar senha
        </h1>
        <p className="text-muted-foreground text-sm text-balance">
          Digite seu email para receber instruções de recuperação
        </p>
      </div>

      <div className="grid gap-7">
        <form onSubmit={onSubmit} className="grid gap-7">
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
                errors?.email &&
                  "border-destructive focus-visible:ring-destructive",
              )}
            />
            {errors?.email && (
              <p className="text-destructive text-sm">{errors.email}</p>
            )}
          </div>

          <Button type="submit" className="h-11 w-full" disabled={isLoading}>
            {isLoading ? "Enviando..." : "Enviar instruções"}
          </Button>
        </form>
      </div>

      <div className="text-center text-sm">
        <a href="/sign-in" className="underline underline-offset-4">
          Voltar para o login
        </a>
      </div>
    </div>
  );
}

export default ForgotPasswordForm;
