"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast, Toaster } from "react-hot-toast";
import { CONFIG, getApiUrl } from "@/lib/config";

const API = getApiUrl(CONFIG.API.DASHBOARD_STATS);

import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import {
  Send, Clock, Zap, Activity, ArrowUpRight, ArrowDownRight,
  CheckCircle2, AlertCircle, FileText, Loader2, Users, BarChart3,
} from "lucide-react";

const cardStyle: React.CSSProperties = {
  background: "var(--bg-card)", borderRadius: 12, border: "1px solid var(--border-color)",
  boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
};

function timeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hr ago`;
  const days = Math.floor(hrs / 24);
  return `${days} day${days > 1 ? "s" : ""} ago`;
}

const statusConfig: Record<string, { color: string; bg: string; icon: any }> = {
  PUBLISHED: { color: "var(--primary-color)", bg: "#f0fdf4", icon: CheckCircle2 },
  SCHEDULED: { color: "#2563eb", bg: "#eff6ff", icon: Clock },
  DRAFT: { color: "var(--text-secondary)", bg: "#f3f4f6", icon: FileText },
  FAILED: { color: "#ef4444", bg: "#fef2f2", icon: AlertCircle },
};

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const u = localStorage.getItem("user");
    if (u) setUser(JSON.parse(u));

    const token = localStorage.getItem("token");
    if (!token) return;

    axios
      .get(API, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => setData(res.data))
      .catch((err) => console.error("Dashboard fetch error:", err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "60vh" }}>
        <Loader2 style={{ width: 32, height: 32, color: "var(--primary-color)", animation: "spin 1s linear infinite" }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  const s = data?.stats || {};
  const isAdmin = user?.role === "ADMIN";

  const statsCards = isAdmin
    ? [
      { title: "Total Users", value: s.totalUsers, icon: Users, bgColor: "#faf5ff", iconColor: "#7c3aed", borderColor: "#ddd6fe" },
      { title: "Total Posts", value: s.totalPosts, icon: Send, bgColor: "#f0fdf4", iconColor: "#16a34a", borderColor: "#bbf7d0" },
      { title: "Published", value: s.publishedPosts, icon: CheckCircle2, bgColor: "#eff6ff", iconColor: "#2563eb", borderColor: "#bfdbfe" },
      { title: "Scheduled", value: s.scheduledPosts, icon: Clock, bgColor: "#fffbeb", iconColor: "#d97706", borderColor: "#fde68a" },
      { title: "Social Accounts", value: s.socialAccounts, icon: Activity, bgColor: "#fdf2f8", iconColor: "#db2777", borderColor: "#fbcfe8" },
      { title: "AI Usage", value: s.totalAiUsage, icon: Zap, bgColor: "#f0fdf4", iconColor: "#16a34a", borderColor: "#bbf7d0" },
    ]
    : [
      { title: "My Posts", value: s.totalPosts, icon: Send, bgColor: "#f0fdf4", iconColor: "#16a34a", borderColor: "#bbf7d0" },
      { title: "Published", value: s.publishedPosts, icon: CheckCircle2, bgColor: "#eff6ff", iconColor: "#2563eb", borderColor: "#bfdbfe" },
      { title: "Scheduled", value: s.scheduledPosts, icon: Clock, bgColor: "#fffbeb", iconColor: "#d97706", borderColor: "#fde68a" },
      { title: "AI Usage", value: s.totalAiUsage, icon: Zap, bgColor: "#faf5ff", iconColor: "#7c3aed", borderColor: "#ddd6fe" },
    ];

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>
            {isAdmin ? "Admin Dashboard" : "Dashboard"}
          </h1>
          <p style={{ fontSize: 13, color: "var(--text-secondary)", marginTop: 4 }}>
            {isAdmin ? "Platform overview with real-time data." : "Your content performance overview."}
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div style={{
        display: "grid",
        gridTemplateColumns: `repeat(${isAdmin ? 3 : 4}, 1fr)`,
        gap: 16, marginBottom: 24,
      }}>
        {statsCards.map((c) => (
          <div key={c.title} style={{ ...cardStyle, border: `1px solid ${c.borderColor}`, padding: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <p style={{ fontSize: 11, fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  {c.title}
                </p>
                <p style={{ fontSize: 28, fontWeight: 700, color: "var(--text-primary)", marginTop: 4 }}>
                  {c.value ?? 0}
                </p>
              </div>
              <div style={{
                width: 44, height: 44, borderRadius: 12, background: c.bgColor,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <c.icon style={{ width: 22, height: 22, color: c.iconColor }} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Admin: Plan Distribution */}
      {isAdmin && data?.planDistribution && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 24 }}>
          {[
            { label: "Free Users", count: data.planDistribution.free, color: "var(--text-secondary)", bg: "#f3f4f6" },
            { label: "Basic Users", count: data.planDistribution.basic, color: "#2563eb", bg: "#eff6ff" },
            { label: "Pro Users", count: data.planDistribution.pro, color: "#7c3aed", bg: "#faf5ff" },
          ].map((p) => (
            <div key={p.label} style={{ ...cardStyle, padding: 20, display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: p.color, flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 12, color: "var(--text-secondary)", margin: 0 }}>{p.label}</p>
                <p style={{ fontSize: 22, fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>{p.count}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Chart + Activity */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 20 }}>
        {/* Chart */}
        <div style={{ ...cardStyle, padding: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <h3 style={{ fontSize: 15, fontWeight: 600, color: "var(--text-primary)", margin: 0 }}>
              Posts Overview (Last 12 Months)
            </h3>
          </div>
          <div style={{ height: 300 }}>
            {data?.chartData && data.chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.chartData}>
                  <defs>
                    <linearGradient id="gGreen" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#16a34a" stopOpacity={0.12} />
                      <stop offset="95%" stopColor="#16a34a" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gBlue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.08} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 12 }} dy={8} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 12 }} dx={-8} allowDecimals={false} />
                  <Tooltip contentStyle={{ background: "var(--bg-card)", border: "1px solid var(--border-color)", borderRadius: 8, fontSize: 12, boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }} />
                  <Area type="monotone" dataKey="posts" name="Total Posts" stroke="#16a34a" strokeWidth={2.5} fillOpacity={1} fill="url(#gGreen)" />
                  <Area type="monotone" dataKey="published" name="Published" stroke="#3b82f6" strokeWidth={2.5} fillOpacity={1} fill="url(#gBlue)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "var(--text-muted)" }}>
                <div style={{ textAlign: "center" }}>
                  <BarChart3 style={{ width: 40, height: 40, color: "#d1d5db", margin: "0 auto 12px" }} />
                  <p style={{ fontSize: 14, fontWeight: 500 }}>No post data yet</p>
                  <p style={{ fontSize: 12, marginTop: 4 }}>Start creating posts to see analytics</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div style={{ ...cardStyle, padding: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h3 style={{ fontSize: 15, fontWeight: 600, color: "var(--text-primary)", margin: 0 }}>Recent Activity</h3>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {data?.recentActivity && data.recentActivity.length > 0 ? (
              data.recentActivity.map((a: any) => {
                const cfg = statusConfig[a.status] || statusConfig.DRAFT;
                return (
                  <div key={a.id} style={{
                    display: "flex", alignItems: "flex-start", gap: 12,
                    padding: 12, borderRadius: 10, background: "var(--bg-hover)",
                  }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: 8, background: cfg.bg,
                      display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                    }}>
                      <cfg.icon style={{ width: 16, height: 16, color: cfg.color }} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {a.title}
                      </p>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
                        <span style={{
                          fontSize: 10, fontWeight: 700, textTransform: "uppercase",
                          padding: "1px 6px", borderRadius: 4, background: cfg.bg, color: cfg.color,
                        }}>
                          {a.status}
                        </span>
                        {a.platforms?.length > 0 && (
                          <span style={{ fontSize: 11, color: "var(--text-muted)" }}>
                            {a.platforms.join(", ")}
                          </span>
                        )}
                      </div>
                      <p style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 4 }}>
                        {isAdmin && a.userName ? `${a.userName} • ` : ""}{timeAgo(a.time)}
                      </p>
                    </div>
                  </div>
                );
              })
            ) : (
              <div style={{ textAlign: "center", padding: "40px 0", color: "var(--text-muted)" }}>
                <Activity style={{ width: 32, height: 32, color: "#d1d5db", margin: "0 auto 12px" }} />
                <p style={{ fontSize: 13, fontWeight: 500 }}>No activity yet</p>
                <p style={{ fontSize: 12, marginTop: 4 }}>Activity will appear here</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
