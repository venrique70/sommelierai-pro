"use client"

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { VariantProps, cva } from "class-variance-authority"
import { PanelLeft, BarChart, Wine, HandCoins, UserCog, BotMessageSquare, CookingPot, FileText, Utensils, Building, Users, LogOut, Home, History, Beaker, Archive, BookOpenCheck, DollarSign, ShieldCheck } from "lucide-react"
import Link from "next/link"
import { usePathname, useRouter } from 'next/navigation'

import { useIsMobile } from "@/hooks/use-mobile"
import { useAuth } from "@/hooks/use-auth"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { logout } from "@/lib/auth"
import { useToast } from "@/hooks/use-toast"

/* -------------------- COMPONENTES BASE -------------------- */

const SidebarMenu = React.forwardRef<
  HTMLUListElement,
  React.ComponentProps<"ul">
>(({ className, ...props }, ref) => (
  <ul
    ref={ref}
    className={cn("flex w-full min-w-0 flex-col gap-1", className)}
    {...props}
  />
))
SidebarMenu.displayName = "SidebarMenu"

const SidebarMenuItem = React.forwardRef<
  HTMLLIElement,
  React.ComponentProps<"li">
>(({ className, ...props }, ref) => (
  <li
    ref={ref}
    className={cn("group/menu-item relative", className)}
    {...props}
  />
))
SidebarMenuItem.displayName = "SidebarMenuItem"

const sidebarMenuButtonVariants = cva(
  "flex w-full items-center gap-3 rounded-md p-2 text-left text-sm hover:bg-sidebar-accent hover:text-sidebar-accent-foreground [&>svg]:size-5 [&>svg]:shrink-0"
)

const SidebarMenuButton = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<"button"> & {
    asChild?: boolean
    isActive?: boolean
    tooltip?: string | React.ComponentProps<typeof TooltipContent>
  } & VariantProps<typeof sidebarMenuButtonVariants>
>(({ asChild = false, isActive = false, tooltip, className, ...props }, ref) => {
  const Comp = asChild ? Slot : "button"
  const { isMobile } = useSidebar()

  const button = (
    <Comp
      ref={ref}
      data-active={isActive}
      className={cn(sidebarMenuButtonVariants(), className)}
      {...props}
    />
  )

  if (!tooltip) return button
  if (typeof tooltip === "string") {
    tooltip = { children: tooltip }
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>{button}</TooltipTrigger>
      <TooltipContent side="right" align="center" hidden={!isMobile} {...tooltip} />
    </Tooltip>
  )
})
SidebarMenuButton.displayName = "SidebarMenuButton"

/* -------------------- SIDEBAR PROVIDER -------------------- */

const SidebarContext = React.createContext<any>(null)
function useSidebar() {
  const context = React.useContext(SidebarContext)
  if (!context) throw new Error("useSidebar must be used within a SidebarProvider.")
  return context
}

const SidebarProvider = ({ children, defaultOpen = true }: { children: React.ReactNode; defaultOpen?: boolean }) => {
  const isMobile = useIsMobile()
  const [openMobile, setOpenMobile] = React.useState(false)
  const [open, setOpen] = React.useState(defaultOpen)

  const toggleSidebar = () => (isMobile ? setOpenMobile(!openMobile) : setOpen(!open))
  const state = open ? "expanded" : "collapsed"

  return (
    <SidebarContext.Provider value={{ state, open, setOpen, isMobile, openMobile, setOpenMobile, toggleSidebar }}>
      <TooltipProvider delayDuration={0}>
        <div className="flex h-full">{children}</div>
      </TooltipProvider>
    </SidebarContext.Provider>
  )
}

/* -------------------- APP SIDEBAR -------------------- */

const AppSidebar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { profile, loading: authLoading } = useAuth();
  const { toast } = useToast();

  const mainNav = [
    { href: "/", label: "Home", icon: Home, isButton: true },
    { href: "/history", label: "Mi Historial", icon: History },
    { href: "/mi-bodega", label: "Mi Bodega", icon: Archive },
  ];

  const accountNav = [
    { href: "/account", label: "Mi Cuenta", icon: UserCog },
    { href: "/planes", label: "Planes", icon: HandCoins },
    { href: "/corporate", label: "Planes Corporativos", icon: Building },
    { href: "/privacy-policy", label: "Política de Privacidad", icon: ShieldCheck }, // 👈 añadido
  ];

  const affiliateNav = [
    { href: "/dashboard-afiliado", label: "Portal de Afiliados", icon: BarChart },
  ];

  const adminNav = [
    { href: "/admin/dashboard-afiliado", label: "Dashboard Afiliados", icon: DollarSign },
    { href: "/admin/vendedores", label: "Gestión de Vendedores", icon: Users },
    { href: "/admin/webhook-test", label: "Test Webhook", icon: Beaker },
    { href: "/mi-carta", label: "Mi Carta (Restaurante)", icon: BookOpenCheck },
  ]

  const toolNav = [
    { href: "/cata-sheet", label: "Análisis por Ficha", icon: FileText },
    { href: "/course-pairing", label: "Maridaje 6 Tiempos", icon: Utensils },
  ]

  const handleHomeClick = () => {
    if (pathname === '/') {
      window.location.reload();
    } else {
      router.push('/');
    }
  };

  const NavMenu = ({ items }: { items: { href: string, label: string, icon: React.ElementType, isButton?: boolean }[] }) => (
    <SidebarMenu>
      {items.map((item) => (
        <SidebarMenuItem key={item.href}>
          {item.isButton ? (
            <SidebarMenuButton onClick={handleHomeClick} isActive={pathname === item.href} tooltip={item.label}>
              <item.icon />
              <span>{item.label}</span>
            </SidebarMenuButton>
          ) : (
            <SidebarMenuButton asChild isActive={pathname === item.href} tooltip={item.label}>
              <Link href={item.href}>
                <item.icon />
                <span>{item.label}</span>
              </Link>
            </SidebarMenuButton>
          )}
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );

  const handleLogout = async () => {
    try {
      await logout(router);
      toast({ title: "Sesión Cerrada", description: "Has cerrado sesión correctamente." });
    } catch(error) {
      toast({ title: "Error al cerrar sesión", description: "No se pudo cerrar la sesión. Inténtalo de nuevo.", variant: "destructive" });
    }
  }

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex flex-col w-64 bg-sidebar text-sidebar-foreground">
        <div className="p-4 font-bold text-lg">SommelierPro AI</div>
        <NavMenu items={mainNav} />
        <div className="mt-4 font-semibold text-xs px-4">Herramientas IA</div>
        <NavMenu items={toolNav} />
        <div className="mt-4 font-semibold text-xs px-4">Cuenta</div>
        <NavMenu items={accountNav} />
        {!authLoading && (
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton onClick={handleLogout} tooltip="Cerrar Sesión">
                <LogOut />
                <span>Cerrar Sesión</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        )}
        {profile?.role === 'admin' && (
          <>
            <div className="mt-4 font-semibold text-xs px-4">Admin</div>
            <NavMenu items={adminNav} />
          </>
        )}
      </div>
    </SidebarProvider>
  )
}

export { AppSidebar }
