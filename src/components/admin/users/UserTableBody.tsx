
import { User, UserRole } from "@/types";
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
import { Button } from "@/components/ui/button";

interface UserTableBodyProps {
  users: User[];
}

export function UserTableBody({ users }: UserTableBodyProps) {
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
                <UserAuthDialog userId={user.id} />
                <UserEditDialog userId={user.id} />
                <UserDeleteDialog userId={user.id} userName={user.name} />
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
