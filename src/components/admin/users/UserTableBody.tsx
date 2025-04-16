
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

interface UserTableBodyProps {
  users: User[];
  onRefresh: () => void;
}

export function UserTableBody({ users, onRefresh }: UserTableBodyProps) {
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
                <UserAuthDialog userId={user.id} onSuccess={onRefresh} />
                <UserEditDialog userId={user.id} onSuccess={onRefresh} />
                <UserDeleteDialog userId={user.id} userName={user.name} onSuccess={onRefresh} />
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
