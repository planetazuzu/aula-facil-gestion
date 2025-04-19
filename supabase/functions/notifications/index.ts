
import { serve } from "https://deno.land/std@0.170.0/http/server.ts";

// Configuración y constantes
const N8N_WEBHOOK_URL = Deno.env.get("N8N_WEBHOOK_URL");
const SENDGRID_API_KEY = Deno.env.get("SENDGRID_API_KEY");
const TWILIO_ACCOUNT_SID = Deno.env.get("TWILIO_ACCOUNT_SID");
const TWILIO_AUTH_TOKEN = Deno.env.get("TWILIO_AUTH_TOKEN");
const TWILIO_PHONE_NUMBER = Deno.env.get("TWILIO_PHONE_NUMBER");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Tipos
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

interface EmailContent {
  subject: string;
  html: string;
}

// Utilidades para formateo
function formatDate(dateString?: string): string {
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

// Funciones helpers para email
function getEmailTemplate(template: string, data: Record<string, any>): EmailContent {
  const templates: Record<string, (data: Record<string, any>) => EmailContent> = {
    enrollment_confirmation: (data) => ({
      subject: "Confirmación de inscripción en curso",
      html: `
        <h1>¡Inscripción confirmada!</h1>
        <p>Hola ${data.userName || "Estudiante"},</p>
        <p>Has sido inscrito exitosamente en el curso <strong>${data.courseTitle || "seleccionado"}</strong>.</p>
        <p>El curso comienza el <strong>${formatDate(data.startDate)}</strong>.</p>
        <p>Gracias por confiar en Empresa Formacion para tu desarrollo profesional.</p>
      `
    }),
    waitlist_update: (data) => ({
      subject: "Actualización de lista de espera",
      html: `
        <h1>¡Buenas noticias!</h1>
        <p>Hola ${data.userName || "Estudiante"},</p>
        <p>Una plaza está disponible para el curso <strong>${data.courseTitle || "solicitado"}</strong>.</p>
        <p>Tienes 24 horas para confirmar tu inscripción.</p>
        <p>Accede a tu cuenta para confirmar tu asistencia.</p>
      `
    }),
    course_reminder: (data) => ({
      subject: "Recordatorio de curso",
      html: `
        <h1>Recordatorio de curso</h1>
        <p>Hola ${data.userName || "Estudiante"},</p>
        <p>Tu curso <strong>${data.courseTitle || "programado"}</strong> comienza mañana a las <strong>${data.startTime || "hora programada"}</strong>.</p>
        <p>¡No olvides asistir!</p>
      `
    }),
    course_cancellation: (data) => ({
      subject: "Cancelación de curso",
      html: `
        <h1>Información importante sobre tu curso</h1>
        <p>Hola ${data.userName || "Estudiante"},</p>
        <p>Lamentamos informarte que el curso <strong>${data.courseTitle || "seleccionado"}</strong> ha sido cancelado.</p>
        <p>Por favor, contacta con administración para más información.</p>
      `
    }),
    test_notification: (data) => ({
      subject: "Prueba de notificación",
      html: `
        <h1>Prueba de notificación por correo</h1>
        <p>Hola ${data.userName || "Usuario"},</p>
        <p>Este es un correo de prueba para verificar la configuración de notificaciones.</p>
        <p>Si estás recibiendo este mensaje, la configuración es correcta.</p>
        <p>Fecha y hora de envío: ${new Date().toLocaleString()}</p>
      `
    })
  };

  const templateFn = templates[template];
  if (!templateFn) {
    return {
      subject: "Notificación de Empresa Formacion",
      html: "<p>Notificación del sistema.</p>"
    };
  }

  return templateFn(data);
}

// Funciones helpers para WhatsApp
function getWhatsAppTemplate(template: string, data: Record<string, any>): string {
  const templates: Record<string, (data: Record<string, any>) => string> = {
    enrollment_confirmation: (data) => 
      `¡Inscripción confirmada!\nHola ${data.userName || "Estudiante"},\nHas sido inscrito exitosamente en el curso "${data.courseTitle || "seleccionado"}".\nComienza el ${formatDate(data.startDate)}.\nGracias por confiar en Empresa Formacion.`,
    
    waitlist_update: (data) =>
      `¡Buenas noticias!\nHola ${data.userName || "Estudiante"},\nUna plaza está disponible para el curso "${data.courseTitle || "solicitado"}".\nTienes 24 horas para confirmar tu inscripción.\nAccede a tu cuenta para confirmar tu asistencia.`,
    
    course_reminder: (data) =>
      `Recordatorio:\nHola ${data.userName || "Estudiante"},\nTu curso "${data.courseTitle || "programado"}" comienza mañana a las ${data.startTime || "hora programada"}.\n¡No olvides asistir!`,
    
    course_cancellation: (data) =>
      `Información importante:\nHola ${data.userName || "Estudiante"},\nLamentamos informarte que el curso "${data.courseTitle || "seleccionado"}" ha sido cancelado.\nPor favor, contacta con administración para más información.`,
    
    test_notification: (data) =>
      `Prueba de notificación por WhatsApp\nHola ${data.userName || "Usuario"},\nEste es un mensaje de prueba para verificar la configuración de notificaciones.\nSi estás recibiendo este mensaje, la configuración es correcta.\nFecha y hora de envío: ${new Date().toLocaleString()}`
  };

  const templateFn = templates[template];
  return templateFn ? templateFn(data) : "Notificación de Empresa Formacion";
}

// Funciones para envío de notificaciones
async function sendN8NNotification(type: string, template: string, userId: string, data: Record<string, any>, recipient: { email?: string; phone?: string }) {
  console.log(`Sending ${type} notification via N8N webhook`);
  
  const n8nPayload = {
    notificationType: type,
    template,
    userId,
    ...data,
    recipient
  };

  const response = await fetch(N8N_WEBHOOK_URL!, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(n8nPayload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`N8N ${type} request failed: ${response.status} - ${errorText}`);
  }

  return await response.json();
}

async function sendSendGridEmail(to: string, emailContent: EmailContent) {
  console.log("Sending email notification via SendGrid API");
  
  const sendgridPayload = {
    personalizations: [
      {
        to: [{ email: to }],
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

  const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${SENDGRID_API_KEY}`,
    },
    body: JSON.stringify(sendgridPayload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`SendGrid request failed: ${response.status} - ${errorText}`);
  }

  return { success: true, provider: "sendgrid" };
}

async function sendTwilioWhatsApp(to: string, message: string) {
  console.log("Sending WhatsApp notification via Twilio API");
  
  const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`;
  const toPhone = to.startsWith("whatsapp:") ? to : `whatsapp:${to}`;
  const fromPhone = TWILIO_PHONE_NUMBER!.startsWith("whatsapp:") ? TWILIO_PHONE_NUMBER : `whatsapp:${TWILIO_PHONE_NUMBER}`;
  const credentials = btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`);
  
  const formData = new URLSearchParams();
  formData.append("To", toPhone);
  formData.append("From", fromPhone);
  formData.append("Body", message);

  const response = await fetch(twilioUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "Authorization": `Basic ${credentials}`,
    },
    body: formData.toString(),
  });

  const result = await response.json();
  
  if (!response.ok) {
    throw new Error(`Twilio request failed: ${response.status} - ${JSON.stringify(result)}`);
  }

  return { success: true, provider: "twilio", sid: result.sid };
}

// Manejador principal de la función
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId, template, type, data, to } = await req.json() as NotificationRequest;
    const results = { email: null, whatsapp: null };
    const isTestRequest = template === "test_notification";

    // Procesar notificación por correo
    if (type === "email" || type === "both") {
      if (!to?.email) {
        throw new Error("Email address is required for email notifications");
      }

      if (N8N_WEBHOOK_URL) {
        results.email = await sendN8NNotification("email", template, userId, data, { email: to.email });
      } else if (SENDGRID_API_KEY) {
        const emailContent = getEmailTemplate(template, data);
        results.email = await sendSendGridEmail(to.email, emailContent);
      } else {
        console.log("No email provider configured. Simulating email sending for:", to.email);
        console.log("Email template:", template);
        console.log("Email data:", data);
        results.email = { success: true, provider: "mock", mock: true };
      }
    }

    // Procesar notificación por WhatsApp
    if (type === "whatsapp" || type === "both") {
      if (!to?.phone) {
        throw new Error("Phone number is required for WhatsApp notifications");
      }

      if (N8N_WEBHOOK_URL) {
        results.whatsapp = await sendN8NNotification("whatsapp", template, userId, data, { phone: to.phone });
      } else if (TWILIO_ACCOUNT_SID && TWILIO_AUTH_TOKEN && TWILIO_PHONE_NUMBER) {
        const whatsAppContent = getWhatsAppTemplate(template, data);
        results.whatsapp = await sendTwilioWhatsApp(to.phone, whatsAppContent);
      } else {
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

