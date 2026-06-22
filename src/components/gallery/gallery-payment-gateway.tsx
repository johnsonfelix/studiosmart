"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { CreditCard, Loader2, ShieldCheck, Camera } from "lucide-react";

interface GalleryPaymentGatewayProps {
  albumToken: string;
  albumTitle: string;
  studioName: string;
  price: number;
}

export function GalleryPaymentGateway({
  albumToken,
  albumTitle,
  studioName,
  price,
}: GalleryPaymentGatewayProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    // Load Razorpay checkout script
    const existingScript = document.getElementById("razorpay-checkout-js");
    if (!existingScript) {
      const script = document.createElement("script");
      script.id = "razorpay-checkout-js";
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  const handlePayment = async () => {
    if (!(window as any).Razorpay) {
      setError("Payment gateway is loading. Please try again in a moment.");
      return;
    }
    setLoading(true);
    setError("");

    try {
      const orderRes = await fetch(`/api/gallery/${albumToken}/razorpay/create-order`, {
        method: "POST",
      });
      if (!orderRes.ok) throw new Error("Failed to create order");
      const orderData = await orderRes.json();

      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: studioName,
        description: `Payment for ${albumTitle}`,
        order_id: orderData.orderId,
        handler: async function (response: any) {
          try {
            setLoading(true);
            const verifyRes = await fetch(`/api/gallery/${albumToken}/razorpay/verify`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });
            
            if (!verifyRes.ok) throw new Error("Verification failed");
            
            // Payment successful, refresh the page to unlock gallery
            router.refresh();
          } catch (error: any) {
            setError(error.message || "Payment verification failed. Contact support.");
            setLoading(false);
          }
        },
        theme: { color: "#0f172a" },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on("payment.failed", function (response: any) {
        setError(`Payment failed: ${response.error.description}`);
      });
      rzp.open();
    } catch (error: any) {
      setError(error.message || "Failed to initiate payment. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] p-4 font-sans relative overflow-hidden">
      {/* Dynamic Background Effects */}
      <div className="absolute top-[-15%] left-[-10%] w-[50%] h-[50%] bg-blue-600/10 rounded-full blur-[120px] animate-pulse pointer-events-none" />
      <div className="absolute bottom-[-15%] right-[-10%] w-[50%] h-[50%] bg-purple-600/10 rounded-full blur-[120px] animate-pulse pointer-events-none" />

      <div className="max-w-md w-full bg-white/[0.03] backdrop-blur-2xl border border-white/10 rounded-3xl p-8 shadow-2xl relative z-10 flex flex-col items-center text-center transform transition-all hover:scale-[1.01] duration-500">
        <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-blue-500/20">
          <Camera className="w-10 h-10 text-white" />
        </div>
        
        <h1 className="text-2xl font-bold text-white mb-2">{albumTitle}</h1>
        <p className="text-sm text-white/50 mb-8 font-medium tracking-wide">Captured by <span className="text-white/80">{studioName}</span></p>

        <div className="w-full bg-white/5 border border-white/10 rounded-2xl p-6 mb-8 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <p className="text-sm text-white/60 mb-2 uppercase tracking-wider font-semibold">Total Amount</p>
          <div className="text-5xl font-black text-white tracking-tighter">
            ₹{price.toFixed(2)}
          </div>
        </div>

        {error && (
          <div className="w-full bg-red-500/10 border border-red-500/20 text-red-400 text-sm p-4 rounded-xl mb-6 text-left flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 shrink-0 mt-0.5" />
            <p>{error}</p>
          </div>
        )}

        <button
          onClick={handlePayment}
          disabled={loading}
          className="w-full relative group overflow-hidden bg-white text-black font-bold py-4 rounded-2xl transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed hover:shadow-[0_0_40px_rgba(255,255,255,0.3)] hover:scale-[1.02] active:scale-[0.98]"
        >
          <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
          {loading ? (
            <div className="flex items-center justify-center gap-3">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Processing...</span>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-3">
              <CreditCard className="w-5 h-5" />
              <span>Unlock Gallery Now</span>
            </div>
          )}
        </button>

        <div className="mt-6 flex items-center justify-center gap-2 text-xs text-white/40">
          <ShieldCheck className="w-4 h-4" />
          <span>Secure payments processed by Razorpay</span>
        </div>
      </div>
    </div>
  );
}
