
import { User, UserRole, NotificationPreference } from "@/types";
import { LoginResult } from "./types";

export const mockUsers: User[] = [
  {
    id: "1",
    email: "admin@example.com",
    name: "Admin User",
    role: UserRole.ADMIN,
    notificationPreference: NotificationPreference.EMAIL,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "2",
    email: "teacher@example.com",
    name: "Teacher User",
    role: UserRole.TEACHER,
    notificationPreference: NotificationPreference.WHATSAPP,
    phone: "+1234567890",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "3",
    email: "student@example.com",
    name: "Student User",
    role: UserRole.USER,
    notificationPreference: NotificationPreference.BOTH,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

export const userService = {
  getUserById: (id: string): User | undefined => {
    return mockUsers.find(u => u.id === id);
  },
  
  getTotalUserCount: (): number => {
    return 350; // Número fijo de usuarios para mostrar en el dashboard
  },
  
  login: (email: string, password: string): Promise<LoginResult> => {
    return new Promise((resolve) => {
      const user = mockUsers.find(u => u.email === email);
      
      if (user && (password === 'password' || email === 'student@example.com')) {
        resolve({
          success: true,
          user: user,
        });
      } else {
        resolve({
          success: false,
          message: 'Credenciales incorrectas'
        });
      }
    });
  },
};
