import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Package from "@/models/Package";
import Tool from "@/models/Tool";
import { getPublicSiteSettings } from "@/lib/site-settings";

export async function GET(req: Request) {
  try {
    await dbConnect();
    
    // Fetch all active packages and tools
    // Assuming you have 'status' or just fetching all
    const packages = await Package.find({});
    const tools = await Tool.find({});
    const siteSettings = await getPublicSiteSettings();
    
    // In a real prod setup, BASE_URL should from env
    const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://uddokta-tools.vercel.app";
    const brandImageUrl = siteSettings.logoUrl?.startsWith("http")
      ? siteSettings.logoUrl
      : `${BASE_URL}${siteSettings.logoUrl || "/logo.png"}`;
    
    const generateItemXML = (item: any, type: string) => `
      <item>
        <g:id>${item._id}</g:id>
        <g:title><![CDATA[${item.name}]]></g:title>
        <g:description><![CDATA[${item.description || item.name}]]></g:description>
        <g:link>${BASE_URL}/premium-tools</g:link>
        <g:image_link>${item.icon || item.image || brandImageUrl}</g:image_link>
        <g:brand><![CDATA[${siteSettings.siteName}]]></g:brand>
        <g:condition>new</g:condition>
        <g:availability>in stock</g:availability>
        <g:price>${item.price} USD</g:price>
        <g:custom_label_0>${type}</g:custom_label_0>
      </item>
    `;

    const packageItems = packages.map(p => generateItemXML(p, "Package")).join('');
    const toolItems = tools.map(t => generateItemXML(t, "Tool")).join('');

    const xml = `<?xml version="1.0" encoding="utf-8"?>
<rss xmlns:g="http://base.google.com/ns/1.0" version="2.0">
  <channel>
    <title><![CDATA[${siteSettings.siteName} Catalog]]></title>
    <link>${BASE_URL}</link>
    <description><![CDATA[${siteSettings.seoDescription}]]></description>
    ${packageItems}
    ${toolItems}
  </channel>
</rss>`;

    return new NextResponse(xml, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 's-maxage=3600, stale-while-revalidate'
      }
    });
  } catch (error) {
    console.error("Failed to generate catalog feed", error);
    return new NextResponse('<error>Failed to generate catalog feed</error>', { status: 500, headers: { 'Content-Type': 'application/xml' } });
  }
}
