# Manager ERP

> Painel administrativo e sistema ERP para gerenciamento de vendas, produtos, clientes, pedidos e operações comerciais — construído com Next.js 16, React 19 e arquitetura Server Components.

![Next.js](https://img.shields.io/badge/Next.js-16.1-black?logo=next.js)
![React](https://img.shields.io/badge/React-19.2-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.2-06B6D4?logo=tailwindcss)
![Biome](https://img.shields.io/badge/Biome-2.4-60A5FA?logo=biome)
![License](https://img.shields.io/badge/License-MIT-green)

---

## 📑 Índice

- [Sobre o Projeto](#-sobre-o-projeto)
- [Tecnologias Utilizadas](#-tecnologias-utilizadas)
- [Pré-requisitos](#-pré-requisitos)
- [Instalação e Configuração](#-instalação-e-configuração)
- [Scripts Disponíveis](#-scripts-disponíveis)
- [Estrutura de Diretórios](#-estrutura-de-diretórios)
- [Variáveis de Ambiente](#-variáveis-de-ambiente)
- [Contribuição](#-contribuição)
- [Licença](#-licença)

---

## 📖 Sobre o Projeto

O **Manager ERP** é um painel administrativo completo para operações comerciais, incluindo:

- **PDV (Ponto de Venda)** — Interface para criação e gerenciamento de pedidos de venda
- **Catálogo de Produtos** — CRUD completo com categorias, tipos e marcas
- **Gestão de Clientes** — Cadastro, edição inline e busca
- **Gestão de Pedidos** — Itens, operações, relatórios de vendas e atualizações
- **Taxonomia** — Gerenciamento de categorias, relacionamentos e classificações
- **Fornecedores e Transportadoras** — Cadastro e manutenção
- **Dashboard Analítico** — Visão geral com gráficos e métricas (Recharts)
- **Autenticação** — Login com e-mail/senha, OAuth (GitHub, Google) via Better Auth
- **Multi-organização** — Suporte a membros, permissões e organizações

O projeto segue uma arquitetura **Server Components first**, utilizando React Compiler e cache granular para máxima performance.

---

## 🚀 Tecnologias Utilizadas

### Core

| Tecnologia | Versão | Descrição |
|---|---|---|
| **Next.js** | 16.1 | Framework React com App Router e React Compiler |
| **React** | 19.2 | Biblioteca UI com Server Components |
| **TypeScript** | 5.9 | Tipagem estática com strict mode |
| **Tailwind CSS** | 4.2 | Utility-first CSS framework |

### UI & Componentes

| Tecnologia | Descrição |
|---|---|
| **shadcn/ui** | Componentes acessíveis (Radix UI + Tailwind) |
| **Lucide React** | Biblioteca de ícones |
| **Tabler Icons** | Ícones adicionais |
| **Recharts** | Gráficos e visualizações |
| **Sonner** | Notificações toast |
| **Vaul** | Drawer/modal components |
| **dnd-kit** | Drag and drop |

### Backend & Dados

| Tecnologia | Descrição |
|---|---|
| **MySQL** (mysql2) | Banco de dados relacional |
| **Better Auth** | Autenticação (e-mail, GitHub, Google) |
| **Axios** | Cliente HTTP para APIs externas |
| **Zod** | Validação de schemas e dados |
| **Resend** | Envio transacional de e-mails |

### Ferramentas de Desenvolvimento

| Tecnologia | Descrição |
|---|---|
| **Biome** | Linter e formatter |
| **pnpm** | Gerenciador de pacotes |
| **React Hook Form** | Gerenciamento de formulários |
| **DOMPurify** | Sanitização de HTML |

---

## 📦 Pré-requisitos

- **Node.js** >= 22.x
- **pnpm** >= 10.x
- **MySQL** 8.x (ou compatível)
- Conta em serviços OAuth (GitHub e/ou Google) para autenticação social (opcional)
- Conta no [Resend](https://resend.com) para envio de e-mails (opcional)

---

## ⚙️ Instalação e Configuração

### 1. Clone o repositório

```bash
git clone https://github.com/seu-usuario/web-app-manager-erp-v1.git
cd web-app-manager-erp-v1
```

### 2. Instale as dependências

```bash
pnpm install
```

### 3. Configure as variáveis de ambiente

Copie o arquivo de exemplo e preencha com seus valores:

```bash
cp .env.example .env
```

Consulte a seção [Variáveis de Ambiente](#-variáveis-de-ambiente) para detalhes.

### 4. Execute o projeto

```bash
# Modo desenvolvimento
pnpm dev

# Modo produção
pnpm build && pnpm start
```

O servidor estará disponível em `http://localhost:3000` (ou na porta configurada).

---

## 📜 Scripts Disponíveis

| Script | Comando | Descrição |
|---|---|---|
| `dev` | `pnpm dev` | Inicia o servidor de desenvolvimento com variáveis do `.env` |
| `build` | `pnpm build` | Gera o build de produção |
| `start` | `pnpm start` | Inicia o servidor de produção com variáveis do `.env` |
| `lint` | `pnpm lint` | Executa o linter (Biome) para verificação de código |
| `format` | `pnpm format` | Formata o código automaticamente com Biome |

---

## 🗂️ Estrutura de Diretórios

```
src/
├── app/                        # Next.js App Router
│   ├── (auth)/                 # Rotas de autenticação (sign-in, forgot-password, etc.)
│   ├── actions/                # Server Actions globais
│   ├── admin/                  # Painel de administração
│   ├── api/                    # API Routes (auth, invitations)
│   ├── brand/                  # CRUD de marcas
│   ├── dashboard/              # Dashboard principal e PDV
│   │   ├── _components/        # Componentes do dashboard (sidebar, header, PDV)
│   │   ├── category/           # Gestão de categorias
│   │   ├── product/            # Gestão de produtos
│   │   └── report/             # Relatórios
│   ├── layout.tsx              # Layout raiz (tema, fontes, metadata)
│   └── page.tsx                # Página inicial
│
├── components/                 # Componentes reutilizáveis
│   ├── auth/                   # Componentes de autenticação
│   ├── common/                 # Componentes genéricos compartilhados
│   ├── dashboard/              # Componentes do painel
│   ├── emails/                 # Templates de e-mail (React Email)
│   ├── header/                 # Cabeçalho do site
│   ├── theme/                  # Provider de tema (dark/light)
│   └── ui/                     # Componentes base (shadcn/ui)
│
├── core/                       # Utilitários core
│   ├── config/                 # Configuração e variáveis de ambiente (Zod)
│   ├── constants/              # Constantes da aplicação
│   └── logger.ts               # Sistema de logging
│
├── db/                         # Schema do banco de dados
│
├── hooks/                      # React hooks customizados
│
├── lib/                        # Utilitários compartilhados
│   ├── auth/                   # Configuração do Better Auth
│   ├── axios/                  # Instância e interceptors Axios
│   ├── constants/              # Constantes de lib
│   ├── translations/           # Internacionalização (pt/en)
│   └── validations/            # Schemas de validação
│
├── server/                     # Lógica server-side
│   ├── auth-context.ts         # Contexto de autenticação
│   ├── members.ts              # Gestão de membros
│   ├── organizations.ts        # Gestão de organizações
│   ├── permissions.ts          # Sistema de permissões
│   └── users.ts                # Gestão de usuários
│
├── services/                   # Camada de serviços
│   ├── api-main/               # Serviços da API principal (20+ módulos)
│   ├── api-assets/             # Serviço de assets
│   ├── api-cep/                # Serviço de consulta CEP
│   └── db/                     # Conexão e serviços de banco de dados
│
└── types/                      # Definições de tipos TypeScript
```

---

## 🛡️ Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis:

### Variáveis Públicas (expostas ao cliente)

```env
NEXT_PUBLIC_APP_URL=
NEXT_PUBLIC_APP_NAME=
NEXT_PUBLIC_SIDEBAR_TITLE=
NEXT_PUBLIC_DEVELOPER_NAME=
NEXT_PUBLIC_DEVELOPER_URL=
NEXT_PUBLIC_COMPANY_NAME=
NEXT_PUBLIC_COMPANY_PHONE=
NEXT_PUBLIC_COMPANY_EMAIL=
NEXT_PUBLIC_COMPANY_WHATSAPP=
NEXT_PUBLIC_COMPANY_META_TITLE_MAIN=
NEXT_PUBLIC_COMPANY_META_TITLE_CAPTION=
NEXT_PUBLIC_COMPANY_META_DESCRIPTION=
```

### Variáveis do Servidor (apenas server-side)

```env
PORT=
APP_ID=
STORE_ID=
API_KEY=

# Banco de Dados
DATABASE_URL=
DATABASE_HOST=
DATABASE_PORT=
DATABASE_NAME=
DATABASE_USER=
DATABASE_PASSWORD=

# APIs Externas
EXTERNAL_API_MAIN_URL=
EXTERNAL_API_ASSETS_URL=

# Autenticação (Better Auth)
BETTER_AUTH_URL=
BETTER_AUTH_SECRET=

# OAuth - GitHub
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=

# OAuth - Google
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# E-mail (Resend)
RESEND_API_KEY=
EMAIL_SENDER_NAME=
EMAIL_SENDER_ADDRESS=
```

> **⚠️ Importante:** Nunca commite o arquivo `.env` com valores reais. Utilize `.env.example` como referência.

---

## 🤝 Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/minha-feature`)
3. Faça commit das alterações (`git commit -m 'feat: adiciona minha feature'`)
4. Envie para a branch (`git push origin feature/minha-feature`)
5. Abra um Pull Request

### Convenções

- **Commits:** Siga o padrão [Conventional Commits](https://www.conventionalcommits.org/) (`feat:`, `fix:`, `chore:`, etc.)
- **Code Style:** Execute `pnpm format` antes de commitar
- **Linting:** Execute `pnpm lint` para garantir que não há erros
- **Arquivos:** Use kebab-case para nomes de arquivos
- **Componentes:** Use PascalCase para nomes de componentes
- **TypeScript:** Strict mode — sem `any`, use `unknown` quando necessário

---

## 📝 Licença

Este projeto está licenciado sob a licença MIT. Consulte o arquivo [LICENSE](LICENSE) para mais detalhes.

---

## 👤 Autor

Desenvolvido com ❤️ para gestão comercial moderna.

Para dúvidas ou sugestões, abra uma [issue](../../issues) no repositório.