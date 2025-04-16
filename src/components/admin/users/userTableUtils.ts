
import { UserRole } from "@/types";

/**
 * Returns the appropriate badge variant based on user role
 */
export const getUserRoleBadgeVariant = (role: UserRole) => {
  switch (role) {
    case UserRole.ADMIN:
      return "destructive";
    case UserRole.TEACHER:
      return "default";
    case UserRole.USER:
      return "secondary";
    default:
      return "outline";
  }
};

/**
 * Generates the page numbers to display in pagination
 */
export const getPageNumbers = (currentPage: number, totalPages: number) => {
  const pages = [];
  const maxPagesToShow = 5;
  
  if (totalPages <= maxPagesToShow) {
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }
  } else {
    pages.push(1);
    
    let startPage = Math.max(2, currentPage - 1);
    let endPage = Math.min(currentPage + 1, totalPages - 1);
    
    if (startPage > 2) pages.push(null);
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    if (endPage < totalPages - 1) pages.push(null);
    
    pages.push(totalPages);
  }
  
  return pages;
};

/**
 * Get the translated user role name
 */
export const getUserRoleName = (role: UserRole): string => {
  switch (role) {
    case UserRole.ADMIN:
      return "Administrador";
    case UserRole.TEACHER:
      return "Profesor";
    case UserRole.USER:
      return "Usuario";
    default:
      return "Desconocido";
  }
};

/**
 * Get formatted notification preference text
 */
export const getNotificationPreferenceText = (preference: string): string => {
  switch (preference) {
    case "EMAIL":
      return "Email";
    case "WHATSAPP":
      return "WhatsApp";
    case "BOTH":
      return "Ambos";
    default:
      return "Ninguno";
  }
};
