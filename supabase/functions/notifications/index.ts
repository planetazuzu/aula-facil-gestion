
import { serve } from "https://deno.land/std@0.170.0/http/server.ts";

// Obtener variables de entorno
const N8N_WEBHOOK_URL = Deno.env.get("N8N_WEBHOOK_URL");
const SENDGRID_API_KEY = Deno.env.get("SENDGRID_API_KEY");
const TWILIO_ACCOUNT_SID = Deno.env.get("TWILIO_ACCOUNT_SID");
const TWILIO_AUTH_TOKEN = Deno.env.get("TWILIO_AUTH_TOKEN");
const TWILIO_PHONE_NUMBER = Deno.env.get("TWILIO_PHONE_NUMBER");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface NotificationRequest {
  userId: string;
  template: string;
  type: "email" | "whatsapp" | "both";
  data: Record<string, any>;
  to?: {
    email?: string;
    phone?: string;
  };
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse request body
    const requestData = await req.json();
    const { userId, template, type, data, to } = requestData as NotificationRequest;

    console.log(`Processing notification request for user ${userId} using template ${template} via ${type}`);

    // Verificar si es una solicitud de prueba
    const isTestRequest = template === "test_notification";
    
    // Inicializar objetos para almacenar resultados
    const results = {
      email: null,
      whatsapp: null
    };

    // Procesar la notificación por correo si es email o both
    if (type === "email" || type === "both") {
      if (!to?.email) {
        throw new Error("Email address is required for email notifications");
      }

      // Si tenemos N8N_WEBHOOK_URL, usar N8N para enviar el correo
      if (N8N_WEBHOOK_URL) {
        console.log("Sending email notification via N8N webhook");
        
        // Preparar datos para N8N
        const n8nEmailPayload = {
          notificationType: "email",
          template,
          userId,
          ...data,
          recipient: { email: to.email }
        };

        // Enviar a N8N
        const n8nResponse = await fetch(N8N_WEBHOOK_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(n8nEmailPayload),
        });

        if (!n8nResponse.ok) {
          const errorText = await n8nResponse.text();
          throw new Error(`N8N email request failed: ${n8nResponse.status} - ${errorText}`);
        }

        results.email = await n8nResponse.json();
      } 
      // Si tenemos SendGrid API key, usar SendGrid directamente
      else if (SENDGRID_API_KEY) {
        console.log("Sending email notification via SendGrid API");
        
        // Obtener contenido del correo según la plantilla
        const emailContent = getEmailContent(template, data);
        
        // Preparar datos para SendGrid
        const sendgridPayload = {
          personalizations: [
            {
              to: [{ email: to.email }],
              subject: emailContent.subject,
            },
          ],
          from: { email: "notificaciones@empresaformacion.com", name: "Empresa Formacion" },
          content: [
            {
              type: "text/html",
              value: emailContent.html,
            },
          ],
        };

        // Enviar a SendGrid
        const sendgridResponse = await fetch("https://api.sendgrid.com/v3/mail/send", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${SENDGRID_API_KEY}`,
          },
          body: JSON.stringify(sendgridPayload),
        });

        if (!sendgridResponse.ok) {
          const errorText = await sendgridResponse.text();
          throw new Error(`SendGrid request failed: ${sendgridResponse.status} - ${errorText}`);
        }

        results.email = { success: true, provider: "sendgrid" };
      } else {
        // Si no hay integración configurada, simulamos el envío para pruebas
        console.log("No email provider configured. Simulating email sending for:", to.email);
        console.log("Email template:", template);
        console.log("Email data:", data);
        
        results.email = { success: true, provider: "mock", mock: true };
      }
    }

    // Procesar la notificación por WhatsApp si es whatsapp o both
    if (type === "whatsapp" || type === "both") {
      if (!to?.phone) {
        throw new Error("Phone number is required for WhatsApp notifications");
      }

      // Si tenemos N8N_WEBHOOK_URL, usar N8N para enviar el WhatsApp
      if (N8N_WEBHOOK_URL) {
        console.log("Sending WhatsApp notification via N8N webhook");
        
        // Preparar datos para N8N
        const n8nWhatsAppPayload = {
          notificationType: "whatsapp",
          template,
          userId,
          ...data,
          recipient: { phone: to.phone }
        };

        // Enviar a N8N
        const n8nResponse = await fetch(N8N_WEBHOOK_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(n8nWhatsAppPayload),
        });

        if (!n8nResponse.ok) {
          const errorText = await n8nResponse.text();
          throw new Error(`N8N WhatsApp request failed: ${n8nResponse.status} - ${errorText}`);
        }

        results.whatsapp = await n8nResponse.json();
      } 
      // Si tenemos Twilio configurado, usar Twilio directamente
      else if (TWILIO_ACCOUNT_SID && TWILIO_AUTH_TOKEN && TWILIO_PHONE_NUMBER) {
        console.log("Sending WhatsApp notification via Twilio API");
        
        // Obtener contenido del mensaje según la plantilla
        const whatsAppContent = getWhatsAppContent(template, data);
        
        // Preparar datos para Twilio (formato básico)
        const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`;
        
        // Preparar el número de teléfono con formato para WhatsApp
        const toPhone = to.phone.startsWith("whatsapp:") ? to.phone : `whatsapp:${to.phone}`;
        const fromPhone = TWILIO_PHONE_NUMBER.startsWith("whatsapp:") ? TWILIO_PHONE_NUMBER : `whatsapp:${TWILIO_PHONE_NUMBER}`;
        
        // Codificar credenciales para autenticación básica
        const credentials = btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`);
        
        // Crear FormData para la solicitud
        const formData = new URLSearchParams();
        formData.append("To", toPhone);
        formData.append("From", fromPhone);
        formData.append("Body", whatsAppContent);

        // Enviar a Twilio
        const twilioResponse = await fetch(twilioUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            "Authorization": `Basic ${credentials}`,
          },
          body: formData.toString(),
        });

        const twilioResult = await twilioResponse.json();
        
        if (!twilioResponse.ok) {
          throw new Error(`Twilio request failed: ${twilioResponse.status} - ${JSON.stringify(twilioResult)}`);
        }

        results.whatsapp = { success: true, provider: "twilio", sid: twilioResult.sid };
      } else {
        // Si no hay integración configurada, simulamos el envío para pruebas
        console.log("No WhatsApp provider configured. Simulating WhatsApp sending for:", to.phone);
        console.log("WhatsApp template:", template);
        console.log("WhatsApp data:", data);
        
        results.whatsapp = { success: true, provider: "mock", mock: true };
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Notificación enviada correctamente vía ${type}`,
        results
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error en la función de notificaciones:", error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || "Error desconocido",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});

// Funciones auxiliares para generar contenido según la plantilla
function getEmailContent(template: string, data: Record<string, any>) {
  let subject = "Notificación de Empresa Formacion";
  let html = "<p>Notificación del sistema.</p>";
  
  switch(template) {
    case "enrollment_confirmation":
      subject = "Confirmación de inscripción en curso";
      html = `
        <h1>¡Inscripción confirmada!</h1>
        <p>Hola ${data.userName || "Estudiante"},</p>
        <p>Has sido inscrito exitosamente en el curso <strong>${data.courseTitle || "seleccionado"}</strong>.</p>
        <p>El curso comienza el <strong>${formatDate(data.startDate)}</strong>.</p>
        <p>Gracias por confiar en Empresa Formacion para tu desarrollo profesional.</p>
      `;
      break;
      
    case "waitlist_update":
      subject = "Actualización de lista de espera";
      html = `
        <h1>¡Buenas noticias!</h1>
        <p>Hola ${data.userName || "Estudiante"},</p>
        <p>Una plaza está disponible para el curso <strong>${data.courseTitle || "solicitado"}</strong>.</p>
        <p>Tienes 24 horas para confirmar tu inscripción.</p>
        <p>Accede a tu cuenta para confirmar tu asistencia.</p>
      `;
      break;
      
    case "course_reminder":
      subject = "Recordatorio de curso";
      html = `
        <h1>Recordatorio de curso</h1>
        <p>Hola ${data.userName || "Estudiante"},</p>
        <p>Tu curso <strong>${data.courseTitle || "programado"}</strong> comienza mañana a las <strong>${data.startTime || "hora programada"}</strong>.</p>
        <p>¡No olvides asistir!</p>
      `;
      break;
    
    case "course_cancellation":
      subject = "Cancelación de curso";
      html = `
        <h1>Información importante sobre tu curso</h1>
        <p>Hola ${data.userName || "Estudiante"},</p>
        <p>Lamentamos informarte que el curso <strong>${data.courseTitle || "seleccionado"}</strong> ha sido cancelado.</p>
        <p>Por favor, contacta con administración para más información.</p>
      `;
      break;
      
    case "test_notification":
      subject = "Prueba de notificación";
      html = `
        <h1>Prueba de notificación por correo</h1>
        <p>Hola ${data.userName || "Usuario"},</p>
        <p>Este es un correo de prueba para verificar la configuración de notificaciones.</p>
        <p>Si estás recibiendo este mensaje, la configuración es correcta.</p>
        <p>Fecha y hora de envío: ${new Date().toLocaleString()}</p>
      `;
      break;
  }
  
  return { subject, html };
}

function getWhatsAppContent(template: string, data: Record<string, any>) {
  let message = "Notificación de Empresa Formacion";
  
  switch(template) {
    case "enrollment_confirmation":
      message = `¡Inscripción confirmada! 
Hola ${data.userName || "Estudiante"}, 
Has sido inscrito exitosamente en el curso "${data.courseTitle || "seleccionado"}". 
Comienza el ${formatDate(data.startDate)}.
Gracias por confiar en Empresa Formacion.`;
      break;
      
    case "waitlist_update":
      message = `¡Buenas noticias! 
Hola ${data.userName || "Estudiante"},
Una plaza está disponible para el curso "${data.courseTitle || "solicitado"}". 
Tienes 24 horas para confirmar tu inscripción.
Accede a tu cuenta para confirmar tu asistencia.`;
      break;
      
    case "course_reminder":
      message = `Recordatorio: 
Hola ${data.userName || "Estudiante"},
Tu curso "${data.courseTitle || "programado"}" comienza mañana a las ${data.startTime || "hora programada"}. 
¡No olvides asistir!`;
      break;
    
    case "course_cancellation":
      message = `Información importante:
Hola ${data.userName || "Estudiante"},
Lamentamos informarte que el curso "${data.courseTitle || "seleccionado"}" ha sido cancelado.
Por favor, contacta con administración para más información.`;
      break;
      
    case "test_notification":
      message = `Prueba de notificación por WhatsApp
Hola ${data.userName || "Usuario"},
Este es un mensaje de prueba para verificar la configuración de notificaciones.
Si estás recibiendo este mensaje, la configuración es correcta.
Fecha y hora de envío: ${new Date().toLocaleString()}`;
      break;
  }
  
  return message;
}

function formatDate(dateString?: string) {
  if (!dateString) return "fecha programada";
  
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  } catch (e) {
    return dateString;
  }
}
