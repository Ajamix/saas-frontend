"use client";

import { UserCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { logout } from "@/app/api/auth";
import TokenService from "@/app/lib/auth/tokens";
import { NotificationsDropdown } from "../notifications/notifications-dropdown";

export function AdminNavbar() {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState<string>('Admin');

  useEffect(() => {
    const token = TokenService.getAccessToken();
    if (token) {
      const decodedToken = TokenService.decodeToken(token);
      if (decodedToken?.email) {
        setUserEmail(decodedToken.email);
      }
    }
  }, []);

  const handleLogout = () => {
    logout();
    router.push('/auth-admin/login');
  };

  return (
    <div className="h-16 border-b px-4 flex items-center justify-end bg-white">
      <div className="flex items-center gap-4">
        <NotificationsDropdown />
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="flex items-center gap-x-2 cursor-pointer hover:opacity-80">
              <Avatar>
                <AvatarFallback>
                  <UserCircle className="h-5 w-5" />
                </AvatarFallback>
              </Avatar>
              <div className="text-sm font-medium">
                {userEmail}
              </div>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
} 