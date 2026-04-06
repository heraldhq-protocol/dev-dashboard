"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUiStore } from "@/lib/stores/ui.store";
import { SidebarUsageMeter } from "./SidebarUsageMeter";
import { cn } from "@/lib/utils";

import Image from "next/image";

const navItems = [
  {
    name: "Overview",
    href: "/overview",
    icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6",
  },
  {
    name: "Analytics",
    href: "/analytics",
    icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
  },
  {
    name: "Notifications",
    href: "/notifications",
    icon: "M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9",
  },
  {
    name: "API Keys",
    href: "/api-keys",
    icon: "M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z",
  },
  {
    name: "Playground",
    href: "/playground",
    icon: "M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z",
  },
  { name: "Webhooks", href: "/webhooks", icon: "M13 10V3L4 14h7v7l9-11h-7z" },
  {
    name: "Billing",
    href: "/billing",
    icon: "M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z",
  },
  {
    name: "Team",
    href: "/team",
    icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z",
  },
  {
    name: "Settings",
    href: "/settings",
    icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065zM15 12a3 3 0 11-6 0 3 3 0 016 0z",
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { mobileSidebarOpen, desktopSidebarCollapsed, closeMobileSidebar } =
    useUiStore();

  const collapsed = desktopSidebarCollapsed;

  return (
    <>
      {/* Mobile overlay — with fade transition */}
      <div
        className={cn(
          "fixed inset-0 z-40 bg-navy/80 backdrop-blur-sm lg:hidden transition-opacity duration-300",
          mobileSidebarOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none",
        )}
        onClick={closeMobileSidebar}
      />

      <aside
        style={{ willChange: "width, transform" }}
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex flex-col border-r border-border bg-navy-2/95 backdrop-blur-md shrink-0",
          "transition-[width,transform] duration-350 ease-[cubic-bezier(0.25,0.1,0.25,1)]",
          "lg:static lg:z-auto",
          // Mobile: slide in/out
          mobileSidebarOpen
            ? "translate-x-0 w-[240px]"
            : "-translate-x-full w-[240px]",
          // Desktop: collapse width smoothly (fixed values, not auto)
          "lg:translate-x-0",
          collapsed ? "lg:w-[68px]" : "lg:w-[240px]",
        )}
      >
        {/* Logo Header */}
        <div className="flex h-16 items-center border-b border-border px-4 justify-between shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className={cn(
                "flex shrink-0 items-center justify-center transition-transform duration-350 ease-[cubic-bezier(0.25,0.1,0.25,1)]",
                collapsed ? "lg:scale-90" : "scale-100",
              )}
            >
              <Image
                src="/logo.svg"
                alt="Herald Logo"
                width={32}
                height={32}
                className="h-8 w-8 object-contain"
              />
            </div>
            <span
              className={cn(
                "text-xl font-extrabold tracking-tight text-foreground whitespace-nowrap overflow-hidden",
                "transition-[opacity,max-width] duration-350 ease-[cubic-bezier(0.25,0.1,0.25,1)]",
                collapsed
                  ? "lg:max-w-0 lg:opacity-0"
                  : "max-w-[160px] opacity-100",
              )}
            >
              Herald
            </span>
          </div>

          {/* Mobile close button */}
          <button
            onClick={closeMobileSidebar}
            className="lg:hidden text-text-muted hover:text-foreground transition-colors"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto overflow-x-hidden py-4">
          <ul className="grid gap-1 px-3">
            {navItems.map((item) => {
              const isActive = pathname.startsWith(item.href);
              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    onClick={() => closeMobileSidebar()}
                    title={collapsed ? item.name : undefined}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold whitespace-nowrap overflow-hidden",
                      "transition-colors duration-200",
                      isActive
                        ? "bg-card-2 text-primary shadow-[inset_3px_0_0_var(--color-teal)]"
                        : "text-text-secondary hover:bg-card-2 hover:text-primary",
                    )}
                  >
                    <svg
                      className="h-5 w-5 shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d={item.icon}
                      />
                    </svg>
                    <span
                      className={cn(
                        "overflow-hidden whitespace-nowrap",
                        "transition-[opacity,max-width,transform] duration-350 ease-[cubic-bezier(0.25,0.1,0.25,1)]",
                        collapsed
                          ? "lg:max-w-0 lg:opacity-0 lg:translate-x-2"
                          : "max-w-[160px] opacity-100 translate-x-0",
                      )}
                    >
                      {item.name}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <SidebarUsageMeter collapsed={collapsed} />
      </aside>
    </>
  );
}
