
import { User, UserRole, NotificationPreference } from "@/types";
import { createContext, useContext, useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { mockUsers, userService } from "@/lib/mock/users";

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

// Define permissions for each role
const rolePermissions: Record<UserRole, string[]> = {
  [UserRole.ADMIN]: [
    'user:create', 'user:read', 'user:update', 'user:delete',
    'course:create', 'course:read', 'course:update', 'course:delete',
    'enrollment:create', 'enrollment:read', 'enrollment:update', 'enrollment:delete',
    'statistics:read', 'system:manage'
  ],
  [UserRole.TEACHER]: [
    'course:read', 'course:update',
    'enrollment:read',
    'user:read',
    'statistics:read'
  ],
  [UserRole.USER]: [
    'course:read',
    'enrollment:create', 'enrollment:read', 'enrollment:update',
    'user:read'
  ]
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Flag to determine if we should use mock authentication
  const useMockAuth = true; // Set to true to use mock users instead of Supabase

  useEffect(() => {
    // Check if user is already authenticated
    const initAuth = async () => {
      try {
        if (useMockAuth) {
          // For mock auth, check localStorage
          const storedUser = localStorage.getItem('mockUser');
          if (storedUser) {
            const parsedUser = JSON.parse(storedUser);
            setUser(parsedUser);
          }
          setIsLoading(false);
          return;
        }
        
        // Real Supabase authentication
        const { data } = await supabase.auth.getSession();
        
        if (data.session) {
          // Get the full user profile from the user_profiles table
          const { data: profileData, error } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('id', data.session.user.id)
            .single();
            
          if (profileData && !error) {
            // Map the Supabase format to our application's User format
            const userData: User = {
              id: data.session.user.id,
              email: profileData.email,
              name: profileData.name,
              role: profileData.role as UserRole,
              notificationPreference: profileData.notification_preference as NotificationPreference,
              phone: profileData.phone,
              createdAt: new Date(profileData.created_at),
              updatedAt: new Date(profileData.updated_at)
            };
            setUser(userData);
          }
        }
      } catch (error) {
        console.error("Error initializing auth:", error);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();

    // Set up auth state listener only for real Supabase auth
    if (!useMockAuth) {
      const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          // User signed in, get their profile
          const { data: profileData, error } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
              
          if (profileData && !error) {
            const userData: User = {
              id: session.user.id,
              email: profileData.email,
              name: profileData.name,
              role: profileData.role as UserRole,
              notificationPreference: profileData.notification_preference as NotificationPreference,
              phone: profileData.phone,
              createdAt: new Date(profileData.created_at),
              updatedAt: new Date(profileData.updated_at)
            };
            setUser(userData);
          }
        } else if (event === 'SIGNED_OUT') {
          // User signed out
          setUser(null);
        }
      });

      // Cleanup listener on unmount
      return () => {
        authListener.subscription.unsubscribe();
      };
    }
  }, [useMockAuth]);

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      
      if (useMockAuth) {
        // Use mock authentication
        const result = await userService.login(email, password);
        
        if (result.success && result.user) {
          setUser(result.user);
          // Store user in localStorage for persistence
          localStorage.setItem('mockUser', JSON.stringify(result.user));
          toast.success(`Welcome back, ${result.user.name}`);
          return true;
        }
        
        toast.error(result.message || "Invalid login credentials");
        return false;
      }
      
      // Real Supabase authentication
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        toast.error(error.message || "Error during login");
        return false;
      }
      
      if (data.user) {
        // Get the user profile
        const { data: profileData, error: profileError } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();
          
        if (profileError || !profileData) {
          toast.error("Could not retrieve user profile");
          return false;
        }
        
        const userData: User = {
          id: data.user.id,
          email: profileData.email,
          name: profileData.name,
          role: profileData.role as UserRole,
          notificationPreference: profileData.notification_preference as NotificationPreference,
          phone: profileData.phone,
          createdAt: new Date(profileData.created_at),
          updatedAt: new Date(profileData.updated_at)
        };
        
        setUser(userData);
        
        toast.success(`Welcome back, ${userData.name}`);
        return true;
      }
      
      return false;
    } catch (error: any) {
      console.error("Login error:", error);
      toast.error(error.message || "An error occurred during login");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      if (useMockAuth) {
        // Mock logout: just clear the user state and localStorage
        setUser(null);
        localStorage.removeItem('mockUser');
        toast.success("Logged out successfully");
        return;
      }
      
      // Real Supabase logout
      await supabase.auth.signOut();
      setUser(null);
      toast.success("Logged out successfully");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Failed to log out");
    }
  };

  // Role-based checks
  const isAdmin = user?.role === UserRole.ADMIN;
  const isTeacher = user?.role === UserRole.TEACHER;
  const isUser = user?.role === UserRole.USER;

  // Permission-based checks
  const hasPermission = (permission: string): boolean => {
    if (!user) return false;
    
    const userPermissions = rolePermissions[user.role] || [];
    return userPermissions.includes(permission);
  };

  // Check if user has any of the provided permissions
  const checkPermissions = (permissions: string[]): boolean => {
    if (!user) return false;
    if (permissions.length === 0) return true;
    
    const userPermissions = rolePermissions[user.role] || [];
    return permissions.some(permission => userPermissions.includes(permission));
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
        hasPermission,
        checkPermissions,
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
