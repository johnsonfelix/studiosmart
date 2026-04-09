"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { Check, X, User, ArrowUpRight, Loader2, ShieldCheck, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

export function AdminWalletApprovalList({ initialRequests }: { initialRequests: any[] }) {
  const router = useRouter();
  const [requests, setRequests] = useState(initialRequests);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const handleAction = async (transactionId: string, status: "APPROVED" | "REJECTED") => {
    setProcessingId(transactionId);
    try {
      const res = await fetch("/api/wallet/process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transactionId, status }),
      });

      if (!res.ok) throw new Error("Failed to process");

      toast.success(`Request ${status === "APPROVED" ? "Approved" : "Rejected"} successfully`);
      setRequests((prev) => prev.filter((r) => r.id !== transactionId));
      router.refresh();
    } catch (error) {
      toast.error("Error processing request");
    } finally {
      setProcessingId(null);
    }
  };

  if (requests.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-20 text-center space-y-3">
        <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center">
          <ShieldCheck className="w-8 h-8 text-emerald-500" />
        </div>
        <div>
          <h3 className="text-lg font-semibold">Queue Clear</h3>
          <p className="text-muted-foreground text-sm max-w-xs">There are no pending wallet deposits to verify at the moment.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-muted/30 text-left">
            <th className="px-6 py-4 font-medium text-muted-foreground">Studio / Owner</th>
            <th className="px-6 py-4 font-medium text-muted-foreground">Reference</th>
            <th className="px-6 py-4 font-medium text-muted-foreground text-right">Amount</th>
            <th className="px-6 py-4 font-medium text-muted-foreground">Request Date</th>
            <th className="px-6 py-4 font-medium text-muted-foreground text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {requests.map((req) => (
            <tr key={req.id} className="border-b hover:bg-muted/5 transition-colors group">
              <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">
                    {req.studio.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="font-semibold text-foreground flex items-center gap-1.5">
                      {req.studio.name}
                      <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-40 transition-opacity" />
                    </div>
                    <div className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
                      <User className="w-3 h-3" /> {req.studio.owner.name}
                    </div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4">
                <Badge variant="outline" className="font-mono text-[10px] tracking-tighter bg-muted/30 border-muted/60">
                  {req.referenceNumber}
                </Badge>
              </td>
              <td className="px-6 py-4 text-right font-bold text-base">
                ₹{req.amount.toLocaleString()}
              </td>
              <td className="px-6 py-4 text-muted-foreground text-xs">
                {format(new Date(req.createdAt), "MMM d, yyyy • p")}
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center justify-end gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50"
                    onClick={() => handleAction(req.id, "REJECTED")}
                    disabled={!!processingId}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    className="h-8 px-3 gap-1.5 bg-emerald-600 hover:bg-emerald-700 shadow-sm"
                    onClick={() => handleAction(req.id, "APPROVED")}
                    disabled={!!processingId}
                  >
                    {processingId === req.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <Check className="h-4 w-4" />
                        Approve
                      </>
                    )}
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      
      <div className="p-4 bg-amber-500/5 border-t border-amber-500/10 flex items-center gap-2 text-[10px] text-amber-700 font-medium">
        <AlertCircle className="w-3.5 h-3.5" />
        Reminder: Always cross-verify the reference number in your business bank statement before clicking Approve.
      </div>
    </div>
  );
}
