
import { User } from "@/types";
import { 
  TableBody, 
  TableCell, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { UserAuthDialog } from "./UserAuthDialog";
import { getUserRoleBadgeVariant, getUserRoleName, getNotificationPreferenceText } from "./userTableUtils";
import { UserEditDialog } from "./UserEditDialog";
import { UserDeleteDialog } from "./UserDeleteDialog";
import { useAuth } from "@/contexts/AuthContext";

interface UserTableBodyProps {
  users: User[];
  onRefresh: () => void;
}

export function UserTableBody({ users, onRefresh }: UserTableBodyProps) {
  const { hasPermission } = useAuth();
  
  return (
    <TableBody>
      {users.length > 0 ? (
        users.map((user) => (
          <TableRow key={user.id}>
            <TableCell className="font-medium">{user.name}</TableCell>
            <TableCell>{user.email}</TableCell>
            <TableCell>
              <Badge variant={getUserRoleBadgeVariant(user.role)}>
                {getUserRoleName(user.role)}
              </Badge>
            </TableCell>
            <TableCell>
              {getNotificationPreferenceText(user.notificationPreference)}
            </TableCell>
            <TableCell>{user.createdAt.toLocaleDateString()}</TableCell>
            <TableCell>
              <div className="flex items-center space-x-2">
                {hasPermission('user:update') && (
                  <UserAuthDialog userId={user.id} onSuccess={onRefresh} />
                )}
                {hasPermission('user:update') && (
                  <UserEditDialog userId={user.id} onSuccess={onRefresh} />
                )}
                {hasPermission('user:delete') && (
                  <UserDeleteDialog userId={user.id} userName={user.name} onSuccess={onRefresh} />
                )}
              </div>
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
  );
}
