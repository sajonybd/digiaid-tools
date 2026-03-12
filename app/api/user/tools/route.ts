import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Tool from "@/models/Tool";
import User from "@/models/User";
import Package from "@/models/Package";
import Subscription from "@/models/Subscription";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();

  try {
      const allTools = await Tool.find({ status: 'active' }).sort({ createdAt: -1 });
      const user = session.user as any;
      const userId = user.id || user._id;
      console.log("Tools API: User Details:", { userId, role: user.role });

      // Admin sees everything as active
      if (user.role === 'admin') {
          return NextResponse.json(allTools.map(t => ({
              _id: t._id,
              name: t.name,
              description: t.description,
              category: t.category,
              status: t.status,
              url: t.url,
              loginMethod: t.loginMethod || 'none',
              access: { status: 'active', expiryDate: null }
          })));
      }

      const toolAccess = new Map<string, { status: 'active' | 'expired', expiryDate: Date, packageId: string }>();

      // Fetch all subscriptions for the user from dedicated collection
      const userSubscriptions = await Subscription.find({ 
          user: userId 
      }).populate({
          path: 'packageId',
          strictPopulate: false,
          populate: { 
              path: 'tools',
              strictPopulate: false
          }
      });

      if (userSubscriptions && userSubscriptions.length > 0) {
        userSubscriptions.forEach((sub: any) => {
            if (!sub.packageId) return;
            
            const isSubActive = sub.status === 'active' && new Date(sub.endDate) > new Date();
            const subStatus = isSubActive ? 'active' : 'expired';

            // Determine which tools are granted by this subscription
            let toolsToProcess: any[] = [];
            if (sub.itemType === 'Package' && sub.packageId.tools) {
                toolsToProcess = sub.packageId.tools;
            } else if (sub.itemType === 'Tool') {
                toolsToProcess = [sub.packageId];
            }

            toolsToProcess.forEach((t: any) => {
                const tid = t._id?.toString() || t.toString();
                const existing = toolAccess.get(tid);

                if (!existing) {
                    toolAccess.set(tid, {
                        status: subStatus,
                        expiryDate: sub.endDate,
                        packageId: sub.packageId._id || sub.packageId
                    });
                } else {
                    if (subStatus === 'active' && existing.status === 'expired') {
                        toolAccess.set(tid, {
                            status: 'active',
                            expiryDate: sub.endDate,
                            packageId: sub.packageId._id || sub.packageId
                        });
                    } else if (subStatus === existing.status) {
                        if (new Date(sub.endDate) > new Date(existing.expiryDate)) {
                            toolAccess.set(tid, {
                                status: subStatus,
                                expiryDate: sub.endDate,
                                packageId: sub.packageId._id || sub.packageId
                            });
                        }
                    }
                }
            });
        });
      }

      // Return tools user has history with, attached with access info
      const userTools = allTools
        .filter(t => toolAccess.has(t._id.toString()))
        .map(t => ({
            _id: t._id,
            name: t.name,
            description: t.description,
            category: t.category,
            status: t.status,
            url: t.url,
            loginMethod: t.loginMethod || 'none',
            access: toolAccess.get(t._id.toString())
        }));
      
      return NextResponse.json(userTools);

  } catch (error: any) {
    console.error("Tools API Error:", error);
    return NextResponse.json({ error: error.message || "Fetch failed" }, { status: 500 });
  }
}
