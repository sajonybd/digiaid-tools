import type { Metadata } from "next";
import dbConnect from "@/lib/mongodb";
import Setting from "@/models/Setting";

export type PublicSiteSettings = {
  siteName: string;
  siteTagline: string;
  logoUrl: string;
  faviconUrl: string;
  footerText: string;
  seoTitle: string;
  seoDescription: string;
  supportEmail: string;
  supportPhone: string;
  whatsappNumber: string;
  facebookChatUrl: string;
  whatsappMessage: string;
  gtmId: string;
  ga4MeasurementId: string;
  facebookPixelId: string;
  microsoftClarityId: string;
};

export const defaultSiteSettings: PublicSiteSettings = {
  siteName: "Uddokta Tools",
  siteTagline: "Making premium SEO tools accessible to everyone",
  logoUrl: "/logo.png",
  faviconUrl: "/favicon.ico",
  footerText: "",
  seoTitle: "Uddokta Tools - Premium SEO Tools",
  seoDescription: "Get access to premium SEO tools at affordable prices",
  supportEmail: "",
  supportPhone: "01940268500",
  whatsappNumber: "8801940268500",
  facebookChatUrl: "https://m.me/PremiumSEOTools?text=Hello%20I%20have%20a%20question",
  whatsappMessage: "Hello! I need some support.",
  gtmId: "",
  ga4MeasurementId: "",
  facebookPixelId: "",
  microsoftClarityId: "",
};

function normalizeSettings(raw: any): PublicSiteSettings {
  const merged = {
    ...defaultSiteSettings,
    ...(raw || {}),
  };

  return {
    ...merged,
    footerText:
      merged.footerText || `© ${new Date().getFullYear()} ${merged.siteName}. All rights reserved.`,
  };
}

export async function getPublicSiteSettings(): Promise<PublicSiteSettings> {
  try {
    await dbConnect();
    let setting = await Setting.findOne({}).lean();
    if (!setting) {
      setting = (await Setting.create({})).toObject();
    }
    return normalizeSettings(setting);
  } catch {
    return normalizeSettings(null);
  }
}

export async function buildSiteMetadata(pageTitle?: string): Promise<Metadata> {
  const settings = await getPublicSiteSettings();
  const title = pageTitle ? `${pageTitle} - ${settings.siteName}` : settings.seoTitle;

  return {
    title,
    description: settings.seoDescription,
    icons: {
      icon: settings.faviconUrl || settings.logoUrl || "/favicon.ico",
    },
  };
}
