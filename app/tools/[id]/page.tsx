import { notFound } from "next/navigation";
import dbConnect from "@/lib/mongodb";
import Package from "@/models/Package";
import Tool from "@/models/Tool";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Badge } from "@/components/ui/badge";
import { ProductCard } from "@/components/product-card";

interface ToolPageProps {
  params: Promise<{
    id: string;
  }>;
}

export const dynamic = "force-dynamic";

function formatInterval(interval?: string) {
  if (interval === "monthly") return "mo";
  if (interval === "yearly") return "yr";
  if (interval === "lifetime") return "lifetime";
  return "";
}

async function getActivePackage(id: string) {
  try {
    const pkg = await Package.findById(id).populate("tools");
    if (pkg?.status === "active") {
      return pkg;
    }
  } catch {
    return null;
  }

  return null;
}

async function getVisibleTool(id: string) {
  try {
    const tool = await Tool.findById(id).populate("packageId");
    if (tool && ["active", "maintenance", "down", "stock_out"].includes(tool.status)) {
      return tool;
    }
  } catch {
    return null;
  }

  return null;
}

export default async function ToolDetailsPage(props: ToolPageProps) {
  const params = await props.params;
  const { id } = params;

  await dbConnect();

  const pkg = await getActivePackage(id);
  if (pkg) {
    const pkgJson = JSON.parse(JSON.stringify(pkg));

    return (
      <main className="min-h-screen bg-background">
        <Navbar />
        <div className="px-4 pb-16 pt-32 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="grid items-start gap-12 md:grid-cols-2">
              <div className="space-y-6">
                <div className="relative flex aspect-video items-center justify-center overflow-hidden rounded-xl border bg-muted/20">
                  <div className="p-6 text-center">
                    <h2 className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-3xl font-bold text-transparent">
                      {pkg.name}
                    </h2>
                    {pkg.price === 0 && (
                      <Badge className="mt-4 bg-green-500/10 text-green-500">Free</Badge>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-8">
                <div>
                  <h1 className="mb-4 text-4xl font-bold">{pkg.name}</h1>
                  <div className="mb-6 flex items-end gap-2">
                    <span className="text-4xl font-bold text-primary">${pkg.price}</span>
                    {pkg.interval && (
                      <span className="mb-1 text-foreground/60">/{formatInterval(pkg.interval)}</span>
                    )}
                  </div>
                  <p className="text-lg leading-relaxed text-foreground/70">
                    {pkg.description || "Get access to premium tools with this package."}
                  </p>
                </div>

                <div className="rounded-xl border bg-card p-6 shadow-sm">
                  <h3 className="mb-4 text-lg font-semibold">Included Tools</h3>
                  {pkg.tools && pkg.tools.length > 0 ? (
                    <div className="grid gap-4">
                      {pkg.tools.map((tool: any) => (
                        <div key={tool._id} className="flex items-start gap-3">
                          <div className="mt-1 h-2 w-2 rounded-full bg-primary" />
                          <div>
                            <span className="font-medium text-foreground">{tool.name}</span>
                            {tool.description && (
                              <p className="text-sm text-muted-foreground">{tool.description}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No specific tools listed.</p>
                  )}
                </div>

                <div className="max-w-sm">
                  <ProductCard pkg={pkgJson} />
                </div>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </main>
    );
  }

  const tool = await getVisibleTool(id);
  if (!tool) {
    notFound();
  }

  const toolJson = JSON.parse(JSON.stringify(tool));

  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <div className="px-4 pb-16 pt-32 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid items-start gap-12 md:grid-cols-2">
            <div className="space-y-6">
              <div className="relative flex aspect-video items-center justify-center overflow-hidden rounded-xl border bg-muted/20">
                <div className="p-6 text-center">
                  <h2 className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-3xl font-bold text-transparent">
                    {tool.name}
                  </h2>
                  {tool.price === 0 && (
                    <Badge className="mt-4 bg-green-500/10 text-green-500">Free</Badge>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-8">
              <div>
                <h1 className="mb-4 text-4xl font-bold">{tool.name}</h1>
                <div className="mb-6 flex items-end gap-2">
                  <span className="text-4xl font-bold text-primary">${tool.price}</span>
                  {tool.interval && (
                    <span className="mb-1 text-foreground/60">/{formatInterval(tool.interval)}</span>
                  )}
                </div>
                <p className="text-lg leading-relaxed text-foreground/70">
                  {tool.description || "Get access to this premium tool with managed onboarding and support."}
                </p>
              </div>

              <div className="rounded-xl border bg-card p-6 shadow-sm">
                <h3 className="mb-4 text-lg font-semibold">What You Get</h3>
                <div className="grid gap-4">
                  <div className="flex items-start gap-3">
                    <div className="mt-1 h-2 w-2 rounded-full bg-primary" />
                    <div>
                      <span className="font-medium text-foreground">Category</span>
                      <p className="text-sm text-muted-foreground">{tool.category || "Premium Tool"}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="mt-1 h-2 w-2 rounded-full bg-primary" />
                    <div>
                      <span className="font-medium text-foreground">Access Model</span>
                      <p className="text-sm text-muted-foreground">
                        {tool.visibility === "private" ? "Private access" : "Shared access"} with support after purchase.
                      </p>
                    </div>
                  </div>
                  {tool.packageId?.name && (
                    <div className="flex items-start gap-3">
                      <div className="mt-1 h-2 w-2 rounded-full bg-primary" />
                      <div>
                        <span className="font-medium text-foreground">Included In</span>
                        <p className="text-sm text-muted-foreground">{tool.packageId.name}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="max-w-sm">
                <ProductCard pkg={toolJson} />
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
