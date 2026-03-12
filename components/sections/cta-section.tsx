"use client"

import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { useSiteSettings } from "@/components/providers/site-settings-provider"

export function CTASection() {
  const siteSettings = useSiteSettings()

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-gradient-to-r from-primary/20 via-accent/20 to-secondary/20 border border-primary/30 rounded-2xl p-12 text-center">
          <h2 className="text-4xl font-bold text-foreground mb-4">Ready to Get Started?</h2>
          <p className="text-foreground/70 text-lg mb-8">
            Join thousands of professionals already using {siteSettings.siteName} to level up their business.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/signup"
              className="px-8 py-4 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition flex items-center justify-center gap-2 shadow-xl shadow-primary/30 hover:shadow-2xl"
            >
              Start Free Trial <ArrowRight size={18} />
            </Link>
            <a
              href="#pricing"
              className="px-8 py-4 border border-foreground/20 text-foreground rounded-lg font-semibold hover:bg-card transition"
            >
              View Pricing Plans
            </a>
          </div>
          <p className="text-foreground/50 text-sm mt-6">7-day free trial • No credit card required • Cancel anytime</p>
        </div>
      </div>
    </section>
  )
}
