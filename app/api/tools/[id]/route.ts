import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Tool from "@/models/Tool";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

import Package from "@/models/Package";

export async function GET(req: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();
  try {
    const tool = await Tool.findById(params.id);
    if (!tool) return NextResponse.json({ error: "Tool not found" }, { status: 404 });
    
    return NextResponse.json(tool);
  } catch (error) {
    return NextResponse.json({ error: "Fetch failed" }, { status: 500 });
  }
}

export async function PATCH(req: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();
  const body = await req.json();
  const { price, interval, ...otherData } = body;
  console.log("PATCH Tool:", params.id, "Body:", body);

  try {
    // 1. Update the Tool Document
    const tool = await Tool.findByIdAndUpdate(params.id, 
        { ...otherData, price, interval }, 
        { new: true }
    );
    console.log("Updated Tool:", tool);
    
    if (!tool) return NextResponse.json({ error: "Tool not found" }, { status: 404 });

    // 2. Sync with Single-Tool Package only
    // Find a package that contains EXACTLY this tool and no others
    let pkg = await Package.findOne({ tools: { $size: 1, $all: [tool._id] } });
    
    if (pkg) {
        // Update existing single package
        pkg.name = tool.name; // Keep simple name
        pkg.price = parseFloat(price);
        pkg.interval = interval;
        pkg.visibility = tool.visibility;
        pkg.description = `Access to ${tool.name}`;
        await pkg.save();
    } else {
        // Create new single package if it doesn't exist
        await Package.create({
            name: tool.name,
            description: `Access to ${tool.name}`,
            price: parseFloat(price) || 0,
            interval: interval || 'monthly',
            tools: [tool._id],
            status: tool.status === 'inactive' ? 'inactive' : 'active',
            visibility: tool.visibility,
            features: ['Instant Access', 'Premium Support']
        });
    }

    return NextResponse.json(tool);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}

export async function DELETE(req: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  await dbConnect();
  try {
    await Tool.findByIdAndDelete(params.id);
    return NextResponse.json({ message: "Tool deleted" });
  } catch (error) {
      return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}
