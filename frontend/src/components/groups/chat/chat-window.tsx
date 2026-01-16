"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { GroupChat, groupChatApi } from "@/lib/api/groups-api";
import { useAuthStore } from "@/lib/stores/auth-store";
import { ChatMessage } from "./chat-message";
import { ChatInput } from "./chat-input";
import { Loader2, ArrowLeft, MessageCircle } from "lucide-react";

interface ChatWindowProps {
  groupId: number;
  groupName: string;
}

export function ChatWindow({ groupId, groupName }: ChatWindowProps) {
  const [messages, setMessages] = useState<GroupChat[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuthStore();

  useEffect(() => {
    fetchMessages();
  }, [groupId]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const fetchMessages = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await groupChatApi.getGroupChats(groupId);
      if (response.success) {
        setMessages(response.data || []);
      } else {
        setError("Failed to load messages");
      }
    } catch (err) {
      console.error("Failed to fetch messages:", err);
      setError("Failed to load messages");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async (content: string) => {
    try {
      setIsSending(true);
      const response = await groupChatApi.sendGroupChat({
        content,
        groupId,
      });

      if (response.success && response.data) {
        setMessages((prev) => [...prev, response.data]);
      }
    } catch (err) {
      console.error("Failed to send message:", err);
      // Could show a toast here
    } finally {
      setIsSending(false);
    }
  };

  const handleDeleteMessage = async (chatId: number) => {
    try {
      const response = await groupChatApi.deleteChat(chatId);
      if (response.success) {
        setMessages((prev) => prev.filter((msg) => msg.id !== chatId));
      }
    } catch (err) {
      console.error("Failed to delete message:", err);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <p className="text-red-500 mb-2">{error}</p>
          <button
            onClick={fetchMessages}
            className="text-sm text-primary hover:underline"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
            <MessageCircle className="h-12 w-12 mb-2 opacity-50" />
            <p>No messages yet</p>
            <p className="text-sm">Start the conversation!</p>
          </div>
        ) : (
          messages.map((message) => (
            <ChatMessage
              key={message.id}
              message={message}
              onDelete={handleDeleteMessage}
            />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <ChatInput
        onSendMessage={handleSendMessage}
        isLoading={isSending}
        placeholder={`Message ${groupName}...`}
      />
    </div>
  );
}
