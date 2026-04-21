import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";

import { Footer } from "@/components/footer";
import { Navbar } from "@/components/navbar";
import { getPublicContent } from "@/lib/public-content";
import { buildSiteMetadata, getPublicSiteSettings } from "@/lib/site-settings";

interface PublicContentPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export const dynamic = "force-dynamic";

export async function generateMetadata(props: PublicContentPageProps): Promise<Metadata> {
  const params = await props.params;
  const settings = await getPublicSiteSettings();
  const page = getPublicContent(settings.siteName)[params.slug];

  if (!page) {
    return buildSiteMetadata();
  }

  return buildSiteMetadata(page.title);
}

export default async function PublicContentPage(props: PublicContentPageProps) {
  const params = await props.params;
  const settings = await getPublicSiteSettings();
  const page = getPublicContent(settings.siteName)[params.slug];

  if (!page) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <section className="border-b border-border bg-gradient-to-b from-primary/5 via-background to-background pt-28">
        <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">
            {page.eyebrow || "Information"}
          </p>
          <h1 className="mt-4 text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            {page.title}
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
            {page.description}
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="space-y-8">
          {page.sections.map((section) => (
            <article key={section.heading} className="rounded-2xl border border-border bg-card p-6 shadow-sm">
              <h2 className="text-2xl font-semibold text-foreground">{section.heading}</h2>

              {section.body?.length ? (
                <div className="mt-4 space-y-4 text-sm leading-7 text-muted-foreground sm:text-base">
                  {section.body.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </div>
              ) : null}

              {section.bullets?.length ? (
                <ul className="mt-4 space-y-3 text-sm leading-7 text-muted-foreground sm:text-base">
                  {section.bullets.map((bullet) => (
                    <li key={bullet} className="flex gap-3">
                      <span className="mt-2 h-2 w-2 rounded-full bg-primary" />
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
              ) : null}
            </article>
          ))}
        </div>

        <div className="mt-10 rounded-2xl border border-primary/20 bg-primary/5 p-6">
          <h2 className="text-xl font-semibold text-foreground">Need direct help?</h2>
          <p className="mt-2 text-sm leading-7 text-muted-foreground sm:text-base">
            Contact DigiAid on WhatsApp, Messenger, phone, or email if you need help before or after purchase.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <a
              href={`https://wa.me/${settings.whatsappNumber}`}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
            >
              WhatsApp Support
            </a>
            <a
              href={settings.facebookChatUrl}
              className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground"
            >
              Messenger
            </a>
            <Link
              href="/premium-tools"
              className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground"
            >
              Shop All Products
            </Link>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
