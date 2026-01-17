"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/stores/auth-store";
import { UserRole, type Group } from "@/lib/typings/models";
import { groupApi } from "@/lib/api/groups-api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Users,
  Plus,
  LayoutDashboard,
  Settings,
  UserPlus,
  ArrowRight,
  Bell,
  Calendar,
  UserMinus,
} from "lucide-react";
import {
  UsersTable,
  NotificationsTable,
  GroupsTable,
  MeetingsTable,
  GroupInvitesTable,
  MembersTable,
} from "@/components/dashboard";

export default function Home() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);

  const isAdmin = user?.role === UserRole.ADMIN;

  useEffect(() => {
    if (!isAuthenticated || !user) {
      router.push("/login");
      return;
    }

    const fetchGroups = async () => {
      try {
        const response = await groupApi.getMyGroups(user.id);
        if (response.success) {
          const userGroups =
            response.data?.map((membership: any) => membership.group) || [];
          setGroups(userGroups);
        }
      } catch (error) {
        console.error("Failed to fetch groups:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchGroups();
  }, [isAuthenticated, router, user]);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <LayoutDashboard className="h-8 w-8" />
          Welcome back, {user?.name}!
        </h1>
        <p className="text-muted-foreground mt-1">
          Here's an overview of your groups and activity
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Groups</p>
                <p className="text-3xl font-bold">{groups.length}</p>
              </div>
              <Users className="h-10 w-10 text-primary/50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Your Role</p>
                <Badge
                  variant={isAdmin ? "default" : "secondary"}
                  className="mt-1"
                >
                  {isAdmin ? "Admin" : "Member"}
                </Badge>
              </div>
              <Settings className="h-10 w-10 text-primary/50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Quick Actions</p>
                <div className="flex gap-2 mt-2">
                  <Button
                    size="sm"
                    onClick={() => router.push("/groups")}
                    variant="outline"
                  >
                    View Groups
                  </Button>
                  {isAdmin && (
                    <Button
                      size="sm"
                      onClick={() => router.push("/admin/groups")}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Create Group
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Dashboard Tables Section */}
      <Tabs defaultValue="overview">
        <TabsList className="mb-4 grid w-full grid-cols-4 lg:grid-cols-7">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger
            value="notifications"
            className="flex items-center gap-1"
          >
            <Bell className="h-4 w-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="groups" className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            Groups
          </TabsTrigger>
          <TabsTrigger value="meetings" className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            Meetings
          </TabsTrigger>
          <TabsTrigger value="invites" className="flex items-center gap-1">
            <UserPlus className="h-4 w-4" />
            Invites
          </TabsTrigger>
          {isAdmin && (
            <>
              <TabsTrigger value="members" className="flex items-center gap-1">
                <UserMinus className="h-4 w-4" />
                Members
              </TabsTrigger>
              <TabsTrigger value="users" className="flex items-center gap-1">
                <Settings className="h-4 w-4" />
                Users
              </TabsTrigger>
            </>
          )}
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview">
          {/* Recent Groups */}
          <Card className="mb-6">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Recent Groups
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push("/groups")}
              >
                View All
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p className="text-muted-foreground text-center py-8">
                  Loading groups...
                </p>
              ) : groups.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {groups.slice(0, 6).map((group) => (
                    <div
                      key={group.id}
                      onClick={() => router.push("/groups")}
                      className="p-4 border rounded-lg cursor-pointer hover:bg-muted transition-colors"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium truncate">{group.name}</h3>
                        <Badge variant="secondary" className="text-xs">
                          Group
                        </Badge>
                      </div>
                      {group.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                          {group.description}
                        </p>
                      )}
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Users className="h-4 w-4" />
                        <span>
                          {group.memberCount || group.members?.length || 0}{" "}
                          members
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">
                    No groups found yet
                  </p>
                  {isAdmin && (
                    <Button onClick={() => router.push("/admin/groups")}>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Your First Group
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Admin Section */}
          {isAdmin && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Admin Management
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div
                    onClick={() => router.push("/admin/groups")}
                    className="p-4 border rounded-lg cursor-pointer hover:bg-muted transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Users className="h-5 w-5 text-primary" />
                      <div>
                        <h3 className="font-medium">Manage Groups</h3>
                        <p className="text-sm text-muted-foreground">
                          Create and manage groups, invite members
                        </p>
                      </div>
                    </div>
                  </div>
                  <div
                    onClick={() => router.push("/admin/groups")}
                    className="p-4 border rounded-lg cursor-pointer hover:bg-muted transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <UserPlus className="h-5 w-5 text-primary" />
                      <div>
                        <h3 className="font-medium">Invite Users</h3>
                        <p className="text-sm text-muted-foreground">
                          Add new members to your groups
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications">
          <NotificationsTable />
        </TabsContent>

        {/* Groups Tab */}
        <TabsContent value="groups">
          <GroupsTable />
        </TabsContent>

        {/* Meetings Tab */}
        <TabsContent value="meetings">
          <MeetingsTable />
        </TabsContent>

        {/* Invites Tab */}
        <TabsContent value="invites">
          <GroupInvitesTable />
        </TabsContent>

        {/* Members Tab (Admin Only) */}
        {isAdmin && (
          <TabsContent value="members">
            <MembersTable />
          </TabsContent>
        )}

        {/* Users Tab (Admin Only) */}
        {isAdmin && (
          <TabsContent value="users">
            <UsersTable />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}

