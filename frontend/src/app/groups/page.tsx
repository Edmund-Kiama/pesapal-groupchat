"use client";

import { useState } from "react";
import { useAuthStore } from "@/lib/stores/auth-store";
import { UserRole } from "@/lib/typings/models";
import { CreateGroupForm } from "@/components/groups/create-group-form";
import { GroupList } from "@/components/groups/group-list";
import { PendingGroupInvites } from "@/components/groups/pending-group-invites";
import { PendingMeetingInvites } from "@/components/groups/pending-meeting-invites";
import { CreateMeetingForm } from "@/components/groups/create-meeting-form";
import { SentGroupInvites } from "@/components/groups/sent-group-invites";
import { InviteUsersToGroup } from "@/components/groups/invite-users-to-group";
import { LeaveGroupDialog } from "@/components/groups/leave-group-dialog";
import { DeleteGroupDialog } from "@/components/groups/delete-group-dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Users, Plus, Mail, UserPlus, Bell, Calendar } from "lucide-react";

export default function GroupsPage() {
  const { user } = useAuthStore();
  const isAdmin = user?.role === UserRole.ADMIN;
  const [refreshKey, setRefreshKey] = useState(0);
  const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false);
  const [actionMessage, setActionMessage] = useState<{
    type: "success" | "error" | "";
    text: string;
  }>({ type: "", text: "" });

  // Dialog states
  const [leaveDialogOpen, setLeaveDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null);
  const [selectedGroupName, setSelectedGroupName] = useState("");
  const [isCreateMeetingOpen, setIsCreateMeetingOpen] = useState(false);

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

  const handleOpenLeaveDialog = (groupId: number, groupName: string) => {
    setSelectedGroupId(groupId);
    setSelectedGroupName(groupName);
    setLeaveDialogOpen(true);
  };

  const handleOpenDeleteDialog = (groupId: number, groupName: string) => {
    setSelectedGroupId(groupId);
    setSelectedGroupName(groupName);
    setDeleteDialogOpen(true);
  };

  const handleLeaveOrDeleteSuccess = () => {
    setRefreshKey((prev) => prev + 1);
    setActionMessage({
      type: "success",
      text: selectedGroupId ? "Group action completed successfully!" : "",
    });
    setTimeout(() => setActionMessage({ type: "", text: "" }), 3000);
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Groups</h1>
        <div className="flex gap-2">
          {isAdmin && (
            <Button
              onClick={() => setIsCreateMeetingOpen(true)}
              className="flex items-center gap-2"
            >
              <Calendar className="h-4 w-4" />
              Create Group Meeting
            </Button>
          )}
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

      <Tabs defaultValue="my-groups">
        <TabsList className="mb-4">
          <TabsTrigger value="my-groups">
            <Users className="h-4 w-4 mr-2" />
            My Groups
          </TabsTrigger>
          <TabsTrigger value="my-invitations">
            <Bell className="h-4 w-4 mr-2" />
            My Invitations
          </TabsTrigger>
          <TabsTrigger value="my-meetings">
            <Calendar className="h-4 w-4 mr-2" />
            My Meetings
          </TabsTrigger>
          {isAdmin && (
            <TabsTrigger value="sent-invites">
              <Mail className="h-4 w-4 mr-2" />
              Sent Invites
            </TabsTrigger>
          )}
          {isAdmin && (
            <TabsTrigger value="invite-users">
              <UserPlus className="h-4 w-4 mr-2" />
              Invite Users
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="my-groups">
          <GroupList
            key={refreshKey}
            onLeaveGroup={(groupId, groupName) =>
              handleOpenLeaveDialog(groupId, groupName)
            }
            onDeleteGroup={(groupId, groupName) =>
              handleOpenDeleteDialog(groupId, groupName)
            }
          />
        </TabsContent>

        <TabsContent value="my-invitations">
          <PendingGroupInvites onInviteAccepted={handleInviteAccepted} />
        </TabsContent>

        <TabsContent value="my-meetings">
          <PendingMeetingInvites />
        </TabsContent>

        {isAdmin && (
          <TabsContent value="sent-invites">
            <SentGroupInvites
              onInviteCancelled={() => {
                setRefreshKey((prev) => prev + 1);
              }}
            />
          </TabsContent>
        )}

        {isAdmin && (
          <TabsContent value="invite-users">
            <InviteUsersToGroup
              onInviteSent={() => {
                setRefreshKey((prev) => prev + 1);
              }}
            />
          </TabsContent>
        )}
      </Tabs>

      {/* Centered Modal Overlay for Create Group */}
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

      {/* Centered Modal Overlay for Create Meeting */}
      {isCreateMeetingOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setIsCreateMeetingOpen(false)}
          />
          {/* Modal Content */}
          <div className="relative z-10 w-full max-w-md mx-4">
            <CreateMeetingForm
              onMeetingCreated={() => {
                setRefreshKey((prev) => prev + 1);
                setIsCreateMeetingOpen(false);
                setActionMessage({
                  type: "success",
                  text: "Meeting created successfully!",
                });
                setTimeout(
                  () => setActionMessage({ type: "", text: "" }),
                  3000
                );
              }}
              onCancel={() => setIsCreateMeetingOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Leave Group Dialog */}
      {selectedGroupId && (
        <LeaveGroupDialog
          groupId={selectedGroupId}
          groupName={selectedGroupName}
          isOpen={leaveDialogOpen}
          onClose={() => {
            setLeaveDialogOpen(false);
            setSelectedGroupId(null);
            setSelectedGroupName("");
          }}
          onSuccess={handleLeaveOrDeleteSuccess}
        />
      )}

      {/* Delete Group Dialog */}
      {selectedGroupId && (
        <DeleteGroupDialog
          groupId={selectedGroupId}
          groupName={selectedGroupName}
          isOpen={deleteDialogOpen}
          onClose={() => {
            setDeleteDialogOpen(false);
            setSelectedGroupId(null);
            setSelectedGroupName("");
          }}
          onSuccess={handleLeaveOrDeleteSuccess}
        />
      )}
    </div>
  );
}

