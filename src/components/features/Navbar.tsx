"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Archive, Settings, LogOut } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import Button from "../ui/Button";
import { cn } from "@/lib/utils";

export default function Navbar() {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();

  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: Home },
    { href: "/archive", label: "Arsip", icon: Archive },
    { href: "/settings", label: "Pengaturan", icon: Settings },
  ];

  return (
    <nav className="bg-surface border-b border-primary/10 sticky top-0 z-40 backdrop-blur-sm bg-surface/95">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary-light rounded-lg" />
            <span className="text-xl font-bold text-text-primary">Habitual</span>
          </Link>

          {/* Nav Links */}
          <div className="flex items-center gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-lg transition-all",
                    isActive
                      ? "bg-primary/20 text-primary"
                      : "text-text-secondary hover:text-text-primary hover:bg-surface/50"
                  )}
                >
                  <Icon className="w-5 h-5" />
                  <span className="hidden sm:inline">{item.label}</span>
                </Link>
              );
            })}

            {/* User Info & Logout */}
            <div className="flex items-center gap-3 ml-4 pl-4 border-l border-primary/20">
              <span className="text-sm text-text-secondary hidden sm:inline">
                {user?.name}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={logout}
                className="rounded-full p-2"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
