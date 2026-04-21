"use client";

import Link from "next/link";
import { useSiteSettings } from "@/components/providers/site-settings-provider";
export function Footer() {
  const siteSettings = useSiteSettings();

  return (
    <footer className="bg-card border-t border-border mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="font-bold text-foreground mb-4">About</h3>
            <p className="text-foreground/60 text-sm">{siteSettings.siteTagline}</p>
          </div>
          <div>
            <h3 className="font-bold text-foreground mb-4">Product</h3>
            <ul className="space-y-2 text-sm text-foreground/60">
              <li>
                <Link href="/premium-tools" className="hover:text-foreground transition">
                  All Products
                </Link>
              </li>
              <li>
                <Link href="/packages" className="hover:text-foreground transition">
                  All Products Shop
                </Link>
              </li>
              <li>
                <Link href={siteSettings.affiliateUrl || "/affiliate-program"} className="hover:text-foreground transition">
                  Become an Affiliate
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-foreground mb-4">Support</h3>
            <ul className="space-y-2 text-sm text-foreground/60">
              <li>
                <Link href="/how-to-buy" className="hover:text-foreground transition">
                  How to Buy
                </Link>
              </li>
              <li>
                <Link href="/how-to-access" className="hover:text-foreground transition">
                  How to Access
                </Link>
              </li>
              <li>
                <Link href="/get-support" className="hover:text-foreground transition">
                  Get Support
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-foreground mb-4">Legal</h3>
            <ul className="space-y-2 text-sm text-foreground/60">
              <li>
                <Link href="/privacy-policy" className="hover:text-foreground transition">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/refund-policy" className="hover:text-foreground transition">
                  Refund Policy
                </Link>
              </li>
              <li>
                <Link href="/return-policy" className="hover:text-foreground transition">
                  Return Policy
                </Link>
              </li>
              <li>
                <Link href="/terms-and-conditions" className="hover:text-foreground transition">
                  Terms & Conditions
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-border pt-8 flex justify-between items-center">
          <div>
            <p className="text-foreground/60 text-sm">{siteSettings.footerText}</p>
            <p className="text-foreground/50 text-xs mt-1">{siteSettings.contactAddress}</p>
          </div>
          <div className="flex gap-4">
            <a href={siteSettings.websiteUrl} className="text-foreground/60 hover:text-foreground text-sm" target="_blank" rel="noreferrer">
              Website
            </a>
            <a href={`mailto:${siteSettings.supportEmail}`} className="text-foreground/60 hover:text-foreground text-sm">
              Email
            </a>
            <a href={siteSettings.facebookChatUrl} className="text-foreground/60 hover:text-foreground text-sm" target="_blank" rel="noreferrer">
              Facebook
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
