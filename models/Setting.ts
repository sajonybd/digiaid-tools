import mongoose from 'mongoose';

const SettingSchema = new mongoose.Schema({
  siteName: {
    type: String,
    default: "Digital Tools by DigiAid",
  },
  siteTagline: {
    type: String,
    default: "Trusted Premium digital tools by DigiAid",
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
    default: "Digital Tools by DigiAid - Trusted Premium Digital Tools",
  },
  seoDescription: {
    type: String,
    default: "Shop trusted premium digital tools with hands-on support from DigiAid.",
  },
  supportEmail: {
    type: String,
    default: "info@digiaidit.com",
  },
  supportPhone: {
    type: String,
    default: "01316-414532",
  },
  whatsappNumber: {
    type: String,
    default: "8801316414532",
  },
  facebookChatUrl: {
    type: String,
    default:
      "https://www.facebook.com/profile.php?id=61588189935634",
  },
  whatsappMessage: {
    type: String,
    default: "Hello! I need support with Digital Tools by DigiAid.",
  },
  websiteUrl: {
    type: String,
    default: "https://digiaidit.com",
  },
  contactAddress: {
    type: String,
    default: "Dhaka, Dhaka, Bangladesh, 1219",
  },
  affiliateUrl: {
    type: String,
    default: "/affiliate-program",
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
  const fieldsToAdd: Record<string, any> = {};

  if (!schema.path('siteName')) {
    Object.assign(fieldsToAdd, {
      siteName: { type: String, default: "Digital Tools by DigiAid" },
      siteTagline: {
        type: String,
        default: "Trusted Premium digital tools by DigiAid",
      },
      logoUrl: { type: String, default: "/logo.png" },
      faviconUrl: { type: String, default: "/favicon.ico" },
      footerText: { type: String, default: "" },
      seoTitle: {
        type: String,
        default: "Digital Tools by DigiAid - Trusted Premium Digital Tools",
      },
      seoDescription: {
        type: String,
        default: "Shop trusted premium digital tools with hands-on support from DigiAid.",
      },
      supportEmail: { type: String, default: "info@digiaidit.com" },
      supportPhone: { type: String, default: "01316-414532" },
      whatsappNumber: { type: String, default: "8801316414532" },
      facebookChatUrl: {
        type: String,
        default: "https://www.facebook.com/profile.php?id=61588189935634",
      },
      whatsappMessage: {
        type: String,
        default: "Hello! I need support with Digital Tools by DigiAid.",
      },
      websiteUrl: { type: String, default: "https://digiaidit.com" },
      contactAddress: {
        type: String,
        default: "Dhaka, Dhaka, Bangladesh, 1219",
      },
      affiliateUrl: { type: String, default: "/affiliate-program" },
      extensionDownloadUrl: { type: String, default: "" },
    });
  }

  if (!schema.path('websiteUrl')) {
    Object.assign(fieldsToAdd, {
      websiteUrl: { type: String, default: "https://digiaidit.com" },
    });
  }

  if (!schema.path('contactAddress')) {
    Object.assign(fieldsToAdd, {
      contactAddress: {
        type: String,
        default: "Dhaka, Dhaka, Bangladesh, 1219",
      },
    });
  }

  if (!schema.path('affiliateUrl')) {
    Object.assign(fieldsToAdd, {
      affiliateUrl: { type: String, default: "/affiliate-program" },
    });
  }

  if (Object.keys(fieldsToAdd).length > 0) {
    schema.add({
      ...fieldsToAdd,
    });
  }
}

export default mongoose.models.Setting || mongoose.model('Setting', SettingSchema);
