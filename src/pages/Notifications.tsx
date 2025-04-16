
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { AlertTriangle, Bell, Mail, Phone, Send } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/components/ui/use-toast";
import { NotificationPreference, UserRole } from "@/types";
import { notificationService } from "@/lib/mock/notifications";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function Notifications() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isUpdating, setIsUpdating] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [notificationSettings, setNotificationSettings] = useState({
    preference: user?.notificationPreference || NotificationPreference.EMAIL,
    phone: user?.phone || "",
    email: user?.email || "",
    optionsOpen: false,
    courseUpdates: true,
    waitlistAlerts: true,
    reminders: true,
    administrativeMessages: true,
  });

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;
    
    // Validate phone number if WhatsApp is selected
    if (
      (notificationSettings.preference === NotificationPreference.WHATSAPP ||
       notificationSettings.preference === NotificationPreference.BOTH) &&
      !notificationSettings.phone
    ) {
      toast({
        title: "Error de validación",
        description: "Se requiere un número de teléfono para las notificaciones por WhatsApp.",
        variant: "destructive",
      });
      return;
    }
    
    setIsUpdating(true);
    
    try {
      // Since updateUser doesn't exist in the AuthContext, we'll simulate success after a delay
      // In a real implementation, this would make an API call to update user preferences
      setTimeout(() => {
        // Show success toast without updating user in context
        toast({
          title: "Preferencias actualizadas",
          description: "Tus preferencias de notificación han sido actualizadas correctamente.",
        });
        
        setIsUpdating(false);
      }, 1000);
    } catch (error) {
      console.error("Error updating notification preferences:", error);
      toast({
        title: "Error",
        description: "No se pudieron actualizar las preferencias. Inténtalo de nuevo.",
        variant: "destructive",
      });
      setIsUpdating(false);
    }
  };

  // Send test notification
  const sendTestNotification = async (channel: "email" | "whatsapp") => {
    if (!user) return;
    
    if (channel === "email" && !notificationSettings.email) {
      toast({
        title: "Error",
        description: "No hay dirección de correo configurada",
        variant: "destructive",
      });
      return;
    }
    
    if (channel === "whatsapp" && !notificationSettings.phone) {
      toast({
        title: "Error",
        description: "No hay número de teléfono configurado",
        variant: "destructive",
      });
      return;
    }
    
    await notificationService.testNotification(channel, {
      ...user,
      email: notificationSettings.email,
      phone: notificationSettings.phone || undefined,
    });
  };

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNotificationSettings(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  if (!user) {
    return (
      <Layout>
        <div className="container py-10">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>No has iniciado sesión</AlertTitle>
            <AlertDescription>
              Debes iniciar sesión para acceder a tus preferencias de notificación.
            </AlertDescription>
          </Alert>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-8">
        <div className="flex items-center mb-6">
          <Bell className="mr-2 h-6 w-6 text-primary" />
          <h1 className="text-3xl font-bold">Preferencias de Notificación</h1>
        </div>
        
        <div className="grid gap-8 md:grid-cols-3">
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Canales de notificación</CardTitle>
                <CardDescription>
                  Elige cómo quieres recibir las notificaciones del sistema
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-4">
                    <RadioGroup
                      value={notificationSettings.preference}
                      onValueChange={(value) => 
                        setNotificationSettings(prev => ({
                          ...prev,
                          preference: value as NotificationPreference,
                        }))
                      }
                      className="space-y-3"
                    >
                      <div className="flex items-start space-x-3 rounded-md border p-3">
                        <RadioGroupItem value={NotificationPreference.EMAIL} id="email" />
                        <div className="flex flex-col">
                          <Label htmlFor="email" className="font-medium">
                            Solo Email
                          </Label>
                          <p className="text-sm text-muted-foreground">
                            Recibirás todas las notificaciones a través de correo electrónico.
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-start space-x-3 rounded-md border p-3">
                        <RadioGroupItem value={NotificationPreference.WHATSAPP} id="whatsapp" />
                        <div className="flex flex-col">
                          <Label htmlFor="whatsapp" className="font-medium">
                            Solo WhatsApp
                          </Label>
                          <p className="text-sm text-muted-foreground">
                            Recibirás todas las notificaciones a través de WhatsApp.
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-start space-x-3 rounded-md border p-3">
                        <RadioGroupItem value={NotificationPreference.BOTH} id="both" />
                        <div className="flex flex-col">
                          <Label htmlFor="both" className="font-medium">
                            Email y WhatsApp
                          </Label>
                          <p className="text-sm text-muted-foreground">
                            Recibirás todas las notificaciones por ambos canales.
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-start space-x-3 rounded-md border p-3">
                        <RadioGroupItem value={NotificationPreference.NONE} id="none" />
                        <div className="flex flex-col">
                          <Label htmlFor="none" className="font-medium">
                            Ninguna notificación
                          </Label>
                          <p className="text-sm text-muted-foreground">
                            No recibirás notificaciones automáticas (no recomendado).
                          </p>
                        </div>
                      </div>
                    </RadioGroup>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="email" className="mb-1 block">
                        Dirección de correo electrónico
                      </Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          placeholder="tu@email.com"
                          value={notificationSettings.email}
                          onChange={handleChange}
                          className="pl-10"
                        />
                      </div>
                    </div>
                    
                    {(notificationSettings.preference === NotificationPreference.WHATSAPP || 
                      notificationSettings.preference === NotificationPreference.BOTH) && (
                      <div>
                        <Label htmlFor="phone" className="mb-1 block">
                          Número de teléfono (WhatsApp)
                        </Label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="phone"
                            name="phone"
                            type="tel"
                            placeholder="+34 600 000 000"
                            value={notificationSettings.phone}
                            onChange={handleChange}
                            className="pl-10"
                          />
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Ingresa el número con el código de país (ej: +34 para España)
                        </p>
                      </div>
                    )}
                  </div>
                  
                  <Collapsible
                    open={notificationSettings.optionsOpen}
                    onOpenChange={() => 
                      setNotificationSettings(prev => ({
                        ...prev,
                        optionsOpen: !prev.optionsOpen,
                      }))
                    }
                    className="space-y-4"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium">Opciones avanzadas</h4>
                      <CollapsibleTrigger asChild>
                        <Button variant="ghost" size="sm">
                          {notificationSettings.optionsOpen ? "Ocultar" : "Mostrar"}
                        </Button>
                      </CollapsibleTrigger>
                    </div>
                    
                    <CollapsibleContent className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Checkbox 
                            id="courseUpdates" 
                            checked={notificationSettings.courseUpdates}
                            onCheckedChange={(checked) => 
                              setNotificationSettings(prev => ({
                                ...prev,
                                courseUpdates: checked as boolean,
                              }))
                            }
                          />
                          <label
                            htmlFor="courseUpdates"
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            Actualizaciones de cursos
                          </label>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Checkbox 
                            id="waitlistAlerts" 
                            checked={notificationSettings.waitlistAlerts}
                            onCheckedChange={(checked) => 
                              setNotificationSettings(prev => ({
                                ...prev,
                                waitlistAlerts: checked as boolean,
                              }))
                            }
                          />
                          <label
                            htmlFor="waitlistAlerts"
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            Alertas de lista de espera
                          </label>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Checkbox 
                            id="reminders" 
                            checked={notificationSettings.reminders}
                            onCheckedChange={(checked) => 
                              setNotificationSettings(prev => ({
                                ...prev,
                                reminders: checked as boolean,
                              }))
                            }
                          />
                          <label
                            htmlFor="reminders"
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            Recordatorios de cursos
                          </label>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Checkbox 
                            id="administrativeMessages" 
                            checked={notificationSettings.administrativeMessages}
                            onCheckedChange={(checked) => 
                              setNotificationSettings(prev => ({
                                ...prev,
                                administrativeMessages: checked as boolean,
                              }))
                            }
                          />
                          <label
                            htmlFor="administrativeMessages"
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            Mensajes administrativos
                          </label>
                        </div>
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                  
                  <div className="flex justify-end">
                    <Button type="submit" disabled={isUpdating}>
                      {isUpdating ? "Guardando..." : "Guardar preferencias"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
          
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Prueba de notificaciones</CardTitle>
                <CardDescription>
                  Envía una notificación de prueba para verificar la configuración
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <Button 
                  onClick={() => sendTestNotification("email")}
                  variant="outline" 
                  className="w-full justify-start"
                  disabled={!notificationSettings.email}
                >
                  <Mail className="mr-2 h-4 w-4" />
                  Probar notificación por email
                </Button>
                
                <Button 
                  onClick={() => sendTestNotification("whatsapp")}
                  variant="outline" 
                  className="w-full justify-start"
                  disabled={!notificationSettings.phone}
                >
                  <Send className="mr-2 h-4 w-4" />
                  Probar notificación por WhatsApp
                </Button>
                
                {user.role === UserRole.ADMIN && (
                  <div className="pt-4">
                    <Separator className="my-4" />
                    <h3 className="text-sm font-medium mb-2">Opciones de administrador</h3>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="debug-mode">Modo debug</Label>
                        <p className="text-xs text-muted-foreground">
                          Muestra logs detallados en consola
                        </p>
                      </div>
                      <Switch id="debug-mode" />
                    </div>
                    
                    <Collapsible
                      open={isOpen}
                      onOpenChange={setIsOpen}
                      className="mt-4 space-y-2"
                    >
                      <CollapsibleTrigger asChild>
                        <Button variant="outline" size="sm" className="w-full justify-between">
                          Configuración de Twilio/SendGrid
                          <span>{isOpen ? "▲" : "▼"}</span>
                        </Button>
                      </CollapsibleTrigger>
                      <CollapsibleContent className="space-y-4 p-2">
                        <div>
                          <Label htmlFor="sendgrid-api-key" className="text-xs">
                            SendGrid API Key
                          </Label>
                          <Input
                            id="sendgrid-api-key"
                            type="password"
                            placeholder="SG.XXXXXXXXXXXXXXXXXXXX"
                            className="text-xs"
                          />
                        </div>
                        <div>
                          <Label htmlFor="twilio-account-sid" className="text-xs">
                            Twilio Account SID
                          </Label>
                          <Input
                            id="twilio-account-sid"
                            type="password"
                            placeholder="ACXXXXXXXXXXXXXXXXXXXX"
                            className="text-xs"
                          />
                        </div>
                        <div>
                          <Label htmlFor="twilio-auth-token" className="text-xs">
                            Twilio Auth Token
                          </Label>
                          <Input
                            id="twilio-auth-token"
                            type="password"
                            placeholder="XXXXXXXXXXXXXXXXXXXXXXXX"
                            className="text-xs"
                          />
                        </div>
                        <div>
                          <Label htmlFor="twilio-phone-number" className="text-xs">
                            Twilio Phone Number
                          </Label>
                          <Input
                            id="twilio-phone-number"
                            placeholder="+14155238886"
                            className="text-xs"
                          />
                        </div>
                        <Button size="sm" className="w-full">Guardar configuración</Button>
                      </CollapsibleContent>
                    </Collapsible>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}
