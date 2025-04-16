
import { supabase } from "@/integrations/supabase/client";
import { User, UserRole, NotificationPreference } from "@/types";
import { toast } from "sonner";

export const userService = {
  // Get all users with pagination
  getUsers: async ({ page = 1, pageSize = 10, searchTerm = "", roleFilter = "" }) => {
    try {
      let query = supabase
        .from('user_profiles')
        .select('*', { count: 'exact' });
      
      if (searchTerm) {
        query = query.or(`name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`);
      }
      
      if (roleFilter) {
        query = query.eq('role', roleFilter);
      }
      
      // Add pagination
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      
      const { data, count, error } = await query
        .range(from, to)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Transform the data to match our User type
      const users: User[] = data.map(item => ({
        id: item.id,
        email: item.email,
        name: item.name,
        role: item.role as UserRole,
        notificationPreference: item.notification_preference as NotificationPreference,
        phone: item.phone,
        createdAt: new Date(item.created_at),
        updatedAt: new Date(item.updated_at),
      }));
      
      return { 
        users, 
        totalCount: count || 0,
        totalPages: Math.ceil((count || 0) / pageSize)
      };
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Error fetching users");
      return { users: [], totalCount: 0, totalPages: 0 };
    }
  },
  
  // Get a single user by ID
  getUserById: async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      
      if (!data) return null;
      
      // Transform to User type
      const user: User = {
        id: data.id,
        email: data.email,
        name: data.name,
        role: data.role as UserRole,
        notificationPreference: data.notification_preference as NotificationPreference,
        phone: data.phone,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at),
      };
      
      return user;
    } catch (error) {
      console.error("Error fetching user:", error);
      toast.error("Error fetching user details");
      return null;
    }
  },
  
  // Create a new user
  createUser: async (userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      // First create auth user
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: userData.email,
        password: 'temporaryPassword123', // This would be replaced with a random password in a real app
        email_confirm: true,
      });
      
      if (authError) throw authError;
      
      if (!authData.user) throw new Error("Failed to create user account");
      
      // Then create user profile
      const { data, error } = await supabase
        .from('user_profiles')
        .insert({
          id: authData.user.id,
          email: userData.email,
          name: userData.name,
          role: userData.role,
          notification_preference: userData.notificationPreference,
          phone: userData.phone,
        })
        .select()
        .single();
      
      if (error) throw error;
      
      // Transform to User type
      const newUser: User = {
        id: data.id,
        email: data.email,
        name: data.name,
        role: data.role as UserRole,
        notificationPreference: data.notification_preference as NotificationPreference,
        phone: data.phone,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at),
      };
      
      return newUser;
    } catch (error) {
      console.error("Error creating user:", error);
      toast.error("Error creating user");
      throw error;
    }
  },
  
  // Update an existing user
  updateUser: async (id: string, userData: Partial<Omit<User, 'id' | 'createdAt' | 'updatedAt'>>) => {
    try {
      // Transform the data to match the database schema
      const dbData: any = {};
      
      if (userData.name) dbData.name = userData.name;
      if (userData.email) dbData.email = userData.email;
      if (userData.role) dbData.role = userData.role;
      if (userData.notificationPreference) dbData.notification_preference = userData.notificationPreference;
      if (userData.phone !== undefined) dbData.phone = userData.phone;
      
      const { data, error } = await supabase
        .from('user_profiles')
        .update(dbData)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      
      // Transform to User type
      const updatedUser: User = {
        id: data.id,
        email: data.email,
        name: data.name,
        role: data.role as UserRole,
        notificationPreference: data.notification_preference as NotificationPreference,
        phone: data.phone,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at),
      };
      
      return updatedUser;
    } catch (error) {
      console.error("Error updating user:", error);
      toast.error("Error updating user");
      throw error;
    }
  },
  
  // Delete a user
  deleteUser: async (id: string) => {
    try {
      // Delete the auth user (which should cascade to the profile through RLS)
      const { error } = await supabase.auth.admin.deleteUser(id);
      
      if (error) throw error;
      
      return true;
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error("Error deleting user");
      throw error;
    }
  },
  
  // Update user's password
  resetUserPassword: async (id: string, newPassword: string) => {
    try {
      const { error } = await supabase.auth.admin.updateUserById(
        id,
        { password: newPassword }
      );
      
      if (error) throw error;
      
      return true;
    } catch (error) {
      console.error("Error resetting password:", error);
      toast.error("Error resetting password");
      throw error;
    }
  }
};
