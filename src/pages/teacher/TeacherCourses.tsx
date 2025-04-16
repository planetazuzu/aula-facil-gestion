
import { useEffect, useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { mockService } from "@/lib/mock";
import { Course } from "@/types";
import { CourseTable } from "@/components/admin/courses/CourseTable";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { BookOpen } from "lucide-react";

export default function TeacherCourses() {
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchTeacherCourses = async () => {
      try {
        // In a real app, this would filter courses by instructor ID
        // For now, we're using the mock service to get all courses and filtering them
        const allCourses = await mockService.getCourses();
        const teacherCourses = allCourses.filter(
          course => course.instructor && course.instructor === user?.name
        );
        setCourses(teacherCourses);
      } catch (error) {
        console.error("Error fetching teacher courses:", error);
        toast({
          title: "Error",
          description: "No se pudieron cargar tus cursos. Intenta de nuevo más tarde.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchTeacherCourses();
    }
  }, [user, toast]);

  const handleDeleteCourse = async (courseId: string) => {
    try {
      await mockService.deleteCourse(courseId);
      setCourses(courses.filter(course => course.id !== courseId));
      toast({
        title: "Curso eliminado",
        description: "El curso se ha eliminado correctamente.",
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
    <Layout allowedRoles={["TEACHER", "ADMIN"]}>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Mis Cursos</h1>
        
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Cursos que imparto</CardTitle>
            <CardDescription>
              Gestiona los cursos que tienes asignados como instructor
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-16 bg-muted animate-pulse rounded-md" />
                ))}
              </div>
            ) : courses.length > 0 ? (
              <CourseTable 
                courses={courses} 
                loading={loading} 
                onDelete={handleDeleteCourse} 
              />
            ) : (
              <div className="text-center py-12">
                <BookOpen className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-semibold">No tienes cursos asignados</h3>
                <p className="text-muted-foreground">
                  Actualmente no tienes ningún curso asignado como instructor.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
