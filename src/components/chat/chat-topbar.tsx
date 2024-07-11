import React from "react";
import { Avatar, AvatarImage } from "../ui/avatar";
import { LogOut } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button, buttonVariants } from "../ui/button";
import { unsetToken } from "@/lib/auth";
import { useRouter } from "next/navigation";

interface ChatTopbarProps {
  selectedUser: any;
}

export const TopbarIcons = [{ icon: LogOut }];

export default function ChatTopbar({ selectedUser }: ChatTopbarProps) {
  const router = useRouter();
  const handleLogout = () => {
    unsetToken(router);
  };
  return (
    <div className="w-full h-20 flex p-4 justify-between items-center border-b">
      <div className="flex items-center gap-2">
        <Avatar className="flex justify-center items-center">
          <AvatarImage
            src={selectedUser.avatar}
            alt={selectedUser.username}
            width={6}
            height={6}
            className="w-10 h-10 "
          />
        </Avatar>
        <div className="flex flex-col">
          <span className="font-medium">{selectedUser.username}</span>
          {selectedUser?.username && <span className="text-xs">Active</span>}
        </div>
      </div>

      <div>
        <div
          onClick={handleLogout}
          className={cn(
            buttonVariants({ variant: "ghost", size: "icon" }),
            "h-9 w-9",
            "dark:bg-muted dark:text-muted-foreground dark:hover:bg-muted dark:hover:text-white cursor-pointer"
          )}
        >
          <LogOut size={20} className="text-muted-foreground" />
        </div>
      </div>
    </div>
  );
}
