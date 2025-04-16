
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, BookOpen, CalendarDays, Award } from "lucide-react";
import { userService } from "@/lib/mock/users"; // Updated direct import
import { useAuth } from "@/contexts/AuthContext";
import { UserRole } from "@/types";

export default function Dashboard() {
  const { user } = useAuth();
  const userCount = userService.getTotalUserCount();
  const courseCount = 0; // No hay cursos en el sistema actualmente

  return (
    <Layout requireAuth={true} allowedRoles={[UserRole.ADMIN]}>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Panel de Control</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Usuarios Totales</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userCount}</div>
              <p className="text-xs text-muted-foreground">Usuarios registrados en la plataforma</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Cursos Activos</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{courseCount}</div>
              <p className="text-xs text-muted-foreground">Cursos disponibles actualmente</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Sesiones Mensuales</CardTitle>
              <CalendarDays className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">Sesiones formativas este mes</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Certificaciones</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">Certificaciones emitidas</p>
            </CardContent>
          </Card>
        </div>
        
        <div className="mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Estado del Sistema</CardTitle>
              <CardDescription>Información general de la plataforma</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium">Base de datos:</p>
                    <p className="text-sm text-muted-foreground">Mock Data (Sin conexión)</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Usuarios activos:</p>
                    <p className="text-sm text-muted-foreground">1 (Administrador actual)</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Estado de cursos:</p>
                    <p className="text-sm text-muted-foreground">No hay cursos en el sistema</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Estado del sistema:</p>
                    <p className="text-sm text-green-500">Operativo</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
