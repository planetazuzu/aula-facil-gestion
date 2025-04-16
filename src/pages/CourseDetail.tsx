
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { mockService } from "@/lib/mock";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Course, CourseStatus, Enrollment, EnrollmentStatus } from "@/types";
import { Calendar, Clock, Users, MapPin, GraduationCap, ArrowLeft, CalendarDays } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default function CourseDetail() {
  const { courseId } = useParams<{ courseId: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [userEnrollment, setUserEnrollment] = useState<Enrollment | null>(null);
  const [enrollmentLoading, setEnrollmentLoading] = useState(false);

  useEffect(() => {
    const fetchCourseDetails = async () => {
      if (!courseId) return;
      
      try {
        setLoading(true);
        const courseData = await mockService.getCourseById(courseId);
        setCourse(courseData);
        
        // If user is logged in, check their enrollment status
        if (user) {
          const enrollments = await mockService.getEnrollmentsByUserId(user.id);
          const enrollment = enrollments.find(e => e.courseId === courseId);
          setUserEnrollment(enrollment || null);
        }
      } catch (error) {
        console.error("Error fetching course details:", error);
        toast({
          title: "Error",
          description: "No se pudo cargar la información del curso.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchCourseDetails();
  }, [courseId, user, toast]);

  const handleEnrollCourse = async () => {
    if (!user || !course) {
      toast({
        title: "Inicio de sesión requerido",
        description: "Debes iniciar sesión para inscribirte en este curso.",
        variant: "destructive",
      });
      return;
    }
    
    setEnrollmentLoading(true);
    
    try {
      const result = await mockService.enrollUserInCourse(user.id, course.id);
      
      if (result.success) {
        // Update local enrollment status
        const enrollments = await mockService.getEnrollmentsByUserId(user.id);
        const enrollment = enrollments.find(e => e.courseId === course.id);
        setUserEnrollment(enrollment || null);
        
        // Refresh course data to get updated capacity
        const updatedCourse = await mockService.getCourseById(course.id);
        setCourse(updatedCourse);
        
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
      console.error("Error enrolling in course:", error);
      toast({
        title: "Error",
        description: "No se pudo procesar la inscripción. Intenta de nuevo más tarde.",
        variant: "destructive",
      });
    } finally {
      setEnrollmentLoading(false);
    }
  };

  const handleCancelEnrollment = async () => {
    if (!user || !course) return;
    
    setEnrollmentLoading(true);
    
    try {
      const result = await mockService.cancelEnrollment(user.id, course.id);
      
      if (result.success) {
        // Update local enrollment status
        setUserEnrollment(null);
        
        // Refresh course data to get updated capacity
        const updatedCourse = await mockService.getCourseById(course.id);
        setCourse(updatedCourse);
        
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
        description: "No se pudo cancelar la inscripción. Intenta de nuevo más tarde.",
        variant: "destructive",
      });
    } finally {
      setEnrollmentLoading(false);
    }
  };

  // Helper function to render status badge
  const getStatusBadge = (status: CourseStatus) => {
    switch (status) {
      case CourseStatus.UPCOMING:
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Próximamente</Badge>;
      case CourseStatus.ONGOING:
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">En curso</Badge>;
      case CourseStatus.COMPLETED:
        return <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">Completado</Badge>;
      case CourseStatus.CANCELLED:
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Cancelado</Badge>;
      default:
        return null;
    }
  };

  return (
    <Layout>
      <div className="container py-8 px-4 md:px-6">
        <Link 
          to="/courses" 
          className="flex items-center text-sm text-muted-foreground hover:text-primary mb-4"
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          Volver a cursos
        </Link>

        {loading ? (
          <div className="space-y-4">
            <div className="h-8 bg-muted animate-pulse rounded-md w-1/3" />
            <div className="h-64 bg-muted animate-pulse rounded-md" />
            <div className="h-32 bg-muted animate-pulse rounded-md" />
          </div>
        ) : !course ? (
          <Card className="text-center py-12">
            <CardContent>
              <h3 className="text-xl font-semibold mb-2">Curso no encontrado</h3>
              <p className="text-muted-foreground mb-6">El curso que estás buscando no existe o ha sido eliminado.</p>
              <Button asChild>
                <Link to="/courses">Ver todos los cursos</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold mb-2">{course.title}</h1>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>{course.location}</span>
                  <span className="mx-2">•</span>
                  <GraduationCap className="h-4 w-4" />
                  <span>{course.topic}</span>
                </div>
              </div>
              {getStatusBadge(course.status)}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Descripción del curso</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="whitespace-pre-line">{course.description}</p>
                  
                  <Separator className="my-6" />
                  
                  <h3 className="text-lg font-medium mb-4">Detalles del curso</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex items-start">
                      <Calendar className="h-5 w-5 mr-2 text-muted-foreground mt-0.5" />
                      <div>
                        <h4 className="font-medium">Fecha de inicio</h4>
                        <p className="text-muted-foreground">{formatDate(course.startDate)}</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <CalendarDays className="h-5 w-5 mr-2 text-muted-foreground mt-0.5" />
                      <div>
                        <h4 className="font-medium">Fecha de finalización</h4>
                        <p className="text-muted-foreground">{formatDate(course.endDate)}</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <Users className="h-5 w-5 mr-2 text-muted-foreground mt-0.5" />
                      <div>
                        <h4 className="font-medium">Capacidad</h4>
                        <p className="text-muted-foreground">
                          {course.enrolled}/{course.capacity} plazas ocupadas
                          {course.waitlist > 0 && ` (${course.waitlist} en lista de espera)`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <Clock className="h-5 w-5 mr-2 text-muted-foreground mt-0.5" />
                      <div>
                        <h4 className="font-medium">Duración</h4>
                        <p className="text-muted-foreground">
                          {Math.ceil((new Date(course.endDate).getTime() - new Date(course.startDate).getTime()) / (1000 * 60 * 60 * 24))} días
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Inscripción</CardTitle>
                    <CardDescription>
                      {course.status === CourseStatus.UPCOMING || course.status === CourseStatus.ONGOING ? (
                        course.enrolled < course.capacity ? 
                          `${course.capacity - course.enrolled} plazas disponibles` : 
                          "No hay plazas disponibles"
                      ) : (
                        course.status === CourseStatus.COMPLETED ? 
                          "Este curso ya ha finalizado" : 
                          "Este curso ha sido cancelado"
                      )}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {!user ? (
                      <Button asChild className="w-full">
                        <Link to="/login">Inicia sesión para inscribirte</Link>
                      </Button>
                    ) : userEnrollment ? (
                      <div className="space-y-4">
                        <div className="p-3 bg-primary/10 rounded-md">
                          <p className="text-sm mb-1">
                            <span className="font-medium">Estado:</span>{" "}
                            {userEnrollment.status === EnrollmentStatus.ENROLLED ? "Inscrito" : "En lista de espera"}
                          </p>
                          <p className="text-sm">
                            <span className="font-medium">Fecha de inscripción:</span>{" "}
                            {formatDate(userEnrollment.enrollmentDate)}
                          </p>
                        </div>
                        <Button 
                          variant="destructive" 
                          className="w-full"
                          onClick={handleCancelEnrollment}
                          disabled={enrollmentLoading || course.status !== CourseStatus.UPCOMING}
                        >
                          {userEnrollment.status === EnrollmentStatus.ENROLLED ? 
                            "Cancelar inscripción" : 
                            "Salir de la lista de espera"}
                        </Button>
                      </div>
                    ) : (
                      <Button 
                        className="w-full"
                        onClick={handleEnrollCourse}
                        disabled={
                          enrollmentLoading || 
                          (course.status !== CourseStatus.UPCOMING && course.status !== CourseStatus.ONGOING) ||
                          (course.enrolled >= course.capacity && course.waitlist >= 10) // Assuming max waitlist of 10
                        }
                      >
                        {course.enrolled < course.capacity ? 
                          "Inscribirme en este curso" : 
                          "Unirme a la lista de espera"}
                      </Button>
                    )}
                  </CardContent>
                </Card>

                {course.instructor && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Instructor</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center mr-3">
                          <GraduationCap className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{course.instructor}</p>
                          <p className="text-sm text-muted-foreground">Instructor/a</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>

            <Tabs defaultValue="detalles" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-8">
                <TabsTrigger value="detalles">Detalles del programa</TabsTrigger>
                <TabsTrigger value="ubicacion">Ubicación</TabsTrigger>
              </TabsList>
              <TabsContent value="detalles" className="p-4 border rounded-md">
                <h3 className="font-medium text-lg mb-4">Programa del curso</h3>
                <p className="text-muted-foreground mb-4">
                  El programa detallado del curso se enviará a los participantes inscritos antes del inicio del mismo.
                </p>
                <p className="text-muted-foreground">
                  Para cualquier consulta sobre el contenido del curso, puedes ponerte en contacto con nosotros a través de 
                  la sección de mensajes o llamando al número de atención al cliente.
                </p>
              </TabsContent>
              <TabsContent value="ubicacion" className="p-4 border rounded-md">
                <h3 className="font-medium text-lg mb-4">Ubicación del curso</h3>
                <div className="flex items-start mb-4">
                  <MapPin className="h-5 w-5 mr-2 text-muted-foreground mt-0.5" />
                  <p>{course.location}</p>
                </div>
                <div className="bg-muted h-[200px] rounded-md flex items-center justify-center">
                  <p className="text-muted-foreground">Mapa no disponible</p>
                </div>
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>
    </Layout>
  );
}
