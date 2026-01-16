"use client";

import { useState, useEffect } from "react";
import { useAuthStore } from "@/lib/stores/auth-store";
import { UserRole } from "@/lib/typings/models";
import { CreateGroupForm } from "@/components/groups/create-group-form";
import { InviteUserForm } from "@/components/groups/invite-user-form";
import { groupApi } from "@/lib/api/groups-api";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { Shield, Settings, Users, UserPlus } from "lucide-react";

// Simple Tabs component since we don't have it in UI components
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

interface MockUser {
  id: number;
  name: string;
  email: string;
  role: UserRole;
}

export default function AdminGroupsPage() {
  const { user } = useAuthStore();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("manage-groups");
  const [refreshKey, setRefreshKey] = useState(0);
  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null);
  const [groups, setGroups] = useState<any[]>([]);
  const [availableUsers] = useState<MockUser[]>([
    {
      id: 2,
      name: "John Doe",
      email: "john@example.com",
      role: UserRole.MEMBER,
    },
    {
      id: 3,
      name: "Jane Smith",
      email: "jane@example.com",
      role: UserRole.MEMBER,
    },
    {
      id: 4,
      name: "Bob Johnson",
      email: "bob@example.com",
      role: UserRole.MEMBER,
    },
  ]);

  const isAdmin = user?.role === UserRole.ADMIN;

  useEffect(() => {
    if (!isAdmin) {
      console.warn("Access denied: Admin only");
    }
  }, [isAdmin]);

  const fetchGroups = async () => {
    try {
      const response = await groupApi.getAllGroups();
      if (response.success) {
        setGroups(response.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch groups:", error);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  const handleGroupCreated = (groupId: number) => {
    setRefreshKey((prev) => prev + 1);
    fetchGroups();
    toast.success("Group created successfully! You can now invite members.");
  };

  const handleInviteSent = () => {
    setRefreshKey((prev) => prev + 1);
    toast.success("Invitation sent successfully!");
  };

  const handleSelectGroup = (groupId: number) => {
    setSelectedGroupId(groupId);
  };

  if (!isAdmin) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-500">
              <Shield className="h-5 w-5" />
              Access Denied
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              You need administrator privileges to access this page.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Settings className="h-8 w-8" />
            Group Management
          </h1>
          <p className="text-muted-foreground mt-1">
            Create groups and manage members (Admin Only)
          </p>
        </div>
        <Badge variant="outline" className="px-3 py-1">
          Admin Access
        </Badge>
      </div>

      <Tabs defaultValue={activeTab}>
        <TabsList>
          <TabsTrigger
            value="manage-groups"
            onClick={() => setActiveTab("manage-groups")}
          >
            <Users className="h-4 w-4 mr-2" />
            Manage Groups
          </TabsTrigger>
          <TabsTrigger
            value="create-group"
            onClick={() => setActiveTab("create-group")}
          >
            <Users className="h-4 w-4 mr-2" />
            Create Group
          </TabsTrigger>
          <TabsTrigger
            value="invite-user"
            onClick={() => setActiveTab("invite-user")}
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Invite User
          </TabsTrigger>
        </TabsList>

        <TabsContent value="manage-groups">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>All Groups</CardTitle>
                  <CardDescription>
                    Select a group to manage its members
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {groups.length > 0 ? (
                    <div className="space-y-3">
                      {groups.map((group) => (
                        <div
                          key={group.id}
                          onClick={() => handleSelectGroup(group.id)}
                          className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                            selectedGroupId === group.id
                              ? "border-primary bg-primary/5"
                              : "hover:bg-muted"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">{group.name}</p>
                              {group.description && (
                                <p className="text-sm text-muted-foreground">
                                  {group.description}
                                </p>
                              )}
                            </div>
                            <Badge variant="secondary">
                              {group.members?.length || 0} members
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-center py-8">
                      No groups found. Create one to get started.
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>

            <div>
              {selectedGroupId ? (
                <InviteUserForm
                  groupId={selectedGroupId}
                  groupName={
                    groups.find((g) => g.id === selectedGroupId)?.name || ""
                  }
                  availableUsers={availableUsers as any}
                  onInviteSent={handleInviteSent}
                />
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Select a Group</CardTitle>
                    <CardDescription>
                      Click on a group to invite users
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Select a group from the list to manage its members.
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="create-group">
          <div className="max-w-xl mx-auto">
            <CreateGroupForm onGroupCreated={handleGroupCreated} />
          </div>
        </TabsContent>

        <TabsContent value="invite-user">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>My Groups</CardTitle>
                  <CardDescription>
                    Groups you can invite users to
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {groups.length > 0 ? (
                    <div className="space-y-2">
                      {groups.map((group) => (
                        <div
                          key={group.id}
                          onClick={() => handleSelectGroup(group.id)}
                          className={`p-3 border rounded cursor-pointer transition-colors ${
                            selectedGroupId === group.id
                              ? "border-primary bg-primary/5"
                              : "hover:bg-muted"
                          }`}
                        >
                          <p className="font-medium">{group.name}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-center py-4">
                      No groups available
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>

            <div>
              {selectedGroupId ? (
                <InviteUserForm
                  groupId={selectedGroupId}
                  groupName={
                    groups.find((g) => g.id === selectedGroupId)?.name || ""
                  }
                  availableUsers={availableUsers as any}
                  onInviteSent={handleInviteSent}
                />
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Invite User</CardTitle>
                    <CardDescription>
                      Select a group first, then invite users
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Click on a group from the left to invite users to it.
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
