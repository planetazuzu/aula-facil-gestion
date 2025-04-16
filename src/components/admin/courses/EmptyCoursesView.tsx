
import { BookOpen, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyCoursesViewProps {
  onCreateCourse: () => void;
}

export function EmptyCoursesView({ onCreateCourse }: EmptyCoursesViewProps) {
  return (
    <div className="text-center py-10">
      <BookOpen className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
      <h3 className="text-lg font-medium mb-2">No se encontraron cursos</h3>
      <p className="text-muted-foreground mb-4">
        No hay cursos que coincidan con tu búsqueda. Intenta con otros términos o crea un nuevo curso.
      </p>
      <Button className="flex items-center gap-2 mx-auto" onClick={onCreateCourse}>
        <Plus className="h-4 w-4" />
        Crear Curso
      </Button>
    </div>
  );
}
