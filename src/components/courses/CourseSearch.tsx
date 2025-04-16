
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useCourses } from "@/contexts/CourseContext";
import { useState } from "react";

interface CourseSearchProps {
  onToggleFilters: () => void;
  showFilters: boolean;
}

export function CourseSearch({ onToggleFilters, showFilters }: CourseSearchProps) {
  const { searchTerm, setSearchTerm } = useCourses();
  const [inputValue, setInputValue] = useState(searchTerm);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setInputValue(term);
    setSearchTerm(term);
  };

  return (
    <div className="flex gap-2 mb-4">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por título, descripción o temática..."
          className="pl-10"
          value={inputValue}
          onChange={handleSearchChange}
        />
      </div>
      <Button
        variant="outline"
        onClick={onToggleFilters}
      >
        {showFilters ? "Ocultar filtros" : "Mostrar filtros"}
      </Button>
    </div>
  );
}
