
import { User } from "@/types";
import { 
  Table, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { UserTableBody } from "./UserTableBody";
import { UserTablePagination } from "./UserTablePagination";
import { UserExportButton } from "./UserExportButton";
import { UserCreateDialog } from "./UserCreateDialog";
import { useAuth } from "@/contexts/AuthContext";

interface UsersTableProps {
  users: User[];
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems: number;
  pageSize: number;
  onRefresh: () => void;
}

export function UsersTable({ 
  users, 
  currentPage, 
  totalPages, 
  onPageChange,
  totalItems,
  pageSize,
  onRefresh
}: UsersTableProps) {
  const { hasPermission } = useAuth();
  
  return (
    <div>
      <div className="flex justify-between mb-2">
        {hasPermission('user:create') && (
          <UserCreateDialog onSuccess={onRefresh} />
        )}
        {hasPermission('user:read') && (
          <UserExportButton users={users} />
        )}
      </div>
      
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
          <UserTableBody users={users} onRefresh={onRefresh} />
        </Table>
      </div>
      
      <UserTablePagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={onPageChange}
        totalItems={totalItems}
        pageSize={pageSize}
      />
    </div>
  );
}
