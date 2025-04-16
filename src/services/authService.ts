
import { User, UserRole, NotificationPreference } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { mockUsers, userService } from "@/lib/mock/users";
import { toast } from "sonner";

// Flag to determine if we should use mock authentication
export const useMockAuth = true; // Set to true to use mock users instead of Supabase

export const getCurrentSession = async (): Promise<User | null> => {
  try {
    if (useMockAuth) {
      // For mock auth, check localStorage
      const storedUser = localStorage.getItem('mockUser');
      if (storedUser) {
        return JSON.parse(storedUser);
      }
      return null;
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
        return userData;
      }
    }
    return null;
  } catch (error) {
    console.error("Error getting session:", error);
    return null;
  }
};

export const loginUser = async (email: string, password: string): Promise<{success: boolean, user: User | null, message?: string}> => {
  try {
    if (useMockAuth) {
      // Use mock authentication
      const result = await userService.login(email, password);
      
      if (result.success && result.user) {
        // Store user in localStorage for persistence
        localStorage.setItem('mockUser', JSON.stringify(result.user));
        toast.success(`Welcome back, ${result.user.name}`);
        return { 
          success: true, 
          user: result.user 
        };
      }
      
      return { 
        success: false, 
        user: null,
        message: result.message || "Invalid login credentials" 
      };
    }
    
    // Real Supabase authentication
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) {
      return {
        success: false,
        user: null,
        message: error.message || "Error during login"
      };
    }
    
    if (data.user) {
      // Get the user profile
      const { data: profileData, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();
        
      if (profileError || !profileData) {
        return {
          success: false,
          user: null,
          message: "Could not retrieve user profile"
        };
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
      
      toast.success(`Welcome back, ${userData.name}`);
      return {
        success: true,
        user: userData
      };
    }
    
    return {
      success: false,
      user: null,
      message: "Unknown login error"
    };
  } catch (error: any) {
    console.error("Login error:", error);
    return {
      success: false,
      user: null,
      message: error.message || "An error occurred during login"
    };
  }
};

export const logoutUser = async (): Promise<void> => {
  try {
    if (useMockAuth) {
      // Mock logout: just clear localStorage
      localStorage.removeItem('mockUser');
      toast.success("Logged out successfully");
      return;
    }
    
    // Real Supabase logout
    await supabase.auth.signOut();
    toast.success("Logged out successfully");
  } catch (error) {
    console.error("Logout error:", error);
    toast.error("Failed to log out");
  }
};

// Set up auth state listener for Supabase (used in the context provider)
export const setupAuthListener = (
  setUser: (user: User | null) => void
) => {
  if (useMockAuth) {
    return null; // No listener needed for mock auth
  }
  
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

  return authListener?.subscription;
};
