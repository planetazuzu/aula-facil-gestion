
const SENDGRID_API_KEY = Deno.env.get("SENDGRID_API_KEY");
const N8N_WEBHOOK_URL = Deno.env.get("N8N_WEBHOOK_URL");

import type { EmailContent } from "./templates.ts";

// Envío con webhook N8N
export async function sendN8NEmailNotification(
  template: string,
  userId: string,
  data: Record<string, any>,
  toEmail: string
) {
  console.log(`Sending email notification via N8N webhook`);
  const n8nPayload = {
    notificationType: "email",
    template,
    userId,
    ...data,
    recipient: { email: toEmail }
  };

  const response = await fetch(N8N_WEBHOOK_URL!, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(n8nPayload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`N8N email request failed: ${response.status} - ${errorText}`);
  }

  return await response.json();
}

// Envío con SendGrid
export async function sendSendGridEmail(to: string, emailContent: EmailContent) {
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
