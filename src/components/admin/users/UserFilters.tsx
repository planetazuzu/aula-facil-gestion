
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { UserRole } from "@/types";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue, 
} from "@/components/ui/select";

interface UserFiltersProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  roleFilter: string;
  setRoleFilter: (value: string) => void;
}

export function UserFilters({ searchTerm, setSearchTerm, roleFilter, setRoleFilter }: UserFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-6">
      <div className="relative flex-1">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar usuarios..."
          className="pl-8"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      <Select value={roleFilter} onValueChange={setRoleFilter}>
        <SelectTrigger className="w-full sm:w-[180px]">
          <SelectValue placeholder="Todos los roles" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">Todos los roles</SelectItem>
          <SelectItem value={UserRole.ADMIN}>Administrador</SelectItem>
          <SelectItem value={UserRole.TEACHER}>Profesor</SelectItem>
          <SelectItem value={UserRole.USER}>Usuario</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
