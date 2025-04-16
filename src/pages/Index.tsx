
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/layout/Layout";
import { CourseCard } from "@/components/courses/CourseCard";
import { course  } from "date-fns/locale";
import { useEffect, useState } from "react";
import { Course, CourseStatus, Enrollment, EnrollmentStatus } from "@/types";
import { useToast } from "@/components/ui/use-toast";
import { mockService } from "@/lib/mockData";
import { BookCheck, BookOpen, Star, Users } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";

export default function Index() {
  const { user, isAdmin, isTeacher } = useAuth();
  const { toast } = useToast();
  const [upcomingCourses, setUpcomingCourses] = useState<Course[]>([]);
  const [popularCourses, setPopularCourses] = useState<Course[]>([]);
  const [userEnrollments, setUserEnrollments] = useState<Enrollment[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const courses = await mockService.getCourses();
        
        // Get upcoming courses
        const upcoming = courses
          .filter(course => course.status === CourseStatus.UPCOMING)
          .slice(0, 3);
        setUpcomingCourses(upcoming);
        
        // Get most popular courses (highest enrollment percentage)
        const popular = [...courses]
          .sort((a, b) => (b.enrolled / b.capacity) - (a.enrolled / a.capacity))
          .slice(0, 3);
        setPopularCourses(popular);
        
        // Fetch user enrollments if logged in
        if (user) {
          const enrollments = await mockService.getUserEnrollments(user.id);
          setUserEnrollments(enrollments);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        toast({
          title: "Error",
          description: "No se pudieron cargar los cursos.",
          variant: "destructive",
        });
      }
    }
    
    fetchData();
  }, [user, toast]);

  const handleEnroll = async (courseId: string) => {
    if (!user) {
      toast({
        title: "Inicio de sesión requerido",
        description: "Debes iniciar sesión para inscribirte a un curso.",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      const result = await mockService.enrollInCourse(user.id, courseId);
      
      if (result.success) {
        // Refresh user enrollments
        const enrollments = await mockService.getUserEnrollments(user.id);
        setUserEnrollments(enrollments);
        
        // Refresh courses
        const courses = await mockService.getCourses();
        const upcoming = courses
          .filter(course => course.status === CourseStatus.UPCOMING)
          .slice(0, 3);
        setUpcomingCourses(upcoming);
        
        const popular = [...courses]
          .sort((a, b) => (b.enrolled / b.capacity) - (a.enrolled / a.capacity))
          .slice(0, 3);
        setPopularCourses(popular);
        
        toast({
          title: "Éxito",
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
      console.error("Error enrolling:", error);
      toast({
        title: "Error",
        description: "No se pudo completar la inscripción.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const isEnrolled = (courseId: string) => {
    return userEnrollments.some(
      enrollment => enrollment.courseId === courseId && 
      (enrollment.status === EnrollmentStatus.ENROLLED || enrollment.status === EnrollmentStatus.WAITLISTED)
    );
  };

  const getEnrollmentStatus = (courseId: string) => {
    const enrollment = userEnrollments.find(
      enrollment => enrollment.courseId === courseId
    );
    return enrollment?.status;
  };

  return (
    <Layout>
      <section className="mb-10">
        <div className="rounded-lg bg-gradient-to-r from-teal-600 to-blue-700 p-8 text-white">
          <div className="max-w-3xl">
            <h1 className="text-4xl font-bold mb-4">
              {isAdmin ? "Panel de Administración de Cursos" : 
               isTeacher ? "Portal de Profesores" : 
               "Bienvenido a Aula Fácil"}
            </h1>
            <p className="text-xl mb-6">
              {isAdmin ? "Gestiona cursos, usuarios, y monitorea el progreso del sistema." : 
               isTeacher ? "Administra tus cursos y comunícate con tus alumnos." : 
               "Descubre nuevos cursos y mejora tus habilidades con nuestra plataforma educativa."}
            </p>
            <div className="flex flex-wrap gap-4">
              {isAdmin && (
                <>
                  <Button asChild size="lg" variant="secondary">
                    <Link to="/admin/courses">Gestionar Cursos</Link>
                  </Button>
                  <Button asChild size="lg" variant="outline" className="bg-white/10 hover:bg-white/20 text-white">
                    <Link to="/admin/users">Gestionar Usuarios</Link>
                  </Button>
                </>
              )}
              
              {isTeacher && (
                <>
                  <Button asChild size="lg" variant="secondary">
                    <Link to="/teacher/courses">Mis Cursos</Link>
                  </Button>
                  <Button asChild size="lg" variant="outline" className="bg-white/10 hover:bg-white/20 text-white">
                    <Link to="/messages">Mensajes</Link>
                  </Button>
                </>
              )}
              
              {!isAdmin && !isTeacher && (
                <>
                  <Button asChild size="lg" variant="secondary">
                    <Link to="/courses">Explorar Cursos</Link>
                  </Button>
                  {user && (
                    <Button asChild size="lg" variant="outline" className="bg-white/10 hover:bg-white/20 text-white">
                      <Link to="/enrollments">Mis Inscripciones</Link>
                    </Button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </section>
      
      {(isAdmin || isTeacher) && (
        <section className="mb-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow p-6 border">
              <div className="flex items-center">
                <div className="rounded-full bg-teal-100 p-3 mr-4">
                  <BookOpen className="h-6 w-6 text-teal-600" />
                </div>
                <div>
                  <h3 className="text-lg font-medium">Cursos Activos</h3>
                  <p className="text-3xl font-bold">
                    {popularCourses.filter(c => c.status === CourseStatus.ONGOING).length}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6 border">
              <div className="flex items-center">
                <div className="rounded-full bg-blue-100 p-3 mr-4">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-medium">Inscripciones</h3>
                  <p className="text-3xl font-bold">
                    {upcomingCourses.reduce((acc, course) => acc + course.enrolled, 0)}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6 border">
              <div className="flex items-center">
                <div className="rounded-full bg-amber-100 p-3 mr-4">
                  <Star className="h-6 w-6 text-amber-600" />
                </div>
                <div>
                  <h3 className="text-lg font-medium">Próximos Cursos</h3>
                  <p className="text-3xl font-bold">
                    {upcomingCourses.length}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}
      
      <section className="mb-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Próximos Cursos</h2>
          <Button asChild variant="outline">
            <Link to="/courses">Ver todos</Link>
          </Button>
        </div>
        
        {upcomingCourses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {upcomingCourses.map((course) => (
              <CourseCard
                key={course.id}
                course={course}
                isEnrolled={isEnrolled(course.id)}
                enrollmentStatus={getEnrollmentStatus(course.id)}
                onEnroll={handleEnroll}
                isLoading={isLoading}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-10 bg-muted rounded-lg">
            <BookCheck className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-medium mb-2">No hay cursos próximos</h3>
            <p className="text-muted-foreground">
              Actualmente no hay cursos programados para el futuro.
            </p>
          </div>
        )}
      </section>
      
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Cursos Destacados</h2>
          <Button asChild variant="outline">
            <Link to="/courses">Ver todos</Link>
          </Button>
        </div>
        
        {popularCourses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {popularCourses.map((course) => (
              <CourseCard
                key={course.id}
                course={course}
                isEnrolled={isEnrolled(course.id)}
                enrollmentStatus={getEnrollmentStatus(course.id)}
                onEnroll={handleEnroll}
                isLoading={isLoading}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-10 bg-muted rounded-lg">
            <BookCheck className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-medium mb-2">No hay cursos destacados</h3>
            <p className="text-muted-foreground">
              Actualmente no hay cursos destacados.
            </p>
          </div>
        )}
      </section>
    </Layout>
  );
}
