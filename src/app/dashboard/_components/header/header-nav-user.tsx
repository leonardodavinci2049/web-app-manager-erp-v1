"use client";

import {
  Activity,
  Bell,
  ChevronDown,
  LogOut,
  Settings,
  User,
} from "lucide-react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/use-auth";
import { useIsMobile } from "@/hooks/use-mobile";
import { useUserData } from "@/hooks/use-user-data";

export function HeaderNavUser() {
  const { user, isLoading } = useUserData();
  const { logout } = useAuth();
  const isMobile = useIsMobile();

  if (isLoading || !user) {
    return <div className="bg-muted/30 h-10 w-32 animate-pulse rounded-full" />;
  }

  const userInitials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="hover:bg-accent/50 focus-visible:ring-ring relative h-9 w-auto gap-2 rounded-full px-2 py-1 transition-all duration-200 focus-visible:ring-2 focus-visible:ring-offset-2"
        >
          <Avatar className="border-border/20 hover:border-border/40 h-7 w-7 border-2 transition-all duration-200">
            <AvatarImage src={user.avatar} alt={user.name} />
            <AvatarFallback className="text-primary border-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 text-xs font-semibold">
              {userInitials}
            </AvatarFallback>
          </Avatar>
          <div className="hidden flex-col text-left sm:flex">
            <span className="max-w-20 truncate text-sm leading-none font-medium lg:max-w-24">
              {user.name}
            </span>
            <span className="text-muted-foreground mt-0.5 text-xs leading-none">
              {user.email.includes("@") ? user.email.split("@")[0] : user.email}
            </span>
          </div>
          <ChevronDown className="text-muted-foreground h-3 w-3 shrink-0 transition-transform duration-200 group-data-[state=open]:rotate-180" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        className={`border-border/20 bg-background/95 w-72 rounded-xl shadow-xl backdrop-blur-sm ${
          isMobile ? "max-w-[calc(100vw-2rem)]" : ""
        }`}
        align="end"
        sideOffset={12}
        forceMount
      >
        <DropdownMenuLabel className="p-4">
          <div className="flex items-center gap-3">
            <Avatar className="border-border/20 h-12 w-12 border-2">
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback className="text-primary border-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 text-sm font-semibold">
                {userInitials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-1">
              <p className="text-sm leading-none font-semibold">{user.name}</p>
              <p className="text-muted-foreground text-xs leading-relaxed">
                {user.email}
              </p>
            </div>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator className="bg-border/50" />

        <DropdownMenuGroup className="space-y-1 p-2">
          <DropdownMenuItem
            asChild
            className="focus:bg-accent/80 cursor-pointer rounded-lg p-3 transition-colors duration-150"
          >
            <Link href="/dashboard/profile" className="flex items-center gap-3">
              <User className="text-muted-foreground h-4 w-4" />
              <div className="flex-1">
                <span className="text-sm font-medium">Meu Perfil</span>
                <p className="text-muted-foreground text-xs">
                  Visualizar e editar perfil
                </p>
              </div>
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem
            asChild
            className="focus:bg-accent/80 cursor-pointer rounded-lg p-3 transition-colors duration-150"
          >
            <Link
              href="/dashboard/settings"
              className="flex items-center gap-3"
            >
              <Settings className="text-muted-foreground h-4 w-4" />
              <div className="flex-1">
                <span className="text-sm font-medium">Configurações</span>
                <p className="text-muted-foreground text-xs">
                  Preferências da conta
                </p>
              </div>
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem
            asChild
            className="focus:bg-accent/80 cursor-pointer rounded-lg p-3 transition-colors duration-150"
          >
            <Link
              href="/dashboard/notifications"
              className="flex items-center gap-3"
            >
              <Bell className="text-muted-foreground h-4 w-4" />
              <div className="flex-1">
                <span className="text-sm font-medium">Notificações</span>
                <p className="text-muted-foreground text-xs">Gerir alertas</p>
              </div>
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem
            asChild
            className="focus:bg-accent/80 cursor-pointer rounded-lg p-3 transition-colors duration-150"
          >
            <Link
              href="/dashboard/activity"
              className="flex items-center gap-3"
            >
              <Activity className="text-muted-foreground h-4 w-4" />
              <div className="flex-1">
                <span className="text-sm font-medium">Atividade</span>
                <p className="text-muted-foreground text-xs">
                  Histórico de ações
                </p>
              </div>
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator className="bg-border/30" />

        <div className="p-2">
          <DropdownMenuItem
            className="cursor-pointer rounded-lg p-3 text-red-600 transition-colors duration-150 focus:bg-red-50 focus:text-red-700 dark:focus:bg-red-950/30 dark:focus:text-red-400"
            onClick={logout}
          >
            <LogOut className="h-4 w-4" />
            <div className="flex-1">
              <span className="text-sm font-medium">Sair</span>
              <p className="text-xs opacity-75">Encerrar sessão</p>
            </div>
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
