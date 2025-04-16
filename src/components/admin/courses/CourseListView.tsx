
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CourseTable } from "./CourseTable";
import { EmptyCoursesView } from "./EmptyCoursesView";
import { Course } from "@/types";

interface CourseListViewProps {
  courses: Course[];
  loading: boolean;
  onCreateCourse: () => void;
  onDeleteCourse: (courseId: string) => Promise<void>;
}

export function CourseListView({ 
  courses, 
  loading, 
  onCreateCourse, 
  onDeleteCourse 
}: CourseListViewProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Listado de Cursos</CardTitle>
            <CardDescription>
              {courses.length} curso{courses.length !== 1 ? 's' : ''} disponible{courses.length !== 1 ? 's' : ''}
            </CardDescription>
          </div>
          <Button className="flex items-center gap-2" onClick={onCreateCourse}>
            <Plus className="h-4 w-4" />
            Crear Curso
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {courses.length > 0 ? (
          <CourseTable 
            courses={courses} 
            loading={loading} 
            onDelete={onDeleteCourse} 
          />
        ) : (
          <EmptyCoursesView onCreateCourse={onCreateCourse} />
        )}
      </CardContent>
    </Card>
  );
}
