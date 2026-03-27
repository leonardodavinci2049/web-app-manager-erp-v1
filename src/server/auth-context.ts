import "server-only";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createLogger } from "@/core/logger";
import { auth } from "@/lib/auth/auth";
import { AuthService } from "@/services/db/auth/auth.service";

const logger = createLogger("AuthContext");

type AuthSession = NonNullable<Awaited<ReturnType<typeof auth.api.getSession>>>;

export type AuthContextWarning = {
  title: string;
  description: string;
};

export type AuthContext = {
  session: AuthSession;
  authWarning: AuthContextWarning | null;
  apiContext: {
    pe_system_client_id: number;
    pe_organization_id: string;
    pe_user_id: string;
    pe_user_name: string;
    pe_user_role: string;
    pe_person_id: number;
  };
};

export async function getAuthContext(): Promise<AuthContext> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/sign-in");

  const activeOrganizationId = session.session?.activeOrganizationId;

  let personId = 0;
  let authWarning: AuthContextWarning | null = null;

  const registerFallbackWarning = ({
    logMessage,
    warning,
    metadata,
  }: {
    logMessage: string;
    warning: AuthContextWarning;
    metadata?: Record<string, unknown>;
  }) => {
    authWarning = warning;

    if (metadata) {
      logger.warn(logMessage, metadata);
      return;
    }

    logger.warn(logMessage);
  };

  if (!activeOrganizationId) {
    registerFallbackWarning({
      logMessage: `Sessão do usuário ${session.user.id} sem organização ativa. Usando fallback 0 para pe_person_id.`,
      warning: {
        title: "Organização ativa não identificada",
        description:
          "Não foi possível identificar a organização ativa da sua sessão. Alguns recursos podem funcionar de forma limitada até essa associação ser corrigida.",
      },
    });
  } else {
    const memberResponse = await AuthService.findMemberByUserAndOrganization({
      userId: session.user.id,
      organizationId: activeOrganizationId,
    });

    if (!memberResponse.success) {
      registerFallbackWarning({
        logMessage: `Falha ao resolver member ativo do usuário ${session.user.id} na organização ${activeOrganizationId}. Usando fallback 0 para pe_person_id.`,
        warning: {
          title: "Não foi possível validar seu vínculo ativo",
          description:
            "Houve um problema ao carregar seu vínculo com a organização atual. Algumas operações dependentes desse cadastro podem ficar indisponíveis temporariamente.",
        },
        metadata: {
          error: memberResponse.error,
        },
      });
    } else if (!memberResponse.data) {
      registerFallbackWarning({
        logMessage: `Nenhum member encontrado para o usuário ${session.user.id} na organização ${activeOrganizationId}. Usando fallback 0 para pe_person_id.`,
        warning: {
          title: "Seu vínculo com a organização não foi encontrado",
          description:
            "Sua conta está autenticada, mas não encontramos o cadastro interno que conecta você à organização atual. Revise o vínculo antes de continuar com rotinas operacionais.",
        },
      });
    } else if (!memberResponse.data.personId) {
      registerFallbackWarning({
        logMessage: `Member ${memberResponse.data.id} do usuário ${session.user.id} na organização ${activeOrganizationId} sem personId preenchido. Usando fallback 0 para pe_person_id.`,
        warning: {
          title: "Seu cadastro está incompleto",
          description:
            "Seu vínculo com a organização está sem personId preenchido. Enquanto isso não for corrigido, algumas ações podem usar dados incompletos ou ficar restritas.",
        },
      });
    } else {
      personId = memberResponse.data.personId;
    }
  }

  return {
    session,
    authWarning,
    apiContext: {
      pe_system_client_id: session.session?.systemId ?? 0,
      pe_organization_id: activeOrganizationId ?? "0",
      pe_user_id: session.user.id ?? "0",
      pe_user_name: session.user.name ?? "",
      pe_user_role: session.user.role ?? "admin",
      pe_person_id: personId,
    },
  };
}
