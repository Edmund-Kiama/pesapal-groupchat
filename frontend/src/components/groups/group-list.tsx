import { useState, useEffect } from "react";
import { GroupCard } from "./group-card";
import { groupApi } from "@/lib/api/groups-api";
import { useAuthStore } from "@/lib/stores/auth-store";
import { GroupMember } from "@/lib/typings/models";
import { Loader2 } from "lucide-react";

interface GroupListProps {
  onViewGroupDetails?: (groupId: number) => void;
}

export function GroupList({ onViewGroupDetails }: GroupListProps) {
  const [memberships, setMemberships] = useState<GroupMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuthStore();

  useEffect(() => {
    fetchMyGroups();
  }, [user?.id]);

  const fetchMyGroups = async () => {
    try {
      const response = await groupApi.getMyGroups();
      if (response.success) {
        setMemberships(response.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch groups:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (memberships.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground mb-4">
          You don't belong to any groups yet.
        </p>
        <p className="text-sm text-muted-foreground">
          Ask an admin to invite you to a group or create a new group.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {memberships.map((membership) => (
        <GroupCard
          key={membership.id}
          groupName={membership.group?.name || "Unknown Group"}
          description={membership.group?.description || undefined}
          memberCount={membership.group?.members?.length || 0}
          onViewDetails={() => onViewGroupDetails?.(membership.groupId)}
        />
      ))}
    </div>
  );
}
