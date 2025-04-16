
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { z } from "zod";

const loginFormSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export type LoginFormValues = z.infer<typeof loginFormSchema>;

export function useLogin() {
  const { login } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (values: LoginFormValues) => {
    try {
      setIsSubmitting(true);
      setError(null);
      const success = await login(values.email, values.password);
      if (!success) {
        setError("Las credenciales ingresadas son incorrectas. Por favor, revisa los datos de ejemplo abajo.");
      }
    } catch (err) {
      setError("Ha ocurrido un error durante el inicio de sesión. Inténtalo de nuevo.");
      console.error("Login error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    isSubmitting,
    error,
    handleSubmit,
  };
}
