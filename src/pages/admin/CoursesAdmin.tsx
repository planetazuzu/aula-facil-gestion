
import { useState, useEffect } from "react";
import { Layout } from "@/components/layout/Layout";
import { UserRole, Course, CourseStatus } from "@/types";
import { mockService, mockCourses } from "@/lib/mock";
import { useToast } from "@/components/ui/use-toast";
import { 
  BookOpen, 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2,
  Users
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { formatDate } from "@/lib/utils";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

export default function CoursesAdmin() {
  const { toast } = useToast();
  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [topics, setTopics] = useState<string[]>([]);
  const [locations, setLocations] = useState<string[]>([]);

  const form = useForm({
    defaultValues: {
      title: "",
      description: "",
      topic: "",
      location: "",
      startDate: "",
      endDate: "",
      capacity: 20,
      instructor: "",
    },
  });

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

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    
    if (term.trim() === "") {
      setFilteredCourses(courses);
    } else {
      const filtered = courses.filter(
        (course) =>
          course.title.toLowerCase().includes(term) ||
          course.description.toLowerCase().includes(term) ||
          course.topic.toLowerCase().includes(term) ||
          course.location.toLowerCase().includes(term)
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
      mockCourses.push(newCourse);
      
      // Fetch updated courses
      await fetchCourses();
      
      // Close modal and reset form
      setModalOpen(false);
      form.reset();
      
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
      // Find the course index in the mockCourses array
      const courseIndex = mockCourses.findIndex(course => course.id === courseId);
      
      if (courseIndex !== -1) {
        // Remove the course from the array
        mockCourses.splice(courseIndex, 1);
        
        // Update the courses state
        await fetchCourses();
        
        toast({
          title: "Curso eliminado",
          description: "El curso ha sido eliminado exitosamente.",
        });
      } else {
        toast({
          title: "Error",
          description: "No se encontró el curso seleccionado.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error deleting course:", error);
      toast({
        title: "Error",
        description: "No se pudo eliminar el curso. Intenta de nuevo más tarde.",
        variant: "destructive",
      });
    }
  };

  // Function to get status badge
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
    <Layout requireAuth={true} allowedRoles={[UserRole.ADMIN]}>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Gestión de Cursos</h1>
            <p className="text-muted-foreground">
              Administra todos los cursos de la plataforma
            </p>
          </div>
          <Dialog open={modalOpen} onOpenChange={setModalOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Crear Curso
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[525px]">
              <DialogHeader>
                <DialogTitle>Crear nuevo curso</DialogTitle>
                <DialogDescription>
                  Complete los detalles del curso y haga clic en guardar cuando termine.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={form.handleSubmit(createCourse)}>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <FormLabel htmlFor="title" className="text-right">
                      Título
                    </FormLabel>
                    <Input
                      id="title"
                      className="col-span-3"
                      {...form.register("title", { required: true })}
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <FormLabel htmlFor="topic" className="text-right">
                      Tema
                    </FormLabel>
                    <Input
                      id="topic"
                      className="col-span-3"
                      {...form.register("topic", { required: true })}
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <FormLabel htmlFor="description" className="text-right">
                      Descripción
                    </FormLabel>
                    <Textarea
                      id="description"
                      className="col-span-3"
                      {...form.register("description", { required: true })}
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <FormLabel htmlFor="location" className="text-right">
                      Ubicación
                    </FormLabel>
                    <Input
                      id="location"
                      className="col-span-3"
                      {...form.register("location", { required: true })}
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <FormLabel htmlFor="startDate" className="text-right">
                      Fecha inicio
                    </FormLabel>
                    <Input
                      id="startDate"
                      type="datetime-local"
                      className="col-span-3"
                      {...form.register("startDate", { required: true })}
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <FormLabel htmlFor="endDate" className="text-right">
                      Fecha fin
                    </FormLabel>
                    <Input
                      id="endDate"
                      type="datetime-local"
                      className="col-span-3"
                      {...form.register("endDate", { required: true })}
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <FormLabel htmlFor="capacity" className="text-right">
                      Capacidad
                    </FormLabel>
                    <Input
                      id="capacity"
                      type="number"
                      className="col-span-3"
                      {...form.register("capacity", { required: true, min: 1 })}
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <FormLabel htmlFor="instructor" className="text-right">
                      Instructor
                    </FormLabel>
                    <Input
                      id="instructor"
                      className="col-span-3"
                      {...form.register("instructor", { required: true })}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit">Guardar</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card className="mb-8">
          <CardHeader className="pb-3">
            <CardTitle>Buscador de Cursos</CardTitle>
            <CardDescription>
              Encuentra rápidamente cualquier curso por título, descripción, tema o ubicación
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar cursos..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={handleSearch}
                />
              </div>
              <Button variant="outline" className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Filtros
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Listado de Cursos</CardTitle>
            <CardDescription>
              {filteredCourses.length} curso{filteredCourses.length !== 1 ? 's' : ''} disponible{filteredCourses.length !== 1 ? 's' : ''}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-16 bg-muted animate-pulse rounded-md" />
                ))}
              </div>
            ) : filteredCourses.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[300px]">Curso</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Capacidad</TableHead>
                    <TableHead>Ubicación</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCourses.map((course) => (
                    <TableRow key={course.id}>
                      <TableCell className="font-medium">
                        <div className="flex flex-col">
                          <span>{course.title}</span>
                          <span className="text-xs text-muted-foreground">{course.topic}</span>
                        </div>
                      </TableCell>
                      <TableCell>{formatDate(course.startDate)}</TableCell>
                      <TableCell>
                        <span className={course.enrolled >= course.capacity ? "text-orange-500" : ""}>
                          {course.enrolled}/{course.capacity}
                        </span>
                        {course.waitlist > 0 && (
                          <span className="ml-2 text-xs text-muted-foreground">
                            (+{course.waitlist} en espera)
                          </span>
                        )}
                      </TableCell>
                      <TableCell>{course.location}</TableCell>
                      <TableCell>{getStatusBadge(course.status)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="icon" title="Ver inscritos">
                            <Users className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="icon" title="Editar curso">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" size="icon" title="Eliminar curso">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Esta acción no se puede deshacer. Esto eliminará permanentemente el curso "{course.title}" y eliminará los datos de sus inscripciones.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction onClick={() => deleteCourse(course.id)} className="bg-red-500 hover:bg-red-600">
                                  Eliminar
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-10">
                <BookOpen className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No se encontraron cursos</h3>
                <p className="text-muted-foreground mb-4">
                  No hay cursos que coincidan con tu búsqueda. Intenta con otros términos o crea un nuevo curso.
                </p>
                <Button className="flex items-center gap-2 mx-auto" onClick={() => setModalOpen(true)}>
                  <Plus className="h-4 w-4" />
                  Crear Curso
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
