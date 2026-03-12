import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Tool from "@/models/Tool";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(req: Request) {
  await dbConnect();
  const session = await getServerSession(authOptions);
  const user = session?.user as any;
  const isAdmin = user?.role === 'admin';

  let query: any = { status: { $ne: 'inactive' } }; // Default: show everything except inactive

  if (!isAdmin) {
    query.visibility = 'public';
    query.status = { $in: ['active', 'maintenance', 'down', 'stock_out'] };
  }

  try {
    const toolQuery = Tool.find(query);
    if (!isAdmin) {
      toolQuery.select("-loginData");
    }
    const tools = await toolQuery.sort({ createdAt: -1 });
    return NextResponse.json(tools);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch tools" }, { status: 500 });
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
    const tool = await Tool.create(body);
    return NextResponse.json(tool, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create tool" }, { status: 500 });
  }
}
