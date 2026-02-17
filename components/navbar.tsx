'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { LayoutTemplate, FileText, Zap } from 'lucide-react'

export default function Navbar() {
  const pathname = usePathname()

  const isAdminRoute = pathname?.startsWith('/admin')
  const isUserRoute = pathname?.startsWith('/user')

  const adminLinks = [
    {
      href: '/admin/template',
      label: 'Design Template',
      icon: LayoutTemplate,
      description: 'Create & manage campaign templates'
    }
  ]

  const userLinks = [
    {
      href: '/user/content',
      label: 'Create Campaign',
      icon: FileText,
      description: 'Upload content & select template'
    },
    {
      href: '/user/generate',
      label: 'Generate',
      icon: Zap,
      description: 'Review & generate final output'
    }
  ]

  const currentLinks = isAdminRoute ? adminLinks : isUserRoute ? userLinks : []

  return (
    <nav className="border-b border-border bg-background sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo/Home */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-accent-foreground" />
            </div>
            <span className="font-serif font-bold text-lg text-foreground">Campaign Studio</span>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center gap-8">
            {currentLinks.map((link) => {
              const Icon = link.icon
              const isActive = pathname === link.href

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className="group relative"
                  title={link.description}
                >
                  <div className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-accent text-accent-foreground'
                      : 'text-muted-foreground hover:bg-secondary'
                  }`}>
                    <Icon className="w-4 h-4" />
                    <span className="text-sm font-medium">{link.label}</span>
                  </div>
                </Link>
              )
            })}
          </div>

          {/* Role Indicator & Switch */}
          <div className="flex items-center gap-4">
            <div className="text-xs font-medium px-3 py-1 rounded-full bg-secondary text-foreground">
              {isAdminRoute ? 'Admin Mode' : isUserRoute ? 'User Mode' : 'Home'}
            </div>

            {!isAdminRoute && !isUserRoute && (
              <div className="flex gap-2">
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="border-border bg-transparent"
                >
                  <Link href="/admin/template">Admin</Link>
                </Button>
                <Button
                  asChild
                  size="sm"
                  className="bg-accent hover:bg-accent/90 text-accent-foreground"
                >
                  <Link href="/user/content">User</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
