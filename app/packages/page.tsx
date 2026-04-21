import { Metadata } from 'next';
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import dbConnect from "@/lib/mongodb";
import Package from "@/models/Package";
import Tool from "@/models/Tool";
import { ProductCard } from "@/components/product-card";
import { FeaturedPackageCard } from "@/components/featured-package-card";
import { buildSiteMetadata } from "@/lib/site-settings";

export async function generateMetadata(): Promise<Metadata> {
  return buildSiteMetadata('Packages');
}

export const dynamic = 'force-dynamic';

export default async function PackagesPage() {
  await dbConnect();
  
  // Ensure Tool model is registered
  console.log(Tool);

  const packages = await Package.find({ 
      status: 'active', 
      visibility: 'public',
  }).sort({ sortOrder: 1, price: 1, createdAt: -1 }).populate('tools');

  // Separate Featured vs Standard
  // Logic: "Featured" if is_featured is true. 
  // Migration didn't set is_featured, so initially none might be featured. 
  // For demo/consistency, let's treat "Bundles" (tools > 1) as potential candidates if manually flagged, 
  // but strictly use is_featured flag.
  const featuredPackages = packages.filter(p => p.is_featured);
  const otherPackages = packages.filter(p => !p.is_featured);

  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-32 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
                <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary mb-4">
                    All Products Shop
                </h1>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                    Browse featured bundles, standard packages, and individual product access in one place.
                </p>
            </div>

            {/* Featured Section */}
            {featuredPackages.length > 0 && (
                <div className="mb-20">
                    <h2 className="text-2xl font-bold text-center mb-8">Featured Plans</h2>
                    <div className="grid md:grid-cols-3 gap-8 justify-center">
                        {featuredPackages.map((pkg) => (
                            <FeaturedPackageCard key={pkg._id.toString()} pkg={JSON.parse(JSON.stringify(pkg))} />
                        ))}
                    </div>
                </div>
            )}

            {/* Standard/Tools Section */}
            <div>
                 <h2 className="text-2xl font-bold mb-8 flex items-center gap-2">
                    {featuredPackages.length > 0 ? "Single Tools & Standard Plans" : "All Plans"}
                 </h2>
                 
                 {otherPackages.length === 0 && featuredPackages.length === 0 ? (
                     <div className="text-center py-20 bg-muted/30 rounded-lg">
                         <p className="text-muted-foreground">No packages available at the moment.</p>
                     </div>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {otherPackages.map((pkg) => (
                            <ProductCard key={pkg._id.toString()} pkg={JSON.parse(JSON.stringify(pkg))} />
                        ))}
                    </div>
                )}
            </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
