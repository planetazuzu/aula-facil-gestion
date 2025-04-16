
import { User, UserRole } from "@/types";
import { createContext, useContext, useEffect, useState } from "react";
import { useToast } from "@/components/ui/use-toast";
// Import the userService directly to avoid any mock service confusion
import { userService } from "@/lib/mock/users";
// Importamos los servicios de Supabase, pero mantenemos compatibilidad con el servicio mock
import { supabaseService } from "@/lib/supabase";

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

// Variable para controlar si usamos Supabase o el servicio mock
// En producción, esto sería true. Para desarrollo, podría ser false para usar los datos mock
const USE_SUPABASE = false; // Cambiar a true para usar Supabase

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Verificar si el usuario ya está autenticado
    const initAuth = async () => {
      if (USE_SUPABASE) {
        // Lógica para Supabase
        try {
          const { supabase } = await import('@/lib/supabase');
          const { data } = await supabase.auth.getSession();
          
          if (data.session) {
            // Recuperar el perfil completo del usuario desde la tabla user_profiles
            const { data: profileData } = await supabase
              .from('user_profiles')
              .select('*')
              .eq('id', data.session.user.id)
              .single();
              
            if (profileData) {
              // Mapear el formato de Supabase al formato de usuario de la aplicación
              const userData: User = {
                id: data.session.user.id,
                email: data.session.user.email || '',
                name: profileData.name || 'Usuario',
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
        }
      } else {
        // Lógica existente para datos mock
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          try {
            const parsedUser = JSON.parse(storedUser);
            setUser(parsedUser);
          } catch (error) {
            console.error("Error parsing stored user:", error);
            localStorage.removeItem("user");
          }
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      
      if (USE_SUPABASE) {
        // Inicio de sesión con Supabase
        const data = await supabaseService.signIn(email, password);
        
        if (data && data.user) {
          // Recuperar el perfil completo del usuario desde la tabla user_profiles
          const { supabase } = await import('@/lib/supabase');
          const { data: profileData } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('id', data.user.id)
            .single();
            
          if (profileData) {
            // Mapear el formato de Supabase al formato de usuario de la aplicación
            const userData: User = {
              id: data.user.id,
              email: data.user.email || '',
              name: profileData.name || 'Usuario',
              role: profileData.role as UserRole,
              notificationPreference: profileData.notification_preference,
              phone: profileData.phone,
              createdAt: new Date(profileData.created_at),
              updatedAt: new Date(profileData.updated_at)
            };
            setUser(userData);
            
            toast({
              title: "Inicio de sesión exitoso",
              description: `Bienvenido, ${userData.name}`,
            });
            
            return true;
          } else {
            toast({
              title: "Error de inicio de sesión",
              description: "No se encontró el perfil de usuario",
              variant: "destructive",
            });
            return false;
          }
        } else {
          toast({
            title: "Error de inicio de sesión",
            description: "Credenciales incorrectas",
            variant: "destructive",
          });
          return false;
        }
      } else {
        // Usar directamente userService en lugar de mockService
        const result = await userService.login(email, password);
        if (result.success && result.user) {
          setUser(result.user);
          localStorage.setItem("user", JSON.stringify(result.user));
          
          toast({
            title: "Inicio de sesión exitoso",
            description: `Bienvenido, ${result.user.name}`,
          });
          
          return true;
        } else {
          toast({
            title: "Error de inicio de sesión",
            description: result.message || "Credenciales incorrectas",
            variant: "destructive",
          });
          return false;
        }
      }
    } catch (error) {
      console.error("Login error:", error);
      toast({
        title: "Error",
        description: "Ha ocurrido un error durante el inicio de sesión",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    if (USE_SUPABASE) {
      // Cierre de sesión con Supabase
      await supabaseService.signOut();
    } else {
      // Lógica existente para el servicio mock
      localStorage.removeItem("user");
    }
    
    setUser(null);
    toast({
      title: "Sesión cerrada",
      description: "Has cerrado sesión correctamente",
    });
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
