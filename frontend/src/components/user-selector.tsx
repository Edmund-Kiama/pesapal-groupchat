"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { authApi } from "@/lib/api/auth-api";
import { User } from "@/lib/typings/models";
import { useAuthStore } from "@/lib/stores/auth-store";
import { useActiveUserStore } from "@/lib/stores/active-user-store";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { ChevronDown, User as UserIcon, Crown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface UserSelectorProps {
  className?: string;
}

export function UserSelector({ className }: UserSelectorProps) {
  const { user, setAuth } = useAuthStore();
  const { setActiveUser } = useActiveUserStore();
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const { data: users } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const response = await authApi.getUsers();
      return response.data;
    },
  });

  useEffect(() => {
    if (users && users.length > 0) {
      setIsLoading(false);
    } else {
      setIsLoading(false);
    }
  }, [users]);

  const handleSelectUser = (selectedUser: User) => {
    // Set in both stores for compatibility
    setAuth(selectedUser, "demo-token");
    setActiveUser(selectedUser);
    setOpen(false);
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300";
      case "member":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
    }
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-[200px] justify-between"
            disabled={isLoading}
          >
            <span className="flex items-center gap-2">
              <UserIcon className="h-4 w-4" />
              {user ? user.name : "Select User"}
            </span>
            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[200px] p-0">
          <Command>
            <CommandInput placeholder="Search users..." className="h-9" />
            <CommandList>
              <CommandEmpty>No user found.</CommandEmpty>
              <CommandGroup>
                {users?.map((u: User) => (
                  <CommandItem
                    key={u.id}
                    value={u.name}
                    onSelect={() => handleSelectUser(u)}
                  >
                    <div className="flex items-center gap-2">
                      {u.role === "admin" && (
                        <Crown className="h-3 w-3 text-purple-500" />
                      )}
                      <span>{u.name}</span>
                      <Badge
                        variant="secondary"
                        className={cn(
                          "text-[10px] px-1.5 py-0 h-5 ml-auto",
                          getRoleBadgeColor(u.role)
                        )}
                      >
                        {u.role}
                      </Badge>
                    </div>
                    {user?.id === u.id && (
                      <span className="ml-auto text-xs text-primary">✓</span>
                    )}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
