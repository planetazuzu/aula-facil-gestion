
import { Layout } from "@/components/layout/Layout";
import { useEffect, useState } from "react";
import { mockService } from "@/lib/mock"; // Updated import
import { Course, CourseFilter, Enrollment, EnrollmentStatus } from "@/types";
import { Search, BookText, Clock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { CourseCard } from "@/components/courses/CourseCard";
import { CourseFilters } from "@/components/courses/CourseFilters";
import { Link } from "react-router-dom";

export default function Courses() {
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [topics, setTopics] = useState<string[]>([]);
  const [locations, setLocations] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [enrollmentLoading, setEnrollmentLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const coursesData = await mockService.getCourses();
        setCourses(coursesData);
        
        // Extraer temas y ubicaciones únicas
        const uniqueTopics = Array.from(new Set(coursesData.map(course => course.topic)));
        const uniqueLocations = Array.from(new Set(coursesData.map(course => course.location)));
        
        setTopics(uniqueTopics);
        setLocations(uniqueLocations);
        
        // Cargar inscripciones del usuario si está autenticado
        if (user) {
          const userEnrollments = await mockService.getEnrollmentsByUserId(user.id);
          setEnrollments(userEnrollments);
        }
        
        // Aplicar filtro de búsqueda inicial
        applySearchFilter(coursesData, searchTerm);
      } catch (error) {
        console.error("Error fetching courses:", error);
        toast({
          title: "Error",
          description: "No se pudieron cargar los cursos. Intenta de nuevo más tarde.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, toast]);

  // Aplicar filtro de búsqueda
  const applySearchFilter = (courseList: Course[], term: string) => {
    if (!term.trim()) {
      setFilteredCourses(courseList);
      return;
    }
    
    const filtered = courseList.filter(
      (course) =>
        course.title.toLowerCase().includes(term.toLowerCase()) ||
        course.description.toLowerCase().includes(term.toLowerCase()) ||
        course.topic.toLowerCase().includes(term.toLowerCase())
    );
    
    setFilteredCourses(filtered);
  };

  // Manejar cambio en el campo de búsqueda
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setSearchTerm(term);
    applySearchFilter(courses, term);
  };

  // Aplicar filtros avanzados
  const handleFilterChange = (filter: CourseFilter) => {
    let filtered = [...courses];
    
    // Aplicar cada filtro si está definido
    if (filter.topic) {
      filtered = filtered.filter(course => course.topic === filter.topic);
    }
    
    if (filter.location) {
      filtered = filtered.filter(course => course.location === filter.location);
    }
    
    if (filter.startDate) {
      const filterDate = new Date(filter.startDate);
      filtered = filtered.filter(course => 
        new Date(course.startDate) >= filterDate
      );
    }
    
    if (filter.status) {
      filtered = filtered.filter(course => course.status === filter.status);
    }
    
    // Aplicar también el filtro de búsqueda
    applySearchFilter(filtered, searchTerm);
  };

  // Verificar si el usuario está inscrito en un curso
  const isUserEnrolled = (courseId: string): boolean => {
    return enrollments.some(
      enrollment => 
        enrollment.courseId === courseId && 
        (enrollment.status === EnrollmentStatus.ENROLLED || 
         enrollment.status === EnrollmentStatus.WAITLISTED)
    );
  };

  // Obtener el estado de inscripción del usuario para un curso
  const getUserEnrollmentStatus = (courseId: string): EnrollmentStatus | undefined => {
    const enrollment = enrollments.find(
      e => e.courseId === courseId && 
           (e.status === EnrollmentStatus.ENROLLED || 
            e.status === EnrollmentStatus.WAITLISTED)
    );
    
    return enrollment?.status;
  };

  // Inscribir usuario en un curso o lista de espera
  const handleEnrollCourse = async (courseId: string) => {
    if (!user) {
      toast({
        title: "Inicio de sesión requerido",
        description: "Debes iniciar sesión para inscribirte en un curso.",
        variant: "destructive",
      });
      return;
    }
    
    setEnrollmentLoading(true);
    
    try {
      const result = await mockService.enrollUserInCourse(user.id, courseId);
      
      if (result.success) {
        // Actualizar la lista de inscripciones local
        const updatedEnrollments = await mockService.getEnrollmentsByUserId(user.id);
        setEnrollments(updatedEnrollments);
        
        // Actualizar la lista de cursos para reflejar cambios en capacidad
        const updatedCourses = await mockService.getCourses();
        setCourses(updatedCourses);
        applySearchFilter(updatedCourses, searchTerm);
        
        toast({
          title: "¡Operación exitosa!",
          description: result.message,
        });
        
        // Si el usuario fue añadido a la lista de espera, sugerir ir a la página
        if (result.waitlisted) {
          toast({
            title: "Lista de espera",
            description: (
              <div className="flex flex-col space-y-2">
                <span>Has sido añadido a la lista de espera. Te notificaremos cuando haya una plaza disponible.</span>
                <Link to="/waitlist" className="text-primary hover:underline font-medium">
                  Ver mi lista de espera
                </Link>
              </div>
            ),
          });
        }
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

  // Cancelar inscripción o salir de lista de espera
  const handleCancelEnrollment = async (courseId: string) => {
    if (!user) return;
    
    setEnrollmentLoading(true);
    
    try {
      const result = await mockService.cancelEnrollment(user.id, courseId);
      
      if (result.success) {
        // Actualizar la lista de inscripciones local
        const updatedEnrollments = await mockService.getEnrollmentsByUserId(user.id);
        setEnrollments(updatedEnrollments);
        
        // Actualizar la lista de cursos para reflejar cambios en capacidad
        const updatedCourses = await mockService.getCourses();
        setCourses(updatedCourses);
        applySearchFilter(updatedCourses, searchTerm);
        
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

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">Cursos disponibles</h1>
          <p className="text-muted-foreground">
            Explora nuestra amplia selección de cursos y encuentra el que mejor se adapte a tus
            intereses y necesidades.
          </p>
        </div>

        <div className="mb-6">
          <div className="flex gap-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por título, descripción o temática..."
                className="pl-10"
                value={searchTerm}
                onChange={handleSearchChange}
              />
            </div>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
            >
              {showFilters ? "Ocultar filtros" : "Mostrar filtros"}
            </Button>
          </div>

          {showFilters && (
            <CourseFilters 
              onFilter={handleFilterChange} 
              topics={topics} 
              locations={locations} 
            />
          )}
        </div>

        {user && enrollments.some(e => e.status === EnrollmentStatus.WAITLISTED) && (
          <div className="mb-6 bg-amber-50 border border-amber-200 rounded-lg p-4">
            <h2 className="text-lg font-semibold text-amber-800 mb-2 flex items-center">
              <Clock className="h-5 w-5 mr-2" />
              Tienes cursos en lista de espera
            </h2>
            <p className="text-amber-700 mb-3">
              Estás en lista de espera para algunos cursos. Te notificaremos cuando haya plazas disponibles.
            </p>
            <Button asChild variant="outline" className="bg-white border-amber-300 text-amber-700 hover:bg-amber-100">
              <Link to="/waitlist">Ver mi lista de espera</Link>
            </Button>
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="overflow-hidden">
                <div className="h-48 bg-muted animate-pulse" />
                <CardContent className="p-4">
                  <div className="h-6 bg-muted animate-pulse mb-2 rounded" />
                  <div className="h-4 bg-muted animate-pulse mb-2 rounded w-3/4" />
                  <div className="h-4 bg-muted animate-pulse mb-2 rounded w-1/2" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredCourses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course) => (
              <CourseCard
                key={course.id}
                course={course}
                isEnrolled={isUserEnrolled(course.id)}
                enrollmentStatus={getUserEnrollmentStatus(course.id)}
                onEnroll={handleEnrollCourse}
                onCancelEnrollment={handleCancelEnrollment}
                isLoading={enrollmentLoading}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <BookText className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">No se encontraron cursos</h3>
            <p className="text-muted-foreground">
              No hay cursos que coincidan con tu búsqueda. Intenta con otros términos.
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
}
