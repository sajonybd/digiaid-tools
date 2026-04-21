import dbConnect from "@/lib/mongodb";
import Tool from "@/models/Tool";

export interface StorefrontProduct {
  _id: string;
  packageId?: string;
  name: string;
  description: string;
  tagline: string;
  image?: string;
  category: string;
  price: number;
  interval: "monthly" | "yearly" | "lifetime";
  status: "active" | "maintenance" | "down" | "stock_out";
  visibility: "public" | "private";
  brand: string;
  initial: string;
  tileClass: string;
  promoLabel: string;
}

const tileClasses = [
  "bg-orange-500 text-white",
  "bg-emerald-500 text-white",
  "bg-sky-500 text-white",
  "bg-violet-500 text-white",
  "bg-cyan-500 text-white",
  "bg-rose-500 text-white",
];

const statusLabels: Record<StorefrontProduct["status"], string> = {
  active: "Live Now",
  maintenance: "Setup Assist",
  down: "Limited Slots",
  stock_out: "Restocking",
};

function truncateText(value: string, maxLength: number) {
  if (value.length <= maxLength) {
    return value;
  }

  return `${value.slice(0, maxLength - 1).trim()}…`;
}

function extractBrand(name: string, category: string) {
  const [firstWord] = name.trim().split(/\s+/);
  return firstWord || category || "Tool";
}

export function mapToolToStorefront(tool: any, index = 0): StorefrontProduct {
  const name = tool.name || "Untitled Tool";
  const description = tool.description || "Premium SEO tool access with managed onboarding.";
  const brand = extractBrand(name, tool.category || "SEO");
  const initial = (brand[0] || name[0] || "T").toUpperCase();

  return {
    _id: String(tool._id),
    packageId: tool.packageId ? String(tool.packageId) : undefined,
    name,
    description,
    tagline: truncateText(description, 78),
    image: tool.image || tool.icon || undefined,
    category: tool.category || "SEO",
    price: Number(tool.price || 0),
    interval: (tool.interval || "monthly") as StorefrontProduct["interval"],
    status: (tool.status || "active") as StorefrontProduct["status"],
    visibility: (tool.visibility || "public") as StorefrontProduct["visibility"],
    brand,
    initial,
    tileClass: tileClasses[index % tileClasses.length],
    promoLabel: statusLabels[(tool.status || "active") as StorefrontProduct["status"]] || "Premium Pick",
  };
}

export async function getStorefrontProducts(): Promise<StorefrontProduct[]> {
  await dbConnect();

  const tools = await Tool.find({
    visibility: "public",
    status: { $in: ["active", "maintenance", "down", "stock_out"] },
    price: { $gt: 0 },
  })
    .sort({ createdAt: -1 })
    .lean();

  return tools.map((tool, index) => mapToolToStorefront(tool, index));
}
