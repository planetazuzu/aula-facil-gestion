import { useAuth } from "@/contexts/AuthContext";
import { UserRole } from "@/types";
import { cn } from "@/lib/utils";
import { 
  BookOpen, 
  Calendar, 
  ChevronRight, 
  Clock, 
  Home, 
  LayoutDashboard, 
  LogOut, 
  MessageCircle, 
  Settings, 
  Users,
  BookCheck,
  BookText,
  ChartBar,
  Bell
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const { user, logout, isAdmin, isTeacher } = useAuth();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  if (!user) return null;

  const navigationItems = (() => {
    const commonItems = [
      {
        title: "Inicio",
        href: "/",
        icon: Home,
      },
      {
        title: "Cursos",
        href: "/courses",
        icon: BookOpen,
      },
      {
        title: "Calendario",
        href: "/calendar",
        icon: Calendar,
      },
      {
        title: "Mensajes",
        href: "/messages",
        icon: MessageCircle,
      },
      {
        title: "Notificaciones",
        href: "/notifications",
        icon: Bell,
      },
    ];
    
    if (isAdmin) {
      return [
        ...commonItems,
        {
          title: "Panel de Control",
          href: "/admin/dashboard",
          icon: LayoutDashboard,
        },
        {
          title: "Gestión de Cursos",
          href: "/admin/courses",
          icon: BookText,
        },
        {
          title: "Gestión de Usuarios",
          href: "/admin/users",
          icon: Users,
        },
        {
          title: "Estadísticas",
          href: "/admin/statistics",
          icon: ChartBar,
        },
      ];
    }
    
    if (isTeacher) {
      return [
        ...commonItems,
        {
          title: "Mis Cursos",
          href: "/teacher/courses",
          icon: BookCheck,
        },
      ];
    }
    
    return [
      ...commonItems,
      {
        title: "Mis Inscripciones",
        href: "/enrollments",
        icon: Clock,
      },
      {
        title: "Historial",
        href: "/history",
        icon: Clock,
      },
    ];
  })();

  return (
    <div
      className={cn(
        "flex flex-col h-full border-r bg-sidebar transition-all duration-300",
        collapsed ? "w-16" : "w-64",
        className
      )}
    >
      <div className="flex items-center justify-between p-4 border-b">
        {!collapsed && (
          <div className="flex items-center">
            <BookOpen className="h-6 w-6 text-primary mr-2" />
            <span className="font-semibold text-lg">Empresa Formacion</span>
          </div>
        )}
        {collapsed && <BookOpen className="h-6 w-6 text-primary mx-auto" />}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className="ml-auto"
        >
          <ChevronRight 
            className={cn(
              "h-4 w-4 transition-transform", 
              collapsed ? "" : "rotate-180"
            )} 
          />
        </Button>
      </div>
      <div className="flex-1 overflow-auto py-2">
        <nav className="flex flex-col gap-1 px-2">
          {navigationItems.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                location.pathname === item.href
                  ? "bg-sidebar-primary text-sidebar-primary-foreground"
                  : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
            >
              <item.icon className="h-4 w-4" />
              {!collapsed && <span>{item.title}</span>}
            </Link>
          ))}
        </nav>
      </div>
      <div className="mt-auto border-t p-4">
        <div className="flex flex-col gap-2">
          <Link
            to="/settings"
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
              location.pathname === "/settings"
                ? "bg-sidebar-primary text-sidebar-primary-foreground"
                : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            )}
          >
            <Settings className="h-4 w-4" />
            {!collapsed && <span>Configuración</span>}
          </Link>
          <Button
            variant="ghost"
            className="flex items-center gap-3 rounded-md px-3 py-2 text-sm justify-start"
            onClick={logout}
          >
            <LogOut className="h-4 w-4" />
            {!collapsed && <span>Cerrar Sesión</span>}
          </Button>
        </div>
      </div>
    </div>
  );
}
