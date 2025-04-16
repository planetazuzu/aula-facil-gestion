
import { User, UserRole } from "@/types";
import { createContext, useContext, useEffect, useState } from "react";
import { getCurrentSession, loginUser, logoutUser, setupAuthListener } from "@/services/authService";
import { hasPermission, checkPermissions } from "@/utils/permissionUtils";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAdmin: boolean;
  isTeacher: boolean;
  isUser: boolean;
  hasPermission: (permission: string) => boolean;
  checkPermissions: (permissions: string[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Check if user is already authenticated
    const initAuth = async () => {
      try {
        const userData = await getCurrentSession();
        setUser(userData);
      } catch (error) {
        console.error("Error initializing auth:", error);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();

    // Set up auth state listener
    const subscription = setupAuthListener(setUser);

    // Cleanup listener on unmount
    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const result = await loginUser(email, password);
      
      if (result.success && result.user) {
        setUser(result.user);
        return true;
      }
      
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    await logoutUser();
    setUser(null);
  };

  // Role-based checks
  const isAdmin = user?.role === UserRole.ADMIN;
  const isTeacher = user?.role === UserRole.TEACHER;
  const isUser = user?.role === UserRole.USER;

  // Permission-based checks
  const hasPermissionFn = (permission: string): boolean => {
    return hasPermission(user?.role, permission);
  };

  // Check if user has any of the provided permissions
  const checkPermissionsFn = (permissions: string[]): boolean => {
    return checkPermissions(user?.role, permissions);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        logout,
        isAdmin,
        isTeacher,
        isUser,
        hasPermission: hasPermissionFn,
        checkPermissions: checkPermissionsFn,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
