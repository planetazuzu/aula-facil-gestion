
import { Message } from "@/types";

export const mockMessages: Message[] = [];

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
