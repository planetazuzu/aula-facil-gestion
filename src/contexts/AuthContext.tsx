
import { User, UserRole } from "@/types";
import { createContext, useContext, useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAdmin: boolean;
  isTeacher: boolean;
  isUser: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is already authenticated
    const initAuth = async () => {
      try {
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
              notificationPreference: profileData.notification_preference,
              phone: profileData.phone,
              createdAt: new Date(profileData.created_at),
              updatedAt: new Date(profileData.updated_at)
            };
            setUser(userData);
          }
        }
      } catch (error) {
        console.error("Error initializing Supabase auth:", error);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();

    // Set up auth state listener
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
            notificationPreference: profileData.notification_preference,
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
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      
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
          notificationPreference: profileData.notification_preference,
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
      await supabase.auth.signOut();
      setUser(null);
      toast.success("Logged out successfully");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Failed to log out");
    }
  };

  const isAdmin = user?.role === UserRole.ADMIN;
  const isTeacher = user?.role === UserRole.TEACHER;
  const isUser = user?.role === UserRole.USER;

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
