import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Calendar } from "lucide-react";

interface GroupCardProps {
  groupName: string;
  description?: string;
  memberCount: number;
  onViewDetails?: () => void;
  onLeaveGroup?: () => void;
  isAdmin?: boolean;
}

export function GroupCard({
  groupName,
  description,
  memberCount,
  onViewDetails,
  onLeaveGroup,
  isAdmin,
}: GroupCardProps) {
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
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onViewDetails}
            className="flex-1"
          >
            View Details
          </Button>
          {!isAdmin && (
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
