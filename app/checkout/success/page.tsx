"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Clock, Package, ArrowRight, Home, CreditCard, AlertCircle } from "lucide-react";
import { PriceDisplay } from "@/components/price-display";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { trackEvent } from "@/lib/tracking";

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (!orderId) {
      setError("Order ID not found");
      setLoading(false);
      return;
    }

    const fetchOrder = async () => {
      try {
        const res = await fetch(`/api/orders/${orderId}`);
        if (!res.ok) throw new Error("Failed to fetch order details");
        const data = await res.json();
        setOrder(data);
        
        // Track Purchase Event
        if (data && data._id) {
          trackEvent('purchase', {
             transaction_id: data._id,
             value: data.finalAmount,
             currency: 'USD',
             items: data.items.map((item: any) => ({
                item_id: item.package, // Package ID
                item_name: item.name,
                price: item.price,
                quantity: item.durationMonths || 1
             }))
          });
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
        <p className="text-muted-foreground animate-pulse">Loading order details...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <Card className="max-w-md mx-auto mt-20 border-destructive/20 bg-destructive/5">
        <CardContent className="pt-6 text-center space-y-4">
          <AlertCircle className="w-12 h-12 text-destructive mx-auto" />
          <CardTitle>Oops! Something went wrong</CardTitle>
          <p className="text-muted-foreground">{error || "Could not load order information."}</p>
          <Button onClick={() => router.push("/dashboard/billing")} className="w-full">
            Go to My Orders
          </Button>
        </CardContent>
      </Card>
    );
  }

  const isApproved = order.status === "approved";
  const isPending = order.status === "pending";
  const isRejected = order.status === "rejected";

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Summary Card */}
      <Card className="border-2 border-primary/10 shadow-xl overflow-hidden">
        <div className={`h-2 w-full ${isApproved ? "bg-green-500" : isRejected ? "bg-destructive" : "bg-primary"}`} />
        <CardContent className="pt-8 pb-10 text-center space-y-6">
          <div className="flex justify-center">
            {isApproved ? (
              <div className="p-4 bg-green-500/10 rounded-full">
                <CheckCircle2 className="w-16 h-16 text-green-500" />
              </div>
            ) : isRejected ? (
              <div className="p-4 bg-destructive/10 rounded-full">
                <AlertCircle className="w-16 h-16 text-destructive" />
              </div>
            ) : (
              <div className="p-4 bg-primary/10 rounded-full">
                <Clock className="w-16 h-16 text-primary" />
              </div>
            )}
          </div>

          <div className="space-y-2">
            <h1 className="text-4xl font-extrabold tracking-tight">
              {isApproved ? "Thank You for Your Purchase!" : isRejected ? "Order Rejected" : "Order Received!"}
            </h1>
            <p className="text-xl text-muted-foreground max-w-lg mx-auto">
              {isApproved
                ? "Your order has been processed successfully. You can now access your tools from the dashboard."
                : isRejected
                ? "Unfortunately, your payment verification failed. Please check your transaction details and try again or contact support."
                : "Thank you for your order! We've received your payment details and are currently verifying them."}
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <Badge variant="outline" className="px-4 py-1 text-sm bg-muted/50">
              Order ID: <span className="font-mono ml-2 font-bold">{order._id.slice(-8).toUpperCase()}</span>
            </Badge>
            <Badge 
              variant={isApproved ? "default" : isRejected ? "destructive" : "secondary"} 
              className={`px-4 py-1 text-sm ${isApproved ? "bg-green-600 hover:bg-green-700" : ""}`}
            >
              Status: {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
            </Badge>
          </div>
        </CardContent>
      </Card>


      <div className="grid md:grid-cols-2 gap-8">
        {/* Order Details */}
        <Card className="h-fit">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Package className="w-5 h-5 text-primary" /> Order Items
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4">
              {order.items.map((item: any, idx: number) => (
                <li key={idx} className="flex justify-between items-center py-2 border-b last:border-0">
                  <div className="space-y-1">
                    <p className="font-medium text-sm">{item.name}</p>
                    <p className="text-xs text-muted-foreground">{item.durationMonths} Month(s)</p>
                  </div>
                  <PriceDisplay amount={item.price * item.durationMonths} />
                </li>
              ))}
            </ul>
            <div className="pt-4 mt-2 space-y-2 border-t font-semibold">
              <div className="flex justify-between text-sm text-muted-foreground font-normal">
                <span>Subtotal</span>
                <PriceDisplay amount={order.totalAmount} />
              </div>
              {order.discountAmount > 0 && (
                <div className="flex justify-between text-sm text-green-600 font-normal">
                  <span>Discount</span>
                  <span>-<PriceDisplay amount={order.discountAmount} /></span>
                </div>
              )}
              <div className="flex justify-between text-lg pt-2">
                <span>Total Paid</span>
                <PriceDisplay amount={order.finalAmount} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Next Steps */}
        <div className="space-y-6">
          <Card className="bg-primary/5 border-primary/10">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <ArrowRight className="w-5 h-5 text-primary" /> Next Steps
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground leading-relaxed">
                {isApproved
                  ? "Your subscriptions are already active. Head over to your dashboard to start using your premium digital tools."
                  : isRejected
                  ? "Since your payment was not verified, your tools have not been activated. You can try placing the order again with correct details."
                  : "Our team is verifying your transaction. This usually takes 15-30 minutes during business hours. You'll receive an email once your tools are active."}
              </p>
              <div className="grid gap-3 pt-2">
                {isRejected ? (
                   <Button asChild className="w-full font-bold shadow-lg shadow-destructive/20" variant="destructive">
                    <Link href="/checkout">
                      Retry Checkout <ArrowRight className="ml-2 w-4 h-4" />
                    </Link>
                  </Button>
                ) : (
                  <Button asChild className="w-full font-bold shadow-lg shadow-primary/20">
                    <Link href="/dashboard">
                      Go to Dashboard <ArrowRight className="ml-2 w-4 h-4" />
                    </Link>
                  </Button>
                )}
                <Button variant="outline" asChild className="w-full">
                  <Link href="/dashboard/billing">
                    View Order Details
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-primary" /> Payment Method
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Provider</span>
                <span className="font-medium capitalize">{order.paymentMethod}</span>
              </div>
              {order.paymentProof && (
                <div className="flex items-center justify-between text-sm mt-2">
                  <span className="text-muted-foreground text-xs">Proof / Trans ID</span>
                  <span className="font-mono text-xs bg-muted px-2 py-0.5 rounded uppercase">{order.paymentProof}</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <main className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <div className="flex-1 pt-32 pb-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-primary/5 to-transparent">
        <Suspense fallback={
          <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
            <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
            <p className="text-muted-foreground animate-pulse">Initializing...</p>
          </div>
        }>
          <SuccessContent />
        </Suspense>
      </div>
      <Footer />
    </main>
  );
}
