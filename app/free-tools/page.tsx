import { Metadata } from 'next';
import { ProductCard } from "@/components/product-card";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import dbConnect from "@/lib/mongodb";
import Tool from "@/models/Tool"; // Ensure model is compiled
import { buildSiteMetadata } from "@/lib/site-settings";

export async function generateMetadata(): Promise<Metadata> {
  return buildSiteMetadata('Free Tools');
}

export const dynamic = 'force-dynamic';

export default async function FreeToolsPage() {
  await dbConnect();
  
  // Ensure Tool model is registered
  console.log(Tool);

  const tools = await Tool.find({ 
      status: 'active', 
      visibility: 'public',
      price: 0 
  }).sort({ createdAt: -1 });

  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-32 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
                <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary mb-4">
                    Free Digital Tools
                </h1>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                    Powerfull tools completely free to use. No credit card required.
                </p>
            </div>

            {tools.length === 0 ? (
                 <div className="text-center py-20 bg-muted/30 rounded-lg">
                     <p className="text-muted-foreground">No free tools available at the moment.</p>
                 </div>
            ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {tools.map((tool) => (
                        <ProductCard key={tool._id.toString()} pkg={JSON.parse(JSON.stringify(tool))} />
                    ))}
                </div>
            )}
        </div>
      </div>
      <Footer />
    </main>
  );
}
