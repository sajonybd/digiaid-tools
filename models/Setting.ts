import mongoose from 'mongoose';

const SettingSchema = new mongoose.Schema({
  siteName: {
    type: String,
    default: "SEO Tools",
  },
  siteTagline: {
    type: String,
    default: "Making premium SEO tools accessible to everyone",
  },
  logoUrl: {
    type: String,
    default: "/logo.png",
  },
  faviconUrl: {
    type: String,
    default: "/favicon.ico",
  },
  footerText: {
    type: String,
    default: "",
  },
  seoTitle: {
    type: String,
    default: "SEO Tools - Premium SEO Tools",
  },
  seoDescription: {
    type: String,
    default: "Get access to premium SEO tools at affordable prices",
  },
  supportEmail: {
    type: String,
    default: "",
  },
  supportPhone: {
    type: String,
    default: "01940268500",
  },
  whatsappNumber: {
    type: String,
    default: "8801940268500",
  },
  facebookChatUrl: {
    type: String,
    default:
      "https://m.me/PremiumSEOTools?text=Hello%20I%20have%20a%20question",
  },
  whatsappMessage: {
    type: String,
    default: "Hello! I need some support.",
  },
  extensionDownloadUrl: {
    type: String,
    default: "",
  },
  // Google Analytics & Tag Manager
  gtmId: {
    type: String,
    default: "",
  },
  ga4MeasurementId: {
    type: String,
    default: "",
  },
  // Meta / Facebook Pixel & CAPI
  facebookPixelId: {
    type: String,
    default: "",
  },
  facebookCapiToken: {
    type: String,
    default: "",
  },
  // Microsoft Clarity
  microsoftClarityId: {
    type: String,
    default: "",
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

if (mongoose.models.Setting) {
  const schema = mongoose.models.Setting.schema;
  if (!schema.path('siteName')) {
    schema.add({
      siteName: { type: String, default: "SEO Tools" },
      siteTagline: {
        type: String,
        default: "Making premium SEO tools accessible to everyone",
      },
      logoUrl: { type: String, default: "/logo.png" },
      faviconUrl: { type: String, default: "/favicon.ico" },
      footerText: { type: String, default: "" },
      seoTitle: { type: String, default: "SEO Tools - Premium SEO Tools" },
      seoDescription: {
        type: String,
        default: "Get access to premium SEO tools at affordable prices",
      },
      supportEmail: { type: String, default: "" },
      supportPhone: { type: String, default: "01940268500" },
      whatsappNumber: { type: String, default: "8801940268500" },
      facebookChatUrl: {
        type: String,
        default:
          "https://m.me/PremiumSEOTools?text=Hello%20I%20have%20a%20question",
      },
      whatsappMessage: { type: String, default: "Hello! I need some support." },
      extensionDownloadUrl: { type: String, default: "" },
    });
  }
}

export default mongoose.models.Setting || mongoose.model('Setting', SettingSchema);
