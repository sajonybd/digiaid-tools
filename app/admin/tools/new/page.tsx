"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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

export default function NewToolPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [pages, setPages] = useState<any[]>([]);
  const [isInternal, setIsInternal] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [loginMethod, setLoginMethod] = useState<string>("none");
  const [loginDataText, setLoginDataText] = useState<string>("");

  useEffect(() => {
      fetch('/api/admin/pages')
        .then(res => res.json())
        .then(data => setPages(data))
        .catch(err => console.error("Failed to load pages"));

      fetch('/api/admin/categories')
        .then(res => res.json())
        .then(data => {
            setCategories(data);
            if (data.length > 0 && !selectedCategory) {
                setSelectedCategory(data[0].name);
            }
        })
        .catch(err => console.error("Failed to load categories"));
  }, []);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);

    const formData = new FormData(event.currentTarget);
    if (selectedCategory) {
        formData.set('category', selectedCategory);
    }
    const data = Object.fromEntries(formData);
    
    if (data.linkedPage === 'none') {
        delete data.linkedPage;
    }

    if (loginMethod === "cookies" || loginMethod === "localstorage" || loginMethod === "indexeddb") {
      if (!loginDataText.trim()) {
        alert("Please paste JSON login data for the selected login method.");
        setLoading(false);
        return;
      }
      try {
        JSON.parse(loginDataText);
      } catch {
        alert("Login data must be valid JSON.");
        setLoading(false);
        return;
      }
    }

    (data as any).loginMethod = loginMethod;
    (data as any).loginData =
      loginMethod === "cookies" || loginMethod === "localstorage" || loginMethod === "indexeddb"
        ? JSON.parse(loginDataText)
        : null;

    try {
      const res = await fetch("/api/tools", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error("Failed to create tool");

      router.push("/admin/tools");
      router.refresh();
    } catch (error) {
      console.error(error);
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-3xl font-bold tracking-tight">Add New Tool</h2>
      </div>

      <form onSubmit={onSubmit} className="space-y-6 border p-6 rounded-lg bg-card">
        <div className="space-y-2">
          <Label htmlFor="name">Tool Name</Label>
          <Input id="name" name="name" placeholder="e.g. SEMRush" required />
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

        <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
                <Label htmlFor="price">Price ($)</Label>
                <Input type="number" id="price" name="price" defaultValue="0" min="0" step="0.01" />
            </div>
            <div className="space-y-2">
                <Label htmlFor="interval">Billing Interval</Label>
                <Select name="interval" defaultValue="monthly">
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
          <Label htmlFor="status">Status</Label>
          <Select name="status" defaultValue="active">
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
          <Select name="visibility" defaultValue="public">
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
            <Label htmlFor="linkedPage">Linked Internal Page (Access Control)</Label>
            <Select name="linkedPage" defaultValue="none" onValueChange={(val) => setIsInternal(val !== 'none')}>
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
        </div>

        {!isInternal && (
            <div className="space-y-2">
            <Label htmlFor="url">Target URL</Label>
            <Input id="url" name="url" placeholder="https://..." required />
            </div>
        )}
        
        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea id="description" name="description" placeholder="Brief description..." required />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="icon">Product Icon URL</Label>
            <Input id="icon" name="icon" placeholder="https://... or /icon.png" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="image">Product Image URL</Label>
            <Input id="image" name="image" placeholder="https://... or /image.png" />
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
            <Button type="submit" disabled={loading}>
            {loading ? "Creating..." : "Create Tool"}
            </Button>
        </div>
      </form>
    </div>
  );
}
