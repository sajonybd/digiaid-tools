import { Metadata } from 'next';
import { buildSiteMetadata } from "@/lib/site-settings";
import { getStorefrontProducts } from "@/lib/storefront";
import { StorefrontClient } from "@/components/storefront/storefront-client";

export async function generateMetadata(): Promise<Metadata> {
  return buildSiteMetadata('Premium Tools');
}

export const dynamic = 'force-dynamic';

export default async function PremiumToolsPage() {
  const tools = await getStorefrontProducts();

  return (
    <StorefrontClient products={tools} mode="catalog" />
  );
}
