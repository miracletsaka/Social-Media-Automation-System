"use client";

import type React from "react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Menu, Search, Bell, ChevronDown, User, Settings, LogOut } from "lucide-react";
import { Sidebar } from "@/components/sidebar";
import { apiMe, logoutUser } from "@/lib/api";

type TopNavItem = {
  label: string;
  href: string;
  key: string;
};

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // mobile top nav drawer
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  // simple dropdown
  const [profileOpen, setProfileOpen] = useState(false);

  const router = useRouter();

  useEffect(() => {
    (async () => {
      try {
        const me = await apiMe();
        if (!me.is_email_verified) router.replace("/verify-required");
      } catch {
        router.replace("/auth/login");
      }
    })();
  }, [router]);

  const navItems: TopNavItem[] = useMemo(
    () => [
      { key: "overview", label: "Overview", href: "/dashboard" },
      { key: "approvals", label: "Approvals", href: "/dashboard/approvals" },
      { key: "scheduled", label: "Scheduled", href: "/dashboard/scheduling#scheduled" },
      { key: "queued", label: "Queue", href: "/dashboard/scheduling#queued" },
      { key: "published", label: "Published", href: "/dashboard/published" },
      { key: "failed", label: "Failed", href: "/dashboard/failed" },
      { key: "platforms", label: "Platforms", href: "/dashboard/platforms" },
      { key: "brands", label: "Manage brand Profile", href: "/dashboard/settings/brand-profile" },
      { key: "export", label: "Export", href: "/dashboard/export" },
    ],
    []
  );

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard" || pathname === "/dashboard/";
    return pathname?.startsWith(href);
  };

  return (
    <div className="h-screen bg-gray-100 flex overflow-hidden font-sans text-gray-900">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 w-full lg:w-auto">
        {/* Header / Top Nav */}
        <header className="sticky top-0 z-40 bg-gray-100 border-b border-gray-200 ">
          <div className="h-16 px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-3">
            {/* Left */}
            <div className="flex items-center gap-2 min-w-0">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 hover:bg-gray-200/60 rounded-lg transition-colors lg:hidden"
                aria-label="Toggle sidebar"
              >
                <Menu className="w-5 h-5 text-gray-700" />
              </button>
            </div>

            {/* Center (desktop nav) */}
            <nav className="hidden lg:flex items-center gap-1 flex-1 justify-center">
              {navItems.slice(0, 7).map((it) => (
                <Link
                  key={it.key}
                  href={it.href}
                  className={cx(
                    "text-[11px] font-bold text-slate-500 uppercase tracking-wide px-3 py-2 rounded-lg text-xs font-semibold transition-colors",
                    isActive(it.href)
                      ? "bg-white shadow border border-gray-200"
                      : " hover:text-gray-900"
                  )}
                >
                  {it.label}
                </Link>
              ))}

              {/* More dropdown (desktop) */}
              <div className="relative">
                <button
                  onClick={() => setMobileNavOpen((v) => !v)}
                  className={cx(
                    "text-[11px] font-bold text-slate-500 uppercase tracking-wide px-3 py-2 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1",
                    "text-gray-600 hover:bg-gray-200/60 hover:text-gray-900"
                  )}
                >
                  More <ChevronDown className="w-4 h-4" />
                </button>

                {mobileNavOpen && (
                  <div
                    className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 shadow-lg rounded-xl overflow-hidden"
                    onMouseLeave={() => setMobileNavOpen(false)}
                  >
                    <div className="p-2">
                      {navItems.slice(7).map((it) => (
                        <Link
                          key={it.key}
                          href={it.href}
                          onClick={() => setMobileNavOpen(false)}
                          className={cx(
                            "block px-3 py-2 rounded-lg text-xs font-semibold transition-colors",
                            isActive(it.href)
                              ? "bg-gray-100 text-gray-900"
                              : "text-gray-700 hover:bg-gray-100"
                          )}
                        >
                          {it.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </nav>

            {/* Right */}
            <div className="flex items-center gap-2">
              {/* Search (desktop) */}
              {/* <div className="hidden md:flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2 shadow-sm w-[260px]">
                <Search className="w-4 h-4 text-gray-500" />
                <input
                  className="w-full text-xs outline-none placeholder:text-gray-400"
                  placeholder="Search content, topics, ids..."
                  // Hook up later (optional)
                  onChange={() => {}}
                />
              </div> */}

              {/* Notifications */}
              <button
                className="p-2 rounded-lg hover:bg-gray-200/60 transition-colors relative"
                aria-label="Notifications"
              >
                <Bell className="w-5 h-5 text-gray-700" />
                <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-red-500" />
              </button>

              {/* Profile */}
              <div className="relative">
                <button
                  onClick={() => setProfileOpen((v) => !v)}
                  className="flex items-center gap-2 px-2 py-2 rounded-xl hover:bg-gray-200/60 transition-colors"
                  aria-label="Profile menu"
                >
                  <div className="w-8 h-8 rounded-full bg-white border border-gray-200 shadow flex items-center justify-center">
                    <User className="w-4 h-4 text-gray-700" />
                  </div>
                  <ChevronDown className="hidden sm:block w-4 h-4 text-gray-600" />
                </button>

                {profileOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 shadow-lg rounded-xl overflow-hidden">
                    <div className="p-2">
                      <Link
                        href="/dashboard/settings"
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-100"
                      >
                        <Settings className="w-4 h-4" />
                        Settings
                      </Link>
                      <button
                        onClick={async () => {
                          setProfileOpen(false);

                          try {
                            await logoutUser();
                          } finally {
                            // Always redirect even if request fails
                            window.location.href = "/auth/login";
                          }
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-100"
                      >
                        <LogOut className="w-4 h-4" />
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Mobile "Menu" button for top nav */}
              <button
                onClick={() => setMobileNavOpen((v) => !v)}
                className="lg:hidden px-3 py-2 rounded-xl bg-white border border-gray-200 shadow text-xs font-bold text-gray-700 hover:bg-gray-50"
              >
                More
              </button>
            </div>
          </div>

          {/* Mobile nav panel */}
          {mobileNavOpen && (
            <div className="lg:hidden border-t border-gray-200 bg-gray-100">
              <div className="px-4 py-3">
                {/* Mobile search */}
               
                {/* Links */}
                <div className="mt-3 grid grid-cols-2 gap-2">
                  {navItems.map((it) => (
                    <Link
                      key={it.key}
                      href={it.href}
                      onClick={() => setMobileNavOpen(false)}
                      className={cx(
                        "px-3 py-3 rounded-xl text-xs font-semibold border shadow-sm transition-colors",
                        isActive(it.href)
                          ? "bg-white text-gray-900 border-gray-200"
                          : "bg-white/70 text-gray-700 border-gray-200 hover:bg-white"
                      )}
                    >
                      {it.label}
                    </Link>
                  ))}
                </div>

                <div className="mt-3 flex justify-end">
                  <button
                    className="text-xs font-bold text-gray-600 hover:text-gray-900"
                    onClick={() => setMobileNavOpen(false)}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto bg-gray-50">{children}</main>
      </div>

      {/* Click-out overlays (simple) */}
      {(mobileNavOpen || profileOpen) && (
        <button
          aria-label="Close menus"
          className="fixed inset-0 z-30 bg-black/0 cursor-default"
          onClick={() => {
            setMobileNavOpen(false);
            setProfileOpen(false);
          }}
        />
      )}
    </div>
  );
}
