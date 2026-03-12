import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Setting from "@/models/Setting";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// Middleware check helper
const checkAdmin = async () => {
    const session = await getServerSession(authOptions);
    const user = session?.user as any;
    if (user?.role !== 'admin') throw new Error("Unauthorized");
    return user;
}

export async function GET(req: Request) {
  await dbConnect();
  try {
    await checkAdmin();
    // Assuming a single settings document.
    let setting = await Setting.findOne({});
    if (!setting) {
      setting = await Setting.create({});
    }
    return NextResponse.json(setting);
  } catch (error) {
    return NextResponse.json({ error: "Unauthorized or Error fetching settings" }, { status: 401 });
  }
}

export async function PUT(req: Request) {
  await dbConnect();
  try {
    await checkAdmin();
    const data = await req.json();

    let setting = await Setting.findOne({});
    if (!setting) {
      setting = new Setting(data);
    } else {
      setting.set(data);
    }
    
    // update the timestamp
    setting.updatedAt = Date.now();
    await setting.save();

    return NextResponse.json(setting);
  } catch (error) {
    console.error("Setting update failed:", error);
    return NextResponse.json({ error: "Failed to update setting" }, { status: 500 });
  }
}
