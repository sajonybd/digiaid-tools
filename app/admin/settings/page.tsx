"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, Save, RefreshCw, BarChart, Facebook, MousePointerClick, Palette, Phone } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    siteName: "",
    siteTagline: "",
    logoUrl: "",
    faviconUrl: "",
    footerText: "",
    seoTitle: "",
    seoDescription: "",
    supportEmail: "",
    supportPhone: "",
    whatsappNumber: "",
    facebookChatUrl: "",
    whatsappMessage: "",
    extensionDownloadUrl: "",
    gtmId: "",
    ga4MeasurementId: "",
    facebookPixelId: "",
    facebookCapiToken: "",
    microsoftClarityId: ""
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/settings');
      if (res.ok) {
        const data = await res.json();
        if (data) {
          setSettings({
            siteName: data.siteName || "",
            siteTagline: data.siteTagline || "",
            logoUrl: data.logoUrl || "",
            faviconUrl: data.faviconUrl || "",
            footerText: data.footerText || "",
            seoTitle: data.seoTitle || "",
            seoDescription: data.seoDescription || "",
            supportEmail: data.supportEmail || "",
            supportPhone: data.supportPhone || "",
            whatsappNumber: data.whatsappNumber || "",
            facebookChatUrl: data.facebookChatUrl || "",
            whatsappMessage: data.whatsappMessage || "",
            extensionDownloadUrl: data.extensionDownloadUrl || "",
            gtmId: data.gtmId || "",
            ga4MeasurementId: data.ga4MeasurementId || "",
            facebookPixelId: data.facebookPixelId || "",
            facebookCapiToken: data.facebookCapiToken || "",
            microsoftClarityId: data.microsoftClarityId || ""
          });
        }
      }
    } catch (e) {
      console.error(e);
      toast({ title: "Failed to load settings", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });
      
      if(res.ok) {
        toast({ title: "Settings updated successfully" });
      } else {
        throw new Error("Failed");
      }
    } catch (e) {
      toast({ title: "Failed to update settings", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setSettings((prev) => ({ ...prev, [e.target.id]: e.target.value }));
  };

  if (loading) return <div className="flex justify-center p-10"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Site Settings</h2>
        <p className="text-muted-foreground">Manage branding, contact details, SEO defaults, and tracking integrations.</p>
      </div>

      <Tabs defaultValue="branding" className="w-full">
        <TabsList className="grid w-full grid-cols-5 mb-4">
          <TabsTrigger value="branding"><Palette className="w-4 h-4 mr-2"/>Branding</TabsTrigger>
          <TabsTrigger value="contact"><Phone className="w-4 h-4 mr-2"/>Contact</TabsTrigger>
          <TabsTrigger value="google"><BarChart className="w-4 h-4 mr-2"/>Google</TabsTrigger>
          <TabsTrigger value="facebook"><Facebook className="w-4 h-4 mr-2"/>Facebook / Meta</TabsTrigger>
          <TabsTrigger value="clarity"><MousePointerClick className="w-4 h-4 mr-2"/>Clarity</TabsTrigger>
        </TabsList>

        <TabsContent value="branding" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Branding & SEO</CardTitle>
              <CardDescription>Use the same codebase across multiple sites by changing these settings per deployment.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="siteName">Website Name</Label>
                <Input id="siteName" placeholder="Your brand name" value={settings.siteName} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="siteTagline">Website Tagline</Label>
                <Input id="siteTagline" placeholder="Short brand tagline" value={settings.siteTagline} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="logoUrl">Logo URL</Label>
                <Input id="logoUrl" placeholder="/logo.png or https://..." value={settings.logoUrl} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="faviconUrl">Favicon URL</Label>
                <Input id="faviconUrl" placeholder="/favicon.ico or https://..." value={settings.faviconUrl} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="seoTitle">Default SEO Title</Label>
                <Input id="seoTitle" placeholder="Brand - Main offer" value={settings.seoTitle} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="seoDescription">Default SEO Description</Label>
                <Textarea id="seoDescription" placeholder="Describe the site for search engines." value={settings.seoDescription} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="footerText">Footer Text</Label>
                <Input id="footerText" placeholder="© 2026 Brand. All rights reserved." value={settings.footerText} onChange={handleChange} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contact" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Support & Contact</CardTitle>
              <CardDescription>These values power the floating contact widget and shared support links.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="supportEmail">Support Email</Label>
                <Input id="supportEmail" placeholder="support@example.com" value={settings.supportEmail} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="supportPhone">Support Phone</Label>
                <Input id="supportPhone" placeholder="01940268500" value={settings.supportPhone} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="whatsappNumber">WhatsApp Number</Label>
                <Input id="whatsappNumber" placeholder="8801XXXXXXXXX" value={settings.whatsappNumber} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="whatsappMessage">WhatsApp Default Message</Label>
                <Textarea id="whatsappMessage" placeholder="Hello! I need support." value={settings.whatsappMessage} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="facebookChatUrl">Facebook Chat URL</Label>
                <Input id="facebookChatUrl" placeholder="https://m.me/your-page" value={settings.facebookChatUrl} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="extensionDownloadUrl">Extension Download URL (Restricted)</Label>
                <Input id="extensionDownloadUrl" placeholder="https://chromewebstore.google.com/..." value={settings.extensionDownloadUrl} onChange={handleChange} />
                <p className="text-xs text-muted-foreground">Used by /download/extension. Only active subscribers can access the redirect.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="google" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Google Analytics & Tag Manager</CardTitle>
              <CardDescription>Configure Google tags for tracking website traffic and behavior.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="gtmId">Google Tag Manager ID (GTM-XXXXXXX)</Label>
                <Input 
                  id="gtmId" 
                  placeholder="GTM-XXXXXXX" 
                  value={settings.gtmId} 
                  onChange={handleChange} 
                />
                <p className="text-xs text-muted-foreground">Used for managing all your website tags.</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="ga4MeasurementId">GA4 Measurement ID (G-XXXXXXXXXX)</Label>
                <Input 
                  id="ga4MeasurementId" 
                  placeholder="G-XXXXXXXXXX" 
                  value={settings.ga4MeasurementId} 
                  onChange={handleChange} 
                />
                <p className="text-xs text-muted-foreground">Used for direct Google Analytics 4 tracking. Optional if you are injecting GA4 via GTM.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="facebook" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Facebook / Meta Pixel & CAPI</CardTitle>
              <CardDescription>Configure Facebook tracking for ads and commerce manager.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="facebookPixelId">Meta Pixel ID</Label>
                <Input 
                  id="facebookPixelId" 
                  placeholder="123456789012345" 
                  value={settings.facebookPixelId} 
                  onChange={handleChange} 
                />
                <p className="text-xs text-muted-foreground">Standard browser-side pixel tracking.</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="facebookCapiToken">Conversions API (CAPI) Token</Label>
                <Input 
                  id="facebookCapiToken" 
                  type="password"
                  placeholder="EAAB..." 
                  value={settings.facebookCapiToken} 
                  onChange={handleChange} 
                />
                <p className="text-xs text-muted-foreground">For server-side event tracking (e.g., Purchase events). Recommended for maximum accuracy.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="clarity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Microsoft Clarity</CardTitle>
              <CardDescription>Configure Clarity for heatmaps and session recordings.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="microsoftClarityId">Project ID</Label>
                <Input 
                  id="microsoftClarityId" 
                  placeholder="xxxxxxxxx" 
                  value={settings.microsoftClarityId} 
                  onChange={handleChange} 
                />
                <p className="text-xs text-muted-foreground">Find this in your Clarity dashboard under Settings &gt; Overview.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end gap-2 mt-6">
        <Button onClick={fetchSettings} variant="outline" disabled={loading || saving}>
          <RefreshCw className="mr-2 h-4 w-4" /> Reset
        </Button>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          Save Settings
        </Button>
      </div>
    </div>
  );
}
