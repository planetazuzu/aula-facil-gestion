
import { serve } from "https://deno.land/std@0.170.0/http/server.ts";

const N8N_WEBHOOK_URL = Deno.env.get("N8N_WEBHOOK_URL");

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
    if (!N8N_WEBHOOK_URL) {
      throw new Error("N8N_WEBHOOK_URL environment variable is not set");
    }

    // Parse request body
    const { userId, template, type, data, to } = await req.json() as NotificationRequest;

    console.log(`Processing notification request for user ${userId} using template ${template} via ${type}`);

    // Format payload for N8N
    const n8nPayload = {
      notificationType: type,
      template,
      userId,
      ...data,
      recipient: to || {}, // Provide contact details if available
    };

    // Send to N8N
    const response = await fetch(N8N_WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(n8nPayload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`N8N request failed: ${response.status} - ${errorText}`);
    }

    const result = await response.json();

    return new Response(
      JSON.stringify({
        success: true,
        message: `Notification sent successfully via ${type}`,
        result,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error in notifications function:", error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || "Unknown error occurred",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
