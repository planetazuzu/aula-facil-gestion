import { User, UserRole } from "@/types";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { UserAuthDialog } from "./UserAuthDialog";
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious,
  PaginationEllipsis
} from "@/components/ui/pagination";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";

interface UsersTableProps {
  users: User[];
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems: number;
  pageSize: number;
}

export function UsersTable({ 
  users, 
  currentPage, 
  totalPages, 
  onPageChange,
  totalItems,
  pageSize
}: UsersTableProps) {
  
  const getBadgeVariant = (role: UserRole) => {
    switch (role) {
      case UserRole.ADMIN:
        return "destructive";
      case UserRole.TEACHER:
        return "default";
      case UserRole.USER:
        return "secondary";
      default:
        return "outline";
    }
  };

  const getPageNumbers = () => {
    const pages = [];
    const maxPagesToShow = 5;
    
    if (totalPages <= maxPagesToShow) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);
      
      let startPage = Math.max(2, currentPage - 1);
      let endPage = Math.min(currentPage + 1, totalPages - 1);
      
      if (startPage > 2) pages.push(null);
      
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
      
      if (endPage < totalPages - 1) pages.push(null);
      
      pages.push(totalPages);
    }
    
    return pages;
  };

  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  return (
    <div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Rol</TableHead>
              <TableHead>Preferencia Notificación</TableHead>
              <TableHead>Fecha Registro</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.length > 0 ? (
              users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Badge variant={getBadgeVariant(user.role)}>
                      {user.role === UserRole.ADMIN ? "Administrador" : 
                       user.role === UserRole.TEACHER ? "Profesor" : "Usuario"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {user.notificationPreference === "EMAIL" ? "Email" : 
                     user.notificationPreference === "WHATSAPP" ? "WhatsApp" : 
                     user.notificationPreference === "BOTH" ? "Ambos" : "Ninguno"}
                  </TableCell>
                  <TableCell>{user.createdAt.toLocaleDateString()}</TableCell>
                  <TableCell>
                    <UserAuthDialog userId={user.id} />
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  No se encontraron usuarios.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      
      <div className="flex flex-col sm:flex-row justify-between items-center mt-4 gap-4">
        <div className="text-sm text-muted-foreground">
          Mostrando {users.length > 0 ? startItem : 0} a {endItem} de {totalItems} usuarios
        </div>
        
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationLink 
                onClick={() => onPageChange(1)} 
                className={currentPage === 1 ? "opacity-50 pointer-events-none" : "cursor-pointer"}
              >
                <ChevronsLeft className="h-4 w-4 mr-1" />
                Inicio
              </PaginationLink>
            </PaginationItem>
            
            <PaginationItem>
              <PaginationPrevious 
                onClick={() => onPageChange(currentPage - 1)} 
                className={currentPage === 1 ? "opacity-50 pointer-events-none" : "cursor-pointer"}
              />
            </PaginationItem>
            
            {getPageNumbers().map((page, i) => (
              page === null ? (
                <PaginationItem key={`ellipsis-${i}`}>
                  <PaginationEllipsis />
                </PaginationItem>
              ) : (
                <PaginationItem key={`page-${page}`}>
                  <PaginationLink 
                    isActive={page === currentPage}
                    onClick={() => onPageChange(page as number)}
                    className="cursor-pointer"
                  >
                    {page}
                  </PaginationLink>
                </PaginationItem>
              )
            ))}
            
            <PaginationItem>
              <PaginationNext 
                onClick={() => onPageChange(currentPage + 1)} 
                className={currentPage === totalPages ? "opacity-50 pointer-events-none" : "cursor-pointer"}
              />
            </PaginationItem>
            
            <PaginationItem>
              <PaginationLink 
                onClick={() => onPageChange(totalPages)} 
                className={currentPage === totalPages ? "opacity-50 pointer-events-none" : "cursor-pointer"}
              >
                Final
                <ChevronsRight className="h-4 w-4 ml-1" />
              </PaginationLink>
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  );
}
