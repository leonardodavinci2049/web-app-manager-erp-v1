import { Suspense } from "react";
import { HeaderNavUser } from "@/components/dashboard/header/header-nav-user";
import ModeToggle from "@/components/theme/mode-toggle";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";

interface SiteHeaderWithBreadcrumbProps {
  title?: string;
  breadcrumbItems?: Array<{
    label: string;
    href?: string;
    isActive?: boolean;
  }>;
}

export function SiteHeaderWithBreadcrumb({
  title = "Dashboard",
  breadcrumbItems = [
    { label: "Dashboard", href: "#" },
    { label: "Analytics", isActive: true },
  ],
}: SiteHeaderWithBreadcrumbProps) {
  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />

        {/* Breadcrumb Section */}
        <div className="flex items-center gap-2">
          <Breadcrumb>
            <BreadcrumbList>
              {breadcrumbItems.map((item, index) => (
                <div
                  key={item.href || item.label}
                  className="flex items-center"
                >
                  {index > 0 && (
                    <BreadcrumbSeparator className="hidden md:block" />
                  )}
                  <BreadcrumbItem className="hidden md:block">
                    {item.isActive ? (
                      <BreadcrumbPage>{item.label}</BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink href={item.href || "#"}>
                        {item.label}
                      </BreadcrumbLink>
                    )}
                  </BreadcrumbItem>
                </div>
              ))}
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        {/* Title for smaller screens */}
        <h1 className="text-base font-medium md:hidden">{title}</h1>
        <div className="ml-auto flex items-center gap-2">
          <Suspense>
            <ModeToggle />
          </Suspense>

          <Suspense
            fallback={
              <div className="bg-muted/30 h-10 w-32 animate-pulse rounded-full" />
            }
          >
            <HeaderNavUser />
          </Suspense>
        </div>
      </div>
    </header>
  );
}
