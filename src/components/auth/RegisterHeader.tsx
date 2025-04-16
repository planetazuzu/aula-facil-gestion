
import { BookOpen } from "lucide-react";

export function RegisterHeader() {
  return (
    <div className="flex flex-col items-center text-center">
      <div className="mb-4 rounded-full bg-primary/10 p-2">
        <BookOpen className="h-8 w-8 text-primary" />
      </div>
      <h1 className="text-3xl font-bold">Crea tu cuenta</h1>
      <p className="mt-2 text-muted-foreground">
        Regístrate para acceder a todos nuestros cursos
      </p>
    </div>
  );
}
