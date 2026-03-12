import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import Tool from "@/models/Tool";
import Subscription from "@/models/Subscription";

export const dynamic = "force-dynamic";

export async function GET(req: Request, props: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const params = await props.params;
  const toolId = params.id;
  const user = session.user as any;

  await dbConnect();

  const tool = await Tool.findById(toolId);
  if (!tool) {
    return NextResponse.json({ error: "Tool not found" }, { status: 404 });
  }

  if (tool.status !== "active" && user.role !== "admin") {
    return NextResponse.json({ error: "Tool is currently unavailable" }, { status: 403 });
  }

  let hasAccess = user.role === "admin";

  if (!hasAccess) {
    const subs = await Subscription.find({
      user: user.id || user._id,
      status: "active",
      endDate: { $gt: new Date() },
    }).populate({
      path: "packageId",
      strictPopulate: false,
      populate: {
        path: "tools",
        strictPopulate: false,
      },
    });

    hasAccess = subs.some((sub: any) => {
      if (!sub.packageId) return false;

      if (sub.itemType === "Tool") {
        return sub.packageId._id?.toString() === toolId || sub.packageId.toString() === toolId;
      }

      if (sub.itemType === "Package" && sub.packageId.tools) {
        return sub.packageId.tools.some((t: any) => t._id?.toString() === toolId || t.toString() === toolId);
      }

      return false;
    });
  }

  if (!hasAccess) {
    return NextResponse.json({ error: "Access denied" }, { status: 403 });
  }

  let loginData = tool.loginData ?? null;

  if (tool.loginMethod === "cookies" && loginData) {
    const sanitizeCookies = (cookies: any[]) =>
      cookies.map((cookie) => {
        if (cookie.name?.startsWith("__Host-")) {
          const { domain, ...rest } = cookie;
          return { ...rest, path: "/", secure: true };
        }
        if (cookie.name?.startsWith("__Secure-")) {
          return { ...cookie, secure: true };
        }
        return cookie;
      });

    if (Array.isArray(loginData)) {
      loginData = sanitizeCookies(loginData);
    } else if (Array.isArray(loginData.cookies)) {
      loginData.cookies = sanitizeCookies(loginData.cookies);
    }
  }

  return NextResponse.json(
    {
      toolId: tool._id,
      toolName: tool.name,
      targetUrl: tool.url,
      loginMethod: tool.loginMethod || "none",
      loginData,
    },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    }
  );
}
