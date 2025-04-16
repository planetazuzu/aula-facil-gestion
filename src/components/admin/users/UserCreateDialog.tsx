
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
import { UserPlus } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { NotificationPreference, UserRole } from "@/types";
import { toast } from "@/hooks/use-toast";
import { mockUsers } from "@/lib/mock";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface UserFormValues {
  name: string;
  email: string;
  role: UserRole;
  notificationPreference: NotificationPreference;
  phone?: string;
}

export function UserCreateDialog() {
  const [open, setOpen] = useState(false);
  
  const form = useForm<UserFormValues>({
    defaultValues: {
      name: "",
      email: "",
      role: UserRole.USER,
      notificationPreference: NotificationPreference.EMAIL,
      phone: "",
    },
  });

  const onSubmit = (data: UserFormValues) => {
    try {
      // In a real app, we would make an API call to create the user
      // For now, we'll just add to the mockUsers array
      const newUser = {
        id: `${mockUsers.length + 1}`,
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      mockUsers.push(newUser);
      
      toast({
        title: "Usuario creado",
        description: `El usuario ${data.name} ha sido creado con éxito.`,
      });
      
      form.reset();
      setOpen(false);
    } catch (error) {
      console.error("Error creating user:", error);
      toast({
        title: "Error al crear usuario",
        description: "Ha ocurrido un error al crear el usuario. Por favor, inténtalo de nuevo.",
        variant: "destructive",
      });
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default">
          <UserPlus className="mr-2 h-4 w-4" />
          Nuevo Usuario
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Crear Nuevo Usuario</DialogTitle>
          <DialogDescription>
            Completa los campos para crear un nuevo usuario en el sistema.
          </DialogDescription>
        </DialogHeader>
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
              <Button type="submit">Crear Usuario</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
