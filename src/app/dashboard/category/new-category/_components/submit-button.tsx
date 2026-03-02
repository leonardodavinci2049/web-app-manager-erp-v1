"use client";

/**
 * Botão de submit isolado que usa useFormStatus para mostrar estado de loading
 * Componente client necessário para hooks do React
 */

import type { ComponentProps } from "react";
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";

type Props = ComponentProps<typeof Button> & {
  pendingText?: string;
  loadingIcon?: React.ReactNode;
};

/**
 * Botão de submit que mostra automaticamente estado de loading quando o form está sendo enviado
 */
export function SubmitButton({
  children,
  pendingText,
  loadingIcon,
  ...props
}: Props) {
  const { pending, action } = useFormStatus();

  // Verifica se este botão específico está sendo executado
  const isPending = pending && action === props.formAction;

  return (
    <Button
      {...props}
      type="submit"
      disabled={pending || props.disabled}
      aria-disabled={pending}
    >
      {isPending ? (
        <>
          {loadingIcon}
          {pendingText}
        </>
      ) : (
        children
      )}
    </Button>
  );
}
