"use client";

import { Info, MessageCircle, Phone } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { publicEnvs } from "@/core/config/envs.client";

export default function CompanyFooter() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Formatar número do WhatsApp para link (remover caracteres especiais)
  const whatsappNumber = publicEnvs.NEXT_PUBLIC_COMPANY_WHATSAPP;
  const whatsappLink = `https://wa.me/${whatsappNumber}`;
  const companyPhone = publicEnvs.NEXT_PUBLIC_COMPANY_PHONE;

  return (
    <footer className="bg-background/50 border-t">
      <div className="py-8 lg:py-10">
        <div className="mx-auto grid max-w-5xl gap-8 px-6 md:grid-cols-2 lg:gap-12 items-center">
          {/* Coluna 1: Informações do Sistema */}
          <div className="flex flex-col items-center md:items-start text-center md:text-left space-y-3">
            <div className="flex items-center gap-2">
              <Info className="h-5 w-5 text-blue-500" />
              <h3 className="text-lg font-semibold">
                Saiba mais sobre esse sistema
              </h3>
            </div>

            <p className="text-muted-foreground text-sm leading-relaxed">
              O sistema <strong>{publicEnvs.NEXT_PUBLIC_COMPANY_NAME}</strong>{" "}
              oferece as melhores soluções para o gerenciamento do seu negócio.
              Simplifique processos e aumente sua produtividade conosco.
            </p>
          </div>

          {/* Coluna 2: Desenvolvedor e Contato */}
          <div className="flex flex-col items-center md:items-end space-y-4 text-center md:text-right">
            <div className="flex flex-col items-center md:items-end gap-2">
              <span className="text-sm font-medium">
                Sistema Desenvolvido Por:
              </span>

              <Link
                href={publicEnvs.NEXT_PUBLIC_DEVELOPER_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="transition-opacity hover:opacity-80"
              >
                <Image
                  src={
                    mounted && resolvedTheme === "dark"
                      ? "/images/developer/logo-developer-dark.png"
                      : "/images/developer/logo-developer-light.png"
                  }
                  alt={publicEnvs.NEXT_PUBLIC_DEVELOPER_NAME}
                  width={140}
                  height={40}
                  className="h-8 w-auto"
                />
              </Link>
            </div>

            <div className="flex flex-col items-center md:items-end gap-1">
              <span className="text-xs text-muted-foreground">
                Entre em contato:
              </span>
              <div className="flex items-center gap-3">
                <Link
                  href={whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-green-600 transition-colors"
                  title="WhatsApp"
                >
                  <MessageCircle className="h-5 w-5" />
                </Link>
                {companyPhone && (
                  <span className="text-muted-foreground text-sm flex items-center gap-1">
                    <Phone className="h-4 w-4" />
                    {companyPhone}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Linha divisória e copyright */}
        <div className="mt-8 border-t pt-6">
          <div className="mx-auto max-w-5xl px-6 text-center">
            <p className="text-muted-foreground text-xs">
              © {new Date().getFullYear()} {publicEnvs.NEXT_PUBLIC_COMPANY_NAME}
              . Todos os direitos reservados.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
