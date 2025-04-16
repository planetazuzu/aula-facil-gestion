
import { Message } from "@/types";

export const mockMessages: Message[] = [
  {
    id: "1",
    senderId: "1", // Admin
    receiverId: "2", // User
    content: "Hola María, ¿cómo estás? Te escribo para confirmar tu inscripción al curso de Liderazgo.",
    read: true,
    createdAt: new Date(2025, 3, 15, 10, 30) // April 15, 2025, 10:30 AM
  },
  {
    id: "2",
    senderId: "2", // User
    receiverId: "1", // Admin
    content: "¡Hola! Estoy bien, gracias. Sí, estoy muy interesada en el curso. ¿Cuándo comienza exactamente?",
    read: true,
    createdAt: new Date(2025, 3, 15, 10, 45) // April 15, 2025, 10:45 AM
  },
  {
    id: "3",
    senderId: "1", // Admin
    receiverId: "2", // User
    content: "El curso comienza el 20 de mayo a las 9:00 AM. ¿Te viene bien esa fecha?",
    read: true,
    createdAt: new Date(2025, 3, 15, 11, 0) // April 15, 2025, 11:00 AM
  },
  {
    id: "4",
    senderId: "2", // User
    receiverId: "1", // Admin
    content: "Perfecto, me viene muy bien. ¿Debo llevar algo específico para el primer día?",
    read: true,
    createdAt: new Date(2025, 3, 15, 11, 15) // April 15, 2025, 11:15 AM
  },
  {
    id: "5",
    senderId: "1", // Admin
    receiverId: "3", // Another User
    content: "Hola Carlos, te informo que hay plazas disponibles para el curso de Innovación.",
    read: false,
    createdAt: new Date(2025, 3, 16, 9, 0) // April 16, 2025, 9:00 AM
  }
];

export const messageService = {
  createMessage: (senderId: string, receiverId: string, content: string): Message => {
    const newMessage: Message = {
      id: String(mockMessages.length + 1),
      senderId,
      receiverId,
      content,
      read: false,
      createdAt: new Date(),
    };

    mockMessages.push(newMessage);
    return newMessage;
  }
};
