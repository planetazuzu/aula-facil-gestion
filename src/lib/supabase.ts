
import { createClient } from '@supabase/supabase-js';
import { toast } from 'sonner';

// Crear el cliente de Supabase usando variables de entorno o valores por defecto
// en una aplicación autohospedada, estos valores se configurarían en el servidor

// Estas URL deberían configurarse según tu instancia autohospedada de Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'http://localhost:8000';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

// Función para manejo de errores de Supabase
export const handleSupabaseError = (error: any, customMessage: string = 'Ha ocurrido un error') => {
  console.error('Supabase error:', error);
  toast.error(`${customMessage}: ${error.message || 'Error desconocido'}`);
  return null;
};

// Funciones auxiliares para interactuar con Supabase
export const supabaseService = {
  // Autenticación
  signUp: async (email: string, password: string, metadata: any = {}) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata,
        }
      });
      
      if (error) throw error;
      return data;
    } catch (error: any) {
      return handleSupabaseError(error, 'Error durante el registro');
    }
  },
  
  signIn: async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) throw error;
      return data;
    } catch (error: any) {
      return handleSupabaseError(error, 'Error durante el inicio de sesión');
    }
  },
  
  signOut: async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      return true;
    } catch (error: any) {
      return handleSupabaseError(error, 'Error al cerrar sesión');
    }
  },
  
  // Funciones de base de datos
  
  // Ejemplo: Obtener cursos
  getCourses: async () => {
    try {
      const { data, error } = await supabase
        .from('courses')
        .select('*');
      
      if (error) throw error;
      return data;
    } catch (error: any) {
      return handleSupabaseError(error, 'Error al obtener cursos');
    }
  },
  
  // Ejemplo: Obtener un curso específico
  getCourseById: async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data;
    } catch (error: any) {
      return handleSupabaseError(error, 'Error al obtener el curso');
    }
  },
  
  // Ejemplo: Crear un curso
  createCourse: async (courseData: any) => {
    try {
      const { data, error } = await supabase
        .from('courses')
        .insert(courseData)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error: any) {
      return handleSupabaseError(error, 'Error al crear el curso');
    }
  },
  
  // Ejemplo: Actualizar un curso
  updateCourse: async (id: string, courseData: any) => {
    try {
      const { data, error } = await supabase
        .from('courses')
        .update(courseData)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error: any) {
      return handleSupabaseError(error, 'Error al actualizar el curso');
    }
  },
  
  // Ejemplo: Eliminar un curso
  deleteCourse: async (id: string) => {
    try {
      const { error } = await supabase
        .from('courses')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return true;
    } catch (error: any) {
      return handleSupabaseError(error, 'Error al eliminar el curso');
    }
  },
  
  // Puedes añadir más funciones aquí para manejar otras tablas y operaciones
};

// Hook para Supabase Auth
export const useSupabaseAuth = () => {
  return { supabase };
};
