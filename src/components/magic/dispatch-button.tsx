"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Mail, Loader2, Sparkles } from "lucide-react";
import { dispatchMagicEmails } from "@/actions/magic.actions";
import toast from "react-hot-toast";

interface DispatchButtonProps {
  albumId: string;
  pendingCount: number;
}

export function DispatchButton({ albumId, pendingCount }: DispatchButtonProps) {
  const [isDispatching, setIsDispatching] = useState(false);

  const handleDispatch = async () => {
    if (pendingCount === 0) {
      toast.error("No pending guests to process.");
      return;
    }

    setIsDispatching(true);
    toast.loading("Analyzing photos and dispatching emails...", { id: "dispatch" });

    try {
      const result = await dispatchMagicEmails(albumId);
      
      if (result?.error) {
        toast.error(result.error, { id: "dispatch" });
      } else {
        toast.success(result?.message || "Dispatched successfully!", { id: "dispatch", duration: 5000 });
        // Optionally refresh the page to update stats
        setTimeout(() => window.location.reload(), 2000);
      }
    } catch (err) {
      console.error(err);
      toast.error("An unexpected error occurred.", { id: "dispatch" });
    } finally {
      setIsDispatching(false);
    }
  };

  return (
    <Button 
      onClick={handleDispatch} 
      disabled={isDispatching || pendingCount === 0}
      className={`w-full gap-2 transition-all duration-300 ${pendingCount > 0 && !isDispatching ? 'bg-blue-600 hover:bg-blue-500 shadow-[0_0_15px_rgba(37,99,235,0.4)]' : ''}`}
      size="lg"
    >
      {isDispatching ? (
        <>
          <Loader2 className="w-5 h-5 animate-spin" />
          Processing AI Matches...
        </>
      ) : (
        <>
          {pendingCount > 0 ? <Sparkles className="w-5 h-5" /> : <Mail className="w-5 h-5" />}
          Dispatch {pendingCount} Magic Emails
        </>
      )}
    </Button>
  );
}
