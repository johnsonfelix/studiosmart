"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Trash2, AlertTriangle, Loader2 } from "lucide-react";
import { deleteMagicEvent } from "@/actions/magic.actions";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

interface DeleteEventButtonProps {
  albumId: string;
}

export function DeleteEventButton({ albumId }: DeleteEventButtonProps) {
  const [isConfirming, setIsConfirming] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const result = await deleteMagicEvent(albumId);
      if (result.success) {
        toast.success("Event deleted successfully");
        router.push("/studio/magic");
      } else {
        toast.error(result.error || "Failed to delete event");
        setIsConfirming(false);
      }
    } catch (err) {
      toast.error("An unexpected error occurred");
      setIsConfirming(false);
    } finally {
      setIsDeleting(false);
    }
  };

  if (isConfirming) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs text-red-500 font-medium hidden md:inline flex items-center gap-1">
          <AlertTriangle className="w-3 h-3" />
          Are you sure? This is permanent.
        </span>
        <Button 
          variant="destructive" 
          size="sm"
          onClick={handleDelete}
          disabled={isDeleting}
          className="gap-2"
        >
          {isDeleting ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Trash2 className="w-4 h-4" />
          )}
          Confirm Delete
        </Button>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => setIsConfirming(false)}
          disabled={isDeleting}
        >
          Cancel
        </Button>
      </div>
    );
  }

  return (
    <Button 
      variant="ghost" 
      size="sm"
      onClick={() => setIsConfirming(true)}
      className="text-muted-foreground hover:text-red-600 gap-2"
    >
      <Trash2 className="w-4 h-4" />
      Delete Event
    </Button>
  );
}
