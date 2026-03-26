import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import Setting from "@/models/Setting";
import Subscription from "@/models/Subscription";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function DownloadExtensionPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const user = session.user as any;
  await dbConnect();

  const isAdmin = user?.role === "admin";
  let hasActiveSubscription = isAdmin;

  if (!hasActiveSubscription) {
    const subs = await Subscription.find({
      user: user.id || user._id,
      status: "active",
      endDate: { $gt: new Date() },
    }).limit(1);

    hasActiveSubscription = subs.length > 0;
  }

  if (!hasActiveSubscription) {
    return (
      <div className="flex-1 p-8 pt-6 flex items-center justify-center min-h-[50vh]">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Extension download is available only for active subscribers.
            </p>
            <Button asChild className="w-full">
              <Link href="/premium-tools">Browse Packages</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const setting = await Setting.findOne({}).lean();
  const url = (setting as any)?.extensionDownloadUrl as string | undefined;

  if (url && typeof url === "string" && url.trim().length > 0) {
    redirect(url.trim());
  }

  return (
    <div className="flex-1 p-8 pt-6 flex items-center justify-center min-h-[50vh]">
      <Card className="max-w-md w-full">
        <CardHeader>
          <CardTitle>Download Not Configured</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Ask an admin to set the Extension Download URL in Admin Settings.
          </p>
          <Button asChild className="w-full" variant="outline">
            <Link href="/dashboard">Back to Dashboard</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

