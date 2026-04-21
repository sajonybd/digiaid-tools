import { StorefrontClient } from "@/components/storefront/storefront-client";
import { getStorefrontProducts } from "@/lib/storefront";

export const dynamic = "force-dynamic";

export default async function Home() {
  const products = await getStorefrontProducts();

  return (
    <StorefrontClient products={products} mode="home" />
  );
}
