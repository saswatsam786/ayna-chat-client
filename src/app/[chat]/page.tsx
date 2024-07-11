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
            `http://localhost:1337/api/users/${chat}?populate=sentMessages,sentMessages.sender,receivedMessages,receivedMessages.receiver`,
            {
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer 03e2c6fcbaa9870d37a4f04294bd53d54a4989b453d543506e47b23745bc60203dc163df20227e69f4e07043004037e37247048f5ff260a409edf52dba8e04c63b2fd292beb1c76e678854cf59c3f959f2804f5c137d7ff5c43e377b9519bd62a48f670feb9791fdf35ff0655113166f0a03413cf55fbf06db20ff162e0f5e36`,
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
            `http://localhost:1337/api/users/${loggedUser.id}?populate=sentMessages,sentMessages.sender,receivedMessages,receivedMessages.receiver`,
            {
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer 03e2c6fcbaa9870d37a4f04294bd53d54a4989b453d543506e47b23745bc60203dc163df20227e69f4e07043004037e37247048f5ff260a409edf52dba8e04c63b2fd292beb1c76e678854cf59c3f959f2804f5c137d7ff5c43e377b9519bd62a48f670feb9791fdf35ff0655113166f0a03413cf55fbf06db20ff162e0f5e36`,
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
    <div className="flex h-[calc(100dvh)] flex-col items-center justify-center p-4 md:px-24 py-32 gap-4">
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
