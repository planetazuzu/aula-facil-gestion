
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import webPush from "npm:web-push"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1"

const VAPID_PUBLIC_KEY = Deno.env.get('VAPID_PUBLIC_KEY')
const VAPID_PRIVATE_KEY = Deno.env.get('VAPID_PRIVATE_KEY')
const VAPID_SUBJECT = 'mailto:notifications@aulagestion.com'
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
  throw new Error('VAPID keys are required.')
}

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('Supabase credentials are required.')
}

// Inicializar cliente de Supabase con la clave de rol de servicio para acceso admin
const supabaseAdmin = createClient(
  SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY
)

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

webPush.setVapidDetails(
  VAPID_SUBJECT,
  VAPID_PUBLIC_KEY,
  VAPID_PRIVATE_KEY
)

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
        // Guardar suscripción en la base de datos asociada al userId
        const { error } = await supabaseAdmin
          .from('push_subscriptions')
          .upsert({ 
            user_id: userId, 
            subscription: subscription 
          }, { 
            onConflict: 'user_id' 
          })
        
        if (error) throw error
        
        return new Response(
          JSON.stringify({ success: true, message: 'Subscription saved to database' }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200 
          }
        )
      } else if (action === 'unsubscribe' && userId) {
        // Eliminar suscripción de la base de datos
        const { error } = await supabaseAdmin
          .from('push_subscriptions')
          .delete()
          .eq('user_id', userId)
        
        if (error) throw error
        
        return new Response(
          JSON.stringify({ success: true, message: 'Subscription removed from database' }),
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
    
    // Enviar notificación a un usuario específico por userId
    if (!subscription && notification && userId) {
      // Buscar la suscripción del usuario en la base de datos
      const { data, error } = await supabaseAdmin
        .from('push_subscriptions')
        .select('subscription')
        .eq('user_id', userId)
        .single()
      
      if (error) throw error
      if (!data) throw new Error('Subscription not found for this user')
      
      const userSubscription = data.subscription
      
      // Enviar notificación al usuario utilizando su suscripción
      const result = await webPush.sendNotification(
        userSubscription,
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
    
    // Enviar notificación a todos los usuarios
    if (!subscription && notification && !userId && notification.broadcast === true) {
      // Obtener todas las suscripciones de la base de datos
      const { data, error } = await supabaseAdmin
        .from('push_subscriptions')
        .select('subscription')
      
      if (error) throw error
      if (!data || data.length === 0) throw new Error('No subscriptions found')
      
      // Enviar notificación a todos los usuarios (de manera secuencial)
      const results = []
      for (const item of data) {
        try {
          const result = await webPush.sendNotification(
            item.subscription,
            JSON.stringify(notification)
          )
          results.push({ success: true, result })
        } catch (err) {
          results.push({ success: false, error: err.message })
        }
      }

      return new Response(
        JSON.stringify({ success: true, results }),
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
