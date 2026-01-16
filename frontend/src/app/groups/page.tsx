"use client";

import { useState } from "react";
import { useAuthStore } from "@/lib/stores/auth-store";
import { UserRole } from "@/lib/typings/models";
import { CreateGroupForm } from "@/components/groups/create-group-form";
import { GroupList } from "@/components/groups/group-list";
import { PendingGroupInvites } from "@/components/groups/pending-group-invites";
import { InviteUserForm } from "@/components/groups/invite-user-form";
import { Button } from "@/components/ui/button";
import { Users, Mail, Plus, UserPlus } from "lucide-react";

// Create tabs component since it doesn't exist
function Tabs({
  children,
  defaultValue,
}: {
  children: React.ReactNode;
  defaultValue: string;
}) {
  const [activeTab, setActiveTab] = useState(defaultValue);
  return (
    <div data-tabs-value={activeTab}>
      {Array.isArray(children)
        ? children.map((child: any) => {
            if (child?.props?.value === activeTab) return child;
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

  const handleGroupCreated = (groupId: number) => {
    setRefreshKey((prev) => prev + 1);
  };

  const handleInviteSent = () => {
    // Refresh groups list when invite is sent
    setRefreshKey((prev) => prev + 1);
  };

  const handleInviteAccepted = (groupId: number) => {
    // Refresh groups list when invite is accepted
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Groups</h1>
        {isAdmin && (
          <Button
            onClick={() => setActiveTab("create-group")}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Create Group
          </Button>
        )}
      </div>

      {/* Pending Invites - Visible to all users */}
      <div className="mb-8">
        <PendingGroupInvites onInviteAccepted={handleInviteAccepted} />
      </div>

      <Tabs defaultValue={activeTab}>
        <TabsList>
          <TabsTrigger
            value="my-groups"
            onClick={() => setActiveTab("my-groups")}
          >
            <Users className="h-4 w-4 mr-2" />
            My Groups
          </TabsTrigger>
          {isAdmin && (
            <TabsTrigger
              value="create-group"
              onClick={() => setActiveTab("create-group")}
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Group
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="my-groups">
          <GroupList
            key={refreshKey}
            onViewGroupDetails={(groupId) => {
              console.log("View group:", groupId);
              // TODO: Navigate to group details page
            }}
          />
        </TabsContent>

        {isAdmin && (
          <TabsContent value="create-group">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <CreateGroupForm onGroupCreated={handleGroupCreated} />
              {/* Additional admin tools can go here */}
            </div>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
