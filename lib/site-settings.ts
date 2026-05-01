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
  websiteUrl: string;
  contactAddress: string;
  affiliateUrl: string;
  gtmId: string;
  ga4MeasurementId: string;
  facebookPixelId: string;
  microsoftClarityId: string;
};

export const defaultSiteSettings: PublicSiteSettings = {
  siteName: "Digital Tools by DigiAid",
  siteTagline: "Trusted Premium digital tools by DigiAid",
  logoUrl: "/logo.png",
  faviconUrl: "/logo.png",
  footerText: "",
  seoTitle: "Digital Tools by DigiAid - Trusted Premium Digital Tools",
  seoDescription: "Shop trusted premium digital tools with hands-on support from DigiAid.",
  supportEmail: "info@digiaidit.com",
  supportPhone: "01316-414532",
  whatsappNumber: "8801316414532",
  facebookChatUrl: "https://www.facebook.com/profile.php?id=61588189935634",
  whatsappMessage: "Hello! I need support with Digital Tools by DigiAid.",
  websiteUrl: "https://digiaidit.com",
  contactAddress: "Dhaka, Dhaka, Bangladesh, 1219",
  affiliateUrl: "/affiliate-program",
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
  const iconUrl =
    settings.faviconUrl && settings.faviconUrl !== "/favicon.ico"
      ? settings.faviconUrl
      : settings.logoUrl || "/logo.png";

  return {
    title,
    description: settings.seoDescription,
    icons: {
      icon: iconUrl,
    },
  };
}
