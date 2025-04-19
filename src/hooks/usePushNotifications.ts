
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

export function usePushNotifications() {
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      registerServiceWorker();
    }
  }, []);

  const registerServiceWorker = async () => {
    try {
      const registration = await navigator.serviceWorker.register('/service-worker.js');
      setRegistration(registration);
      
      const existingSubscription = await registration.pushManager.getSubscription();
      if (existingSubscription) {
        setSubscription(existingSubscription);
      }
    } catch (error) {
      console.error('Service Worker registration failed:', error);
    }
  };

  const subscribeToNotifications = async () => {
    try {
      if (!registration) {
        throw new Error('Service Worker not registered');
      }

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: 'YOUR_VAPID_PUBLIC_KEY'
      });

      setSubscription(subscription);

      // Store the subscription in your backend
      const { error } = await supabase.functions.invoke('push-notifications', {
        body: { subscription }
      });

      if (error) throw error;

      toast({
        title: "Notificaciones activadas",
        description: "Recibirás notificaciones push cuando haya actualizaciones importantes."
      });

    } catch (error) {
      console.error('Failed to subscribe to push notifications:', error);
      toast({
        title: "Error",
        description: "No se pudieron activar las notificaciones push. Por favor, inténtalo de nuevo.",
        variant: "destructive"
      });
    }
  };

  const unsubscribeFromNotifications = async () => {
    try {
      if (subscription) {
        await subscription.unsubscribe();
        setSubscription(null);
        
        toast({
          title: "Notificaciones desactivadas",
          description: "Ya no recibirás notificaciones push."
        });
      }
    } catch (error) {
      console.error('Failed to unsubscribe from push notifications:', error);
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
