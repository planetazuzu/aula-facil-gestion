
import { useState } from "react";
import { Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface CourseSearchProps {
  onSearch: (term: string) => void;
  searchTerm: string;
}

export function CourseSearch({ onSearch, searchTerm }: CourseSearchProps) {
  return (
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
              onChange={(e) => onSearch(e.target.value)}
            />
          </div>
          <Button variant="outline" className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filtros
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
