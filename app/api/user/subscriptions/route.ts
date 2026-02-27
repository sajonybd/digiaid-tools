import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Subscription from "@/models/Subscription";
import Package from "@/models/Package"; // Ensure this is imported for populate
// If you have a Tool model, import that too because of your refPath: 'itemType'
// import Tool from "@/models/Tool"; 

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(req: Request) {
  await dbConnect();
  
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = session.user as any;

  try {
    // Query the Subscription collection directly
    const subscriptions = await Subscription.find({ 
      user: user.id 
    })
    .populate('packageId') // Mongoose uses refPath 'itemType' automatically here
    .sort({ createdAt: -1 });

    return NextResponse.json(subscriptions);
  } catch (error) {
    console.error("Failed to fetch subscriptions:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}