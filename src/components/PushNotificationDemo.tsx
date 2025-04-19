
import { Button } from "@/components/ui/button";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import { Bell, BellOff, Loader2 } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

export const PushNotificationDemo = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const { isSupported, isSubscribed, subscribe, unsubscribe } = usePushNotifications();

  if (!isSupported) {
    return (
      <div className="p-4 bg-muted rounded-lg">
        <p className="text-sm text-muted-foreground">
          Tu navegador no soporta notificaciones push.
        </p>
      </div>
    );
  }

  const handleSubscriptionChange = async () => {
    setIsLoading(true);
    try {
      if (isSubscribed) {
        await unsubscribe();
      } else {
        await subscribe();
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Notificaciones Push</h2>
      <p className="text-muted-foreground">
        {isSubscribed 
          ? "Las notificaciones push están activadas" 
          : "Activa las notificaciones push para recibir actualizaciones importantes"}
      </p>
      
      <Button
        onClick={handleSubscriptionChange}
        variant={isSubscribed ? "outline" : "default"}
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Procesando...
          </>
        ) : isSubscribed ? (
          <>
            <BellOff className="mr-2" />
            Desactivar notificaciones
          </>
        ) : (
          <>
            <Bell className="mr-2" />
            Activar notificaciones
          </>
        )}
      </Button>
    </div>
  );
};
