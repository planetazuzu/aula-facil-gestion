
import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { mockService } from "@/lib/mock";
import { BookOpen, CalendarClock, Clock, Download, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Enrollment, EnrollmentStatus } from "@/types";

export default function History() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Simulate loading past enrollments
  useState(() => {
    if (user) {
      setIsLoading(true);
      // Fetch user's enrollments
      const fetchEnrollments = async () => {
        try {
          const userEnrollments = await mockService.getEnrollmentsByUserId(user.id);
          // Filter to only show completed courses
          const completedEnrollments = userEnrollments.filter(
            enrollment => 
              enrollment.status === EnrollmentStatus.COMPLETED || 
              enrollment.status === EnrollmentStatus.CANCELED
          );
          setEnrollments(completedEnrollments);
        } catch (error) {
          console.error("Error fetching enrollment history:", error);
        } finally {
          setIsLoading(false);
        }
      };
      
      fetchEnrollments();
    }
  }, [user]);

  // Filter enrollments based on search term
  const filteredEnrollments = searchTerm
    ? enrollments.filter(enrollment => 
        enrollment.course.title.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : enrollments;

  // Generate enrollment certificate (mock)
  const generateCertificate = (enrollmentId: string) => {
    console.log(`Generating certificate for enrollment: ${enrollmentId}`);
    // In a real app, this would trigger a PDF generation or certificate download
    alert("Certificado generado correctamente. La descarga comenzará en unos segundos.");
  };

  return (
    <Layout>
      <div className="container py-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Clock className="mr-2 h-6 w-6 text-primary" />
            <h1 className="text-3xl font-bold">Historial de Cursos</h1>
          </div>
        </div>

        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nombre de curso..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center my-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : filteredEnrollments.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-xl font-medium mb-2">No hay cursos completados</h3>
              <p className="text-muted-foreground text-center max-w-md">
                Aún no has completado ningún curso. Cuando finalices un curso, aparecerá en tu historial.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {filteredEnrollments.map((enrollment) => (
              <Card key={enrollment.id}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{enrollment.course.title}</CardTitle>
                      <CardDescription className="mt-1">
                        {enrollment.course.description.substring(0, 120)}...
                      </CardDescription>
                    </div>
                    <Badge variant={enrollment.status === EnrollmentStatus.COMPLETED ? "default" : "destructive"}>
                      {enrollment.status === EnrollmentStatus.COMPLETED ? "Completado" : "Cancelado"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1">
                      <div className="text-sm font-medium">Fecha de inscripción</div>
                      <div className="flex items-center text-sm">
                        <CalendarClock className="mr-1 h-4 w-4 text-muted-foreground" />
                        {format(new Date(enrollment.enrollmentDate), "PPP", { locale: es })}
                      </div>
                    </div>
                    
                    <div className="space-y-1">
                      <div className="text-sm font-medium">Fecha de finalización</div>
                      <div className="flex items-center text-sm">
                        <CalendarClock className="mr-1 h-4 w-4 text-muted-foreground" />
                        {enrollment.completionDate ? 
                          format(new Date(enrollment.completionDate), "PPP", { locale: es }) : 
                          "No disponible"}
                      </div>
                    </div>
                  </div>
                  
                  <Separator className="my-4" />
                  
                  {enrollment.status === EnrollmentStatus.COMPLETED && (
                    <div className="flex justify-end">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex items-center"
                        onClick={() => generateCertificate(enrollment.id)}
                      >
                        <Download className="mr-2 h-4 w-4" />
                        Descargar certificado
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
