"use client";

import React, { useState, useEffect } from "react";
import ChatTopbar from "./chat-topbar";
import { ChatList } from "./chat-list";
import socket from "@/lib/socket";
import { getUserFromLocalCookie } from "@/lib/auth";

interface User {
  id: string;
  username: string;
  email: string;
  provider: string;
  confirmed: boolean;
  blocked: boolean;
  createdAt: string;
  updatedAt: string;
  avatar?: string;
}

interface Message {
  id: string;
  content: string;
  timestamp: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  sender?: User;
  receiver?: User;
}

interface ChatProps {
  sentMessages: Message[];
  receivedMessages: Message[];
  selectedUser: User;
  isMobile: boolean;
}

export function Chat({ sentMessages, receivedMessages, selectedUser, isMobile }: ChatProps) {
  const [messagesState, setMessages] = useState<Message[]>([]);
  // @ts-ignore
  const [loginUser, setLoginUser] = useState<User>({});

  useEffect(() => {
    async function initializeChat() {
      const data = await getUserFromLocalCookie();
      setLoginUser(data);

      if (sentMessages && receivedMessages) {
        const allMessages = [...sentMessages, ...receivedMessages];
        allMessages.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
        setMessages(allMessages);
      }
    }

    initializeChat();

    socket.on("chat message", (newMessage: Message) => {
      setMessages((prevMessages) =>
        [...prevMessages, newMessage].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
      );
    });

    return () => {
      socket.off("chat message");
    };
  }, [sentMessages, receivedMessages]);

  const sendMessage = (newMessage: { message: string }) => {
    if (loginUser) {
      socket.emit("chat message", {
        content: newMessage.message,
        sender: loginUser,
        receiver: selectedUser,
        timestamp: new Date().toISOString(),
      });
    }
  };

  return (
    <div className="flex flex-col justify-between w-full h-full">
      <ChatTopbar selectedUser={selectedUser} />

      <ChatList
        messages={messagesState}
        selectedUser={selectedUser}
        loggedUser={loginUser}
        sendMessage={sendMessage}
        isMobile={isMobile}
      />
    </div>
  );
}
