"use client"

import { CartDrawer } from "@/components/cart-drawer";
import { useState } from "react"
import Link from "next/link"
import { Menu, X } from "lucide-react"
import { useSession, signOut } from "next-auth/react"
import { useCurrency } from "@/context/CurrencyContext"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useSiteSettings } from "@/components/providers/site-settings-provider"

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const { data: session } = useSession()
  const { currency, setCurrency } = useCurrency()
  const siteSettings = useSiteSettings()

  return (
    <nav className="fixed top-0 w-full bg-background/95 backdrop-blur-md border-b-2 border-primary/10 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center gap-2 group">
            <img src={siteSettings.logoUrl} alt={siteSettings.siteName} width={32} height={32} className="h-8 w-8 object-contain" />
            <span className="font-bold text-lg text-foreground">{siteSettings.siteName}</span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <Link href="/premium-tools" className="text-foreground/70 hover:text-primary transition font-medium">
              All Products
            </Link>
            <Link href="/packages" className="text-foreground/70 hover:text-primary transition font-medium">
              Shop
            </Link>
            <Link href="/about-us" className="text-foreground/70 hover:text-primary transition font-medium">
              About Us
            </Link>
            <Link href={siteSettings.affiliateUrl || "/affiliate-program"} className="text-foreground/70 hover:text-primary transition font-medium">
              Become an Affiliate
            </Link>
            
            <Select value={currency} onValueChange={(val: any) => setCurrency(val)}>
                <SelectTrigger className="w-[80px] h-9 border-primary/20 bg-background/50">
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="BDT">🇧🇩 BDT</SelectItem>
                    <SelectItem value="USD">🇺🇸 USD</SelectItem>
                    <SelectItem value="INR">🇮🇳 INR</SelectItem>
                    <SelectItem value="PKR">🇵🇰 PKR</SelectItem>
                </SelectContent>
            </Select>

            <CartDrawer />

            {session ? (
               <div className="flex items-center gap-4">

                   <Link href="/dashboard" className="px-4 py-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition font-medium">
                       Client Area
                   </Link>
                   <div className="flex flex-col items-end">
                      <span className="text-sm font-bold text-primary leading-tight">UID: {(session.user as any).customId || '....'}</span>
                      <span className="text-xs font-medium text-foreground/70 hidden lg:inline-block leading-tight">{session.user?.name}</span>
                   </div>
                </div>
            ) : (
                <>
                    <Link href="/login" className="text-foreground/70 hover:text-primary transition font-medium">
                      Login
                    </Link>
                    <Link
                      href="/signup"
                      className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition font-medium shadow-xl shadow-primary/30"
                    >
                      Sign Up
                    </Link>
                </>
            )}

          </div>

          <button className="md:hidden" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X size={24} className="text-primary" /> : <Menu size={24} className="text-primary" />}
          </button>
        </div>

        {isOpen && (
          <div className="md:hidden pb-4 space-y-3 border-t border-border pt-4">
            <Link href="/premium-tools" className="block text-foreground/70 hover:text-primary py-2 font-medium">
              All Products
            </Link>
            <Link href="/packages" className="block text-foreground/70 hover:text-primary py-2 font-medium">
              Shop
            </Link>
            <Link href="/about-us" className="block text-foreground/70 hover:text-primary py-2 font-medium">
              About Us
            </Link>
            <Link href={siteSettings.affiliateUrl || "/affiliate-program"} className="block text-foreground/70 hover:text-primary py-2 font-medium">
              Become an Affiliate
            </Link>
             {session ? (
                 <>
                    <Link href="/dashboard" className="block w-full px-6 py-2 bg-primary/10 text-primary rounded-lg text-center font-medium">
                        Client Area
                    </Link>
                    <div className="px-3 py-2 space-y-0.5">
                        <div className="text-xs font-bold text-primary">UID: {(session.user as any).customId || '....'}</div>
                        <div className="text-sm font-medium text-foreground/70">
                            Signed in as {session.user?.name}
                        </div>
                    </div>
                     {/* Logout already available in dashboard, but we can keep it here or remove */}
                 </>
             ) : (
                <>
                    <Link href="/login" className="block text-foreground/70 hover:text-primary py-2 font-medium">
                      Login
                    </Link>
                    <Link
                      href="/signup"
                      className="block w-full px-6 py-2 bg-primary text-primary-foreground rounded-lg text-center font-medium shadow-xl shadow-primary/30"
                    >
                      Sign Up
                    </Link>
                </>
             )}
          </div>
        )}
      </div>
    </nav>
  )
}
