"use client";

import { useEffect, useState } from "react";
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
import { UserMinus, Users, Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface MembershipData {
  id: number;
  userId: number;
  groupId: number;
  joined_at: Date;
  createdAt: Date;
  updatedAt: Date;
  user?: {
    id: number;
    name: string;
    email: string;
    role: string;
  };
  group?: {
    id: number;
    name: string;
    description: string;
    memberCount?: number;
  };
}

export function MembersTable() {
  const { user } = useAuthStore();
  const [memberships, setMemberships] = useState<MembershipData[]>([]);
  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isAdmin = user?.role === "admin";

  useEffect(() => {
    fetchMemberships();
  }, []);

  const fetchMemberships = async () => {
    try {
      setLoading(true);
      const response = await membershipsApi.getAllMemberships();
      if (response.success) {
        setMemberships(response.data || []);
      }
    } catch (err: any) {
      setError(err.message || "Failed to fetch memberships");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveMember = async (membershipId: number) => {
    if (!confirm("Are you sure you want to remove this member from the group?"))
      return;

    try {
      setRemoving(membershipId);
      const response = await membershipsApi.leaveGroup(
        memberships.find((m) => m.id === membershipId)?.groupId || 0
      );
      if (response.success) {
        toast.success("Member removed from group");
        fetchMemberships();
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to remove member");
    } finally {
      setRemoving(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Group Members
        </CardTitle>
        <Button variant="outline" size="sm" onClick={fetchMemberships}>
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
                  <TableHead>Member</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Group</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Joined At</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {memberships.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      No memberships found
                    </TableCell>
                  </TableRow>
                ) : (
                  memberships.map((membership) => (
                    <TableRow key={membership.id}>
                      <TableCell className="font-medium">
                        #{membership.id}
                      </TableCell>
                      <TableCell className="font-medium">
                        {membership.user?.name || `User #${membership.userId}`}
                      </TableCell>
                      <TableCell>{membership.user?.email || "-"}</TableCell>
                      <TableCell>
                        {membership.group?.name ||
                          `Group #${membership.groupId}`}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            membership.user?.role === "admin"
                              ? "default"
                              : "secondary"
                          }
                        >
                          {membership.user?.role || "member"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">
                        {formatDate(
                          String(membership.joined_at || membership.createdAt)
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="destructive"
                          size="sm"
                          disabled={removing === membership.id}
                          onClick={() => handleRemoveMember(membership.id)}
                          title="Remove from group"
                        >
                          {removing === membership.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <UserMinus className="h-4 w-4" />
                          )}
                        </Button>
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
  );
}
