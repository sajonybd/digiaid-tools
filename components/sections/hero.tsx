"use client"

import Link from "next/link"
import { ArrowRight, Sparkles, Star } from "lucide-react"
import Image from "next/image"

export function Hero() {
  return (
    <section className="pt-36 pb-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-background via-primary/5 to-background">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="flex items-center gap-2 mb-4 group">
              <Sparkles className="w-5 h-5 text-primary animate-pulse group-hover:animate-bounce" />
              <span className="text-primary text-sm font-bold tracking-wide uppercase">
                Premium Tools at Unbeatable Prices
              </span>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold text-foreground mb-6 text-balance leading-tight">
              Professional <span className="gradient-text">Digital Tools</span> for Everyone
            </h1>
            <p className="text-foreground/70 text-xl mb-10 text-balance leading-relaxed max-w-lg">
              Get access to premium SEO software, AI tools, and design apps at a fraction of the cost. Everything you
              need to grow your business online.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/signup"
                className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition flex items-center justify-center gap-2 shadow-xl shadow-primary/30 hover:shadow-2xl"
              >
                Get Started Free <ArrowRight size={18} />
              </Link>
              <Link
                href="#pricing"
                className="px-6 py-3 border-2 border-primary text-primary rounded-lg font-semibold hover:bg-primary/5 transition flex items-center justify-center gap-2"
              >
                <Star size={18} />
                View Pricing
              </Link>
            </div>
          </div>
          <div className="relative h-[500px] md:h-full rounded-2xl overflow-hidden bg-gradient-to-br from-primary/10 to-secondary/10 border-2 border-primary/20 shadow-xl shadow-primary/20">
            <Image src="/hero.jpeg" alt="Hero" fill className="object-cover" />
          </div>
        </div>
      </div>
    </section>
  )
}
