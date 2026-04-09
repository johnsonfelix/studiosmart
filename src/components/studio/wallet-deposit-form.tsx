"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Loader2, CheckCircle2 } from "lucide-react";

export function WalletDepositForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [amount, setAmount] = useState("");
  const [reference, setReference] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !reference) {
      toast.error("Please fill in all fields");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/wallet/deposit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount, referenceNumber: reference }),
      });

      if (!res.ok) throw new Error("Failed to submit request");

      toast.success("Request submitted successfully!");
      setAmount("");
      setReference("");
      router.refresh();
    } catch (error) {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row gap-8 items-start">
      {/* QR Code Section */}
      <div className="w-full md:w-48 space-y-3">
        <Label className="text-xs uppercase text-muted-foreground font-bold tracking-wider">Step 1: Scan & Pay</Label>
        <div className="aspect-square bg-white p-3 rounded-xl border-2 border-primary/10 shadow-sm relative group overflow-hidden">
          <img 
            src="/images/payment-qr.png" 
            alt="Payment QR Code"
            className="w-full h-full object-contain"
            onError={(e) => {
              (e.target as any).src = "https://raw.githubusercontent.com/sonyl-07/studiosmart-assets/main/qr-placeholder.png";
            }}
          />
          <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
        </div>
        <p className="text-[10px] text-muted-foreground text-center">Scan using Google Pay, PhonePe, or any UPI app.</p>
      </div>

      {/* Form Section */}
      <div className="flex-1 w-full flex flex-col gap-6">
        <Label className="text-xs uppercase text-muted-foreground font-bold tracking-wider underline decoration-primary/30 underline-offset-4">Step 2: Enter Payment Details</Label>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount (₹)</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">₹</span>
                <Input
                  id="amount"
                  placeholder="0.00"
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="pl-7 bg-muted/20"
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="reference">Reference / Transaction ID</Label>
              <Input
                id="reference"
                placeholder="UPI Ref No. / Transaction ID"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                className="bg-muted/20"
                required
              />
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full h-11 text-sm font-semibold shadow-md active:scale-[0.98] transition-all"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting Request...
              </>
            ) : (
              <>
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Submit Verification Request
              </>
            )}
          </Button>
          
          <p className="text-[11px] text-center text-muted-foreground">
            Payments are manually verified by our team. Approval usually takes 15-30 minutes.
          </p>
        </form>
      </div>
    </div>
  );
}
