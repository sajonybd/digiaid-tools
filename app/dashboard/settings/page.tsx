"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";

export default function SettingsPage() {
  const { data: session } = useSession();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handlePasswordChange = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (form.newPassword !== form.confirmPassword) {
      toast({ title: "Passwords do not match", variant: "destructive" });
      return;
    }

    setSaving(true);

    try {
      const res = await fetch("/api/user/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: form.currentPassword,
          newPassword: form.newPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to update password");
      }

      setForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      toast({ title: "Password updated successfully" });
    } catch (error: any) {
      toast({
        title: error.message || "Failed to update password",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Account Settings</h1>
        <p className="text-muted-foreground">Update your login credentials and review your account details.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profile Summary</CardTitle>
          <CardDescription>Your basic account information.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div>
            <span className="font-medium text-foreground">Name:</span>{" "}
            <span className="text-muted-foreground">{session?.user?.name || "Unknown user"}</span>
          </div>
          <div>
            <span className="font-medium text-foreground">Email:</span>{" "}
            <span className="text-muted-foreground">{session?.user?.email || "No email"}</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Password Reset / Change</CardTitle>
          <CardDescription>Use your current password to set a new one.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordChange} className="space-y-4 max-w-lg">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Current Password</Label>
              <Input
                id="currentPassword"
                name="currentPassword"
                type="password"
                value={form.currentPassword}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                name="newPassword"
                type="password"
                value={form.newPassword}
                onChange={handleChange}
                required
                minLength={6}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={form.confirmPassword}
                onChange={handleChange}
                required
                minLength={6}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              If your account was created with Google or another social login, this form will let you know that password changes are not available here.
            </p>
            <Button type="submit" disabled={saving}>
              {saving ? "Updating..." : "Change Password"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="border border-destructive/20 bg-destructive/5 p-4 rounded-lg">
        <h3 className="font-semibold text-destructive">Danger Zone</h3>
        <p className="text-sm text-foreground/60 mb-4">Permanently delete your account and all data.</p>
        <button className="bg-destructive text-destructive-foreground px-4 py-2 rounded text-sm disabled:opacity-50">
          Delete Account
        </button>
      </div>
    </div>
  );
}
