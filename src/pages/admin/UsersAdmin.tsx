
import { Layout } from "@/components/layout/Layout";
import { UserRole } from "@/types";
import { useState } from "react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { mockUsers } from "@/lib/mock/users";
import { Badge } from "@/components/ui/badge";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue, 
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Bell, Check, Search, Shield, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useToast } from "@/components/ui/use-toast";

// Define the schema for user authentication
const authUserSchema = z.object({
  userId: z.string().min(1, "Se requiere ID de usuario"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres")
});

type AuthUserFormValues = z.infer<typeof authUserSchema>;

export default function UsersAdmin() {
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("");
  const { toast } = useToast();
  
  // Form hook for user authentication
  const form = useForm<AuthUserFormValues>({
    resolver: zodResolver(authUserSchema),
    defaultValues: {
      userId: "",
      password: ""
    }
  });
  
  const filteredUsers = mockUsers.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === "" || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

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

  // Function to handle user authentication
  const handleAuthenticateUser = (userId: string) => {
    form.setValue("userId", userId);
  };

  // Function to submit authentication form
  const onSubmit = (values: AuthUserFormValues) => {
    console.log("Authenticating user:", values);
    
    // In a real application, this would call an API endpoint to authenticate the user
    // For this mock implementation, we'll just show a success toast
    
    toast({
      title: "Usuario autenticado",
      description: "El usuario ha sido autenticado correctamente",
      variant: "default",
    });
    
    form.reset();
  };

  return (
    <Layout requireAuth={true} allowedRoles={[UserRole.ADMIN]}>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Gestión de Usuarios</h1>
        
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Usuarios del Sistema</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar usuarios..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Todos los roles" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos los roles</SelectItem>
                  <SelectItem value={UserRole.ADMIN}>Administrador</SelectItem>
                  <SelectItem value={UserRole.TEACHER}>Profesor</SelectItem>
                  <SelectItem value={UserRole.USER}>Usuario</SelectItem>
                </SelectContent>
              </Select>
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
                <TableBody>
                  {filteredUsers.length > 0 ? (
                    filteredUsers.map((user) => (
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
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleAuthenticateUser(user.id)}
                              >
                                <UserCheck className="h-4 w-4 mr-1" />
                                Autenticar
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Autenticar Usuario</DialogTitle>
                                <DialogDescription>
                                  Establece una contraseña para autenticar al usuario seleccionado.
                                </DialogDescription>
                              </DialogHeader>
                              
                              <Form {...form}>
                                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                  <FormField
                                    control={form.control}
                                    name="userId"
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel>ID de Usuario</FormLabel>
                                        <FormControl>
                                          <Input {...field} disabled />
                                        </FormControl>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />
                                  
                                  <FormField
                                    control={form.control}
                                    name="password"
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel>Nueva Contraseña</FormLabel>
                                        <FormControl>
                                          <Input 
                                            type="password" 
                                            placeholder="Ingresa la nueva contraseña" 
                                            {...field} 
                                          />
                                        </FormControl>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />
                                  
                                  <DialogFooter>
                                    <Button type="submit">
                                      <Shield className="h-4 w-4 mr-2" />
                                      Autenticar Usuario
                                    </Button>
                                  </DialogFooter>
                                </form>
                              </Form>
                            </DialogContent>
                          </Dialog>
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
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
