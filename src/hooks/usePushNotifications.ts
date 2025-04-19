
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export function usePushNotifications() {
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);
  const { user } = useAuth();
  
  // Obtenemos la clave VAPID pública de la API de Supabase
  const [vapidPublicKey, setVapidPublicKey] = useState<string | null>(null);
  
  useEffect(() => {
    // Verificamos si el navegador soporta notificaciones push
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      registerServiceWorker();
      fetchVapidPublicKey();
    }
  }, []);

  // Función para obtener la clave VAPID pública de Supabase
  const fetchVapidPublicKey = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('push-notifications', {
        method: 'GET',
      });
      
      if (error) throw error;
      if (data && data.vapidPublicKey) {
        setVapidPublicKey(data.vapidPublicKey);
      }
    } catch (error) {
      console.error('Error al obtener la clave VAPID:', error);
    }
  };

  const registerServiceWorker = async () => {
    try {
      const registration = await navigator.serviceWorker.register('/service-worker.js');
      setRegistration(registration);
      
      const existingSubscription = await registration.pushManager.getSubscription();
      if (existingSubscription) {
        setSubscription(existingSubscription);
      }
    } catch (error) {
      console.error('Error al registrar el Service Worker:', error);
    }
  };

  const subscribeToNotifications = async () => {
    try {
      if (!registration) {
        throw new Error('Service Worker no registrado');
      }
      
      if (!vapidPublicKey) {
        throw new Error('Clave VAPID pública no disponible');
      }
      
      if (!user || !user.id) {
        throw new Error('Usuario no autenticado');
      }

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: vapidPublicKey
      });

      setSubscription(subscription);

      // Guardamos la suscripción en el backend asociada al ID del usuario
      const { error } = await supabase.functions.invoke('push-notifications', {
        body: { 
          subscription, 
          action: 'subscribe',
          userId: user.id
        }
      });

      if (error) throw error;

      toast({
        title: "Notificaciones activadas",
        description: "Recibirás notificaciones push cuando haya actualizaciones importantes."
      });

    } catch (error) {
      console.error('Error al suscribirse a notificaciones push:', error);
      toast({
        title: "Error",
        description: "No se pudieron activar las notificaciones push. Por favor, inténtalo de nuevo.",
        variant: "destructive"
      });
    }
  };

  const unsubscribeFromNotifications = async () => {
    try {
      if (!subscription) {
        throw new Error('No hay suscripción activa');
      }
      
      if (!user || !user.id) {
        throw new Error('Usuario no autenticado');
      }
      
      // Notificamos al backend que el usuario se ha desuscrito
      await supabase.functions.invoke('push-notifications', {
        body: { 
          subscription, 
          action: 'unsubscribe',
          userId: user.id
        }
      });
      
      await subscription.unsubscribe();
      setSubscription(null);
      
      toast({
        title: "Notificaciones desactivadas",
        description: "Ya no recibirás notificaciones push."
      });
    } catch (error) {
      console.error('Error al desuscribirse de notificaciones push:', error);
      toast({
        title: "Error",
        description: "No se pudieron desactivar las notificaciones push. Por favor, inténtalo de nuevo.",
        variant: "destructive"
      });
    }
  };

  return {
    isSupported: 'serviceWorker' in navigator && 'PushManager' in window,
    isSubscribed: !!subscription,
    subscribe: subscribeToNotifications,
    unsubscribe: unsubscribeFromNotifications
  };
}
