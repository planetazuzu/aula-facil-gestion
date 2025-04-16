
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { PencilIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { NotificationPreference, User, UserRole } from "@/types";
import { toast } from "sonner";
import { userService } from "@/services/userService";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface UserFormValues {
  name: string;
  email: string;
  role: UserRole;
  notificationPreference: NotificationPreference;
  phone?: string;
}

interface UserEditDialogProps {
  userId: string;
  onSuccess: () => void;
}

export function UserEditDialog({ userId, onSuccess }: UserEditDialogProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<UserFormValues>({
    defaultValues: {
      name: "",
      email: "",
      role: UserRole.USER,
      notificationPreference: NotificationPreference.EMAIL,
      phone: "",
    },
  });

  useEffect(() => {
    if (open) {
      // Fetch user data
      const fetchUser = async () => {
        setIsLoading(true);
        try {
          const user = await userService.getUserById(userId);
          
          if (user) {
            form.reset({
              name: user.name,
              email: user.email,
              role: user.role,
              notificationPreference: user.notificationPreference,
              phone: user.phone || "",
            });
          }
        } catch (error) {
          console.error("Error fetching user:", error);
          toast.error("Error al cargar los datos del usuario");
          setOpen(false);
        } finally {
          setIsLoading(false);
        }
      };
      
      fetchUser();
    }
  }, [open, userId, form]);

  const onSubmit = async (data: UserFormValues) => {
    try {
      setIsSubmitting(true);
      await userService.updateUser(userId, data);
      
      toast.success(`El usuario ${data.name} ha sido actualizado con éxito.`);
      
      setOpen(false);
      onSuccess();
    } catch (error) {
      console.error("Error updating user:", error);
      toast.error("Ha ocurrido un error al actualizar el usuario. Por favor, inténtalo de nuevo.");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <PencilIcon className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Editar Usuario</DialogTitle>
          <DialogDescription>
            Actualiza la información del usuario.
          </DialogDescription>
        </DialogHeader>
        {isLoading ? (
          <div className="flex justify-center items-center h-48">
            <span className="loading loading-spinner loading-lg"></span>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre</FormLabel>
                    <FormControl>
                      <Input placeholder="Nombre completo" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="email@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rol</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona un rol" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={UserRole.USER}>Usuario</SelectItem>
                        <SelectItem value={UserRole.TEACHER}>Profesor</SelectItem>
                        <SelectItem value={UserRole.ADMIN}>Administrador</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="notificationPreference"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Preferencia de Notificación</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona una preferencia" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={NotificationPreference.EMAIL}>Email</SelectItem>
                        <SelectItem value={NotificationPreference.WHATSAPP}>WhatsApp</SelectItem>
                        <SelectItem value={NotificationPreference.BOTH}>Ambos</SelectItem>
                        <SelectItem value={NotificationPreference.NONE}>Ninguno</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Teléfono (opcional)</FormLabel>
                    <FormControl>
                      <Input placeholder="+1234567890" {...field} />
                    </FormControl>
                    <FormDescription>
                      Necesario para notificaciones por WhatsApp
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}
