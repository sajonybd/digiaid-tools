import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Setting from "@/models/Setting";
import { defaultSiteSettings } from "@/lib/site-settings";

export async function GET(req: Request) {
  await dbConnect();
  try {
    // Assuming a single settings document.
    let setting = await Setting.findOne({});
    if (!setting) {
      setting = await Setting.create({});
    }

    // Only return public settings, excluding sensitive tokens like facebookCapiToken
    return NextResponse.json({
      siteName: setting.siteName || defaultSiteSettings.siteName,
      siteTagline: setting.siteTagline || defaultSiteSettings.siteTagline,
      logoUrl: setting.logoUrl || defaultSiteSettings.logoUrl,
      faviconUrl: setting.faviconUrl || defaultSiteSettings.faviconUrl,
      footerText: setting.footerText || `© ${new Date().getFullYear()} ${setting.siteName || defaultSiteSettings.siteName}. All rights reserved.`,
      seoTitle: setting.seoTitle || defaultSiteSettings.seoTitle,
      seoDescription: setting.seoDescription || defaultSiteSettings.seoDescription,
      supportEmail: setting.supportEmail || defaultSiteSettings.supportEmail,
      supportPhone: setting.supportPhone || defaultSiteSettings.supportPhone,
      whatsappNumber: setting.whatsappNumber || defaultSiteSettings.whatsappNumber,
      facebookChatUrl: setting.facebookChatUrl || defaultSiteSettings.facebookChatUrl,
      whatsappMessage: setting.whatsappMessage || defaultSiteSettings.whatsappMessage,
      websiteUrl: setting.websiteUrl || defaultSiteSettings.websiteUrl,
      contactAddress: setting.contactAddress || defaultSiteSettings.contactAddress,
      affiliateUrl: setting.affiliateUrl || defaultSiteSettings.affiliateUrl,
      gtmId: setting.gtmId || "",
      ga4MeasurementId: setting.ga4MeasurementId || "",
      facebookPixelId: setting.facebookPixelId || "",
      microsoftClarityId: setting.microsoftClarityId || "",
    });
  } catch (error) {
    return NextResponse.json({ error: "Error fetching settings" }, { status: 500 });
  }
}
