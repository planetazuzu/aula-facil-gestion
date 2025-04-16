
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Layout } from "@/components/layout/Layout";
import { BookOpen, Lock, Mail, AlertCircle } from "lucide-react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const formSchema = z.object({
  email: z.string().email("Correo electrónico inválido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
});

export default function Login() {
  const { login, user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
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
  }

  // Redirect if already logged in
  if (user) {
    return <Navigate to="/" replace />;
  }

  return (
    <Layout requireAuth={false}>
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="w-full max-w-md space-y-8">
          <div className="flex flex-col items-center text-center">
            <div className="mb-4 rounded-full bg-primary/10 p-2">
              <BookOpen className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-3xl font-bold">Bienvenido a Aula Fácil</h1>
            <p className="mt-2 text-muted-foreground">
              Inicia sesión para acceder a tu cuenta
            </p>
          </div>

          {error && (
            <Alert variant="destructive" className="my-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Correo electrónico</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="ejemplo@correo.com"
                          className="pl-10"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contraseña</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          type="password"
                          placeholder="••••••••"
                          className="pl-10"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end">
                <Link
                  to="/forgot-password"
                  className="text-sm text-primary hover:underline"
                >
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Iniciando sesión..." : "Iniciar sesión"}
              </Button>
            </form>
          </Form>

          <div className="text-center text-sm">
            <span className="text-muted-foreground">¿No tienes cuenta? </span>
            <Link to="/register" className="text-primary hover:underline">
              Regístrate
            </Link>
          </div>

          <div className="mt-8 border-t pt-6">
            <p className="text-center text-xs font-semibold text-muted-foreground">
              Credenciales de demostración
            </p>
            <div className="mt-2 space-y-2 text-xs">
              <div className="flex items-center justify-between rounded border p-2">
                <span className="font-medium">Administrador</span>
                <code className="rounded bg-muted px-1 py-0.5">
                  admin@example.com
                </code>
              </div>
              <div className="flex items-center justify-between rounded border p-2">
                <span className="font-medium">Profesor</span>
                <code className="rounded bg-muted px-1 py-0.5">
                  teacher@example.com
                </code>
              </div>
              <div className="flex items-center justify-between rounded border p-2">
                <span className="font-medium">Usuario</span>
                <code className="rounded bg-muted px-1 py-0.5">
                  student@example.com
                </code>
              </div>
              <p className="mt-2 text-center">
                <span>Contraseña para todos: </span>
                <code className="rounded bg-muted px-1 py-0.5">password</code>
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
