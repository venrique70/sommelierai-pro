"use client"

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { VariantProps, cva } from "class-variance-authority"
import {
  BarChart,
  HandCoins,
  UserCog,
  FileText,
  Utensils,
  Building,
  Users,
  LogOut,
  Home,
  History,
  Beaker,
  Archive,
  BookOpenCheck,
  DollarSign,
  ShieldCheck,
} from "lucide-react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"

import { useIsMobile } from "@/hooks/use-mobile"
import { useAuth } from "@/hooks/use-auth"
import { cn } from "@/lib/utils"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { logout } from "@/lib/auth"
import { useToast } from "@/hooks/use-toast"

// ⬇️ i18n minimal: usamos el idioma actual y diccionario
import { useLang } from "@/lib/use-lang"
import { translations } from "@/lib/translations"

/* -------------------- COMPONENTES BASE -------------------- */

const SidebarMenu = React.forwardRef<HTMLUListElement, React.ComponentProps<"ul">>(
  ({ className, ...props }, ref) => (
    <ul ref={ref} className={cn("flex w-full min-w-0 flex-col gap-1", className)} {...props} />
  )
)
SidebarMenu.displayName = "SidebarMenu"

const SidebarMenuItem = React.forwardRef<HTMLLIElement, React.ComponentProps<"li">>(
  ({ className, ...props }, ref) => <li ref={ref} className={cn("group/menu-item relative", className)} {...props} />
)
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

  const button = <Comp ref={ref} data-active={isActive} className={cn(sidebarMenuButtonVariants(), className)} {...props} />

  if (!tooltip) return button
  if (typeof tooltip === "string") tooltip = { children: tooltip }

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

  return (
    <SidebarContext.Provider value={{ open, setOpen, isMobile, openMobile, setOpenMobile, toggleSidebar }}>
      <TooltipProvider delayDuration={0}>
        <div className="flex h-full">{children}</div>
      </TooltipProvider>
    </SidebarContext.Provider>
  )
}

/* -------------------- APP SIDEBAR -------------------- */

const AppSidebar = () => {
  const pathname = usePathname()
  const router = useRouter()
  const { profile, loading: authLoading } = useAuth()
  const { toast } = useToast()

  // ⬇️ idioma actual + diccionario
  const lang = useLang("es")
  const t = translations[lang]
  const { isMobile, openMobile, toggleSidebar } = useSidebar()

  // ⬇️ Menús con labels traducidos (no tocamos rutas)
  const mainNav = [
    { href: "/", label: t.navHome, icon: Home, isButton: true },
    { href: "/history", label: t.navHistory, icon: History },
    { href: "/mi-bodega", label: t.navCellar, icon: Archive },
  ]

  const accountNav = [
    { href: "/account", label: t.navAccount, icon: UserCog },
    { href: "/planes", label: t.navPlans, icon: HandCoins },
    { href: "/corporate", label: t.navCorporatePlans, icon: Building },
    { href: "/privacy-policy", label: t.navLegal, icon: ShieldCheck },
  ]

  const affiliateNav = [{ href: "/dashboard-afiliado", label: t.navAffiliatePortal, icon: BarChart }]

  const adminNav = [
    { href: "/admin/dashboard-afiliado", label: t.navAffiliateDashboard, icon: DollarSign },
    { href: "/admin/vendedores", label: t.navVendorsManagement, icon: Users },
    { href: "/admin/webhook-test", label: t.navTestWebhook, icon: Beaker },
    { href: "/mi-carta", label: t.navMyMenu, icon: BookOpenCheck },
  ]

  const toolNav = [
    { href: "/cata-sheet", label: t.navSheetAnalysis, icon: FileText },
    { href: "/course-pairing", label: t.navSixCoursePairing, icon: Utensils },
  ]

  const handleHomeClick = () => {
    if (pathname === "/") window.location.reload()
    else router.push("/")
  }

  const NavMenu = ({
    items,
  }: {
    items: { href: string; label: string; icon: React.ElementType; isButton?: boolean }[]
  }) => (
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
  )

  const handleLogout = async () => {
    try {
      await logout(router)
      toast({ title: "Sesión Cerrada", description: "Has cerrado sesión correctamente." })
    } catch {
      toast({
        title: "Error al cerrar sesión",
        description: "No se pudo cerrar la sesión. Inténtalo de nuevo.",
        variant: "destructive",
      })
    }
  }

  return (
    <SidebarProvider defaultOpen={true}>
      {isMobile && (
        <button
          onClick={toggleSidebar}
          aria-label={openMobile ? "Cerrar menú" : "Abrir menú"}
          className="md:hidden fixed left-3 top-3 z-[60] rounded-full bg-black/70 border border-zinc-700/60 px-3 py-2 text-[#D4B26A]"
        >
          ≡
        </button>
      )}
      {isMobile && openMobile && (
        <div className="fixed inset-0 z-40 bg-black/40" onClick={() => setOpenMobile(false)} />
      )}
      <div
        className={cn(
          "flex flex-col w-64 bg-sidebar text-sidebar-foreground",
          // Desktop fijo:
          "md:static md:translate-x-0",
          // Móvil off-canvas con animación:
          "fixed left-0 top-0 h-full z-50 transition-transform duration-300",
          openMobile ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="p-4 font-bold text-lg">SommelierPro AI</div>

        {/* Principal */}
        <NavMenu items={mainNav} />

        {/* Herramientas IA */}
        <div className="mt-4 font-semibold text-xs px-4">{t.navAiTools}</div>
        <NavMenu items={toolNav} />

        {/* Cuenta */}
        <div className="mt-4 font-semibold text-xs px-4">{t.navAccount}</div>
        <NavMenu items={accountNav} />

        {/* Afiliados */}
        <div className="mt-4 font-semibold text-xs px-4">{t.navAffiliatePortal}</div>
        <NavMenu items={affiliateNav} />

        {/* Logout */}
        {!authLoading && (
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton onClick={handleLogout} tooltip={t.navLogout}>
                <LogOut />
                <span>{t.navLogout}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        )}

        {/* Admin */}
        {profile?.role === "admin" && (
          <>
            <div className="mt-4 font-semibold text-xs px-4">{t.navAdmin}</div>
            <NavMenu items={adminNav} />
          </>
        )}
      </div>
    </SidebarProvider>
  )
}

export { AppSidebar }
