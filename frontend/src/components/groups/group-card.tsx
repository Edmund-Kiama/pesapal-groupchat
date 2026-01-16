import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, MessageCircle } from "lucide-react";

interface GroupCardProps {
  groupName: string;
  description?: string;
  memberCount: number;
  creatorId?: number;
  currentUserId?: number;
  onOpenChat?: () => void;
  onLeaveGroup?: () => void;
  onDeleteGroup?: () => void;
  onManageMeetings?: () => void;
}

export function GroupCard({
  groupName,
  description,
  memberCount,
  creatorId,
  currentUserId,
  onOpenChat,
  onLeaveGroup,
  onDeleteGroup,
  onManageMeetings,
}: GroupCardProps) {
  const isCreator = creatorId === currentUserId;

  return (
    <Card className="w-full hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold line-clamp-1">
          {groupName}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {description && (
          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
            {description}
          </p>
        )}
        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            <span>{memberCount} members</span>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="default" size="sm" onClick={onOpenChat}>
            <MessageCircle className="mr-1 h-4 w-4" />
            Open Chat
          </Button>
          {isCreator && onManageMeetings && (
            <Button variant="outline" size="sm" onClick={onManageMeetings}>
              Meetings
            </Button>
          )}
          {isCreator ? (
            <Button
              variant="destructive"
              size="sm"
              onClick={onDeleteGroup}
              className="text-white hover:text-white"
            >
              Delete
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              onClick={onLeaveGroup}
              className="text-red-500 hover:text-red-600 hover:bg-red-50"
            >
              Leave
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
