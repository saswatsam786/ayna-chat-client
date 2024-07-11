"use client";
import { cn } from "@/lib/utils";
import React, { useRef } from "react";
import { Avatar, AvatarImage } from "../ui/avatar";
import ChatBottombar from "./chat-bottombar";
import { AnimatePresence, motion } from "framer-motion";

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

interface ChatListProps {
  messages: Message[];
  selectedUser: User;
  sendMessage: (newMessage: { message: string }) => void;
  loggedUser: User;
  isMobile: boolean;
}

export const ChatList: React.FC<ChatListProps> = ({ messages, selectedUser, sendMessage, loggedUser, isMobile }) => {
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom of messages on update
  React.useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="w-full overflow-y-auto overflow-x-hidden h-full flex flex-col">
      <div ref={messagesContainerRef} className="w-full overflow-y-auto overflow-x-hidden h-full flex flex-col">
        <AnimatePresence>
          {messages.map((message, index) => (
            <motion.div
              key={index}
              layout
              initial={{ opacity: 0, scale: 1, y: 50, x: 0 }}
              animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
              exit={{ opacity: 0, scale: 1, y: 1, x: 0 }}
              transition={{
                opacity: { duration: 0.1 },
                layout: {
                  type: "spring",
                  bounce: 0.3,
                  duration: messages.indexOf(message) * 0.05 + 0.2,
                },
              }}
              style={{
                originX: 0.5,
                originY: 0.5,
              }}
              className={cn(
                "flex flex-col gap-2 p-4 whitespace-pre-wrap",
                message.sender?.id === loggedUser.id ? "items-end" : "items-start"
              )}
            >
              <div className="flex gap-3 items-center">
                {message.sender?.id !== loggedUser.id && (
                  <Avatar className="flex justify-center items-center">
                    <AvatarImage src={selectedUser.avatar} alt={selectedUser.username} width={6} height={6} />
                  </Avatar>
                )}
                <span
                  className={cn("bg-accent p-3 rounded-md max-w-xs", {
                    "self-end": message.sender?.id === loggedUser.id, // Aligns message to right for logged-in user
                    "self-start": message.sender?.id !== loggedUser.id, // Aligns message to left for other users
                  })}
                >
                  {message.content}
                </span>
                {message.sender?.id === loggedUser.id && (
                  <Avatar className="flex justify-center items-center">
                    <AvatarImage src={message.sender?.avatar} alt={message.sender?.username} width={6} height={6} />
                  </Avatar>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      <ChatBottombar sendMessage={sendMessage} loggedUser={loggedUser} isMobile={isMobile} />
    </div>
  );
};

export default ChatList;
