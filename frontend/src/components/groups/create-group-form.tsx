import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { groupApi } from "@/lib/api/groups-api";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Plus, Users, X } from "lucide-react";

interface CreateGroupFormProps {
  onGroupCreated?: (groupId: number) => void;
  onCancel?: () => void;
}

export function CreateGroupForm({
  onGroupCreated,
  onCancel,
}: CreateGroupFormProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || name.length < 2) {
      toast.error("Group name must be at least 2 characters");
      return;
    }

    setIsLoading(true);
    try {
      console.log(
        "Creating group with name:",
        name,
        "description:",
        description
      );
      const response = await groupApi.createGroup({ name, description });
      console.log("Create group response:", response);

      if (response.success) {
        toast.success(`Group "${name}" created successfully`);
        setName("");
        setDescription("");
        onGroupCreated?.(response.data?.id);
      } else {
        console.error("Group creation failed:", response.message);
        toast.error(response.message || "Failed to create group");
      }
    } catch (error) {
      console.error("Error creating group:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "An error occurred while creating the group"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="relative">
      {onCancel && (
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 z-10 p-1 hover:bg-gray-100 rounded-full transition-colors"
        >
          <X className="h-5 w-5 text-muted-foreground" />
        </button>
      )}
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Create New Group
        </CardTitle>
        <CardDescription>
          Create a new group and become its first admin member
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="group-name">Group Name</Label>
            <Input
              id="group-name"
              placeholder="e.g., Development Team"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isLoading}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="group-description">Description</Label>
            <Input
              id="group-description"
              placeholder="Brief description of the group"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isLoading}
            />
          </div>
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full"
            onClick={(e) => {
              console.log("Create Group button clicked");
              // Form will submit via onSubmit handler
            }}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating Group...
              </>
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" />
                Create Group
              </>
            )}
          </Button>
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              disabled={isLoading}
              className="w-full mt-2"
              onClick={onCancel}
            >
              Cancel
            </Button>
          )}
        </form>
      </CardContent>
    </Card>
  );
}
