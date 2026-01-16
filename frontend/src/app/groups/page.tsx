"use client";

import { useState } from "react";
import { useAuthStore } from "@/lib/stores/auth-store";
import { UserRole } from "@/lib/typings/models";
import { CreateGroupForm } from "@/components/groups/create-group-form";
import { GroupList } from "@/components/groups/group-list";
import { PendingGroupInvites } from "@/components/groups/pending-group-invites";
import { Button } from "@/components/ui/button";
import { Users, Plus } from "lucide-react";
import { groupApi } from "@/lib/api/groups-api";

// Create tabs component since it doesn't exist
function Tabs({
  children,
  value,
}: {
  children: React.ReactNode;
  value: string;
}) {
  return (
    <div data-tabs-value={value}>
      {Array.isArray(children)
        ? children.map((child: any) => {
            if (child?.props?.value === value) return child;
            return null;
          })
        : children}
    </div>
  );
}

function TabsList({ children }: { children: React.ReactNode }) {
  return <div className="flex border-b">{children}</div>;
}

function TabsTrigger({
  value,
  onClick,
  children,
}: {
  value: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className="px-4 py-2 text-sm font-medium border-b-2 border-transparent hover:border-gray-300"
      data-tab-trigger={value}
    >
      {children}
    </button>
  );
}

function TabsContent({
  value,
  children,
}: {
  value: string;
  children: React.ReactNode;
}) {
  return <div data-tab-content={value}>{children}</div>;
}

export default function GroupsPage() {
  const { user } = useAuthStore();
  const isAdmin = user?.role === UserRole.ADMIN;
  const [activeTab, setActiveTab] = useState("my-groups");
  const [refreshKey, setRefreshKey] = useState(0);
  const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false);
  const [actionMessage, setActionMessage] = useState<{
    type: "success" | "error" | "";
    text: string;
  }>({ type: "", text: "" });

  const handleGroupCreated = (groupId: number) => {
    setRefreshKey((prev) => prev + 1);
    setIsCreateGroupOpen(false);
    setActionMessage({ type: "success", text: "Group created successfully!" });
    setTimeout(() => setActionMessage({ type: "", text: "" }), 3000);
  };

  const handleInviteAccepted = (groupId: number) => {
    // Refresh groups list when invite is accepted
    setRefreshKey((prev) => prev + 1);
    setActionMessage({ type: "success", text: "Invite accepted!" });
    setTimeout(() => setActionMessage({ type: "", text: "" }), 3000);
  };

  const handleLeaveOrDeleteGroup = async (groupId: number) => {
    if (!confirm("Are you sure you want to delete this group?")) {
      return;
    }

    try {
      const response = await groupApi.deleteGroup(groupId);
      if (response.success) {
        setActionMessage({
          type: "success",
          text: "Group deleted successfully!",
        });
        setRefreshKey((prev) => prev + 1);
      } else {
        setActionMessage({
          type: "error",
          text: response.message || "Failed to delete group",
        });
      }
    } catch (error) {
      console.error("Error deleting group:", error);
      setActionMessage({
        type: "error",
        text: "Failed to delete the group. You may need to leave instead.",
      });
    }

    setTimeout(() => setActionMessage({ type: "", text: "" }), 5000);
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Groups</h1>
        {isAdmin && (
          <Button
            onClick={() => setIsCreateGroupOpen(true)}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Create Group
          </Button>
        )}
      </div>

      {/* Action message */}
      {actionMessage.text && (
        <div
          className={`mb-4 p-3 rounded-md ${
            actionMessage.type === "success"
              ? "bg-green-100 text-green-800"
              : actionMessage.type === "error"
              ? "bg-red-100 text-red-800"
              : "bg-gray-100"
          }`}
        >
          {actionMessage.text}
        </div>
      )}

      {/* Pending Invites - Visible to all users */}
      <div className="mb-8">
        <PendingGroupInvites onInviteAccepted={handleInviteAccepted} />
      </div>

      <Tabs value={activeTab}>
        <TabsList>
          <TabsTrigger
            value="my-groups"
            onClick={() => setActiveTab("my-groups")}
          >
            <Users className="h-4 w-4 mr-2" />
            My Groups
          </TabsTrigger>
        </TabsList>

        <TabsContent value="my-groups">
          <GroupList
            key={refreshKey}
            onViewGroupDetails={(groupId) => {
              console.log("View group:", groupId);
              // TODO: Navigate to group details page
            }}
            onLeaveGroup={handleLeaveOrDeleteGroup}
          />
        </TabsContent>
      </Tabs>

      {/* Centered Modal Overlay */}
      {isCreateGroupOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setIsCreateGroupOpen(false)}
          />
          {/* Modal Content */}
          <div className="relative z-10 w-full max-w-md mx-4">
            <CreateGroupForm
              onGroupCreated={handleGroupCreated}
              onCancel={() => setIsCreateGroupOpen(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
