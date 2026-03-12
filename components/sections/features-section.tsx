"use client"

import { Card } from "@/components/ui/card"
import { Zap, Lock, Users, Headphones, CreditCard, Gauge } from "lucide-react"
import { useSiteSettings } from "@/components/providers/site-settings-provider"

const features = [
  {
    icon: Zap,
    title: "Lightning Fast",
    description: "Instant access to all premium tools after signup",
  },
  {
    icon: Lock,
    title: "Secure & Private",
    description: "Bank-level encryption and secure payment processing",
  },
  {
    icon: Users,
    title: "Team Collaboration",
    description: "Add team members and manage access easily",
  },
  {
    icon: Headphones,
    title: "24/7 Support",
    description: "Dedicated support team ready to help anytime",
  },
  {
    icon: CreditCard,
    title: "Multiple Payment Options",
    description: "Pay with Stripe, PayPal, bKash, Rocket, and more",
  },
  {
    icon: Gauge,
    title: "Usage Analytics",
    description: "Track tool usage and optimize your workflow",
  },
]

export function FeaturesSection() {
  const siteSettings = useSiteSettings()

  return (
    <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-card/30">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-foreground mb-4">Why Choose {siteSettings.siteName}?</h2>
          <p className="text-foreground/60 text-lg">Everything you need to succeed, nothing you don't</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => {
            const Icon = feature.icon
            return (
              <Card key={feature.title} className="bg-card border-border p-6 hover:border-primary/50 transition">
                <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2">{feature.title}</h3>
                <p className="text-foreground/60 text-sm">{feature.description}</p>
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}
