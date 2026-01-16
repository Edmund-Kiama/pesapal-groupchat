"use client";

import { useEffect, useState } from "react";
import { Group, UserRole } from "@/lib/typings/models";
import { membershipsApi } from "@/lib/api/memberships-api";
import { useAuthStore } from "@/lib/stores/auth-store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Users, Eye, Loader2, AlertCircle, Trash2 } from "lucide-react";
import { DeleteGroupDialog } from "./dialogs";

export function GroupsTable() {
  const { user } = useAuthStore();
  const [groups, setGroups] = useState<
    (Group & { creator?: any; memberCount?: number })[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);

  const isAdmin = user?.role === UserRole.ADMIN;

  useEffect(() => {
    if (user) {
      fetchGroups();
    }
  }, [user]);

  const fetchGroups = async () => {
    try {
      setLoading(true);
      let response;
      if (isAdmin) {
        // Admin sees only groups they created
        response = await membershipsApi.getGroupsByCreator(user!.id);
      } else {
        // Members see all groups (or can be filtered differently)
        response = await membershipsApi.getAllGroups();
      }
      if (response.success) {
        setGroups(response.data || []);
      }
    } catch (err: any) {
      setError(err.message || "Failed to fetch groups");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (group: Group) => {
    setSelectedGroup(group);
    setDeleteDialogOpen(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Filter groups for non-admins to show only their created groups
  const displayedGroups = isAdmin
    ? groups
    : groups.filter((g) => g.created_by === user?.id);

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            {isAdmin ? "My Groups" : "Groups"}
          </CardTitle>
          <Button variant="outline" size="sm" onClick={fetchGroups}>
            Refresh
          </Button>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-8 text-red-500">
              <AlertCircle className="h-5 w-5 mr-2" />
              {error}
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Created By</TableHead>
                    <TableHead>Members</TableHead>
                    <TableHead>Created At</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {displayedGroups.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        No groups found
                      </TableCell>
                    </TableRow>
                  ) : (
                    displayedGroups.map((group) => (
                      <TableRow key={group.id}>
                        <TableCell className="font-medium">
                          #{group.id}
                        </TableCell>
                        <TableCell className="font-medium">
                          {group.name}
                        </TableCell>
                        <TableCell className="max-w-xs truncate">
                          {group.description || "-"}
                        </TableCell>
                        <TableCell>
                          {group.creator?.name || `User #${group.created_by}`}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {group.memberCount || 0} members
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">
                          {formatDate(String(group.createdAt))}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                            {isAdmin && group.created_by === user?.id && (
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleDeleteClick(group)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Group Dialog */}
      <DeleteGroupDialog
        group={selectedGroup!}
        isOpen={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setSelectedGroup(null);
        }}
        onSuccess={fetchGroups}
      />
    </>
  );
}
