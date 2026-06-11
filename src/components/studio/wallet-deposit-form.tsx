"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Loader2, CheckCircle2, Zap, Clock } from "lucide-react";

export function WalletDepositForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  // Offline form state
  const [offlineAmount, setOfflineAmount] = useState("");
  const [reference, setReference] = useState("");

  // Online form state
  const [onlineAmount, setOnlineAmount] = useState("");

  useEffect(() => {
    // Load Razorpay Checkout Script
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handleOfflineSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!offlineAmount || !reference) {
      toast.error("Please fill in all fields");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/wallet/deposit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: offlineAmount, referenceNumber: reference }),
      });

      if (!res.ok) throw new Error("Failed to submit request");

      toast.success("Request submitted successfully!");
      setOfflineAmount("");
      setReference("");
      router.refresh();
    } catch (error) {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleOnlineSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!onlineAmount || parseFloat(onlineAmount) < 1) {
      toast.error("Please enter a valid amount (Minimum ₹1)");
      return;
    }

    setLoading(true);
    try {
      // 1. Create order on server
      const orderRes = await fetch("/api/wallet/razorpay/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: onlineAmount }),
      });

      if (!orderRes.ok) throw new Error("Failed to create order");
      const orderData = await orderRes.json();

      // 2. Initialize Razorpay Checkout
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "StudioSmart",
        description: "Wallet Recharge",
        order_id: orderData.orderId,
        handler: async function (response: any) {
          try {
            toast.loading("Verifying payment...", { id: "payment-verify" });
            
            // 3. Verify payment on server
            const verifyRes = await fetch("/api/wallet/razorpay/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                amount: onlineAmount,
              }),
            });

            if (!verifyRes.ok) throw new Error("Verification failed");

            toast.success("Payment successful! Wallet recharged instantly.", { id: "payment-verify" });
            setOnlineAmount("");
            router.refresh();
          } catch (error) {
            toast.error("Payment verification failed. Contact support.", { id: "payment-verify" });
          }
        },
        theme: {
          color: "#0f172a",
        },
      };

      const rzp = new (window as any).Razorpay(options);
      
      rzp.on("payment.failed", function (response: any) {
        toast.error(`Payment failed: ${response.error.description}`);
      });

      rzp.open();
    } catch (error) {
      toast.error("Failed to initiate payment. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <Tabs defaultValue="online" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6 h-12">
          <TabsTrigger value="online" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-semibold gap-2">
            <Zap className="h-4 w-4" /> Instant Recharge
          </TabsTrigger>
          <TabsTrigger value="offline" className="font-semibold gap-2">
            <Clock className="h-4 w-4" /> Manual Recharge
          </TabsTrigger>
        </TabsList>

        <TabsContent value="online" className="mt-0">
          <div className="flex flex-col gap-6 max-w-md mx-auto pt-4 pb-2">
            <div className="text-center space-y-2 mb-2">
              <h3 className="font-semibold text-lg">Online Payment</h3>
              <p className="text-sm text-muted-foreground">Pay via UPI, Cards, or Netbanking. Your wallet will be credited instantly.</p>
            </div>
            
            <form onSubmit={handleOnlineSubmit} className="space-y-6">
              <div className="space-y-3">
                <Label htmlFor="online-amount" className="text-sm font-medium">Amount to Recharge (₹)</Label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold text-lg">₹</span>
                  <Input
                    id="online-amount"
                    placeholder="500"
                    type="number"
                    min="1"
                    value={onlineAmount}
                    onChange={(e) => setOnlineAmount(e.target.value)}
                    className="pl-9 h-14 text-lg font-medium bg-muted/30 border-primary/20 focus-visible:ring-primary/30"
                    required
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full h-14 text-base font-semibold shadow-md hover:shadow-lg transition-all"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Zap className="mr-2 h-5 w-5" />
                    Pay via Razorpay
                  </>
                )}
              </Button>
            </form>
          </div>
        </TabsContent>

        <TabsContent value="offline" className="mt-0">
          <div className="flex flex-col md:flex-row gap-8 items-start pt-4 border-t mt-4">
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
              
              <form onSubmit={handleOfflineSubmit} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="offline-amount">Amount (₹)</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">₹</span>
                      <Input
                        id="offline-amount"
                        placeholder="0.00"
                        type="number"
                        min="1"
                        value={offlineAmount}
                        onChange={(e) => setOfflineAmount(e.target.value)}
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
                  variant="outline"
                  className="w-full h-11 text-sm font-semibold shadow-sm active:scale-[0.98] transition-all"
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
        </TabsContent>
      </Tabs>
    </div>
  );
}
