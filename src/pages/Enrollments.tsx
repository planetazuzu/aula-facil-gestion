
import { useState, useEffect } from "react";
import { Layout } from "@/components/layout/Layout";
import { mockService } from "@/lib/mock";
import { useAuth } from "@/contexts/AuthContext";
import { Enrollment, EnrollmentStatus, Course } from "@/types";
import { useToast } from "@/components/ui/use-toast";
import { Calendar, Clock, X, UserCheck, BarChart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { Link } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function Enrollments() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      
      try {
        const enrollmentsData = await mockService.getEnrollmentsByUserId(user.id);
        const coursesData = await mockService.getCourses();
        
        const activeEnrollments = enrollmentsData.filter(
          (enrollment) => enrollment.status === EnrollmentStatus.ENROLLED
        );
        
        setCourses(coursesData);
        setEnrollments(activeEnrollments);
      } catch (error) {
        console.error("Error fetching enrollments:", error);
        toast({
          title: "Error",
          description: "No se pudieron cargar tus inscripciones. Intenta de nuevo más tarde.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, toast]);

  const handleCancelEnrollment = async (courseId: string) => {
    if (!user) return;
    
    try {
      const result = await mockService.cancelEnrollment(user.id, courseId);
      
      if (result.success) {
        setEnrollments(enrollments.filter(
          (enrollment) => enrollment.courseId !== courseId
        ));
        
        toast({
          title: "¡Operación exitosa!",
          description: result.message,
        });
      } else {
        toast({
          title: "Error",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error cancelling enrollment:", error);
      toast({
        title: "Error",
        description: "No se pudo cancelar tu inscripción. Intenta de nuevo más tarde.",
        variant: "destructive",
      });
    }
  };

  const getCourseDetails = (courseId: string) => {
    return courses.find((course) => course.id === courseId);
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">Mis Inscripciones</h1>
          <p className="text-muted-foreground">
            Gestiona tus cursos activos y visualiza tu progreso académico.
          </p>
        </div>

        {loading ? (
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader className="pb-4">
                  <div className="h-7 bg-muted rounded w-3/4 mb-2"></div>
                  <div className="h-5 bg-muted rounded w-1/2"></div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="h-5 bg-muted rounded w-full"></div>
                    <div className="h-5 bg-muted rounded w-3/4"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : enrollments.length > 0 ? (
          <div className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Resumen de inscripciones</CardTitle>
                <CardDescription>
                  Tienes {enrollments.length} curso{enrollments.length !== 1 ? 's' : ''} activo{enrollments.length !== 1 ? 's' : ''}.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Curso</TableHead>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Ubicación</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {enrollments.map((enrollment) => {
                      const course = getCourseDetails(enrollment.courseId);
                      if (!course) return null;
                      
                      return (
                        <TableRow key={enrollment.id}>
                          <TableCell className="font-medium">{course.title}</TableCell>
                          <TableCell>{formatDate(course.startDate)}</TableCell>
                          <TableCell>{course.location}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                              Inscrito
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                asChild
                              >
                                <Link to={`/courses/${course.id}/rate`}>
                                  <BarChart className="h-4 w-4 mr-1" />
                                  Valorar
                                </Link>
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleCancelEnrollment(course.id)}
                              >
                                <X className="h-4 w-4 mr-1" />
                                Cancelar
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {enrollments.map((enrollment) => {
                const course = getCourseDetails(enrollment.courseId);
                if (!course) return null;
                
                return (
                  <Card key={enrollment.id} className="overflow-hidden">
                    <CardHeader className="pb-4">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-xl">{course.title}</CardTitle>
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          Inscrito
                        </Badge>
                      </div>
                      <CardDescription>{course.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="pb-4">
                      <div className="space-y-4">
                        <div className="flex items-center text-sm">
                          <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">Fecha:</span>
                          <span className="ml-2">{formatDate(course.startDate)}</span>
                        </div>
                        
                        <div className="flex items-center text-sm">
                          <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">Duración:</span>
                          <span className="ml-2">
                            {Math.round((course.endDate.getTime() - course.startDate.getTime()) / (1000 * 60 * 60))} horas
                          </span>
                        </div>
                        
                        <div className="flex items-center text-sm">
                          <UserCheck className="mr-2 h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">Instructor:</span>
                          <span className="ml-2">{course.instructor || "Por asignar"}</span>
                        </div>
                        
                        <Separator />
                        
                        <div className="flex items-center justify-between text-sm pt-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            asChild
                          >
                            <Link to={`/courses/${course.id}/rate`}>
                              <BarChart className="h-4 w-4 mr-1" />
                              Valorar curso
                            </Link>
                          </Button>
                          
                          <Button 
                            variant="destructive" 
                            size="sm"
                            onClick={() => handleCancelEnrollment(course.id)}
                          >
                            <X className="h-4 w-4 mr-1" />
                            Cancelar inscripción
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        ) : (
          <Card className="border-dashed">
            <CardContent className="pt-6 text-center">
              <div className="mx-auto rounded-full bg-muted w-12 h-12 flex items-center justify-center mb-4">
                <UserCheck className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium mb-2">No tienes inscripciones activas</h3>
              <p className="text-muted-foreground mb-6">
                Cuando te inscribas a un curso, aparecerá aquí. Explora nuestros cursos disponibles y comienza tu formación.
              </p>
              <Button asChild>
                <Link to="/courses">Ver cursos disponibles</Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
}
