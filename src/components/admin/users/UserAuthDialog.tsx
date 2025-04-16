
import { useState } from "react";
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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Shield, UserCheck } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useToast } from "@/hooks/use-toast";

// Define the schema for user authentication
const authUserSchema = z.object({
  userId: z.string().min(1, "Se requiere ID de usuario"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres")
});

type AuthUserFormValues = z.infer<typeof authUserSchema>;

interface UserAuthDialogProps {
  userId: string;
}

export function UserAuthDialog({ userId }: UserAuthDialogProps) {
  const { toast } = useToast();
  
  // Form hook for user authentication
  const form = useForm<AuthUserFormValues>({
    resolver: zodResolver(authUserSchema),
    defaultValues: {
      userId: userId,
      password: ""
    }
  });
  
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
    
    form.reset({ userId: userId, password: "" });
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="sm"
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
  );
}
