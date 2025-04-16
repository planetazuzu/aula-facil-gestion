
import { Layout } from "@/components/layout/Layout";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export default function Index() {
  const { user } = useAuth();

  return (
    <Layout requireAuth={false}>
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none mb-4">
          Bienvenido a FORMACION EMPRESA
        </h1>
        <p className="max-w-[600px] text-muted-foreground md:text-xl mx-auto mb-6">
          Plataforma de gestión de formación para empresas. Desarrolla el potencial de tu equipo.
        </p>
        
        <div className="flex flex-col md:flex-row justify-center gap-4">
          {user ? (
            <>
              <Link to="/courses">
                <Button size="lg" className="w-full md:w-auto">Explorar cursos</Button>
              </Link>
              <Link to="/enrollments">
                <Button size="lg" variant="outline" className="w-full md:w-auto">Mis inscripciones</Button>
              </Link>
            </>
          ) : (
            <>
              <Link to="/login">
                <Button size="lg" className="w-full md:w-auto">Iniciar sesión</Button>
              </Link>
              <Link to="/register">
                <Button size="lg" variant="outline" className="w-full md:w-auto">
                  Registrarse ahora
                </Button>
              </Link>
            </>
          )}
        </div>
        
        {!user && (
          <div className="mt-8 p-4 bg-muted rounded-lg max-w-md mx-auto">
            <h2 className="font-medium mb-2">¿Nuevo en la plataforma?</h2>
            <p className="text-sm mb-4">Regístrate para acceder a todos los cursos y comenzar tu formación profesional.</p>
            <Link to="/register">
              <Button variant="secondary" className="w-full">Crear cuenta gratis</Button>
            </Link>
          </div>
        )}
      </div>
    </Layout>
  );
}
