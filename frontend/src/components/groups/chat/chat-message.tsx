"use client";

import { useState } from "react";
import { GroupChat } from "@/lib/api/groups-api";
import { useAuthStore } from "@/lib/stores/auth-store";
import { Button } from "@/components/ui/button";
import { Trash2, MoreVertical } from "lucide-react";

interface ChatMessageProps {
  message: GroupChat;
  onDelete?: (chatId: number) => void;
}

export function ChatMessage({ message, onDelete }: ChatMessageProps) {
  const { user } = useAuthStore();
  const isOwnMessage = message.senderId === user?.id;
  const [showMenu, setShowMenu] = useState(false);

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    }
  };

  const handleDelete = () => {
    if (onDelete && message.id) {
      onDelete(message.id);
    }
    setShowMenu(false);
  };

  return (
    <div
      className={`flex w-full mb-2 ${
        isOwnMessage ? "justify-end" : "justify-start"
      }`}
    >
      <div
        className={`flex max-w-[80%] ${
          isOwnMessage ? "flex-row-reverse" : "flex-row"
        } gap-2`}
      >
        {/* Avatar for other users */}
        {!isOwnMessage && (
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-sm font-medium text-primary">
              {message.sender?.name?.charAt(0).toUpperCase() || "?"}
            </span>
          </div>
        )}

        {/* Message bubble */}
        <div className="relative group">
          {/* Sender name for group chat */}
          {!isOwnMessage && (
            <span className="text-xs font-medium text-muted-foreground mb-1 block">
              {message.sender?.name || "Unknown"}
            </span>
          )}

          <div
            className={`relative px-4 py-2 rounded-2xl shadow-sm ${
              isOwnMessage
                ? "bg-primary text-primary-foreground rounded-br-md"
                : "bg-muted rounded-bl-md"
            }`}
          >
            <p className="text-sm whitespace-pre-wrap break-words">
              {message.content}
            </p>
          </div>

          {/* Time and menu */}
          <div
            className={`flex items-center gap-1 mt-1 ${
              isOwnMessage ? "justify-end" : "justify-start"
            }`}
          >
            <span className="text-[10px] text-muted-foreground">
              {formatDate(message.createdAt)} {formatTime(message.createdAt)}
            </span>

            {/* Delete button (only for own messages) */}
            {isOwnMessage && (
              <div className="relative">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => setShowMenu(!showMenu)}
                >
                  <MoreVertical className="h-3 w-3" />
                </Button>

                {showMenu && (
                  <div className="absolute bottom-full right-0 mb-1 bg-popover border rounded-md shadow-lg z-10">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex items-center gap-1 text-red-500 hover:text-red-600 hover:bg-red-50 w-full justify-start px-2 py-1 h-auto text-xs"
                      onClick={handleDelete}
                    >
                      <Trash2 className="h-3 w-3" />
                      Delete
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
