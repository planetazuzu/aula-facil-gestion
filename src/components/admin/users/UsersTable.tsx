
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

interface UsersTableProps {
  users: User[];
}

export function UsersTable({ users }: UsersTableProps) {
  
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

  return (
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
  );
}
