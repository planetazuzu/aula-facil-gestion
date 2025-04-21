
const TWILIO_ACCOUNT_SID = Deno.env.get("TWILIO_ACCOUNT_SID");
const TWILIO_AUTH_TOKEN = Deno.env.get("TWILIO_AUTH_TOKEN");
const TWILIO_PHONE_NUMBER = Deno.env.get("TWILIO_PHONE_NUMBER");

import { getWhatsAppTemplate } from "./templates.ts";

export async function sendN8NWhatsAppNotification(
  template: string,
  userId: string,
  data: Record<string, any>,
  toPhone: string
) {
  console.log(`Sending WhatsApp notification via N8N webhook`);

  const n8nPayload = {
    notificationType: "whatsapp",
    template,
    userId,
    ...data,
    recipient: { phone: toPhone }
  };

  const response = await fetch(Deno.env.get("N8N_WEBHOOK_URL")!, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(n8nPayload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`N8N WhatsApp request failed: ${response.status} - ${errorText}`);
  }

  return await response.json();
}

export async function sendTwilioWhatsApp(to: string, template: string, data: Record<string, any>) {
  console.log("Sending WhatsApp notification via Twilio API");
  
  const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`;
  const toPhone = to.startsWith("whatsapp:") ? to : `whatsapp:${to}`;
  const fromPhone = TWILIO_PHONE_NUMBER!.startsWith("whatsapp:") ? TWILIO_PHONE_NUMBER : `whatsapp:${TWILIO_PHONE_NUMBER}`;
  const credentials = btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`);
  
  const formData = new URLSearchParams();
  const whatsAppContent = getWhatsAppTemplate(template, data);
  formData.append("To", toPhone);
  formData.append("From", fromPhone);
  formData.append("Body", whatsAppContent);

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
