
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Course, CourseFilter, Enrollment, EnrollmentStatus } from "@/types";
import { mockService } from "@/lib/mock";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";

interface CourseContextType {
  courses: Course[];
  filteredCourses: Course[];
  enrollments: Enrollment[];
  topics: string[];
  locations: string[];
  loading: boolean;
  enrollmentLoading: boolean;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  isUserEnrolled: (courseId: string) => boolean;
  getUserEnrollmentStatus: (courseId: string) => EnrollmentStatus | undefined;
  handleEnrollCourse: (courseId: string) => Promise<void>;
  handleCancelEnrollment: (courseId: string) => Promise<void>;
  handleFilterChange: (filter: CourseFilter) => void;
}

const CourseContext = createContext<CourseContextType | undefined>(undefined);

export function CourseProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [topics, setTopics] = useState<string[]>([]);
  const [locations, setLocations] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [enrollmentLoading, setEnrollmentLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const coursesData = await mockService.getCourses();
        setCourses(coursesData);
        
        // Extract unique topics and locations
        const uniqueTopics = Array.from(new Set(coursesData.map(course => course.topic)));
        const uniqueLocations = Array.from(new Set(coursesData.map(course => course.location)));
        
        setTopics(uniqueTopics);
        setLocations(uniqueLocations);
        
        // Load user enrollments if authenticated
        if (user) {
          const userEnrollments = await mockService.getEnrollmentsByUserId(user.id);
          setEnrollments(userEnrollments);
        }
        
        // Apply initial search filter
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

  // Apply search filter
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

  // Handle search term change
  const handleSearchChange = (term: string) => {
    setSearchTerm(term);
    applySearchFilter(courses, term);
  };

  // Apply advanced filters
  const handleFilterChange = (filter: CourseFilter) => {
    let filtered = [...courses];
    
    // Apply each filter if defined
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
    
    // Apply search filter on top of other filters
    applySearchFilter(filtered, searchTerm);
  };

  // Check if user is enrolled in a course
  const isUserEnrolled = (courseId: string): boolean => {
    return enrollments.some(
      enrollment => 
        enrollment.courseId === courseId && 
        (enrollment.status === EnrollmentStatus.ENROLLED || 
         enrollment.status === EnrollmentStatus.WAITLISTED)
    );
  };

  // Get enrollment status for a course
  const getUserEnrollmentStatus = (courseId: string): EnrollmentStatus | undefined => {
    const enrollment = enrollments.find(
      e => e.courseId === courseId && 
           (e.status === EnrollmentStatus.ENROLLED || 
            e.status === EnrollmentStatus.WAITLISTED)
    );
    
    return enrollment?.status;
  };

  // Enroll user in course or waitlist
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
        // Update local enrollments list
        const updatedEnrollments = await mockService.getEnrollmentsByUserId(user.id);
        setEnrollments(updatedEnrollments);
        
        // Update courses list to reflect capacity changes
        const updatedCourses = await mockService.getCourses();
        setCourses(updatedCourses);
        applySearchFilter(updatedCourses, searchTerm);
        
        toast({
          title: "¡Operación exitosa!",
          description: result.message,
        });
        
        // If user was added to waitlist, suggest going to the page
        if (result.waitlisted) {
          toast({
            title: "Lista de espera",
            description: "Has sido añadido a la lista de espera. Te notificaremos cuando haya una plaza disponible.",
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

  // Cancel enrollment or remove from waitlist
  const handleCancelEnrollment = async (courseId: string) => {
    if (!user) return;
    
    setEnrollmentLoading(true);
    
    try {
      const result = await mockService.cancelEnrollment(user.id, courseId);
      
      if (result.success) {
        // Update local enrollments list
        const updatedEnrollments = await mockService.getEnrollmentsByUserId(user.id);
        setEnrollments(updatedEnrollments);
        
        // Update courses list to reflect capacity changes
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
    <CourseContext.Provider
      value={{
        courses,
        filteredCourses,
        enrollments,
        topics,
        locations,
        loading,
        enrollmentLoading,
        searchTerm,
        setSearchTerm: handleSearchChange,
        isUserEnrolled,
        getUserEnrollmentStatus,
        handleEnrollCourse,
        handleCancelEnrollment,
        handleFilterChange
      }}
    >
      {children}
    </CourseContext.Provider>
  );
}

export function useCourses() {
  const context = useContext(CourseContext);
  if (context === undefined) {
    throw new Error("useCourses must be used within a CourseProvider");
  }
  return context;
}
