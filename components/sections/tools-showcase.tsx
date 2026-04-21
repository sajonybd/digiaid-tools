"use client"

import { Card } from "@/components/ui/card"

const tools = [
  {
    name: "Semrush",
    description: "Complete SEO suite for keyword research and competitive analysis",
    category: "SEO",
    price: 5,
    badge: "Most Popular",
  },
  {
    name: "ChatGPT Plus",
    description: "Advanced AI for content creation and customer support",
    category: "AI",
    price: 3,
  },
  {
    name: "Canva Pro",
    description: "Professional design tool for social media and marketing",
    category: "Design",
    price: 2,
  },
  {
    name: "Grammarly Premium",
    description: "AI-powered writing assistant and spell checker",
    category: "Writing",
    price: 2,
  },
  {
    name: "Adobe Creative Suite",
    description: "Industry-standard tools for design and video editing",
    category: "Design",
    price: 8,
  }
]

export function ToolsShowcase() {
  return (
    <section id="tools" className="py-20 px-4 sm:px-6 lg:px-8 bg-card/30">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-foreground mb-4">Premium Tools Starting at $2/month</h2>
          <p className="text-foreground/60 text-lg">Access industry-leading software at unbeatable prices</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tools.map((tool) => (
            <Card
              key={tool.name}
              className="bg-card border-border hover:border-primary/50 transition p-6 group cursor-pointer"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold text-foreground">{tool.name}</h3>
                  <span className="text-accent text-xs font-semibold">{tool.category}</span>
                </div>
                {tool.badge && (
                  <span className="px-3 py-1 bg-accent text-accent-foreground text-xs font-bold rounded-full">
                    {tool.badge}
                  </span>
                )}
              </div>
              <p className="text-foreground/60 text-sm mb-6">{tool.description}</p>
              <div className="flex justify-between items-center">
                <span className="text-2xl font-bold text-primary">
                  ${tool.price}
                  <span className="text-sm text-foreground/60">/mo</span>
                </span>
                <button className="px-4 py-2 bg-primary/20 text-primary rounded hover:bg-primary/30 transition text-sm font-medium group-hover:bg-primary/40">
                  Learn More
                </button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
