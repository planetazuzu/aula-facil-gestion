
import { BookText } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { CourseCard } from "@/components/courses/CourseCard";
import { useCourses } from "@/contexts/CourseContext";

export function CourseList() {
  const { 
    filteredCourses, 
    loading, 
    isUserEnrolled, 
    getUserEnrollmentStatus, 
    handleEnrollCourse, 
    handleCancelEnrollment, 
    enrollmentLoading 
  } = useCourses();

  if (loading) {
    return (
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
    );
  }

  if (filteredCourses.length === 0) {
    return (
      <div className="text-center py-12">
        <BookText className="mx-auto h-12 w-12 text-muted-foreground" />
        <h3 className="mt-4 text-lg font-semibold">No se encontraron cursos</h3>
        <p className="text-muted-foreground">
          No hay cursos que coincidan con tu búsqueda. Intenta con otros términos.
        </p>
      </div>
    );
  }

  return (
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
  );
}
