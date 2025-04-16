
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { TrashIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";
import { mockUsers } from "@/lib/mock";

interface UserDeleteDialogProps {
  userId: string;
  userName: string;
}

export function UserDeleteDialog({ userId, userName }: UserDeleteDialogProps) {
  const [open, setOpen] = useState(false);

  const handleDelete = () => {
    try {
      // In a real app, we would make an API call to delete the user
      const userIndex = mockUsers.findIndex(u => u.id === userId);
      if (userIndex >= 0) {
        mockUsers.splice(userIndex, 1);
      }
      
      toast({
        title: "Usuario eliminado",
        description: `El usuario ${userName} ha sido eliminado con éxito.`,
      });
      
      setOpen(false);
    } catch (error) {
      console.error("Error deleting user:", error);
      toast({
        title: "Error al eliminar usuario",
        description: "Ha ocurrido un error al eliminar el usuario. Por favor, inténtalo de nuevo.",
        variant: "destructive",
      });
    }
  };
  
  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <TrashIcon className="h-4 w-4 text-destructive" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
          <AlertDialogDescription>
            Esta acción eliminará permanentemente a {userName} y no se puede deshacer.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
            Eliminar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
