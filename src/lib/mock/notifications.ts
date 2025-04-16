import { User, NotificationPreference } from "@/types";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

// Types for notification service
export type NotificationChannel = "email" | "whatsapp";
export type NotificationTemplate = "enrollment_confirmation" | "waitlist_update" | "course_reminder" | "course_cancellation";

export type NotificationPayload = {
  userId: string;
  template: NotificationTemplate;
  data: Record<string, any>;
};

// Template messages for different notification types
const getEmailTemplateId = (template: NotificationTemplate): string => {
  const templates: Record<NotificationTemplate, string> = {
    enrollment_confirmation: 'd-abc123',
    waitlist_update: 'd-def456',
    course_reminder: 'd-ghi789',
    course_cancellation: 'd-jkl012'
  };
  
  return templates[template];
};

const getWhatsAppMessage = (template: NotificationTemplate, data: Record<string, any>): string => {
  switch (template) {
    case 'enrollment_confirmation':
      return `¡Inscripción confirmada! Has sido inscrito exitosamente en el curso "${data.courseTitle}". Comienza el ${new Date(data.startDate).toLocaleDateString()}.`;
    
    case 'waitlist_update':
      return `¡Buenas noticias! Una plaza está disponible para el curso "${data.courseTitle}". Tienes 24 horas para confirmar tu inscripción.`;
    
    case 'course_reminder':
      return `Recordatorio: Tu curso "${data.courseTitle}" comienza mañana a las ${data.startTime}. ¡No olvides asistir!`;
    
    case 'course_cancellation':
      return `Lo sentimos, el curso "${data.courseTitle}" ha sido cancelado. Por favor, contacta con administración para más información.`;
      
    default:
      return 'Notificación del sistema de cursos.';
  }
};

// Main notification service with N8N integration
export const notificationService = {
  // Send a notification through the preferred channel(s) using N8N
  sendNotification: async (payload: NotificationPayload, userData: User): Promise<boolean> => {
    const { userId, template, data } = payload;
    const { email, phone, notificationPreference } = userData;
    
    try {
      console.log(`Sending notification to user ${userId} using preference ${notificationPreference}`);
      
      let type: "email" | "whatsapp" | "both" = "email"; // Default
      
      // Determine notification type based on preference
      if (notificationPreference === NotificationPreference.EMAIL) {
        type = "email";
      } else if (notificationPreference === NotificationPreference.WHATSAPP) {
        type = "whatsapp";
      } else if (notificationPreference === NotificationPreference.BOTH) {
        type = "both";
      } else if (notificationPreference === NotificationPreference.NONE) {
        console.log("User has opted out of notifications");
        return false;
      }
      
      // Prepare recipient information
      const to = {
        email: email || undefined,
        phone: phone || undefined,
      };
      
      // Check if we have the necessary contact info
      if ((type === "email" || type === "both") && !email) {
        console.warn(`User ${userId} needs email notification but has no email address.`);
        if (type === "both" && phone) {
          // Fallback to WhatsApp only
          type = "whatsapp";
        } else {
          return false;
        }
      }
      
      if ((type === "whatsapp" || type === "both") && !phone) {
        console.warn(`User ${userId} needs WhatsApp notification but has no phone number.`);
        if (type === "both" && email) {
          // Fallback to email only
          type = "email";
        } else {
          return false;
        }
      }
      
      // Call Supabase Edge Function to send notification via N8N
      const { data: result, error } = await supabase.functions.invoke("notifications", {
        body: {
          userId,
          template,
          type,
          data,
          to,
        },
      });
      
      if (error) {
        throw error;
      }
      
      console.log("Notification processing result:", result);
      return result?.success || false;
    } catch (error) {
      console.error('Error sending notification:', error);
      return false;
    }
  },
  
  // Helper to test notifications with UI feedback
  testNotification: async (channel: NotificationChannel, user: User): Promise<void> => {
    try {
      if (!user) {
        toast({
          title: "Error",
          description: "Usuario no autenticado",
          variant: "destructive"
        });
        return;
      }
      
      const type = channel === "email" ? "email" : "whatsapp";
      
      // Check for required contact information
      if (channel === "email" && !user.email) {
        toast({
          title: "Error",
          description: "No hay dirección de correo configurada",
          variant: "destructive"
        });
        return;
      }
      
      if (channel === "whatsapp" && !user.phone) {
        toast({
          title: "Error",
          description: "No hay número de teléfono configurado",
          variant: "destructive"
        });
        return;
      }
      
      // Send test notification using N8N
      const { data, error } = await supabase.functions.invoke("notifications", {
        body: {
          userId: user.id,
          template: "course_reminder",
          type,
          data: { 
            courseTitle: "Curso de Prueba", 
            startTime: "10:00",
            userName: user.name || "Estudiante"
          },
          to: {
            email: channel === "email" ? user.email : undefined,
            phone: channel === "whatsapp" ? user.phone : undefined,
          }
        },
      });
      
      if (error) throw error;
      
      if (data?.success) {
        toast({
          title: `Prueba de ${channel === "email" ? "email" : "WhatsApp"} enviada`,
          description: channel === "email" 
            ? `Se ha enviado un correo de prueba a ${user.email}` 
            : `Se ha enviado un mensaje de prueba al número ${user.phone}`
        });
      } else {
        throw new Error(data?.error || "Error desconocido");
      }
    } catch (error) {
      console.error(`Error sending test ${channel} notification:`, error);
      toast({
        title: "Error",
        description: `No se pudo enviar la notificación de prueba por ${channel === 'email' ? 'correo' : 'WhatsApp'}`,
        variant: "destructive"
      });
    }
  }
};
