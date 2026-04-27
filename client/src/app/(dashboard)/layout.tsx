"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Send,
  Calendar,
  BarChart3,
  Settings,
  LogOut,
  Users as UsersIcon,
  Sparkles,
  Search,
  Bell,
  ChevronDown,
  Crown,
  Menu,
  X,
  Globe,
  Sun,
  Moon,
} from "lucide-react";

const adminItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "User Management", href: "/users", icon: UsersIcon },
  { name: "Social Config", href: "/social-config", icon: Globe },
  { name: "AI Settings", href: "/ai-config", icon: Sparkles },
  { name: "Analytics", href: "/analytics", icon: BarChart3 },
];

const userItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Create Post", href: "/posts/create", icon: Send },
  { name: "My Posts", href: "/posts", icon: Send },
  { name: "Scheduler", href: "/scheduler", icon: Calendar },
  { name: "Analytics", href: "/analytics", icon: BarChart3 },
  { name: "Accounts", href: "/settings", icon: Settings },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      setUser(JSON.parse(userData));
    } else {
      router.push("/login");
    }

    // Load theme preference
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark" || (!savedTheme && window.matchMedia("(prefers-color-scheme: dark)").matches)) {
      setTheme("dark");
      document.documentElement.classList.add("dark");
    }
  }, [router]);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    if (newTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  const sidebarItems = user?.role === "ADMIN" ? adminItems : userItems;

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--bg-page)", color: "var(--text-primary)" }}>

      {/* ── Overlay (mobile) ── */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="lg:hidden"
          style={{
            position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 40,
            backdropFilter: "blur(2px)"
          }}
        />
      )}

      {/* ── Sidebar ── */}
      <aside
        style={{
          position: "fixed",
          top: 0,
          left: sidebarOpen ? 0 : -260,
          bottom: 0,
          width: 260,
          background: "var(--bg-sidebar)",
          borderRight: "1px solid var(--border-color)",
          display: "flex",
          flexDirection: "column",
          zIndex: 50,
          transition: "left 0.3s ease",
          overflowY: "auto",
        }}
      >
        {/* Logo */}
        <div style={{ height: 64, display: "flex", alignItems: "center", gap: 12, padding: "0 20px", borderBottom: "1px solid var(--border-color)", flexShrink: 0 }}>
          <img src="https://framerusercontent.com/images/OmiFNAsUnVnklI6y2SA9EWiDJBk.png?width=915&height=273" alt="AI Social Vibe Logo" style={{ width: 215, height: 40, objectFit: "cover" }} />

          {/* Close btn on mobile */}
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden"
            style={{ marginLeft: "auto", padding: 4, borderRadius: 6, color: "var(--text-secondary)", background: "none", border: "none", cursor: "pointer" }}
          >
            <X style={{ width: 20, height: 20 }} />
          </button>
        </div>

        {/* Menu Items */}
        <nav style={{ flex: 1, padding: "24px 12px 12px", overflowY: "auto" }}>
          <p style={{ fontSize: 10, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.1em", padding: "0 12px", marginBottom: 12 }}>
            Main Menu
          </p>
          {sidebarItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => {
                  if (window.innerWidth < 1024) setSidebarOpen(false);
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  borderRadius: 8,
                  padding: "10px 12px",
                  fontSize: 14,
                  fontWeight: 500,
                  textDecoration: "none",
                  marginBottom: 4,
                  transition: "all 0.15s",
                  background: isActive ? "var(--bg-active)" : "transparent",
                  color: isActive ? "var(--text-active)" : "var(--text-secondary)",
                  border: isActive ? "1px solid var(--border-active)" : "1px solid transparent",
                }}
              >
                <item.icon style={{ width: 18, height: 18, color: isActive ? "var(--primary-color)" : "var(--text-muted)" }} />
                {item.name}
              </Link>
            );
          })}
        </nav>



        {/* Logout */}
        <div style={{ borderTop: "1px solid var(--border-color)", padding: 12, flexShrink: 0 }}>
          <button
            onClick={handleLogout}
            style={{
              display: "flex", width: "100%", alignItems: "center", gap: 12,
              borderRadius: 8, padding: "10px 12px", fontSize: 14, fontWeight: 500,
              color: "#ef4444", background: "none", border: "none", cursor: "pointer",
            }}
          >
            <LogOut style={{ width: 18, height: 18 }} />
            Logout
          </button>
        </div>
      </aside>

      {/* ── Main Area ── */}
      <div style={{ flex: 1, marginLeft: sidebarOpen ? 260 : 0, transition: "margin-left 0.3s ease", width: "100%" }}>
        {/* Top Navbar */}
        <header style={{
          position: "sticky", top: 0, zIndex: 30, height: 64,
          background: "var(--bg-header)", borderBottom: "1px solid var(--border-color)",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "0 24px",
        }}>
          {/* Left: Hamburger + Search */}
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              style={{
                width: 36, height: 36, borderRadius: 8, display: "flex",
                alignItems: "center", justifyContent: "center",
                background: "var(--bg-hover)", border: "none", cursor: "pointer", color: "var(--text-primary)",
              }}
            >
              <Menu style={{ width: 20, height: 20 }} />
            </button>

            <div style={{ position: "relative", width: 280 }} className="hidden sm:block">
              <Search style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", width: 16, height: 16, color: "var(--text-muted)" }} />
              <input
                placeholder="Search..."
                style={{
                  width: "100%", height: 40, paddingLeft: 40, paddingRight: 12,
                  borderRadius: 8, border: "1px solid var(--border-color)", background: "var(--bg-input)",
                  fontSize: 14, outline: "none", color: "var(--text-primary)",
                }}
              />
            </div>
          </div>

          {/* Right: Theme Toggle + Notifications + Profile */}
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              style={{
                width: 36, height: 36, borderRadius: 8,
                display: "flex", alignItems: "center", justifyContent: "center",
                background: "var(--bg-hover)", border: "none", cursor: "pointer", color: "var(--text-secondary)",
              }}
              title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
            >
              {theme === "light" ? <Moon style={{ width: 18, height: 18 }} /> : <Sun style={{ width: 18, height: 18 }} />}
            </button>

            <button style={{
              position: "relative", width: 36, height: 36, borderRadius: 8,
              display: "flex", alignItems: "center", justifyContent: "center",
              background: "var(--bg-hover)", border: "none", cursor: "pointer", color: "var(--text-secondary)",
            }}>
              <Bell style={{ width: 18, height: 18 }} />
              <span style={{
                position: "absolute", top: 6, right: 6, width: 8, height: 8,
                borderRadius: "50%", background: "var(--primary-color)",
              }} />
            </button>

            <div style={{ width: 1, height: 24, background: "var(--border-color)" }} />

            <div style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
              <img
                src={`https://ui-avatars.com/api/?name=${user?.name || "A"}&background=16a34a&color=fff&size=32`}
                alt="avatar"
                style={{ width: 32, height: 32, borderRadius: 8 }}
              />
              <div className="hidden sm:block">
                <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", lineHeight: 1.2 }}>
                  {user?.name || "Admin"}
                </p>
                <p style={{ fontSize: 10, color: "var(--text-muted)", lineHeight: 1.2 }}>
                  {user?.role || "ADMIN"}
                </p>
              </div>
              <ChevronDown style={{ width: 16, height: 16, color: "var(--text-muted)" }} />
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main style={{ padding: 24 }}>{children}</main>
      </div>
    </div>
  );
}
