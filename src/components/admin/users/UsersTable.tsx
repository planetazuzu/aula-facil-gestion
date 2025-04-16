
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
  return (
    <div>
      <div className="flex justify-between mb-2">
        <UserCreateDialog />
        <UserExportButton users={users} />
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
          <UserTableBody users={users} />
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
