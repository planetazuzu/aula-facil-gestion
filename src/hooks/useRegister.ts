
import { useState } from "react";
import { toast } from "sonner";
import { mockUsers } from "@/lib/mock/users";
import { NotificationPreference, UserRole } from "@/types";
import { useAuth } from "@/contexts/AuthContext";
import { RegisterFormValues } from "@/components/auth/RegisterForm";

export function useRegister() {
  const { login } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (values: RegisterFormValues) => {
    try {
      setIsSubmitting(true);
      setError(null);
      
      // Check if email already exists
      const emailExists = mockUsers.some(u => u.email === values.email);
      if (emailExists) {
        setError("Este correo electrónico ya está registrado.");
        return;
      }
      
      // Generate a unique ID for the new user
      const newUserId = String(Date.now());
      
      // Add new user to mockUsers array
      mockUsers.push({
        id: newUserId,
        email: values.email,
        name: values.name,
        role: UserRole.USER, // Default role is USER
        notificationPreference: values.notificationPreference,
        phone: values.phone,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      
      toast.success("Registro exitoso", {
        description: "Tu cuenta ha sido creada correctamente. Iniciando sesión..."
      });
      
      // Login the user automatically
      const loginResult = await login(values.email, values.password);
      
      if (!loginResult) {
        // In case login fails, show a message but don't treat it as an error
        // since registration was successful
        toast.info("Cuenta creada correctamente", {
          description: "Por favor inicia sesión con tus credenciales."
        });
      }
      
    } catch (err) {
      console.error("Register error:", err);
      setError("Ha ocurrido un error durante el registro. Inténtalo de nuevo.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    isSubmitting,
    error,
    handleSubmit
  };
}
