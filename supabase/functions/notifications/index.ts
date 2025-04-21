
import { serve } from "https://deno.land/std@0.170.0/http/server.ts";

import {
  getEmailTemplate,
} from "./templates.ts";

import {
  sendN8NEmailNotification,
  sendSendGridEmail,
} from "./email.ts";

import {
  sendN8NWhatsAppNotification,
  sendTwilioWhatsApp,
} from "./whatsapp.ts";

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
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId, template, type, data, to } = (await req.json()) as NotificationRequest;
    const results = { email: null, whatsapp: null };

    if ((type === "email" || type === "both") && !to?.email) {
      throw new Error("Email address is required for email notifications");
    }
    if ((type === "whatsapp" || type === "both") && !to?.phone) {
      throw new Error("Phone number is required for WhatsApp notifications");
    }

    // Procesar notificación por correo
    if (type === "email" || type === "both") {
      if (Deno.env.get("N8N_WEBHOOK_URL")) {
        results.email = await sendN8NEmailNotification(template, userId, data, to!.email!);
      } else if (Deno.env.get("SENDGRID_API_KEY")) {
        const emailContent = getEmailTemplate(template, data);
        results.email = await sendSendGridEmail(to!.email!, emailContent);
      } else {
        console.log("No email provider configured. Simulating email sending for:", to!.email);
        console.log("Email template:", template);
        console.log("Email data:", data);
        results.email = { success: true, provider: "mock", mock: true };
      }
    }

    // Procesar notificación por WhatsApp
    if (type === "whatsapp" || type === "both") {
      if (Deno.env.get("N8N_WEBHOOK_URL")) {
        results.whatsapp = await sendN8NWhatsAppNotification(template, userId, data, to!.phone!);
      } else if (
        Deno.env.get("TWILIO_ACCOUNT_SID") &&
        Deno.env.get("TWILIO_AUTH_TOKEN") &&
        Deno.env.get("TWILIO_PHONE_NUMBER")
      ) {
        results.whatsapp = await sendTwilioWhatsApp(to!.phone!, template, data);
      } else {
        console.log("No WhatsApp provider configured. Simulating WhatsApp sending for:", to!.phone);
        console.log("WhatsApp template:", template);
        console.log("WhatsApp data:", data);
        results.whatsapp = { success: true, provider: "mock", mock: true };
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Notificación enviada correctamente vía ${type}`,
        results,
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
