"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Trash } from "lucide-react";

export default function EditToolPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [tool, setTool] = useState<any>(null);
  const [pages, setPages] = useState<any[]>([]);

  // State to track if internal page is selected
  const [isInternal, setIsInternal] = useState(false);

  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [loginMethod, setLoginMethod] = useState<string>("none");
  const [loginDataText, setLoginDataText] = useState<string>("");

  useEffect(() => {
    if (!id) return;
    
    // Fetch tool, available pages, and categories
    Promise.all([
        fetch(`/api/tools/${id}`).then(res => res.json()),
        fetch('/api/admin/pages').then(res => res.json()),
        fetch('/api/admin/categories').then(res => res.json())
    ]).then(([toolData, pagesData, categoriesData]) => {
        setTool(toolData);
        setPages(pagesData);
        setCategories(categoriesData);
        setSelectedCategory(toolData.category);
        setLoginMethod(toolData.loginMethod || "none");
        setLoginDataText(toolData.loginData ? JSON.stringify(toolData.loginData, null, 2) : "");
        // Set initial internal state
        if (toolData.linkedPage) setIsInternal(true);
        setLoading(false);
    }).catch(err => {
        console.error(err);
        alert("Error fetching details");
        router.push("/admin/tools");
    });
  }, [id, router]);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);

    const formData = new FormData(event.currentTarget);
    if (selectedCategory) {
        formData.set('category', selectedCategory);
    }
    const data: any = Object.fromEntries(formData);
    
    // Handle linkedPage logic: if 'none', send null
    if (data.linkedPage === 'none') {
        data.linkedPage = null as any;
    }

    if (loginMethod === "cookies" || loginMethod === "localstorage" || loginMethod === "indexeddb") {
      if (!loginDataText.trim()) {
        alert("Please paste JSON login data for the selected login method.");
        setSubmitting(false);
        return;
      }
      try {
        JSON.parse(loginDataText);
      } catch {
        alert("Login data must be valid JSON.");
        setSubmitting(false);
        return;
      }
    }
    data.loginMethod = loginMethod;
    data.loginData =
      loginMethod === "cookies" || loginMethod === "localstorage" || loginMethod === "indexeddb"
        ? JSON.parse(loginDataText)
        : null;

    try {
      const res = await fetch(`/api/tools/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error("Failed to update tool");

      router.push("/admin/tools");
      router.refresh();
    } catch (error) {
      console.error(error);
      alert("Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  // ... (delete handler)

  if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin" /></div>;
  if (!tool) return <div>Tool not found</div>;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-3xl font-bold tracking-tight">Edit Tool: {tool.name}</h2>
      </div>

      <form onSubmit={onSubmit} className="space-y-6 border p-6 rounded-lg bg-card">
        <div className="space-y-2">
          <Label htmlFor="name">Tool Name</Label>
          <Input id="name" name="name" defaultValue={tool.name} required />
        </div>

        <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
                <Label htmlFor="price">Price ($)</Label>
                <Input type="number" id="price" name="price" defaultValue={tool.price} min="0" step="0.01" />
            </div>
            <div className="space-y-2">
                <Label htmlFor="interval">Billing Interval</Label>
                <Select name="interval" defaultValue={tool.interval || "monthly"}>
                    <SelectTrigger>
                        <SelectValue placeholder="Select interval" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="yearly">Yearly</SelectItem>
                        <SelectItem value="lifetime">Lifetime</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </div>

        <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select 
                name="category" 
                value={selectedCategory} 
                onValueChange={setSelectedCategory}
            >
                <SelectTrigger>
                <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                {categories.map((cat: any) => (
                    <SelectItem key={cat._id} value={cat.name}>{cat.name}</SelectItem>
                ))}
                {categories.length === 0 && <SelectItem value="SEO">SEO (Default)</SelectItem>}
                </SelectContent>
            </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select name="status" defaultValue={tool.status}>
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="maintenance">Maintenance</SelectItem>
              <SelectItem value="down">Down</SelectItem>
              <SelectItem value="stock_out">Stock Out</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="visibility">Visibility</Label>
          <Select name="visibility" defaultValue={tool.visibility || "public"}>
            <SelectTrigger>
              <SelectValue placeholder="Select visibility" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="public">Public</SelectItem>
              <SelectItem value="private">Private</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
            <Label htmlFor="linkedPage">Linked Internal Page (Access Control Source)</Label>
            <Select 
                name="linkedPage" 
                defaultValue={tool.linkedPage || "none"} 
                onValueChange={(val) => setIsInternal(val !== 'none')}
            >
            <SelectTrigger>
              <SelectValue placeholder="Select linked page" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None (Public/External)</SelectItem>
              {pages.map((page: any) => (
                  <SelectItem key={page._id} value={page._id}>
                      {page.title} ({page.slug})
                  </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">Select a page to grant access to when the user buys a package containing this tool.</p>
        </div>

        {!isInternal && (
            <div className="space-y-2">
            <Label htmlFor="url">Target URL</Label>
            <Input id="url" name="url" defaultValue={tool.url} required />
            </div>
        )}
        
        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea id="description" name="description" defaultValue={tool.description} required />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="icon">Product Icon URL</Label>
            <Input id="icon" name="icon" defaultValue={tool.icon || ""} placeholder="https://... or /icon.png" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="image">Product Image URL</Label>
            <Input id="image" name="image" defaultValue={tool.image || ""} placeholder="https://... or /image.png" />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="loginMethod">Login Method</Label>
          <Select name="loginMethod" value={loginMethod} onValueChange={setLoginMethod}>
            <SelectTrigger>
              <SelectValue placeholder="Select login method" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None (Direct access)</SelectItem>
              <SelectItem value="cookies">Cookies</SelectItem>
              <SelectItem value="localstorage">LocalStorage</SelectItem>
              <SelectItem value="indexeddb">IndexedDB</SelectItem>
              <SelectItem value="cloud">Cloud</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {(loginMethod === "cookies" || loginMethod === "localstorage" || loginMethod === "indexeddb") && (
          <div className="space-y-2">
            <Label htmlFor="loginData">Login Data JSON</Label>
            <Textarea
              id="loginData"
              value={loginDataText}
              onChange={(e) => setLoginDataText(e.target.value)}
              placeholder='Paste JSON data here...'
              rows={8}
              required
            />
            <p className="text-xs text-muted-foreground">
              Provide valid JSON. This will be applied by the browser extension before launching the tool.
            </p>
          </div>
        )}

        <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
            <Button type="submit" disabled={submitting}>
            {submitting ? "Saving..." : "Save Changes"}
            </Button>
        </div>
      </form>
    </div>
  );
}
