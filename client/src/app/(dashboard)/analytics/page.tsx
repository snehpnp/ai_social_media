"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts";
import {
  TrendingUp, Users, Heart, Share2, Eye, Send, Loader2,
  BarChart3, ArrowUpRight, ArrowDownRight,
} from "lucide-react";

const API = "http://localhost:5000/api/dashboard/stats";
const cardStyle: React.CSSProperties = {
  background: "var(--bg-card)", borderRadius: 12, border: "1px solid var(--border-color)",
  boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
};

const COLORS = ["#16a34a", "#3b82f6", "#f59e0b", "#ef4444"];

export default function AnalyticsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    axios
      .get(API, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => setData(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "60vh" }}>
        <Loader2 style={{ width: 28, height: 28, color: "var(--primary-color)", animation: "spin 1s linear infinite" }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  const s = data?.stats || {};
  const totalByStatus = [
    { name: "Published", value: s.publishedPosts || 0, color: "var(--primary-color)" },
    { name: "Scheduled", value: s.scheduledPosts || 0, color: "#3b82f6" },
    { name: "Draft", value: s.draftPosts || 0, color: "#f59e0b" },
    { name: "Failed", value: s.failedPosts || 0, color: "#ef4444" },
  ];

  const stats = [
    { title: "Total Posts", value: s.totalPosts || 0, icon: Send, change: "", bgColor: "#f0fdf4", iconColor: "#16a34a", borderColor: "#bbf7d0" },
    { title: "Published", value: s.publishedPosts || 0, icon: TrendingUp, change: "", bgColor: "#eff6ff", iconColor: "#2563eb", borderColor: "#bfdbfe" },
    { title: "AI Generations", value: s.totalAiUsage || 0, icon: BarChart3, change: "", bgColor: "#faf5ff", iconColor: "#7c3aed", borderColor: "#ddd6fe" },
    { title: "Connected Accounts", value: s.socialAccounts || 0, icon: Users, change: "", bgColor: "#fffbeb", iconColor: "#d97706", borderColor: "#fde68a" },
  ];

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>Analytics</h1>
        <p style={{ fontSize: 13, color: "var(--text-secondary)", marginTop: 4 }}>Track your content performance and engagement.</p>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 24 }}>
        {stats.map((c) => (
          <div key={c.title} style={{ ...cardStyle, border: `1px solid ${c.borderColor}`, padding: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <p style={{ fontSize: 11, fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em" }}>{c.title}</p>
                <p style={{ fontSize: 28, fontWeight: 700, color: "var(--text-primary)", marginTop: 4 }}>{c.value}</p>
              </div>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: c.bgColor, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <c.icon style={{ width: 22, height: 22, color: c.iconColor }} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 20, marginBottom: 20 }}>
        {/* Posts Over Time */}
        <div style={{ ...cardStyle, padding: 24 }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, color: "var(--text-primary)", margin: "0 0 20px" }}>Posts Over Time</h3>
          <div style={{ height: 300 }}>
            {data?.chartData ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 12 }} dy={8} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 12 }} dx={-8} allowDecimals={false} />
                  <Tooltip contentStyle={{ background: "var(--bg-card)", border: "1px solid var(--border-color)", borderRadius: 8, fontSize: 12 }} />
                  <Bar dataKey="posts" name="Total" fill="#16a34a" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="published" name="Published" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "var(--text-muted)" }}>
                <p>No data available</p>
              </div>
            )}
          </div>
        </div>

        {/* Pie Chart: Post Status */}
        <div style={{ ...cardStyle, padding: 24 }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, color: "var(--text-primary)", margin: "0 0 20px" }}>Post Distribution</h3>
          <div style={{ height: 220 }}>
            {s.totalPosts > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={totalByStatus.filter((d) => d.value > 0)}
                    cx="50%" cy="50%" innerRadius={50} outerRadius={80}
                    paddingAngle={5} dataKey="value"
                  >
                    {totalByStatus.filter((d) => d.value > 0).map((entry, idx) => (
                      <Cell key={idx} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: "var(--bg-card)", border: "1px solid var(--border-color)", borderRadius: 8, fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "var(--text-muted)" }}>
                <div style={{ textAlign: "center" }}>
                  <BarChart3 style={{ width: 32, height: 32, color: "#d1d5db", margin: "0 auto 8px" }} />
                  <p style={{ fontSize: 13 }}>No posts yet</p>
                </div>
              </div>
            )}
          </div>

          {/* Legend */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 12 }}>
            {totalByStatus.map((d) => (
              <div key={d.name} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 10, height: 10, borderRadius: 3, background: d.color, flexShrink: 0 }} />
                <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>{d.name}</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: "var(--text-primary)", marginLeft: "auto" }}>{d.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Engagement Trend */}
      <div style={{ ...cardStyle, padding: 24 }}>
        <h3 style={{ fontSize: 15, fontWeight: 600, color: "var(--text-primary)", margin: "0 0 20px" }}>Content Trend</h3>
        <div style={{ height: 240 }}>
          {data?.chartData ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.chartData}>
                <defs>
                  <linearGradient id="aGreen" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#16a34a" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#16a34a" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 12 }} dy={8} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 12 }} dx={-8} allowDecimals={false} />
                <Tooltip contentStyle={{ background: "var(--bg-card)", border: "1px solid var(--border-color)", borderRadius: 8, fontSize: 12 }} />
                <Area type="monotone" dataKey="posts" stroke="#16a34a" strokeWidth={2.5} fillOpacity={1} fill="url(#aGreen)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "var(--text-muted)" }}>
              <p>Create posts to see trends</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
