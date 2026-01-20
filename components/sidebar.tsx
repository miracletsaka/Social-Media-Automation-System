"use client"

import { Button } from "@/components/ui/button"
import {
  LayoutDashboard,
  CheckSquare,
  Upload,
  Library,
  Settings,
  BarChart3,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  Plus,
  Share,
  Timer,
  User,
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect } from "react"

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Platforms", href: "/dashboard/platforms", icon: Share  },
  { name: "Brand", href: "/dashboard/brands", icon: Plus },
  { name: "Topics Intake", href: "/dashboard/topics", icon: Upload },
  { name: "Approvals", href: "/dashboard/approvals", icon: CheckSquare },
  { name: "Content Library", href: "/dashboard/library", icon: Library },
  { name: "Schedule", href: "/dashboard/scheduling", icon: Timer },
  { name: "Users", href: "/dashboard/users", icon: User },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
]

interface SidebarProps {
  isOpen: boolean
  onToggle: () => void
}

export function Sidebar({ isOpen, onToggle }: SidebarProps) {
  const pathname = usePathname()

  useEffect(() => {
    // Close sidebar when pathname changes on mobile
    if (isOpen) {
      onToggle()
    }
  }, [pathname])

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={onToggle} />}

      {/* Sidebar */}
      <aside
        className={`
          bg-gray-100 flex flex-col
          fixed lg:relative z-50 h-screen lg:h-auto
          transition-all duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
          ${isOpen ? "w-72" : "lg:w-20"}
        `}
      >
        <div className="flex flex-col flex-1 min-h-0">
          {/* Logo & Toggle Button */}
          <div className="flex items-center justify-between h-20 px-6">
            <div
              className={`flex items-center gap-3 transition-opacity duration-200 ${isOpen ? "opacity-100" : "lg:opacity-0 lg:w-0"}`}
            >
              <div className="w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center">
                <img src="/NeuroFlow_AI_Logo.png" alt="NeuroFlow Logo" className="h-4 w-auto" />
              </div>
            </div>

            <button
              onClick={onToggle}
              className={`
                p-2 rounded-lg hover:bg-gray-200 transition-colors
                ${isOpen ? "block" : "hidden lg:block lg:mx-auto"}
              `}
            >
              {isOpen ? (
                <ChevronLeft className="w-5 h-5 text-gray-600" />
              ) : (
                <ChevronRight className="w-5 h-5 text-gray-600" />
              )}
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`
                    text-[11px] font-bold text-slate-500 uppercase tracking-wide group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
                    ${
                      isActive
                        ? "bg-gray-200 text-gray-600 shadow-lg shadow-blue-500/30"
                        : "bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:bg-gray-200"
                    }
                    ${!isOpen ? "lg:justify-center" : ""}
                  `}
                  title={!isOpen ? item.name : undefined}
                >
                  <item.icon
                    className={`w-5 h-5 font-bold flex-shrink-0 ${
                      isActive ? "text-white" : "text-gray-100 group-hover:text-gray-300"
                    }`}
                  />
                  <span
                    className={`transition-opacity duration-200 ${isOpen ? "opacity-100" : "lg:opacity-0 lg:hidden"}`}
                  >
                    {item.name}
                  </span>
                  {isActive && isOpen && <div className="ml-auto w-2 h-2 bg-white rounded-full animate-pulse" />}
                </Link>
              )
            })}
          </nav>

          {/* Help section */}
          <div className={`p-4 transition-opacity duration-200 ${isOpen ? "opacity-100" : "lg:opacity-0 lg:hidden"}`}>
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-4 border border-blue-100">
              <HelpCircle className="w-8 h-8 text-blue-600 mb-2" />
              <p className="text-sm font-semibold text-gray-900 mb-1">Need Help?</p>
              <p className="text-xs text-gray-600 mb-3">Our support team is here for you</p>
              <Button size="sm" className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                Contact Support
              </Button>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}
