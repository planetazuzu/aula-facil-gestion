import { useState, useEffect } from "react";
import { Layout } from "@/components/layout/Layout";
import { mockService } from "@/lib/mockData";
import { useAuth } from "@/contexts/AuthContext";
import { Enrollment, EnrollmentStatus, Course } from "@/types";
import { useToast } from "@/components/ui/use-toast";
import { Clock, AlertCircle, CheckCircle2, Calendar, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { Link } from "react-router-dom";

export default function WaitingList() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [waitlistEnrollments, setWaitlistEnrollments] = useState<Enrollment[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      
      try {
        const enrollmentsData = await mockService.getEnrollmentsByUserId(user.id);
        const coursesData = await mockService.getCourses();
        
        const waitlistData = enrollmentsData.filter(
          (enrollment) => enrollment.status === EnrollmentStatus.WAITLISTED
        );
        
        setCourses(coursesData);
        setWaitlistEnrollments(waitlistData);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast({
          title: "Error",
          description: "No se pudieron cargar tus datos. Intenta de nuevo más tarde.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, toast]);

  const handleCancelWaitlist = async (courseId: string) => {
    if (!user) return;
    
    try {
      const result = await mockService.cancelEnrollment(user.id, courseId);
      
      if (result.success) {
        setWaitlistEnrollments(waitlistEnrollments.filter(
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
      console.error("Error cancelling waitlist:", error);
      toast({
        title: "Error",
        description: "No se pudo cancelar tu lugar en la lista de espera. Intenta de nuevo más tarde.",
        variant: "destructive",
      });
    }
  };

  const getCourseDetails = (courseId: string) => {
    return courses.find((course) => course.id === courseId);
  };

  const getWaitlistPosition = (enrollment: Enrollment) => {
    const course = getCourseDetails(enrollment.courseId);
    if (!course) return "Desconocida";
    
    const courseWaitlist = waitlistEnrollments.filter(
      (e) => e.courseId === enrollment.courseId
    );
    
    const sortedWaitlist = courseWaitlist.sort(
      (a, b) => a.enrollmentDate.getTime() - b.enrollmentDate.getTime()
    );
    
    const position = sortedWaitlist.findIndex(
      (e) => e.id === enrollment.id
    );
    
    return position !== -1 ? position + 1 : "Desconocida";
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">Mi lista de espera</h1>
          <p className="text-muted-foreground">
            Gestiona los cursos en los que estás en lista de espera.
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-6">
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
                    <div className="h-5 bg-muted rounded w-1/2"></div>
                  </div>
                </CardContent>
                <CardFooter>
                  <div className="h-9 bg-muted rounded w-1/3"></div>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : waitlistEnrollments.length > 0 ? (
          <div className="grid grid-cols-1 gap-6">
            {waitlistEnrollments.map((enrollment) => {
              const course = getCourseDetails(enrollment.courseId);
              if (!course) return null;
              
              const waitlistPosition = getWaitlistPosition(enrollment);
              
              return (
                <Card key={enrollment.id} className="overflow-hidden">
                  <CardHeader className="pb-4">
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-xl">{course.title}</CardTitle>
                      <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                        Lista de espera
                      </Badge>
                    </div>
                    <CardDescription>{course.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="pb-4">
                    <div className="space-y-4">
                      <div className="flex items-center text-sm">
                        <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">Inscrito el:</span>
                        <span className="ml-2">{formatDate(enrollment.enrollmentDate)}</span>
                      </div>
                      
                      <div className="flex items-center text-sm">
                        <AlertCircle className="mr-2 h-4 w-4 text-amber-500" />
                        <span className="font-medium">Posición en la lista:</span>
                        <span className="ml-2">{waitlistPosition} de {course.waitlist}</span>
                      </div>
                      
                      <div className="flex items-center text-sm">
                        <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">Fecha prevista del curso:</span>
                        <span className="ml-2">{formatDate(course.startDate)}</span>
                      </div>
                      
                      <div className="flex items-center text-sm">
                        <Users className="mr-2 h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">Capacidad:</span>
                        <span className="ml-2">{course.enrolled}/{course.capacity} (Completo)</span>
                      </div>
                      
                      <Separator />
                      
                      <div className="flex items-center text-sm">
                        <CheckCircle2 className="mr-2 h-4 w-4 text-green-500" />
                        <span>
                          Se te notificará automáticamente cuando se libere una plaza. También puedes cancelar tu inscripción en la lista de espera en cualquier momento.
                        </span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between pt-2">
                    <Button 
                      variant="destructive" 
                      onClick={() => handleCancelWaitlist(course.id)}
                    >
                      Cancelar lista de espera
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card className="border-dashed">
            <CardContent className="pt-6 text-center">
              <div className="mx-auto rounded-full bg-muted w-12 h-12 flex items-center justify-center mb-4">
                <Clock className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium mb-2">No estás en lista de espera para ningún curso</h3>
              <p className="text-muted-foreground mb-6">
                Cuando te inscribas a un curso lleno, aparecerá aquí. Se te notificará automáticamente cuando haya una plaza disponible.
              </p>
              <Button variant="outline" asChild>
                <Link to="/courses">Ver cursos disponibles</Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
}
