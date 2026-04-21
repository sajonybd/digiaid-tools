import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Package from "@/models/Package";
import Tool from "@/models/Tool"; // Ensure Tool model is registered
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(req: Request) {
  await dbConnect();
  
  // Need to ensure Tool model is compiled before population
  // This is a common mongoose issue in Next.js dev mode if models aren't imported
  console.log(Tool); 

  const session = await getServerSession(authOptions);
  const user = session?.user as any;
  const isAdmin = user?.role === 'admin';

  const { searchParams } = new URL(req.url);
  const visibility = searchParams.get('visibility');

  // Define query
  let query: any = { status: 'active' };

  // Admin can filter by visibility or status
  if (isAdmin) {
      if (visibility) query.visibility = visibility;
      const status = searchParams.get('status');
      if (status) query.status = status;
      // If no filters, show all (remove default status: active)
      delete query.status; 
      if (status) query.status = status; // Re-add if specified
  } else {
      // Public users only see active & public
      query.status = 'active';
      query.visibility = 'public';
  }

  try {
    const packages = await Package.find(query)
      .populate('tools')
      .sort({ sortOrder: 1, price: 1, createdAt: -1 });
    return NextResponse.json(packages);
  } catch (error) {
    console.error("Failed to fetch packages:", error);
    return NextResponse.json({ error: "Failed to fetch packages" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  const user = session?.user as any;
  
  if (user?.role !== 'admin') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();
  try {
    const body = await req.json();
    const pkg = await Package.create(body);
    return NextResponse.json(pkg, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create package" }, { status: 500 });
  }
}
