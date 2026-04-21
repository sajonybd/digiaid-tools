"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Headphones,
  LifeBuoy,
  Menu,
  PiggyBank,
  Search,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Users,
  X,
  Zap,
} from "lucide-react";

import { CartDrawer } from "@/components/cart-drawer";
import { useCart } from "@/components/providers/cart-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";
import { useSiteSettings } from "@/components/providers/site-settings-provider";
import { PriceDisplay } from "@/components/price-display";
import type { StorefrontProduct } from "@/lib/storefront";

interface StorefrontClientProps {
  products: StorefrontProduct[];
  mode: "home" | "catalog";
}

const trustItems = [
  { Icon: CheckCircle2, label: "100% Genuine Licenses" },
  { Icon: Zap, label: "Instant Email Delivery" },
  { Icon: Headphones, label: "Priority Human Support" },
  { Icon: ShieldCheck, label: "Refund-Friendly Checkout" },
];

const whyUsItems = [
  {
    Icon: PiggyBank,
    title: "Lower overhead than full retail plans",
    desc: "Give buyers a cleaner way to access expensive SEO subscriptions without a bloated procurement process.",
  },
  {
    Icon: Sparkles,
    title: "Curated for real SEO workflows",
    desc: "From keyword research to backlink audits, every listing is positioned around practical operator needs.",
  },
  {
    Icon: LifeBuoy,
    title: "Support stays close to the sale",
    desc: "Customers can buy, get onboarded, and come back for help without feeling dropped after checkout.",
  },
];

const faqItems = [
  {
    question: "How fast do buyers get access after payment?",
    answer:
      "Most orders can be processed quickly after confirmation. If a tool needs manual setup, the delivery timeline can be communicated clearly in the product description or checkout flow.",
  },
  {
    question: "Can I manage tool content from the admin panel?",
    answer:
      "Yes. The storefront reads from the production tool records, so when you update tool name, image, price, category, or description in admin, these pages reflect that live content.",
  },
  {
    question: "What kinds of products belong here best?",
    answer:
      "This layout is strongest for premium SEO tools, marketing subscriptions, AI utilities, design tools, and similar software offers with trust-sensitive purchase decisions.",
  },
  {
    question: "Can this design work with your existing checkout and cart?",
    answer:
      "Yes. The pages use the existing production cart provider, so buyers can still add items, open the cart drawer, and continue into the current checkout flow.",
  },
];

function getCategoryStats(products: StorefrontProduct[]) {
  return Object.entries(
    products.reduce<Record<string, number>>((acc, product) => {
      acc[product.category] = (acc[product.category] || 0) + 1;
      return acc;
    }, {}),
  )
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([name, count], index) => {
      const accents = [
        {
          iconBg: "bg-orange-100 text-orange-600",
          gradient: "from-orange-100/80 to-amber-100/70",
        },
        {
          iconBg: "bg-emerald-100 text-emerald-600",
          gradient: "from-emerald-100/80 to-teal-100/70",
        },
        {
          iconBg: "bg-sky-100 text-sky-600",
          gradient: "from-sky-100/80 to-cyan-100/70",
        },
        {
          iconBg: "bg-violet-100 text-violet-600",
          gradient: "from-violet-100/80 to-fuchsia-100/70",
        },
      ];
      const Icon = index % 2 === 0 ? TrendingUp : Sparkles;
      return {
        name,
        count,
        Icon,
        ...accents[index % accents.length],
      };
    });
}

function ProductVisual({
  product,
  className,
  imageClassName,
}: {
  product: StorefrontProduct;
  className?: string;
  imageClassName?: string;
}) {
  if (product.image) {
    return (
      <div className={cn("relative overflow-hidden rounded-2xl bg-black", className)}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={product.image}
          alt={product.name}
          className={cn("h-full w-full object-cover", imageClassName)}
        />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-white",
        className,
      )}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.16),_transparent_38%),radial-gradient(circle_at_bottom_left,_rgba(249,115,22,0.25),_transparent_42%)]" />
      <div className="relative flex h-full min-h-[180px] flex-col justify-between p-4">
        <div className="flex items-start justify-between gap-3">
          <div
            className={cn(
              "flex h-11 w-11 items-center justify-center rounded-2xl text-lg font-black shadow-lg",
              product.tileClass,
            )}
          >
            {product.initial}
          </div>
          <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/80">
            {product.category}
          </span>
        </div>

        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/55">
            Managed access
          </p>
          <h3 className="mt-2 text-lg font-extrabold leading-tight">{product.name}</h3>
          <p className="mt-2 text-sm leading-relaxed text-white/70">{product.tagline}</p>
        </div>
      </div>
    </div>
  );
}

function StorefrontProductCard({ product }: { product: StorefrontProduct }) {
  const { addToCart } = useCart();
  const router = useRouter();

  const cartId = product.packageId || product._id;

  const handleAddToCart = () => {
    addToCart(
      {
        _id: cartId,
        name: product.name,
        price: product.price,
        type: "package",
        image: product.image,
      },
      true,
    );
  };

  const handleBuyNow = () => {
    addToCart(
      {
        _id: cartId,
        name: product.name,
        price: product.price,
        type: "package",
        image: product.image,
      },
      false,
    );
    router.push("/checkout");
  };

  return (
    <article className="group relative flex h-full flex-col rounded-3xl border border-border bg-card p-4 shadow-sm transition-all hover:-translate-y-1 hover:border-primary/30 hover:shadow-xl">
      <Link href={`/tools/${product._id}`} className="mb-4 block overflow-hidden rounded-2xl">
        <ProductVisual product={product} className="rounded-2xl" imageClassName="h-40 w-full" />
      </Link>

      <div className="mb-3 flex items-start justify-between gap-3">
        <div
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-xl text-base font-bold shadow-sm",
            product.tileClass,
          )}
          aria-hidden
        >
          {product.initial}
        </div>
        <Badge
          variant="secondary"
          className={cn(
            "rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em]",
            product.visibility === "private"
              ? "bg-emerald-100 text-emerald-700"
              : "bg-slate-100 text-slate-700",
          )}
        >
          {product.visibility === "private" ? "Private" : "Shared"}
        </Badge>
      </div>

      <h3 className="text-base font-bold leading-tight text-foreground">
        <Link href={`/tools/${product._id}`} className="hover:text-primary">
          {product.name}
        </Link>
      </h3>

      <p className="mt-2 min-h-10 text-sm leading-relaxed text-muted-foreground">
        {product.tagline}
      </p>

      <div className="mt-3 flex items-center justify-between gap-3 text-xs">
        <span className="rounded-full bg-primary/10 px-2.5 py-1 font-semibold uppercase tracking-[0.12em] text-primary">
          {product.category}
        </span>
        <span className="text-muted-foreground">{product.promoLabel}</span>
      </div>

      <div className="mt-5 flex items-end justify-between gap-3">
        <div className="flex flex-col">
          <span className="text-2xl font-extrabold tracking-tight text-foreground">
            <PriceDisplay amount={product.price} />
          </span>
          <span className="text-xs capitalize text-muted-foreground">
            {product.interval === "monthly" ? "per month" : product.interval === "yearly" ? "per year" : "one time"}
          </span>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <Button variant="outline" className="rounded-xl" onClick={handleAddToCart}>
          Add to Cart
        </Button>
        <Button className="rounded-xl" onClick={handleBuyNow}>
          Quick Buy
        </Button>
      </div>
    </article>
  );
}

function StorefrontHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { data: session } = useSession();
  const siteSettings = useSiteSettings();

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center gap-4 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex shrink-0 items-center gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={siteSettings.logoUrl}
            alt={siteSettings.siteName}
            className="h-8 w-8 rounded-lg object-contain"
          />
          <span className="text-lg font-extrabold tracking-tight text-foreground">
            {siteSettings.siteName}
          </span>
        </Link>

        <nav className="hidden items-center gap-6 text-sm font-medium lg:flex">
          <Link href="/premium-tools" className="transition-colors hover:text-primary">
            Products
          </Link>
          <a href="/#shop" className="transition-colors hover:text-primary">
            Shop
          </a>
          <Link href="/packages" className="transition-colors hover:text-primary">
            Packages
          </Link>
        </nav>

        <div className="mx-auto hidden flex-1 md:flex lg:max-w-[20rem]">
          <div className="relative w-full">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="search"
              placeholder="Search SEO tools..."
              className="h-10 w-full rounded-xl border border-input bg-muted/60 pl-10 pr-4 text-sm outline-none transition-all placeholder:text-muted-foreground focus:border-primary focus:bg-background"
            />
          </div>
        </div>

        <div className="ml-auto flex items-center gap-2">
          {session ? (
            <Link
              href="/dashboard"
              className="hidden rounded-xl px-3 py-2 text-sm font-medium transition-colors hover:bg-muted sm:inline-flex"
            >
              Client Area
            </Link>
          ) : (
            <Link
              href="/login"
              className="hidden rounded-xl px-3 py-2 text-sm font-medium transition-colors hover:bg-muted sm:inline-flex"
            >
              Login
            </Link>
          )}

          <CartDrawer />

          <button
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl transition-colors hover:bg-muted lg:hidden"
            onClick={() => setMobileOpen((value) => !value)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <div
        className={cn(
          "overflow-hidden border-t border-border bg-background transition-[max-height] duration-300 lg:hidden",
          mobileOpen ? "max-h-80" : "max-h-0",
        )}
      >
        <nav className="mx-auto flex w-full max-w-7xl flex-col gap-1 px-4 py-4 text-sm font-medium sm:px-6">
          <Link href="/premium-tools" className="rounded-lg px-2 py-2.5 hover:bg-muted">
            Products
          </Link>
          <a href="/#shop" className="rounded-lg px-2 py-2.5 hover:bg-muted">
            Shop
          </a>
          <Link href="/packages" className="rounded-lg px-2 py-2.5 hover:bg-muted">
            Packages
          </Link>
          <Link href={session ? "/dashboard" : "/login"} className="rounded-lg px-2 py-2.5 hover:bg-muted">
            {session ? "Client Area" : "Login"}
          </Link>
        </nav>
      </div>
    </header>
  );
}

function StorefrontFooter() {
  const siteSettings = useSiteSettings();

  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="mb-4 flex items-center gap-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={siteSettings.logoUrl}
                alt={siteSettings.siteName}
                className="h-8 w-8 rounded-lg object-contain"
              />
              <span className="text-lg font-extrabold tracking-tight">{siteSettings.siteName}</span>
            </div>
            <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
              {siteSettings.siteTagline}
            </p>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-bold">Quick Links</h4>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              <li><Link href="/premium-tools" className="hover:text-primary">All Products</Link></li>
              <li><Link href="/packages" className="hover:text-primary">Packages</Link></li>
              <li><Link href="/dashboard" className="hover:text-primary">Client Area</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-bold">Support</h4>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              <li><a href={`mailto:${siteSettings.supportEmail || "support@example.com"}`} className="hover:text-primary">Email Support</a></li>
              <li><a href={siteSettings.facebookChatUrl || "#"} className="hover:text-primary">Messenger</a></li>
              <li><a href={`https://wa.me/${siteSettings.whatsappNumber}`} className="hover:text-primary">WhatsApp</a></li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-bold">Payments</h4>
            <div className="flex flex-wrap gap-2 text-xs font-semibold text-muted-foreground">
              <span className="rounded bg-muted px-2 py-1">bKash</span>
              <span className="rounded bg-muted px-2 py-1">Rocket</span>
              <span className="rounded bg-muted px-2 py-1">Nagad</span>
              <span className="rounded bg-muted px-2 py-1">Bank</span>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-border pt-6 sm:flex-row">
          <p className="text-xs text-muted-foreground">
            {siteSettings.footerText}
          </p>
          <div className="text-xs text-muted-foreground">
            Built for premium SEO tool sales and managed onboarding.
          </div>
        </div>
      </div>
    </footer>
  );
}

function HeroSection({ products }: { products: StorefrontProduct[] }) {
  const siteSettings = useSiteSettings();
  const categories = new Set(products.map((product) => product.category)).size;

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-orange-50 via-white to-orange-50/60">
      <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-orange-200/40 blur-3xl" />
      <div className="absolute -left-20 bottom-0 h-72 w-72 rounded-full bg-amber-200/30 blur-3xl" />

      <div className="relative mx-auto grid w-full max-w-7xl gap-10 px-4 pb-12 pt-10 sm:px-6 lg:grid-cols-2 lg:px-8 lg:pb-16 lg:pt-14">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1.5 text-xs font-semibold text-primary">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
            Premium SEO tools with faster delivery and hands-on support
          </span>

          <h1 className="mt-5 text-4xl font-extrabold leading-[1.05] tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            {siteSettings.siteName}
            <br />
            <span className="bg-gradient-to-r from-primary via-orange-500 to-amber-500 bg-clip-text text-transparent">
              built like a real storefront.
            </span>
          </h1>

          <p className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            Launch vetted SEO and digital tool offers with clearer pricing, stronger trust signals,
            and a catalog layout that feels closer to a polished e-commerce experience than a plain software list.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg" className="rounded-xl px-6">
              <Link href="/premium-tools">
                Explore All Tools
                <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="rounded-xl px-6">
              <a href="#deals">View Hot Deals</a>
            </Button>
          </div>

          <dl className="mt-10 grid max-w-md grid-cols-3 gap-4">
            <div>
              <dt className="text-2xl font-extrabold text-foreground">{products.length}+</dt>
              <dd className="mt-0.5 text-xs text-muted-foreground">Active products</dd>
            </div>
            <div>
              <dt className="text-2xl font-extrabold text-foreground">{categories}</dt>
              <dd className="mt-0.5 text-xs text-muted-foreground">Categories</dd>
            </div>
            <div>
              <dt className="text-2xl font-extrabold text-foreground">24/7</dt>
              <dd className="mt-0.5 text-xs text-muted-foreground">Support flow</dd>
            </div>
          </dl>
        </div>

        <div className="relative">
          <div className="rounded-[28px] border border-border bg-card p-5 shadow-xl">
            <div className="grid gap-4 sm:grid-cols-2">
              {products.slice(0, 4).map((product) => (
                <div key={product._id} className="rounded-2xl border border-border bg-background p-3">
                  <ProductVisual product={product} className="rounded-xl" imageClassName="h-28 w-full" />
                  <h3 className="mt-3 text-sm font-bold">{product.name}</h3>
                  <p className="mt-1 text-xs text-muted-foreground">{product.category}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function TrustBar() {
  return (
    <section className="border-y border-border bg-card">
      <div className="mx-auto grid w-full max-w-7xl grid-cols-2 gap-x-6 gap-y-4 px-4 py-5 sm:px-6 md:grid-cols-4 lg:px-8">
        {trustItems.map(({ Icon, label }) => (
          <div key={label} className="flex items-center gap-2.5 text-sm font-medium">
            <Icon className="h-4 w-4 shrink-0 text-primary" />
            <span className="truncate">{label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

function HotDealsSection({ products }: { products: StorefrontProduct[] }) {
  const featured = products.slice(0, 8);

  if (featured.length === 0) {
    return null;
  }

  return (
    <section id="deals" className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="flex items-center gap-2 text-3xl font-extrabold tracking-tight sm:text-4xl">
            <Sparkles className="h-7 w-7 text-primary" />
            This Week&apos;s Hot Deals
          </h2>
          <p className="mt-2 text-sm text-muted-foreground sm:text-base">
            Hand-picked products from your live production catalog.
          </p>
        </div>
        <Button asChild variant="ghost" className="text-primary hover:bg-primary/5 hover:text-primary">
          <Link href="/premium-tools">
            View all products <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {featured.map((product) => (
          <StorefrontProductCard key={product._id} product={product} />
        ))}
      </div>
    </section>
  );
}

function ShopSection({
  products,
  intro,
}: {
  products: StorefrontProduct[];
  intro?: string;
}) {
  const [activeFilter, setActiveFilter] = useState("All");
  const filters = useMemo(
    () => ["All", ...Array.from(new Set(products.map((product) => product.category))).slice(0, 6)],
    [products],
  );

  const visibleProducts = useMemo(
    () =>
      activeFilter === "All"
        ? products
        : products.filter((product) => product.category === activeFilter),
    [activeFilter, products],
  );

  return (
    <section id="shop" className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
      <div className="mb-8 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-2xl">
          <span className="inline-flex rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            Curated Storefront
          </span>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">
            Shop vetted SEO tools with cleaner presentation and faster checkout
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
            {intro ||
              "This catalog is powered by your production tool records, so admin updates to title, image, category, price, and description flow directly into the storefront."}
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-4 shadow-sm lg:max-w-sm">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 rounded-xl bg-primary/10 p-2 text-primary">
              <Search className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Need a custom bundle?</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Mix premium tools, packages, and onboarding help around the workflow your buyers actually need.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        {filters.map((filter) => (
          <button
            key={filter}
            type="button"
            onClick={() => setActiveFilter(filter)}
            className={cn(
              "rounded-full border px-4 py-2 text-sm font-medium transition-colors",
              activeFilter === filter
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card text-muted-foreground hover:border-primary/30 hover:text-foreground",
            )}
          >
            {filter}
          </button>
        ))}
      </div>

      {visibleProducts.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-border bg-muted/30 p-10 text-center text-muted-foreground">
          No products available in this category yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {visibleProducts.map((product) => (
            <StorefrontProductCard key={product._id} product={product} />
          ))}
        </div>
      )}
    </section>
  );
}

function CategoriesSection({ products }: { products: StorefrontProduct[] }) {
  const categories = getCategoryStats(products);

  if (categories.length === 0) {
    return null;
  }

  return (
    <section className="border-y border-border bg-muted/40">
      <div className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        <div className="mx-auto mb-10 max-w-2xl text-center">
          <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
            Shop by Category
          </h2>
          <p className="mt-3 text-muted-foreground">
            Give buyers clearer paths into the parts of your catalog they care about most.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {categories.map(({ name, count, Icon, gradient, iconBg }) => (
            <div
              key={name}
              className={cn(
                "group relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br p-5 text-left transition-all hover:-translate-y-1 hover:shadow-lg sm:p-6",
                gradient,
              )}
            >
              <div className={cn("mb-4 flex h-11 w-11 items-center justify-center rounded-xl", iconBg)}>
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold leading-tight sm:text-lg">{name}</h3>
              <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
                {count} tool{count === 1 ? "" : "s"} available
              </p>
              <div className="mt-4 flex items-center justify-between text-xs font-semibold">
                <span className="text-muted-foreground">Live catalog</span>
                <ArrowRight className="h-4 w-4 text-primary transition-transform group-hover:translate-x-0.5" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function WhyUsSection() {
  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
      <div className="mx-auto mb-12 max-w-2xl text-center">
        <span className="inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
          Why This Layout Works
        </span>
        <h2 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">
          A stronger storefront for SEO and digital subscriptions
        </h2>
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        {whyUsItems.map(({ Icon, title, desc }) => (
          <div
            key={title}
            className="rounded-2xl border border-border bg-card p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/25">
              <Icon className="h-6 w-6" />
            </div>
            <h3 className="mt-5 text-lg font-bold leading-snug">{title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function FaqSection() {
  return (
    <section className="bg-card/70 py-14 lg:py-20">
      <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[0.95fr_1.05fr] lg:px-8 lg:items-start">
        <div>
          <span className="inline-flex rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            Buyer Questions
          </span>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">
            Answers that help customers buy with confidence
          </h2>
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            Trust, delivery speed, and support expectations matter on this kind of site. This section handles those objections early.
          </p>

          <div className="mt-8 rounded-3xl border border-border bg-background p-5 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="rounded-full bg-primary/10 p-2 text-primary">
                <ChevronRight className="h-4 w-4" />
              </div>
              <div>
                <p className="font-semibold text-foreground">Need help before ordering?</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Add WhatsApp, Messenger, or direct support contact details here for an even more service-led buying experience.
                </p>
              </div>
            </div>
          </div>
        </div>

        <Accordion type="single" collapsible className="rounded-3xl border border-border bg-background px-6 shadow-sm">
          {faqItems.map((item) => (
            <AccordionItem key={item.question} value={item.question}>
              <AccordionTrigger className="text-left text-base font-semibold text-foreground">
                {item.question}
              </AccordionTrigger>
              <AccordionContent className="pb-5 text-sm leading-relaxed text-muted-foreground">
                {item.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}

function CtaSection() {
  const siteSettings = useSiteSettings();

  return (
    <section className="mx-auto w-full max-w-7xl px-4 pb-16 sm:px-6 lg:px-8 lg:pb-24">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 p-8 text-white shadow-2xl sm:p-12 lg:p-16">
        <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-primary/30 blur-3xl" aria-hidden />
        <div className="absolute -bottom-20 -left-10 h-72 w-72 rounded-full bg-orange-300/20 blur-3xl" aria-hidden />

        <div className="relative grid items-center gap-8 lg:grid-cols-[1.5fr_1fr]">
          <div>
            <h2 className="text-3xl font-extrabold leading-tight sm:text-4xl lg:text-5xl">
              Ready to turn {siteSettings.siteName} into a cleaner premium-tool storefront?
            </h2>
            <p className="mt-4 max-w-xl text-white/70">
              Use this builder-inspired layout for high-intent buyers, stronger trust signals, and a more polished catalog flow.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row lg:items-end lg:justify-end">
            <Button asChild size="lg" className="rounded-xl px-6">
              <Link href="/premium-tools">
                Browse Products <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="rounded-xl border-white/20 bg-white/10 px-6 text-white hover:bg-white/15 hover:text-white"
            >
              <Link href="/packages">View Packages</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

export function StorefrontClient({ products, mode }: StorefrontClientProps) {
  return (
    <main className="min-h-screen bg-background">
      <StorefrontHeader />

      {mode === "home" ? (
        <>
          <HeroSection products={products} />
          <TrustBar />
          <HotDealsSection products={products} />
          <ShopSection products={products} />
          <CategoriesSection products={products} />
          <WhyUsSection />
          <FaqSection />
          <CtaSection />
        </>
      ) : (
        <>
          <section className="border-b border-border bg-gradient-to-b from-orange-50 via-white to-orange-50/40">
            <div className="mx-auto w-full max-w-7xl px-4 pb-12 pt-12 sm:px-6 lg:px-8 lg:pb-16 lg:pt-16">
              <div className="max-w-3xl">
                <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1.5 text-xs font-semibold text-primary">
                  <Users className="h-3.5 w-3.5" />
                  Production Catalog
                </span>
                <h1 className="mt-4 text-4xl font-extrabold tracking-tight sm:text-5xl">
                  Premium tools page redesigned with the `digiaid-builder` storefront UI
                </h1>
                <p className="mt-4 text-base leading-relaxed text-muted-foreground sm:text-lg">
                  This page now uses the builder-inspired product catalog look while still pulling real items from your live production database and admin panel.
                </p>
              </div>
            </div>
          </section>
          <ShopSection
            products={products}
            intro="These listings come from your existing production Tool records, so the admin panel remains the source of truth for images, titles, descriptions, pricing, and categories."
          />
        </>
      )}

      <StorefrontFooter />
    </main>
  );
}
