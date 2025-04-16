
import { Course, CourseStatus, EnrollmentStatus } from "@/types";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CalendarDays, Clock, MapPin, Users } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { Link } from "react-router-dom";

interface CourseCardProps {
  course: Course;
  isEnrolled?: boolean;
  enrollmentStatus?: EnrollmentStatus;
  onEnroll?: (courseId: string) => void;
  onCancelEnrollment?: (courseId: string) => void;
  isLoading?: boolean;
}

export function CourseCard({
  course,
  isEnrolled = false,
  enrollmentStatus,
  onEnroll,
  onCancelEnrollment,
  isLoading = false,
}: CourseCardProps) {
  const isFull = course.enrolled >= course.capacity;
  const isUpcoming = course.status === CourseStatus.UPCOMING;
  const isOngoing = course.status === CourseStatus.ONGOING;
  const isCompleted = course.status === CourseStatus.COMPLETED;
  const isWaitlisted = enrollmentStatus === EnrollmentStatus.WAITLISTED;

  // Helper function to get status badge
  const getStatusBadge = () => {
    switch (course.status) {
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
    <Card className="overflow-hidden card-hover">
      <CardHeader className="pb-4">
        <div className="flex justify-between items-start">
          <CardTitle className="text-xl">{course.title}</CardTitle>
          {getStatusBadge()}
        </div>
        <CardDescription className="line-clamp-2">
          {course.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-4">
        <div className="space-y-3">
          <div className="flex items-center text-sm">
            <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
            <span>{course.location}</span>
          </div>
          <div className="flex items-center text-sm">
            <CalendarDays className="mr-2 h-4 w-4 text-muted-foreground" />
            <span>
              {formatDate(course.startDate)} - {formatDate(course.endDate)}
            </span>
          </div>
          <div className="flex items-center text-sm">
            <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
            <span>
              {new Date(course.endDate).getTime() - new Date(course.startDate).getTime() > 0
                ? `${Math.ceil((new Date(course.endDate).getTime() - new Date(course.startDate).getTime()) / (1000 * 60 * 60 * 24))} días`
                : "Duración por determinar"
              }
            </span>
          </div>
          <div className="flex items-center text-sm">
            <Users className="mr-2 h-4 w-4 text-muted-foreground" />
            <span>{course.enrolled}/{course.capacity} plazas cubiertas</span>
            {course.waitlist > 0 && (
              <Badge variant="outline" className="ml-2 text-xs">
                {course.waitlist} en espera
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between pt-2">
        <Button variant="outline" asChild>
          <Link to={`/courses/${course.id}`}>Ver detalles</Link>
        </Button>

        {!isEnrolled && isUpcoming && !isCompleted && (
          <Button
            onClick={() => onEnroll && onEnroll(course.id)}
            disabled={isLoading}
            variant={isFull ? "outline" : "default"}
          >
            {isFull ? "Unirse a lista de espera" : "Inscribirse"}
          </Button>
        )}

        {isEnrolled && (isUpcoming || isOngoing) && (
          <Button
            onClick={() => onCancelEnrollment && onCancelEnrollment(course.id)}
            disabled={isLoading}
            variant="destructive"
          >
            {isWaitlisted ? "Salir de lista de espera" : "Cancelar inscripción"}
          </Button>
        )}

        {isEnrolled && isCompleted && !isWaitlisted && (
          <Button variant="outline" asChild>
            <Link to={`/courses/${course.id}/rate`}>Valorar curso</Link>
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
