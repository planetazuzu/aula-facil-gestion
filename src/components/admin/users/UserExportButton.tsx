
import { User } from "@/types";
import { Button } from "@/components/ui/button";
import { FileDown } from "lucide-react";
import { exportToCSV } from "@/utils/exportUtils";
import { getUserRoleName, getNotificationPreferenceText } from "./userTableUtils";
import { toast } from "@/hooks/use-toast";

interface UserExportButtonProps {
  users: User[];
  filterDescription?: string;
}

export function UserExportButton({ users, filterDescription = "" }: UserExportButtonProps) {
  const handleExport = () => {
    if (users.length === 0) {
      toast({
        title: "No hay datos para exportar",
        description: "Aplica filtros menos restrictivos para obtener usuarios para exportar.",
        variant: "destructive",
      });
      return;
    }

    const columns = [
      { key: 'name' as keyof User, header: 'Nombre' },
      { key: 'email' as keyof User, header: 'Email' },
      { key: 'role' as keyof User, header: 'Rol (ID)' },
      { key: 'notificationPreference' as keyof User, header: 'Preferencia Notificación (ID)' },
      { key: 'createdAt' as keyof User, header: 'Fecha Registro' },
    ];

    // Add custom processing to display role names and notification preferences properly
    const processedData = users.map(user => ({
      ...user,
      role: getUserRoleName(user.role),
      notificationPreference: getNotificationPreferenceText(user.notificationPreference),
    }));

    const filename = `usuarios${filterDescription ? '-' + filterDescription : ''}`;
    
    try {
      exportToCSV(processedData, columns, filename);
      
      toast({
        title: "Exportación exitosa",
        description: `Se han exportado ${users.length} usuarios a CSV.`,
      });
    } catch (error) {
      console.error('Error exporting data:', error);
      
      toast({
        title: "Error al exportar",
        description: "Ha ocurrido un error al exportar los datos. Por favor, inténtalo de nuevo.",
        variant: "destructive",
      });
    }
  };

  return (
    <Button 
      onClick={handleExport}
      className="ml-auto"
      variant="outline"
      size="sm"
    >
      <FileDown className="mr-2 h-4 w-4" />
      Exportar CSV
    </Button>
  );
}
