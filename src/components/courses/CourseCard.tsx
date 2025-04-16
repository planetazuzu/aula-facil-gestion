import { Course, EnrollmentStatus } from "@/types";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Users, BookOpen } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

interface CourseCardProps {
  course: Course;
  isEnrolled: boolean;
  enrollmentStatus?: EnrollmentStatus;
  onEnroll: (courseId: string) => Promise<void>;
  onCancelEnrollment: (courseId: string) => Promise<void>;
  isLoading: boolean;
}

export function CourseCard({
  course,
  isEnrolled,
  enrollmentStatus,
  onEnroll,
  onCancelEnrollment,
  isLoading
}: CourseCardProps) {
  const getStatusBadge = (status: Course["status"]) => {
    switch (status) {
      case "UPCOMING":
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Próximamente</Badge>;
      case "ONGOING":
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">En curso</Badge>;
      case "COMPLETED":
        return <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">Completado</Badge>;
      case "CANCELLED":
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Cancelado</Badge>;
      default:
        return null;
    }
  };

  const renderActionButton = () => {
    if (isLoading) {
      return <Button disabled>Cargando...</Button>;
    }

    if (!isEnrolled) {
      return (
        <Button onClick={() => onEnroll(course.id)}>
          {course.enrolled < course.capacity ? "Inscribirme" : "Lista de espera"}
        </Button>
      );
    } else {
      return (
        <Button
          variant="destructive"
          onClick={() => onCancelEnrollment(course.id)}
        >
          {enrollmentStatus === EnrollmentStatus.ENROLLED ? "Cancelar" : "Salir de la lista"}
        </Button>
      );
    }
  };

  return (
    <Card className="overflow-hidden">
      <div className="aspect-video relative overflow-hidden bg-muted">
        {course.imageUrl ? (
          <img
            src={course.imageUrl}
            alt={course.title}
            className="object-cover w-full h-full transition-transform hover:scale-105"
          />
        ) : (
          <div className="flex items-center justify-center h-full bg-muted">
            <BookOpen className="h-12 w-12 text-muted-foreground" />
          </div>
        )}
        <div className="absolute top-2 right-2">
          {getStatusBadge(course.status)}
        </div>
      </div>
      
      <CardHeader className="pb-2">
        <Link to={`/courses/${course.id}`} className="hover:underline">
          <CardTitle>{course.title}</CardTitle>
        </Link>
        <CardDescription className="flex items-center">
          <MapPin className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
          {course.location}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="pb-2">
        <p className="text-sm line-clamp-2">{course.description}</p>
      </CardContent>
      
      <CardFooter className="flex flex-col space-y-3 pt-0">
        <div className="flex justify-between w-full text-sm">
          <div className="flex items-center">
            <Calendar className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
            <span>{format(new Date(course.startDate), "dd MMM yyyy", { locale: es })}</span>
          </div>
          <div className="flex items-center">
            <Users className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
            <span
              className={cn(
                course.enrolled >= course.capacity ? "text-orange-500" : ""
              )}
            >
              {course.enrolled}/{course.capacity}
            </span>
          </div>
        </div>
        
        {renderActionButton()}
      </CardFooter>
    </Card>
  );
}
