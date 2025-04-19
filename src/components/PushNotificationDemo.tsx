
import { Button } from "@/components/ui/button";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import { Bell, BellOff } from "lucide-react";

export const PushNotificationDemo = () => {
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

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Notificaciones Push</h2>
      <p className="text-muted-foreground">
        {isSubscribed 
          ? "Las notificaciones push están activadas" 
          : "Activa las notificaciones push para recibir actualizaciones importantes"}
      </p>
      
      <Button
        onClick={isSubscribed ? unsubscribe : subscribe}
        variant={isSubscribed ? "outline" : "default"}
      >
        {isSubscribed ? (
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
