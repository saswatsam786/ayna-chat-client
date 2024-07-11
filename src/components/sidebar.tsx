import Link from "next/link";
import { MoreHorizontal, SquarePen } from "lucide-react";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import { Avatar, AvatarImage } from "./ui/avatar";
import { useEffect, useState } from "react";
import axios from "axios";
import { getUserFromLocalCookie } from "@/lib/auth";

interface User {
  id: string;
  username: string;
  avatar: string;
  messages: { sender: { username: string }; content: string }[];
}

interface SidebarProps {
  links: { messages: any[] }[];
  isCollapsed: boolean;
  isMobile: boolean;
}

export function Sidebar({ links, isCollapsed, isMobile }: SidebarProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [loggedInUser, setLoggedInUser] = useState<User | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get(
          "https://ayna-strapi-backend-zo3y.onrender.com/api/users?populate=messages.sender,messages.receiver",
          {
            headers: {
              Authorization: `Bearer f2675a8af30c641c0b4e9be626fccf67a5b85a85f350d89419420a5e98e3d90e8c32630fe2c329d192a4ef9a890a4aef4c13f67ee9937d00408c0e523ac6df03cb7a9a076d0ecb3ded61c84a4f4dd48678d3e0c4b812f480064e7fe749cb8191f3a355f53476f99ae07ac0577ec309c4fd3d6aaa0038effb94f33ad525028a34`,
            },
          }
        );

        const fetchedUsers: User[] = response.data;
        const localUser = await getUserFromLocalCookie();

        // Filter out the logged-in user from the list
        const filteredUsers = fetchedUsers.filter((user) => user.id !== localUser.id);

        setUsers(filteredUsers);
        setLoggedInUser(localUser);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchUsers();
  }, []);

  return (
    <div
      data-collapsed={isCollapsed}
      className="relative group flex flex-col h-full gap-4 p-2 data-[collapsed=true]:p-2 "
    >
      {!isCollapsed && (
        <div className="flex justify-between p-2 items-center">
          <div className="flex gap-2 items-center text-2xl">
            <p className="font-medium">Chats</p>
            <span className="text-zinc-300">({users.length})</span>
          </div>

          <div>
            <Link href="#" className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "h-9 w-9")}>
              <MoreHorizontal size={20} />
            </Link>

            <Link href="#" className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "h-9 w-9")}>
              <SquarePen size={20} />
            </Link>
          </div>
        </div>
      )}
      <nav className="grid gap-1 px-2 group-[[data-collapsed=true]]:justify-center group-[[data-collapsed=true]]:px-2">
        {users.map((user, index) =>
          isCollapsed ? (
            <TooltipProvider key={index}>
              <Tooltip key={index} delayDuration={0}>
                <TooltipTrigger asChild>
                  <Link
                    href={`/${user.id}`}
                    className={cn(
                      buttonVariants({ variant: "ghost", size: "icon" }),
                      "h-11 w-11 md:h-16 md:w-16",
                      "dark:bg-muted dark:text-muted-foreground dark:hover:bg-muted dark:hover:text-white"
                    )}
                  >
                    <Avatar className="flex justify-center items-center">
                      <AvatarImage src={user.avatar} alt={user.username} width={6} height={6} className="w-10 h-10" />
                    </Avatar>{" "}
                    <span className="sr-only">{user.username}</span>
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right" className="flex items-center gap-4">
                  {user.username}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ) : (
            <Link
              key={index}
              href={`/${user.id}`}
              className={cn(
                // @ts-ignore
                buttonVariants({ variant: "grey", size: "xl" }),
                "dark:bg-muted dark:text-white dark:hover:bg-muted dark:hover:text-white shrink",
                "justify-start gap-4"
              )}
            >
              <Avatar className="flex justify-center items-center">
                <AvatarImage src={user.avatar} alt={user.username} width={6} height={6} className="w-10 h-10" />
              </Avatar>
              <div className="flex flex-col max-w-28">
                <span>{user.username}</span>
                {links[index].messages && links[index].messages.length > 0 ? (
                  <span className="text-zinc-300 text-xs truncate"></span>
                ) : (
                  <span className="text-zinc-300 text-xs truncate">No messages</span>
                )}
              </div>
            </Link>
          )
        )}
      </nav>
    </div>
  );
}
