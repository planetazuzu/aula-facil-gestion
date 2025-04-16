
import { Layout } from "@/components/layout/Layout";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { es } from "date-fns/locale";
import { Link } from "react-router-dom";
import { Book, GraduationCap, Users } from "lucide-react";

export default function Index() {
  const { user } = useAuth();
  const { toast } = useToast();

  const handleQuickStart = () => {
    toast({
      title: "Información",
      description: "Funcionalidad en desarrollo. Esta función estará disponible próximamente.",
    });
  };

  return (
    <Layout requireAuth={false}>
      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <section className="py-12 md:py-24">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                    Bienvenido a Aula Fácil
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl">
                    Plataforma de gestión de cursos y formación. Encuentra los mejores cursos y administra tu aprendizaje.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  {user ? (
                    <Link to="/courses">
                      <Button size="lg">Explorar cursos</Button>
                    </Link>
                  ) : (
                    <>
                      <Link to="/login">
                        <Button size="lg">Iniciar sesión</Button>
                      </Link>
                      <Link to="/register">
                        <Button size="lg" variant="outline">
                          Registrarse
                        </Button>
                      </Link>
                    </>
                  )}
                </div>
              </div>
              <div className="hidden md:block">
                <img
                  src="/placeholder.svg"
                  width={550}
                  height={310}
                  alt="Hero"
                  className="aspect-video overflow-hidden rounded-xl object-cover"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-12 md:py-24 bg-muted/50 rounded-lg">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">
                  Características principales
                </h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Descubre todas las funcionalidades que nuestra plataforma tiene para ofrecer.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-3 lg:gap-12">
              <div className="grid gap-1 text-center">
                <div className="flex justify-center mb-4">
                  <Book className="h-12 w-12 text-primary" />
                </div>
                <h3 className="text-lg font-bold">Amplio catálogo de cursos</h3>
                <p className="text-sm text-muted-foreground">
                  Encuentra cursos de diversas temáticas y niveles para expandir tus conocimientos.
                </p>
              </div>
              <div className="grid gap-1 text-center">
                <div className="flex justify-center mb-4">
                  <GraduationCap className="h-12 w-12 text-primary" />
                </div>
                <h3 className="text-lg font-bold">Seguimiento de aprendizaje</h3>
                <p className="text-sm text-muted-foreground">
                  Gestiona tu progreso, inscripciones y mantén un historial de tus cursos completados.
                </p>
              </div>
              <div className="grid gap-1 text-center">
                <div className="flex justify-center mb-4">
                  <Users className="h-12 w-12 text-primary" />
                </div>
                <h3 className="text-lg font-bold">Comunicación directa</h3>
                <p className="text-sm text-muted-foreground">
                  Contacta directamente con profesores y administradores para resolver tus dudas.
                </p>
              </div>
            </div>
            <div className="flex justify-center">
              <Button onClick={handleQuickStart}>Comenzar ahora</Button>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
}
