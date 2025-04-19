
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import webPush from "npm:web-push"

const VAPID_PUBLIC_KEY = Deno.env.get('VAPID_PUBLIC_KEY')
const VAPID_PRIVATE_KEY = Deno.env.get('VAPID_PRIVATE_KEY')
const VAPID_SUBJECT = 'mailto:notifications@aulagestion.com'

if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
  throw new Error('VAPID keys are required.')
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

webPush.setVapidDetails(
  VAPID_SUBJECT,
  VAPID_PUBLIC_KEY,
  VAPID_PRIVATE_KEY
)

// Almacenamiento simple de suscripciones (en producción usar una BD)
const subscriptions = new Map()

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  // GET request para obtener la clave VAPID pública
  if (req.method === 'GET') {
    return new Response(
      JSON.stringify({ 
        vapidPublicKey: VAPID_PUBLIC_KEY 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )
  }

  try {
    const { subscription, notification, action, userId } = await req.json()

    // Manejar suscripción/desuscripción
    if (subscription && action) {
      if (action === 'subscribe' && userId) {
        // Guardar suscripción asociada al userId
        subscriptions.set(userId, subscription)
        return new Response(
          JSON.stringify({ success: true, message: 'Subscription saved' }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200 
          }
        )
      } else if (action === 'unsubscribe' && userId) {
        // Eliminar suscripción
        subscriptions.delete(userId)
        return new Response(
          JSON.stringify({ success: true, message: 'Subscription removed' }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200 
          }
        )
      }
    }

    // Enviar notificación push
    if (subscription && notification) {
      const result = await webPush.sendNotification(
        subscription,
        JSON.stringify(notification)
      )

      return new Response(
        JSON.stringify({ success: true, result }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      )
    }

    throw new Error('Invalid request')
  } catch (error) {
    console.error('Error in push notification function:', error)
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})
