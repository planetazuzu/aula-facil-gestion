
import { useState, useEffect } from "react";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { mockService } from "@/lib/mock";
import { BookOpen, CalendarClock, Clock, Download, Search, Filter, SortDesc, SortAsc } from "lucide-react";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Enrollment, EnrollmentStatus, Course } from "@/types";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";

// Extend the Enrollment type locally to include course details
interface EnrollmentWithCourse extends Enrollment {
  course: Course;
}

type SortOrder = "newest" | "oldest";
type StatusFilter = "all" | EnrollmentStatus.COMPLETED | EnrollmentStatus.CANCELLED;

export default function History() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [enrollments, setEnrollments] = useState<EnrollmentWithCourse[]>([]);
  const [filteredEnrollments, setFilteredEnrollments] = useState<EnrollmentWithCourse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  
  // Filters
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [sortOrder, setSortOrder] = useState<SortOrder>("newest");
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);

  // Fetch past enrollments
  useEffect(() => {
    if (user) {
      setIsLoading(true);
      // Fetch user's enrollments
      const fetchEnrollments = async () => {
        try {
          const userEnrollments = await mockService.getEnrollmentsByUserId(user.id);
          // Filter to only show completed or cancelled courses
          const completedEnrollments = userEnrollments.filter(
            enrollment => 
              enrollment.status === EnrollmentStatus.COMPLETED || 
              enrollment.status === EnrollmentStatus.CANCELLED
          );
          
          // Fetch course details for each enrollment
          const enrollmentsWithCourses = await Promise.all(
            completedEnrollments.map(async (enrollment) => {
              const course = await mockService.getCourseById(enrollment.courseId);
              return { 
                ...enrollment, 
                course 
              } as EnrollmentWithCourse;
            })
          );
          
          setEnrollments(enrollmentsWithCourses);
          setFilteredEnrollments(enrollmentsWithCourses);
        } catch (error) {
          console.error("Error fetching enrollment history:", error);
        } finally {
          setIsLoading(false);
        }
      };
      
      fetchEnrollments();
    }
  }, [user]);

  // Apply all filters when they change
  useEffect(() => {
    let filtered = [...enrollments];
    
    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(enrollment => 
        enrollment.course.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(enrollment => enrollment.status === statusFilter);
    }
    
    // Apply date filters
    if (startDate) {
      filtered = filtered.filter(enrollment => 
        new Date(enrollment.completionDate || enrollment.enrollmentDate) >= startDate
      );
    }
    
    if (endDate) {
      const nextDay = new Date(endDate);
      nextDay.setDate(nextDay.getDate() + 1);
      filtered = filtered.filter(enrollment => 
        new Date(enrollment.completionDate || enrollment.enrollmentDate) < nextDay
      );
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      const dateA = new Date(a.completionDate || a.enrollmentDate).getTime();
      const dateB = new Date(b.completionDate || b.enrollmentDate).getTime();
      
      return sortOrder === "newest" ? dateB - dateA : dateA - dateB;
    });
    
    setFilteredEnrollments(filtered);
  }, [searchTerm, statusFilter, sortOrder, startDate, endDate, enrollments]);

  // Generate enrollment certificate (mock)
  const generateCertificate = (enrollmentId: string) => {
    console.log(`Generating certificate for enrollment: ${enrollmentId}`);
    // In a real app, this would trigger a PDF generation or certificate download
    alert("Certificado generado correctamente. La descarga comenzará en unos segundos.");
  };

  // Reset filters
  const resetFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setSortOrder("newest");
    setStartDate(undefined);
    setEndDate(undefined);
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

        <div className="mb-6 space-y-2">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre de curso..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button 
              variant="outline" 
              className="flex items-center gap-2"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-4 w-4" />
              {showFilters ? "Ocultar filtros" : "Mostrar filtros"}
            </Button>
            
            <Button 
              variant="outline"
              className="flex items-center gap-2"
              onClick={() => setSortOrder(sortOrder === "newest" ? "oldest" : "newest")}
            >
              {sortOrder === "newest" ? (
                <>
                  <SortDesc className="h-4 w-4" />
                  Más recientes
                </>
              ) : (
                <>
                  <SortAsc className="h-4 w-4" />
                  Más antiguos
                </>
              )}
            </Button>
          </div>
          
          {showFilters && (
            <Card className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Estado del curso</Label>
                  <Select
                    value={statusFilter}
                    onValueChange={(value) => setStatusFilter(value as StatusFilter)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Filtrar por estado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value={EnrollmentStatus.COMPLETED}>Completados</SelectItem>
                      <SelectItem value={EnrollmentStatus.CANCELLED}>Cancelados</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Fecha de inicio</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                      >
                        {startDate ? (
                          format(startDate, "PPP", { locale: es })
                        ) : (
                          <span className="text-muted-foreground">Seleccionar fecha</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={startDate}
                        onSelect={setStartDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                
                <div className="space-y-2">
                  <Label>Fecha de fin</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                      >
                        {endDate ? (
                          format(endDate, "PPP", { locale: es })
                        ) : (
                          <span className="text-muted-foreground">Seleccionar fecha</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={endDate}
                        onSelect={setEndDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
              
              <Button 
                variant="ghost" 
                className="mt-4" 
                onClick={resetFilters}
              >
                Resetear filtros
              </Button>
            </Card>
          )}
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
                {searchTerm || statusFilter !== "all" || startDate || endDate ? 
                  "No se encontraron cursos que coincidan con los filtros seleccionados." : 
                  "Aún no has completado ningún curso. Cuando finalices un curso, aparecerá en tu historial."}
              </p>
              {(searchTerm || statusFilter !== "all" || startDate || endDate) && (
                <Button 
                  variant="outline" 
                  className="mt-4" 
                  onClick={resetFilters}
                >
                  Quitar filtros
                </Button>
              )}
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
