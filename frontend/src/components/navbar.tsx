"use client";

import { useRouter, usePathname } from "next/navigation";
import { UserSelector } from "@/components/user-selector";
import { NotificationBell } from "@/components/notification-bell";
import { useAuthStore } from "@/lib/stores/auth-store";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { LogOut, User, Users, Settings, LayoutDashboard } from "lucide-react";
import { UserRole } from "@/lib/typings/models";

interface NavbarProps {
  className?: string;
}

export function Navbar({ className }: NavbarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, logout } = useAuthStore();

  const isAdmin = user?.role === UserRole.ADMIN;

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const isActive = (path: string) => pathname === path;

  return (
    <nav
      className={cn(
        "flex items-center justify-between px-4 py-3 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50",
        className
      )}
    >
      <div className="flex items-center gap-4">
        <h1 className="text-xl font-bold">Group Lenders</h1>
        {isAuthenticated && (
          <div className="hidden md:flex items-center gap-1 ml-6">
            <Button
              variant={isActive("/") ? "secondary" : "ghost"}
              size="sm"
              onClick={() => router.push("/")}
              className="flex items-center gap-2"
            >
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </Button>
            <Button
              variant={isActive("/groups") ? "secondary" : "ghost"}
              size="sm"
              onClick={() => router.push("/groups")}
              className="flex items-center gap-2"
            >
              <Users className="h-4 w-4" />
              Groups
            </Button>
            {isAdmin && (
              <Button
                variant={isActive("/admin/groups") ? "secondary" : "ghost"}
                size="sm"
                onClick={() => router.push("/admin/groups")}
                className="flex items-center gap-2"
              >
                <Settings className="h-4 w-4" />
                Admin
              </Button>
            )}
          </div>
        )}
      </div>
      <div className="flex items-center gap-4">
        {isAuthenticated && user ? (
          <>
            <span className="text-sm text-muted-foreground hidden lg:inline">
              Hi, {user.name}
            </span>
            <div className="h-6 w-px bg-border" />
            <NotificationBell />
            <div className=" bg-border h-6 hidden sm:block" />
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
