
import { CourseCard } from "@/components/courses/CourseCard";
import { CourseFilters } from "@/components/courses/CourseFilters";
import { Layout } from "@/components/layout/Layout";
import { mockService } from "@/lib/mockData";
import { Course, CourseFilter, EnrollmentStatus } from "@/types";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { BookSearch } from "lucide-react";

export default function Courses() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [userEnrollments, setUserEnrollments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [topics, setTopics] = useState<string[]>([]);
  const [locations, setLocations] = useState<string[]>([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const coursesData = await mockService.getCourses();
        setCourses(coursesData);
        setFilteredCourses(coursesData);
        
        // Extract unique topics and locations for filters
        const uniqueTopics = Array.from(new Set(coursesData.map(course => course.topic)));
        const uniqueLocations = Array.from(new Set(coursesData.map(course => course.location)));
        
        setTopics(uniqueTopics);
        setLocations(uniqueLocations);
        
        // Fetch user enrollments if logged in
        if (user) {
          const enrollments = await mockService.getUserEnrollments(user.id);
          setUserEnrollments(enrollments);
        }
      } catch (error) {
        console.error("Error fetching courses:", error);
        toast({
          title: "Error",
          description: "No se pudieron cargar los cursos.",
          variant: "destructive",
        });
      }
    }
    
    fetchData();
  }, [user, toast]);

  const handleFilter = (filter: CourseFilter) => {
    const filtered = courses.filter(course => {
      // Check topic
      if (filter.topic && course.topic !== filter.topic) {
        return false;
      }
      
      // Check location
      if (filter.location && course.location !== filter.location) {
        return false;
      }
      
      // Check start date
      if (filter.startDate) {
        const courseStartDate = new Date(course.startDate);
        const filterStartDate = new Date(filter.startDate);
        
        // Set time to 00:00:00 for both dates for fair comparison
        courseStartDate.setHours(0, 0, 0, 0);
        filterStartDate.setHours(0, 0, 0, 0);
        
        if (courseStartDate < filterStartDate) {
          return false;
        }
      }
      
      // Check status
      if (filter.status && course.status !== filter.status) {
        return false;
      }
      
      return true;
    });
    
    setFilteredCourses(filtered);
  };

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
        // Refresh enrollments and courses
        const enrollments = await mockService.getUserEnrollments(user.id);
        setUserEnrollments(enrollments);
        
        const updatedCourses = await mockService.getCourses();
        setCourses(updatedCourses);
        handleFilter({}); // Reset filters
        
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

  const handleCancelEnrollment = async (courseId: string) => {
    if (!user) return;
    
    const enrollment = userEnrollments.find(
      e => e.courseId === courseId && 
      (e.status === EnrollmentStatus.ENROLLED || e.status === EnrollmentStatus.WAITLISTED)
    );
    
    if (!enrollment) {
      toast({
        title: "Error",
        description: "No se encontró la inscripción.",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      const result = await mockService.cancelEnrollment(enrollment.id);
      
      if (result.success) {
        // Refresh enrollments and courses
        const enrollments = await mockService.getUserEnrollments(user.id);
        setUserEnrollments(enrollments);
        
        const updatedCourses = await mockService.getCourses();
        setCourses(updatedCourses);
        handleFilter({}); // Reset filters
        
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
      console.error("Error cancelling enrollment:", error);
      toast({
        title: "Error",
        description: "No se pudo cancelar la inscripción.",
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
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Cursos Disponibles</h1>
          <p className="text-muted-foreground">
            Explora todos nuestros cursos y filtra por tus intereses.
          </p>
        </div>
        
        <CourseFilters 
          onFilter={handleFilter} 
          topics={topics} 
          locations={locations} 
        />
        
        {filteredCourses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course) => (
              <CourseCard
                key={course.id}
                course={course}
                isEnrolled={isEnrolled(course.id)}
                enrollmentStatus={getEnrollmentStatus(course.id)}
                onEnroll={handleEnroll}
                onCancelEnrollment={handleCancelEnrollment}
                isLoading={isLoading}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-muted rounded-lg">
            <BookSearch className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-medium mb-2">No se encontraron cursos</h3>
            <p className="text-muted-foreground">
              No hay cursos que coincidan con los criterios de búsqueda. Intenta con otros filtros.
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
}
