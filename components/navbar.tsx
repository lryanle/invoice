"use client"

import { UserButton } from "@clerk/nextjs"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { FileText, Building2, Settings, BarChart3, TrendingUp } from "lucide-react"
import { useEffect, useState } from "react"
import Image from "next/image"

export function Navbar() {
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: BarChart3 },
    { href: "/invoices", label: "Invoices", icon: FileText },
    { href: "/clients", label: "Clients", icon: Building2 },
    { href: "/analytics", label: "Analytics", icon: TrendingUp },
    { href: "/settings", label: "Settings", icon: Settings },
  ]

  return (
    <nav className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-xs">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link href="/dashboard" className="flex items-center space-x-2">
            <Image src="/icon.svg" alt="invoice.lryanle.com logo" width={36} height={36} className="mb-1" />
            <span className="text-xl font-bold">invoice.lryanle.com</span>
          </Link>

          <div className="flex items-center space-x-6">
            <div className="hidden md:flex items-center space-x-6">
              {navItems.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                      pathname === item.href
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted",
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </Link>
                )
              })}
            </div>

            {mounted && <UserButton />}
          </div>
        </div>
      </div>
    </nav>
  )
}
