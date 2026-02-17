'use client'

import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { LayoutTemplate, FileText, Zap } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Hero */}
        <div className="text-center mb-16">
          <h1 className="font-serif text-5xl font-bold text-foreground mb-4">
            Campaign Studio
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Design powerful campaign templates once, reuse them unlimited times with different content.
            Built for teams that generate campaigns at scale.
          </p>
        </div>

        {/* Role Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Admin - Template Design */}
          <Card className="p-8 border-2 border-border hover:border-accent transition-colors">
            <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-accent mb-6">
              <LayoutTemplate className="w-6 h-6 text-accent-foreground" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">Admin</h2>
            <p className="text-muted-foreground mb-6">
              Design and manage campaign templates. Create reusable designs that users can populate with content.
            </p>
            <ul className="space-y-2 text-sm text-muted-foreground mb-8">
              <li className="flex items-start">
                <span className="text-accent mr-3">✓</span>
                <span>Create template layouts with shapes and elements</span>
              </li>
              <li className="flex items-start">
                <span className="text-accent mr-3">✓</span>
                <span>Bind text fields to campaign data</span>
              </li>
              <li className="flex items-start">
                <span className="text-accent mr-3">✓</span>
                <span>Save templates for team reuse</span>
              </li>
            </ul>
            <Button
              asChild
              className="w-full bg-accent hover:bg-accent/90 text-accent-foreground h-11"
            >
              <Link href="/admin/template">
                Enter Admin Mode
              </Link>
            </Button>
          </Card>

          {/* User - Content & Generation */}
          <Card className="p-8 border-2 border-border hover:border-accent transition-colors">
            <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-accent mb-6">
              <Zap className="w-6 h-6 text-accent-foreground" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">User</h2>
            <p className="text-muted-foreground mb-6">
              Select templates and generate campaigns with your content. Create beautiful designs in minutes.
            </p>
            <ul className="space-y-2 text-sm text-muted-foreground mb-8">
              <li className="flex items-start">
                <span className="text-accent mr-3">✓</span>
                <span>Browse and select saved templates</span>
              </li>
              <li className="flex items-start">
                <span className="text-accent mr-3">✓</span>
                <span>Fill in your campaign content</span>
              </li>
              <li className="flex items-start">
                <span className="text-accent mr-3">✓</span>
                <span>Generate and export PNG instantly</span>
              </li>
            </ul>
            <Button
              asChild
              className="w-full bg-accent hover:bg-accent/90 text-accent-foreground h-11"
            >
              <Link href="/user/content">
                Enter User Mode
              </Link>
            </Button>
          </Card>
        </div>

        {/* Features Grid */}
        <div className="mt-20 pt-12 border-t border-border">
          <h3 className="text-center text-xl font-bold text-foreground mb-10">
            Powerful Features
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-3xl font-bold text-accent mb-2">∞</div>
              <h4 className="font-semibold text-foreground mb-2">Unlimited Templates</h4>
              <p className="text-sm text-muted-foreground">
                Create and save as many templates as you need
              </p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-accent mb-2">⚡</div>
              <h4 className="font-semibold text-foreground mb-2">Instant Generation</h4>
              <p className="text-sm text-muted-foreground">
                Generate campaigns in seconds with one click
              </p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-accent mb-2">🎨</div>
              <h4 className="font-semibold text-foreground mb-2">Full Control</h4>
              <p className="text-sm text-muted-foreground">
                Complete design flexibility with drag, drop, and customize
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
