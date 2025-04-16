
import { useState, useEffect } from "react";
import { Layout } from "@/components/layout/Layout";
import { UserRole, Course, CourseStatus } from "@/types";
import { mockService, mockCourses } from "@/lib/mock";
import { useToast } from "@/components/ui/use-toast";

// Import our new components
import { CourseSearch } from "@/components/admin/courses/CourseSearch";
import { CourseListView } from "@/components/admin/courses/CourseListView";
import { CourseForm } from "@/components/admin/courses/CourseForm";

export default function CoursesAdmin() {
  const { toast } = useToast();
  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [topics, setTopics] = useState<string[]>([]);
  const [locations, setLocations] = useState<string[]>([]);

  useEffect(() => {
    fetchCourses();
  }, [toast]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const coursesData = await mockService.getCourses();
      setCourses(coursesData);
      setFilteredCourses(coursesData);
      
      // Extract unique topics and locations for filter options
      const uniqueTopics = Array.from(new Set(coursesData.map(course => course.topic)));
      const uniqueLocations = Array.from(new Set(coursesData.map(course => course.location)));
      
      setTopics(uniqueTopics);
      setLocations(uniqueLocations);
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

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    
    if (term.trim() === "") {
      setFilteredCourses(courses);
    } else {
      const filtered = courses.filter(
        (course) =>
          course.title.toLowerCase().includes(term.toLowerCase()) ||
          course.description.toLowerCase().includes(term.toLowerCase()) ||
          course.topic.toLowerCase().includes(term.toLowerCase()) ||
          course.location.toLowerCase().includes(term.toLowerCase())
      );
      setFilteredCourses(filtered);
    }
  };

  const createCourse = async (data: any) => {
    try {
      const startDate = new Date(data.startDate);
      const endDate = new Date(data.endDate);
      
      if (endDate < startDate) {
        toast({
          title: "Error",
          description: "La fecha de finalización debe ser posterior a la fecha de inicio.",
          variant: "destructive",
        });
        return;
      }

      const newCourse: Course = {
        id: `${Date.now()}`, // Generate a unique ID
        title: data.title,
        description: data.description,
        topic: data.topic,
        location: data.location,
        startDate: startDate,
        endDate: endDate,
        capacity: parseInt(data.capacity),
        enrolled: 0,
        waitlist: 0,
        status: CourseStatus.UPCOMING,
        instructor: data.instructor,
        imageUrl: "/placeholder.svg",
      };

      // Add the new course to our mock database
      await mockService.createCourse(newCourse);
      
      // Fetch updated courses
      await fetchCourses();
      
      // Close modal
      setModalOpen(false);
      
      toast({
        title: "Curso creado",
        description: "El curso ha sido creado exitosamente.",
      });
    } catch (error) {
      console.error("Error creating course:", error);
      toast({
        title: "Error",
        description: "No se pudo crear el curso. Intenta de nuevo más tarde.",
        variant: "destructive",
      });
    }
  };

  const deleteCourse = async (courseId: string) => {
    try {
      await mockService.deleteCourse(courseId);
      
      // Update the courses state
      await fetchCourses();
      
      toast({
        title: "Curso eliminado",
        description: "El curso ha sido eliminado exitosamente.",
      });
    } catch (error) {
      console.error("Error deleting course:", error);
      toast({
        title: "Error",
        description: "No se pudo eliminar el curso. Intenta de nuevo más tarde.",
        variant: "destructive",
      });
    }
  };

  return (
    <Layout requireAuth={true} allowedRoles={[UserRole.ADMIN]}>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Gestión de Cursos</h1>
            <p className="text-muted-foreground">
              Administra todos los cursos de la plataforma
            </p>
          </div>
          <Button
            className="flex items-center gap-2"
            onClick={() => setModalOpen(true)}
          >
            <Plus className="h-4 w-4" />
            Crear Curso
          </Button>
        </div>

        {/* Search component */}
        <CourseSearch
          onSearch={handleSearch}
          searchTerm={searchTerm}
        />

        {/* Course list component */}
        <CourseListView
          courses={filteredCourses}
          loading={loading}
          onCreateCourse={() => setModalOpen(true)}
          onDeleteCourse={deleteCourse}
        />

        {/* Course form component */}
        <CourseForm
          open={modalOpen}
          onOpenChange={setModalOpen}
          onSubmit={createCourse}
        />
      </div>
    </Layout>
  );
}
