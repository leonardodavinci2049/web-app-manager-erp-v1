"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Send } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { publicEnvs } from "@/core/config/envs.client";

const contactFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Informe seu nome completo.")
    .max(120, "Nome muito longo."),
  email: z
    .string()
    .trim()
    .min(1, "Informe seu e-mail.")
    .email("Informe um e-mail válido.")
    .max(160, "E-mail muito longo."),
  phone: z
    .string()
    .trim()
    .max(20, "Telefone muito longo.")
    .optional()
    .or(z.literal("")),
  message: z
    .string()
    .trim()
    .min(10, "Escreva uma mensagem com pelo menos 10 caracteres.")
    .max(2000, "Mensagem muito longa (máximo de 2000 caracteres)."),
});

type ContactFormValues = z.infer<typeof contactFormSchema>;

/**
 * Builds the destination URL for the contact message.
 *
 * Provisional integration: there is no public contact endpoint yet, so the
 * message is forwarded to the company WhatsApp. Replace only this function
 * when a real submission channel becomes available.
 */
function buildContactMessageUrl(values: ContactFormValues): string {
  const phone = publicEnvs.NEXT_PUBLIC_COMPANY_WHATSAPP.replace(/\D/g, "");

  const lines = [
    "Olá! Gostaria de saber mais sobre o WinERP Gestor.",
    "",
    `Nome: ${values.name}`,
    `E-mail: ${values.email}`,
  ];

  if (values.phone) {
    lines.push(`Telefone: ${values.phone}`);
  }

  lines.push("", `Mensagem: ${values.message}`);

  const text = encodeURIComponent(lines.join("\n"));

  return `https://api.whatsapp.com/send/?phone=${encodeURIComponent(phone)}&text=${text}&type=phone_number&app_absent=0`;
}

export function ContactForm() {
  const [submitted, setSubmitted] = useState(false);

  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      message: "",
    },
  });

  const onSubmit = form.handleSubmit((values) => {
    // Open the public channel with the validated message in a new context.
    window.open(buildContactMessageUrl(values), "_blank", "noopener");

    setSubmitted(true);
    form.reset();

    window.setTimeout(() => setSubmitted(false), 5000);
  });

  return (
    <form onSubmit={onSubmit} className="space-y-5" noValidate>
      <div className="space-y-2">
        <Label htmlFor="contact-name">Nome</Label>
        <Input
          id="contact-name"
          autoComplete="name"
          placeholder="Seu nome completo"
          aria-invalid={Boolean(form.formState.errors.name)}
          aria-describedby={
            form.formState.errors.name ? "contact-name-error" : undefined
          }
          {...form.register("name")}
        />
        {form.formState.errors.name ? (
          <p
            id="contact-name-error"
            role="alert"
            className="text-sm text-destructive"
          >
            {form.formState.errors.name.message}
          </p>
        ) : null}
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="contact-email">E-mail</Label>
          <Input
            id="contact-email"
            type="email"
            autoComplete="email"
            placeholder="voce@empresa.com.br"
            aria-invalid={Boolean(form.formState.errors.email)}
            aria-describedby={
              form.formState.errors.email ? "contact-email-error" : undefined
            }
            {...form.register("email")}
          />
          {form.formState.errors.email ? (
            <p
              id="contact-email-error"
              role="alert"
              className="text-sm text-destructive"
            >
              {form.formState.errors.email.message}
            </p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="contact-phone">
            Telefone{" "}
            <span className="font-normal text-muted-foreground">
              (opcional)
            </span>
          </Label>
          <Input
            id="contact-phone"
            type="tel"
            autoComplete="tel"
            placeholder="(11) 99999-9999"
            aria-invalid={Boolean(form.formState.errors.phone)}
            aria-describedby={
              form.formState.errors.phone ? "contact-phone-error" : undefined
            }
            {...form.register("phone")}
          />
          {form.formState.errors.phone ? (
            <p
              id="contact-phone-error"
              role="alert"
              className="text-sm text-destructive"
            >
              {form.formState.errors.phone.message}
            </p>
          ) : null}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="contact-message">Mensagem</Label>
        <Textarea
          id="contact-message"
          rows={5}
          placeholder="Conte um pouco sobre o seu negócio e o que você precisa gerenciar."
          aria-invalid={Boolean(form.formState.errors.message)}
          aria-describedby={
            form.formState.errors.message ? "contact-message-error" : undefined
          }
          {...form.register("message")}
        />
        {form.formState.errors.message ? (
          <p
            id="contact-message-error"
            role="alert"
            className="text-sm text-destructive"
          >
            {form.formState.errors.message.message}
          </p>
        ) : null}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Button
          type="submit"
          size="lg"
          disabled={form.formState.isSubmitting}
          className="h-12 px-6 text-base"
        >
          <Send className="size-4" />
          Enviar mensagem
        </Button>
        <p aria-live="polite" className="text-sm text-muted-foreground">
          {submitted
            ? "Mensagem validada! Conclua o envio na janela aberta do WhatsApp."
            : "Ao enviar, abrimos o WhatsApp com a sua mensagem pronta."}
        </p>
      </div>
    </form>
  );
}
