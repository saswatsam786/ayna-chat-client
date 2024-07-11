"use client";

import { userData } from "@/app/data";
import React, { useEffect, useState } from "react";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { cn } from "@/lib/utils";
import { Sidebar } from "@/components/sidebar";
import { Chat } from "@/components/chat/chat";

import axios from "axios";
import Link from "next/link";
import { getUserFromLocalCookie } from "@/lib/auth";
import Cookies from "js-cookie";

export default function ChatLayout({ defaultLayout = [320, 480], defaultCollapsed = false, navCollapsedSize }: any) {
  const [isCollapsed, setIsCollapsed] = React.useState(defaultCollapsed);
  const [selectedUser, setSelectedUser] = React.useState<any>({});
  const [isMobile, setIsMobile] = useState(false);
  const [loggedUser, setLoggedUser] = useState<any>({});

  // const router = useRouter();

  useEffect(() => {
    const checkScreenWidth = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    // Initial check
    checkScreenWidth();

    // Event listener for screen width changes
    window.addEventListener("resize", checkScreenWidth);
    if (!Cookies.get("id")) {
      window.location.href = "/login";
    }
    // Cleanup the event listener on component unmount
    return () => {
      window.removeEventListener("resize", checkScreenWidth);
    };
  }, []);

  useEffect(() => {
    const fetchUserDetails = async () => {
      const pathParts = window.location.pathname.split("/");
      const chat = pathParts[pathParts.length - 1];
      if (chat) {
        try {
          const response = await axios.get(
            `https://ayna-strapi-backend-zo3y.onrender.com/api/users/${chat}?populate=sentMessages,sentMessages.sender,receivedMessages,receivedMessages.receiver`,
            {
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer f50790479fbbb8d527048319756fe68e0c6e8a1eabdac7af62cf842c2153e3b8d571a9c185002889f60ad4856302c242a6c3dd85b01c04beb6ab4c5d80333011a85a7a5c2f67bb91b06de4cd7d92259dc58a888ca349045466ea544413f65d272034631e0c46a0fc0020e4f3242b93c617e9beda2c404e13f7dfa30914e2ef74`,
              },
            }
          );
          setSelectedUser(response.data);
          const loggedUser = await getUserFromLocalCookie();

          if (!loggedUser) {
            window.location.href = "/login";
            return;
          }

          const res = await axios.get(
            `https://ayna-strapi-backend-zo3y.onrender.com/api/users/${loggedUser.id}?populate=sentMessages,sentMessages.sender,receivedMessages,receivedMessages.receiver`,
            {
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer f50790479fbbb8d527048319756fe68e0c6e8a1eabdac7af62cf842c2153e3b8d571a9c185002889f60ad4856302c242a6c3dd85b01c04beb6ab4c5d80333011a85a7a5c2f67bb91b06de4cd7d92259dc58a888ca349045466ea544413f65d272034631e0c46a0fc0020e4f3242b93c617e9beda2c404e13f7dfa30914e2ef74`,
              },
            }
          );
          setLoggedUser(res.data);
        } catch (error) {
          console.error("Error fetching user details:", error);
        }
      }
    };

    fetchUserDetails();
  }, []);

  return (
    <div className="flex h-[calc(200dvh)] flex-col items-center justify-center p-4 md:px-24 py-32 gap-4">
      <div className="flex justify-between max-w-5xl w-full items-center">
        <Link href="/" className="text-4xl font-bold text-gradient">
          Ayna - Chat
        </Link>
      </div>
      <div className="z-10 border rounded-lg max-w-5xl w-full h-full text-sm lg:flex">
        <ResizablePanelGroup
          direction="horizontal"
          onLayout={(sizes: number[]) => {
            document.cookie = `react-resizable-panels:layout=${JSON.stringify(sizes)}`;
          }}
          className="h-full items-stretch"
        >
          <ResizablePanel
            defaultSize={defaultLayout[0]}
            collapsedSize={navCollapsedSize}
            collapsible={true}
            minSize={isMobile ? 0 : 24}
            maxSize={isMobile ? 8 : 30}
            onCollapse={() => {
              setIsCollapsed(true);
              document.cookie = `react-resizable-panels:collapsed=${JSON.stringify(true)}`;
            }}
            onExpand={() => {
              setIsCollapsed(false);
              document.cookie = `react-resizable-panels:collapsed=${JSON.stringify(false)}`;
            }}
            className={cn(isCollapsed && "min-w-[50px] md:min-w-[70px] transition-all duration-300 ease-in-out")}
          >
            <Sidebar
              isCollapsed={isCollapsed || isMobile}
              links={userData.map((user) => ({
                name: user.name,
                messages: user.messages ?? [],
                avatar: user.avatar,
                variant: selectedUser.name === user.name ? "grey" : "ghost",
              }))}
              isMobile={isMobile}
            />
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize={defaultLayout[1]} minSize={30}>
            <Chat
              sentMessages={loggedUser.sentMessages}
              receivedMessages={loggedUser.receivedMessages}
              selectedUser={selectedUser}
              isMobile={isMobile}
            />
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  );
}
