
import { useAuth } from "@/contexts/AuthContext";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";
import { Navigate } from "react-router-dom";
import { Loader2 } from "lucide-react";

interface LayoutProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  allowedRoles?: string[];
}

export function Layout({ children, requireAuth = true, allowedRoles = [] }: LayoutProps) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Check if authentication is required but user is not logged in
  if (requireAuth && !user) {
    return <Navigate to="/login" replace />;
  }

  // Check if user has permission to access this page
  if (user && allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  // If no auth required or user is logged in and has permission
  if (!user) {
    // Simple layout for non-authenticated pages
    return <div className="min-h-screen">{children}</div>;
  }

  // Full layout with sidebar for authenticated users
  return (
    <div className="flex h-screen w-full overflow-hidden">
      <div className="hidden md:block">
        <Sidebar />
      </div>
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header />
        <main className="flex-1 overflow-auto p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
