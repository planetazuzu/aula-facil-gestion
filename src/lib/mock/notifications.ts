
import { User, NotificationPreference } from "@/types";
import { toast } from "@/components/ui/use-toast";

// Types for notification service
export type NotificationChannel = "email" | "whatsapp";
export type NotificationTemplate = "enrollment_confirmation" | "waitlist_update" | "course_reminder" | "course_cancellation";

export type NotificationPayload = {
  userId: string;
  template: NotificationTemplate;
  data: Record<string, any>;
};

// Mock SendGrid service
const sendGridService = {
  sendEmail: async (to: string, template: NotificationTemplate, data: Record<string, any>): Promise<boolean> => {
    console.log(`[MOCK] SendGrid email sent to ${to} using template ${template}`, data);
    
    // In a real implementation, this would call the SendGrid API
    // return sendGridClient.send({ to, templateId: getTemplateId(template), dynamicTemplateData: data });
    
    return new Promise(resolve => {
      setTimeout(() => resolve(true), 500);
    });
  }
};

// Mock Twilio service
const twilioService = {
  sendWhatsApp: async (to: string, template: NotificationTemplate, data: Record<string, any>): Promise<boolean> => {
    console.log(`[MOCK] Twilio WhatsApp sent to ${to} using template ${template}`, data);
    
    // In a real implementation, this would call the Twilio API
    // const message = getWhatsAppMessageFromTemplate(template, data);
    // return twilioClient.messages.create({ from: 'whatsapp:+1234567890', to: `whatsapp:${to}`, body: message });
    
    return new Promise(resolve => {
      setTimeout(() => resolve(true), 700);
    });
  }
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

// Main notification service
export const notificationService = {
  // Send a notification through the preferred channel(s)
  sendNotification: async (payload: NotificationPayload, userData: User): Promise<boolean> => {
    const { userId, template, data } = payload;
    const { email, phone, notificationPreference } = userData;
    
    try {
      let emailSent = false;
      let whatsappSent = false;
      
      // Send email if preference includes EMAIL
      if (
        notificationPreference === NotificationPreference.EMAIL || 
        notificationPreference === NotificationPreference.BOTH
      ) {
        if (email) {
          emailSent = await sendGridService.sendEmail(email, template, data);
          console.log(`Email notification sent to ${email}: ${emailSent}`);
        } else {
          console.warn(`User ${userId} has EMAIL preference but no email address.`);
        }
      }
      
      // Send WhatsApp if preference includes WHATSAPP
      if (
        notificationPreference === NotificationPreference.WHATSAPP || 
        notificationPreference === NotificationPreference.BOTH
      ) {
        if (phone) {
          whatsappSent = await twilioService.sendWhatsApp(phone, template, data);
          console.log(`WhatsApp notification sent to ${phone}: ${whatsappSent}`);
        } else {
          console.warn(`User ${userId} has WHATSAPP preference but no phone number.`);
        }
      }
      
      return emailSent || whatsappSent;
    } catch (error) {
      console.error('Error sending notification:', error);
      return false;
    }
  },
  
  // Helper to test notifications with UI feedback
  testNotification: async (channel: NotificationChannel, user: User): Promise<void> => {
    try {
      if (channel === 'email' && user.email) {
        await sendGridService.sendEmail(
          user.email, 
          'course_reminder', 
          { courseTitle: 'Curso de Prueba', startTime: '10:00' }
        );
        toast({
          title: "Prueba de email enviada",
          description: `Se ha enviado un correo de prueba a ${user.email}`
        });
      } else if (channel === 'whatsapp' && user.phone) {
        await twilioService.sendWhatsApp(
          user.phone, 
          'course_reminder', 
          { courseTitle: 'Curso de Prueba', startTime: '10:00' }
        );
        toast({
          title: "Prueba de WhatsApp enviada",
          description: `Se ha enviado un mensaje de prueba al número ${user.phone}`
        });
      } else {
        toast({
          title: "Error",
          description: channel === 'email' 
            ? "No hay dirección de correo configurada" 
            : "No hay número de teléfono configurado",
          variant: "destructive"
        });
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
