import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import bcrypt from "bcryptjs";

import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  const user = session?.user as any;

  if (!user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { currentPassword, newPassword } = await req.json();

  if (!currentPassword || !newPassword) {
    return NextResponse.json({ message: "Current and new password are required." }, { status: 400 });
  }

  if (newPassword.length < 6) {
    return NextResponse.json({ message: "New password must be at least 6 characters." }, { status: 400 });
  }

  await dbConnect();

  const dbUser = await User.findById(user.id).select("+password");

  if (!dbUser) {
    return NextResponse.json({ message: "User not found." }, { status: 404 });
  }

  if (!dbUser.password) {
    return NextResponse.json(
      { message: "This account uses social login. Password changes are not available here." },
      { status: 400 },
    );
  }

  const matches = await bcrypt.compare(currentPassword, dbUser.password);

  if (!matches) {
    return NextResponse.json({ message: "Current password is incorrect." }, { status: 400 });
  }

  dbUser.password = await bcrypt.hash(newPassword, 10);
  await dbUser.save();

  return NextResponse.json({ message: "Password updated successfully." });
}
