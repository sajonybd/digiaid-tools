"use client";

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/components/providers/cart-provider";
import { Check, ShoppingCart } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PriceDisplay } from "@/components/price-display";

export function ProductCard({ pkg }: { pkg: any }) {
  const { addToCart } = useCart();
  const router = useRouter();
  const packageId =
    typeof pkg.packageId === "string" ? pkg.packageId : pkg.packageId?._id;

  // Logic to handle both "Package" (bundles) and "Tool" (single items)
  // If it's a Tool (has packageId), we use that packageId for the cart.
  // If it's a Package, we use its _id.
  const cartId = packageId || pkg._id;
  const detailId = packageId || pkg._id;
  const displayName = pkg.name;
  const displayImage = pkg.image; // Tools have image at top level
  const price = pkg.price;
  const interval = pkg.interval;

  const handleAddToCart = () => {
    addToCart({
        _id: cartId,
        name: displayName,
        price: price,
        type: 'package',
        image: displayImage
    });
  };

  const handleBuyNow = () => {
      addToCart({
        _id: cartId,
        name: displayName,
        price: price,
        type: 'package',
        image: displayImage
      }, false);
      router.push("/checkout");
  }
  
  // Helper to get features or tool details
  // If it's a package, it has tools array. If it's a tool, it might not.
  const toolNames = pkg.tools?.map((t: any) => t.name).join(", ");

  return (
    <Card className="flex flex-col h-full hover:shadow-lg transition-all duration-300 border-border/50 bg-card group">
      <CardHeader>
        <div className="flex justify-between items-start mb-2">
            <div className="flex items-center gap-3">
                {displayImage && (
                    <div className="h-10 w-10 relative rounded-md overflow-hidden bg-muted">
                         {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={displayImage} alt={displayName} className="object-cover h-full w-full" />
                    </div>
                )}
                <div>
                    <CardTitle className="text-xl font-bold">{displayName}</CardTitle>
                    {interval && <span className="text-xs text-muted-foreground capitalize">{interval} Plan</span>}
                </div>
            </div>
            {pkg.price === 0 && (
                <Badge variant="secondary" className="bg-green-500/10 text-green-500">Free</Badge>
            )}
        </div>
        <div className="flex items-baseline gap-1">
            <span className="text-3xl font-bold text-primary">
                <PriceDisplay amount={pkg.price} />
            </span>
            {pkg.interval && <span className="text-sm text-foreground/60">/{pkg.interval === 'monthly' ? 'mo' : 'yr'}</span>}
        </div>
      </CardHeader>
      
      <CardContent className="flex-1">
        <div className="space-y-4">
            <p className="text-sm text-foreground/70">{pkg.description || `Access to: ${toolNames || 'Premium Tools'}`}</p>
            
            {/* Features List if any */}
            {pkg.features && pkg.features.length > 0 && (
                <ul className="space-y-2">
                    {pkg.features.slice(0, 4).map((feat: string, i: number) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-foreground/80">
                            <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                            <span>{feat}</span>
                        </li>
                    ))}
                </ul>
            )}
        </div>
      </CardContent>
      
      <CardFooter className="grid grid-cols-2 gap-3 pt-6">
        <Button variant="outline" className="w-full gap-2" onClick={handleAddToCart}>
            <ShoppingCart size={16} /> Add
        </Button>
        <Button className="w-full" onClick={handleBuyNow}>
            Buy Now
        </Button>
      </CardFooter>
      
       <Link href={`/tools/${detailId}`} className="block text-center text-xs text-muted-foreground hover:text-primary mt-2 pb-2">
            View Details
       </Link>
    </Card>
  );
}
