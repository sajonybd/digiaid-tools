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
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2 } from "lucide-react";

interface PackageFormProps {
    initialData?: any;
    isEdit?: boolean;
}

export function PackageForm({ initialData, isEdit }: PackageFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [tools, setTools] = useState([]);
    const [selectedTools, setSelectedTools] = useState<string[]>(initialData?.tools?.map((t:any) => t._id || t) || []);

    const [formData, setFormData] = useState({
        name: initialData?.name || "",
        price: initialData?.price || 0,
        interval: initialData?.interval || "monthly",
        description: initialData?.description || "",
        sortOrder: initialData?.sortOrder || 0,
        status: initialData?.status || "active",
        visibility: initialData?.visibility || "public",
        is_featured: initialData?.is_featured || false,
        features: initialData?.features?.join('\n') || ""
    });

    useEffect(() => {
        fetch('/api/tools').then(res => res.json()).then(setTools);
    }, []);

    const toggleTool = (toolId: string) => {
        setSelectedTools(prev => 
            prev.includes(toolId) ? prev.filter(id => id !== toolId) : [...prev, toolId]
        );
    };

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        
        try {
            const payload = {
                ...formData,
                tools: selectedTools,
                features: formData.features.split('\n').filter((f: string) => f.trim() !== '')
            };

            const url = isEdit ? `/api/packages/${initialData._id}` : '/api/packages';
            const method = isEdit ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            if (!res.ok) throw new Error("Operation failed");
            
            router.push('/admin/packages');
            router.refresh();
        } catch (error) {
            console.error(error);
            alert("Error saving package");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <form onSubmit={onSubmit} className="space-y-6 max-w-2xl border p-6 rounded-lg bg-card">
            <div className="space-y-2">
                <Label>Package Name</Label>
                <Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label>Price ($)</Label>
                    <Input type="number" value={formData.price} onChange={e => setFormData({...formData, price: Number(e.target.value)})} min="0" step="0.01" required />
                </div>
                 <div className="space-y-2">
                    <Label>Billing Interval</Label>
                    <Select value={formData.interval} onValueChange={v => setFormData({...formData, interval: v})}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="monthly">Monthly</SelectItem>
                            <SelectItem value="yearly">Yearly</SelectItem>
                            <SelectItem value="lifetime">Lifetime</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="space-y-2">
                <Label>Package Sort Order</Label>
                <Input
                    type="number"
                    value={formData.sortOrder}
                    onChange={e => setFormData({...formData, sortOrder: Number(e.target.value)})}
                    min="0"
                    step="1"
                />
                <p className="text-xs text-muted-foreground">
                    Lower numbers appear first in the package listing.
                </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-2">
                    <Label>Status</Label>
                    <Select value={formData.status} onValueChange={v => setFormData({...formData, status: v})}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="inactive">Inactive</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                 <div className="space-y-2">
                    <Label>Visibility</Label>
                    <Select value={formData.visibility} onValueChange={v => setFormData({...formData, visibility: v})}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="public">Public</SelectItem>
                            <SelectItem value="private">Private</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
            
            <div className="flex items-center space-x-2 border p-4 rounded-md">
                <Checkbox 
                    id="featured" 
                    checked={formData.is_featured} 
                    onCheckedChange={(c) => setFormData({...formData, is_featured: !!c})} 
                />
                <Label htmlFor="featured" className="cursor-pointer">Mark as Featured (Premium Design)</Label>
            </div>

            <div className="space-y-2">
                 <Label>Included Tools</Label>
                 <div className="border rounded-md p-4 h-60 overflow-y-auto grid grid-cols-2 gap-2">
                     {tools.map((tool: any) => (
                         <div key={tool._id} className="flex items-center space-x-2">
                             <Checkbox 
                                id={`tool-${tool._id}`} 
                                checked={selectedTools.includes(tool._id)}
                                onCheckedChange={() => toggleTool(tool._id)}
                             />
                             <Label htmlFor={`tool-${tool._id}`} className="cursor-pointer text-sm font-normal">
                                 {tool.name}
                             </Label>
                         </div>
                     ))}
                 </div>
            </div>

            <div className="space-y-2">
                <Label>Description</Label>
                <Textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} rows={3} />
            </div>

            <div className="space-y-2">
                <Label>Features List (One per line)</Label>
                <Textarea value={formData.features} onChange={e => setFormData({...formData, features: e.target.value})} rows={5} placeholder="Instant Access&#10;Premium Support" />
            </div>

            <div className="flex justify-end gap-4">
                <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
                <Button type="submit" disabled={submitting}>
                    {submitting ? "Saving..." : isEdit ? "Update Package" : "Create Package"}
                </Button>
            </div>
        </form>
    );
}
