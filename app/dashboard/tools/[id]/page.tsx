import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, ExternalLink, Info, AlertTriangle, Lock } from "lucide-react";
import Link from "next/link";
import dbConnect from "@/lib/mongodb";
import Tool from "@/models/Tool";
import User from "@/models/User";
import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { ToolAccessLauncher } from "@/components/tool-access-launcher";

interface ToolAccessPageProps {
  params: Promise<{
    id: string;
  }>;
}

export const dynamic = 'force-dynamic';

export default async function ToolAccessPage(props: ToolAccessPageProps) {
  const params = await props.params;
  const { id } = params;
  await dbConnect();

  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  let tool;
  try {
     tool = await Tool.findById(id);
  } catch (e) {
      notFound();
  }

  if (!tool) {
    notFound();
  }

  // Access Control Logic
  const user = session.user as any;
  let hasAccess = false;

  if (user.role === 'admin') {
      hasAccess = true;
  } else {
      const dbUser = await User.findById(user.id).populate({
          path: 'subscriptions.packageId',
          populate: { path: 'tools' }
      });
      
      if (dbUser) {
           const activeSubs = dbUser.subscriptions.filter((sub: any) => 
               sub.status === 'active' && new Date(sub.endDate) > new Date()
           );
           
           for (const sub of activeSubs) {
               if (sub.packageId && sub.packageId.tools) {
                   if (sub.packageId.tools.some((t: any) => t._id.toString() === id)) {
                       hasAccess = true;
                       break;
                   }
               }
           }
      }
  }

  if (!hasAccess) {
      return (
        <div className="flex-1 p-8 pt-6 flex items-center justify-center min-h-[50vh]">
            <Card className="max-w-md w-full border-red-200">
                <CardHeader className="text-center">
                    <div className="mx-auto bg-red-100 p-3 rounded-full w-fit mb-4">
                        <Lock className="w-8 h-8 text-red-500" />
                    </div>
                    <CardTitle className="text-red-700">Access Denied</CardTitle>
                </CardHeader>
                <CardContent className="text-center space-y-4">
                    <p className="text-muted-foreground">
                        You do not have an active subscription for <strong>{tool.name}</strong>.
                    </p>
                    <div className="flex gap-2 justify-center">
                        <Link href="/dashboard">
                            <Button variant="outline">Back to Dashboard</Button>
                        </Link>
                        <Link href="/premium-tools">
                            <Button>Browse Packages</Button>
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
      );
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center space-x-2 mb-6">
         <Link href="/dashboard" className="text-muted-foreground hover:text-foreground transition">
            <ArrowLeft className="h-6 w-6" />
         </Link>
         <h1 className="text-3xl font-bold tracking-tight">{tool.name}</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
          <div className="md:col-span-2 space-y-6">
              {/* Access Area */}
              <Card className="border-primary/20 bg-primary/5">
                  <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                          <ExternalLink className="h-5 w-5 text-primary" />
                          Access Tool
                      </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                      <p className="text-sm text-foreground/80">
                          Click the button below to launch {tool.name}. A new window will open.
                      </p>
                      <ToolAccessLauncher toolId={id} toolName={tool.name} />
                      <div className="flex items-start gap-2 text-xs text-muted-foreground bg-background/50 p-2 rounded">
                          <Info className="h-4 w-4 mt-0.5" />
                          <p>
                              {tool.loginMethod && tool.loginMethod !== "none"
                                ? "This tool uses extension-based auto-login. Make sure the browser extension is installed and enabled."
                                : "If the tool does not open, please try again or contact support."}
                          </p>
                      </div>
                  </CardContent>
              </Card>

              {/* Tool Description */}
               <Card>
                  <CardHeader>
                      <CardTitle>About this Tool</CardTitle>
                  </CardHeader>
                   <CardContent>
                       <p className="text-foreground/80 leading-relaxed">
                           {tool.description}
                       </p>
                   </CardContent>
               </Card>
          </div>

          <div className="space-y-6">
              {/* Status Card */}
               <Card>
                   <CardHeader>
                       <CardTitle>Status</CardTitle>
                   </CardHeader>
                   <CardContent>
                       <div className="flex items-center gap-2">
                           {tool.status === 'active' ? (
                               <div className="flex items-center gap-2 text-green-500 font-medium">
                                   <span className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
                                   Operational
                               </div>
                           ) : (
                               <div className="flex items-center gap-2 text-yellow-500 font-medium">
                                   <AlertTriangle className="h-4 w-4" />
                                   {tool.status === 'maintenance' ? 'Maintenance' : 'Offline'}
                               </div>
                           )}
                       </div>
                   </CardContent>
               </Card>
               
               {/* Quick Info */}
                <Card>
                   <CardHeader>
                       <CardTitle>Details</CardTitle>
                   </CardHeader>
                   <CardContent className="space-y-2">
                       <div className="flex justify-between text-sm">
                           <span className="text-muted-foreground">Category</span>
                           <span className="font-medium">{tool.category}</span>
                       </div>
                        <div className="flex justify-between text-sm">
                           <span className="text-muted-foreground">Access Type</span>
                           <span className="font-medium">
                            {tool.loginMethod && tool.loginMethod !== "none"
                              ? `Extension (${tool.loginMethod})`
                              : "Direct Link"}
                           </span>
                        </div>
                   </CardContent>
               </Card>
          </div>
      </div>
    </div>
  );
}
