
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Message as MessageType, User } from "@/types";
import { Layout } from "@/components/layout/Layout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { mockMessages, mockUsers, mockService } from "@/lib/mock";
import { MessageSquare, Send, User as UserIcon } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "@/components/ui/sonner";

const Messages = () => {
  const { user } = useAuth();
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [message, setMessage] = useState("");
  const [conversations, setConversations] = useState<MessageType[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);

  useEffect(() => {
    // Filter out the current user from the list of users
    if (user) {
      const filteredUsers = mockUsers.filter((u) => u.id !== user.id);
      setAllUsers(filteredUsers);
    }
  }, [user]);

  useEffect(() => {
    if (user && selectedUser) {
      // Get messages between current user and selected user
      const userMessages = mockMessages.filter(
        (msg) =>
          (msg.senderId === user.id && msg.receiverId === selectedUser.id) ||
          (msg.senderId === selectedUser.id && msg.receiverId === user.id)
      );
      
      // Sort messages by date
      userMessages.sort((a, b) => 
        a.createdAt.getTime() - b.createdAt.getTime()
      );
      
      setConversations(userMessages);
    }
  }, [user, selectedUser, mockMessages]);

  const handleSendMessage = () => {
    if (!message.trim() || !user || !selectedUser) return;

    const newMessage = mockService.createMessage(
      user.id,
      selectedUser.id,
      message
    );

    setConversations([...conversations, newMessage]);
    setMessage("");
    toast.success("Mensaje enviado");
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Layout>
      <div className="container mx-auto px-4">
        <h1 className="text-2xl font-bold mb-6">Mensajes</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Users list */}
          <div className="md:col-span-1 bg-card rounded-lg shadow-sm border">
            <div className="p-4 border-b">
              <h2 className="font-semibold">Contactos</h2>
            </div>
            <ScrollArea className="h-[calc(80vh-12rem)]">
              <div className="p-2">
                {allUsers.map((contact) => (
                  <div
                    key={contact.id}
                    className={`flex items-center gap-3 p-3 rounded-md cursor-pointer transition-colors ${
                      selectedUser?.id === contact.id
                        ? "bg-primary/10"
                        : "hover:bg-accent"
                    }`}
                    onClick={() => setSelectedUser(contact)}
                  >
                    <Avatar>
                      <AvatarFallback>{getInitials(contact.name)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{contact.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {contact.email}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>

          {/* Chat area */}
          <div className="md:col-span-2 bg-card rounded-lg shadow-sm border flex flex-col">
            {selectedUser ? (
              <>
                {/* Chat header */}
                <div className="p-4 border-b flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback>
                      {getInitials(selectedUser.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h2 className="font-semibold">{selectedUser.name}</h2>
                    <p className="text-sm text-muted-foreground">
                      {selectedUser.email}
                    </p>
                  </div>
                </div>

                {/* Messages */}
                <ScrollArea className="flex-1 p-4 h-[calc(80vh-16rem)]">
                  {conversations.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center p-4">
                      <MessageSquare className="h-12 w-12 text-muted-foreground mb-2 opacity-50" />
                      <h3 className="font-medium text-lg">No hay mensajes</h3>
                      <p className="text-muted-foreground">
                        Envía un mensaje para iniciar la conversación
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {conversations.map((msg) => (
                        <div
                          key={msg.id}
                          className={`flex ${
                            msg.senderId === user?.id
                              ? "justify-end"
                              : "justify-start"
                          }`}
                        >
                          <div
                            className={`max-w-[80%] rounded-lg p-3 ${
                              msg.senderId === user?.id
                                ? "bg-primary text-primary-foreground"
                                : "bg-accent"
                            }`}
                          >
                            <p>{msg.content}</p>
                            <p className="text-xs opacity-70 mt-1">
                              {msg.createdAt.toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>

                {/* Message input */}
                <div className="p-4 border-t mt-auto">
                  <div className="flex gap-2">
                    <Textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Escribe un mensaje..."
                      className="min-h-[60px] flex-1"
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                    />
                    <Button
                      onClick={handleSendMessage}
                      disabled={!message.trim()}
                      size="icon"
                      className="h-[60px]"
                    >
                      <Send className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-8">
                <UserIcon className="h-16 w-16 text-muted-foreground mb-4 opacity-30" />
                <h3 className="font-medium text-xl mb-2">
                  Selecciona un contacto
                </h3>
                <p className="text-muted-foreground">
                  Elige un contacto para iniciar una conversación
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Messages;
