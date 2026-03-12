import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/providers"; 
import { CurrencyProvider } from "@/context/CurrencyContext";
import { Toaster } from "@/components/ui/toaster";
import { Analytics } from "@vercel/analytics/next";
import { FloatingContact } from "@/components/floating-contact";
import { TrackingScripts, TrackingNoscript } from "@/components/tracking-scripts";
import { buildSiteMetadata, getPublicSiteSettings } from "@/lib/site-settings";
import { SiteSettingsProvider } from "@/components/providers/site-settings-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  return buildSiteMetadata();
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const siteSettings = await getPublicSiteSettings();

  return (
    <html lang="en">
      <head>
        <TrackingScripts />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <TrackingNoscript />

        <SiteSettingsProvider value={siteSettings}>
          <AuthProvider>
            <CurrencyProvider>
              {children}
            </CurrencyProvider>
            <Toaster />
            <Analytics />
            <FloatingContact />
          </AuthProvider>
        </SiteSettingsProvider>
      </body>
    </html>
  );
}
