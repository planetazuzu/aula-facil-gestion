
import { useState } from "react";
import { Course, CourseStatus } from "@/types";
import { Edit, Trash2, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

interface CourseTableProps {
  courses: Course[];
  loading: boolean;
  onDelete: (courseId: string) => Promise<void>;
  onEdit?: (course: Course) => void;
}

export function CourseTable({ courses, loading, onDelete, onEdit }: CourseTableProps) {
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

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-16 bg-muted animate-pulse rounded-md" />
        ))}
      </div>
    );
  }

  return (
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
        {courses.map((course) => (
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
                {onEdit && (
                  <Button 
                    variant="outline" 
                    size="icon" 
                    title="Editar curso"
                    onClick={() => onEdit(course)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                )}
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
                      <AlertDialogAction onClick={() => onDelete(course.id)} className="bg-red-500 hover:bg-red-600">
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
  );
}
