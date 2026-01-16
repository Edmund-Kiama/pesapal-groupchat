"use client";

import { useRouter } from "next/navigation";
import { UserSelector } from "@/components/user-selector";
import { NotificationBell } from "@/components/notification-bell";
import { useAuthStore } from "@/lib/stores/auth-store";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { LogOut, User } from "lucide-react";

interface NavbarProps {
  className?: string;
}

export function Navbar({ className }: NavbarProps) {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <nav
      className={cn(
        "flex items-center justify-between px-4 py-3 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50",
        className
      )}
    >
      <div className="flex items-center gap-4">
        <h1 className="text-xl font-bold">PesaPal</h1>
      </div>
      <div className="flex items-center gap-4">
        {isAuthenticated && user ? (
          <>
            <span className="text-sm text-muted-foreground hidden sm:inline">
              Hi, {user.name}
            </span>
            <div className="h-6 w-px bg-border" />
            <NotificationBell />
            <div className="h-6 w-px bg-border" />
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </>
        ) : (
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/login")}
            >
              <User className="h-4 w-4 mr-1" />
              Login
            </Button>
            <Button size="sm" onClick={() => router.push("/signup")}>
              Sign Up
            </Button>
          </>
        )}
      </div>
    </nav>
  );
}
