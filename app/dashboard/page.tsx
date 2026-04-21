"use client";

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { ToolCard } from "@/components/tool-card"
import User from "@/models/User";
import { Sparkles, Zap, Image as ImageIcon, PenTool, LayoutTemplate, Search, ExternalLink } from "lucide-react"

// Client component wrapper for session check, but we need data fetching too.
// Converting to Client Component for now to keep it simple with existing code structure, 
// using useEffect for fetch or separate Server Component. 
// Let's keep it client-side fetching for now since the whole dashboard is useClient.

interface Tool {
    _id: string;
    name: string;
    description: string;
    category: string;
    status: "active" | "maintenance" | "inactive";
    url: string;
    access?: {
        status: 'active' | 'expired';
        expiryDate?: string;
        packageId?: string;
    };
}

export default function DashboardPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [tools, setTools] = useState<Tool[]>([]);
  const [isLoadingTools, setIsLoadingTools] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    }
  }, [status, router])

  useEffect(() => {
      async function fetchTools() {
          try {
              const res = await fetch('/api/user/tools');
              if (res.ok) {
                  const data = await res.json();
                  const sorted = data.sort((a: any, b: any) => {
                      if (a.access?.status === 'active' && b.access?.status !== 'active') return -1;
                      if (a.access?.status !== 'active' && b.access?.status === 'active') return 1;
                      return 0;
                  });
                  setTools(sorted);
              }
          } catch (error) {
              console.error("Failed to fetch tools", error);
          } finally {
              setIsLoadingTools(false);
          }
      }
      fetchTools();
  }, []);

  if (status === "loading") {
    return <div className="min-h-screen bg-background flex items-center justify-center">Loading...</div>
  }

  if (!session?.user) return null

  // The following code block from the instruction is designed for a Server Component.
  // It cannot be directly executed in a Client Component with `await` calls outside of an async function.
  // To make it syntactically correct within this Client Component context,
  // I'm commenting it out as a placeholder for server-side logic.
  // If the intention is to convert this to a Server Component,
  // then 'use client' and client-side hooks (useState, useEffect, useRouter, useSession) would need to be removed or refactored.

  /*
  if (!session?.user) await dbConnect(); // This line is problematic in a client component

  // Fetch all active tools
  const allTools = await Tool.find({ status: 'active' }).sort({ createdAt: -1 });

  // Get user details for subscription filtering
  const dbUser = await User.findById((session.user as any).id).populate({
      path: 'subscriptions.packageId',
      populate: { path: 'tools' }
  });

  // Collect IDs of tools accessible to the user
  const accessibleToolIds = new Set<string>();
  
  if (dbUser.role === 'admin') {
      // Admin sees everything
      allTools.forEach(t => accessibleToolIds.add(t._id.toString()));
  } else {
      const activeSubs = dbUser.subscriptions.filter((sub: any) => {
          return sub.status === 'active' && new Date(sub.endDate) > new Date();
      });

      activeSubs.forEach((sub: any) => {
          if (sub.packageId && sub.packageId.tools) {
              sub.packageId.tools.forEach((t: any) => {
                  accessibleToolIds.add(t._id.toString());
              });
          }
      });
  }

  // Filter tools
  const tools = allTools.filter(t => accessibleToolIds.has(t._id.toString()));
  */

  const announcements = [
    { id: 1, title: "New Digital Tools Added", date: "2024-03-20" },
    { id: 2, title: "System Maintenance Scheduled", date: "2024-03-25" },
  ];
  // Helper to map category to icon
  const getIcon = (category: string) => {
      switch(category) {
          case 'SEO': return <Search className="w-6 h-6" />;
          case 'AI': return <Sparkles className="w-6 h-6" />;
          case 'Design': return <PenTool className="w-6 h-6" />;
          case 'Writing': return <Zap className="w-6 h-6" />;
          default: return <ExternalLink className="w-6 h-6" />;
      }
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
      </div>
      
      {/* Status Banner */}
      <div className="w-full bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-2 text-blue-500">
               <Sparkles className="w-5 h-5 fill-blue-500/20" />
               <h3 className="font-semibold">What's New</h3>
          </div>
          <p className="text-sm text-foreground/80 mt-1 pl-7">
              Welcome to your new dashboard! Tools are now dynamically managed.
          </p>
      </div>

       <div className="space-y-4">
             <div className="flex items-center gap-2">
                  <h3 className="text-xl font-semibold">Your Tools</h3>
             </div>
             
             {isLoadingTools ? (
                 <div className="text-center py-8">Loading tools...</div>
             ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {tools.map((tool) => (
                        <ToolCard 
                            key={tool._id}
                            name={tool.name}
                            description={tool.description}
                            category={tool.category}
                            status={tool.status}
                            access={tool.access}
                            icon={getIcon(tool.category)}
                            url={`/dashboard/tools/${tool._id}`}
                        />
                    ))}
                    {tools.length === 0 && (
                        <p className="col-span-3 text-center py-10 text-muted-foreground">
                            No tools available yet. Admin needs to add them.
                        </p>
                    )}
                </div>
             )}
       </div>
    </div>
  )
}
