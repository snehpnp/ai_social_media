"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast, Toaster } from "react-hot-toast";
import {
  Calendar, Clock, Camera, Globe, Video, Loader2, Send,
  CheckCircle2, ArrowRight, CalendarDays,
} from "lucide-react";

const API = "http://localhost:5000/api/posts";
const cardStyle: React.CSSProperties = {
  background: "var(--bg-card)", borderRadius: 12, border: "1px solid var(--border-color)",
  boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
};
const platformIcons: Record<string, any> = { instagram: Camera, facebook: Globe, youtube: Video };
const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export default function SchedulerPage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    axios
      .get(API, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => {
        const scheduled = res.data.filter((p: any) => p.status === "SCHEDULED" && p.scheduledAt);
        scheduled.sort((a: any, b: any) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime());
        setPosts(scheduled);
      })
      .catch(() => toast.error("Failed to load scheduled posts"))
      .finally(() => setLoading(false));
  }, []);

  // Group by date
  const grouped: Record<string, any[]> = {};
  posts.forEach((p) => {
    const d = new Date(p.scheduledAt);
    const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(p);
  });

  return (
    <div>
      <Toaster position="top-right" />

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>Post Scheduler</h1>
          <p style={{ fontSize: 13, color: "var(--text-secondary)", marginTop: 4 }}>View and manage your upcoming scheduled posts.</p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            height: 36, padding: "0 14px", borderRadius: 8, background: "#f0fdf4",
            border: "1px solid #bbf7d0", display: "flex", alignItems: "center", gap: 6,
            fontSize: 13, fontWeight: 600, color: "var(--primary-color)",
          }}>
            <CalendarDays style={{ width: 16, height: 16 }} />
            {posts.length} Scheduled
          </div>
        </div>
      </div>

      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: "80px 0" }}>
          <Loader2 style={{ width: 28, height: 28, color: "var(--primary-color)", animation: "spin 1s linear infinite" }} />
        </div>
      ) : posts.length === 0 ? (
        <div style={{ ...cardStyle, padding: "80px 0", textAlign: "center" }}>
          <Calendar style={{ width: 48, height: 48, color: "#d1d5db", margin: "0 auto 16px" }} />
          <p style={{ fontSize: 16, fontWeight: 600, color: "var(--text-primary)" }}>No scheduled posts</p>
          <p style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 4 }}>Schedule a post from the Create Post page</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {Object.entries(grouped).map(([key, items]) => {
            const d = new Date(items[0].scheduledAt);
            const isToday = new Date().toDateString() === d.toDateString();
            const isTomorrow = new Date(Date.now() + 86400000).toDateString() === d.toDateString();
            const dayLabel = isToday ? "Today" : isTomorrow ? "Tomorrow" : `${monthNames[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;

            return (
              <div key={key}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                  <div style={{
                    width: 8, height: 8, borderRadius: "50%",
                    background: isToday ? "#16a34a" : "#d1d5db",
                  }} />
                  <span style={{ fontSize: 13, fontWeight: 600, color: isToday ? "#16a34a" : "#6b7280" }}>
                    {dayLabel}
                  </span>
                  <div style={{ flex: 1, height: 1, background: "var(--bg-hover)" }} />
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 10, paddingLeft: 18 }}>
                  {items.map((post) => {
                    const t = new Date(post.scheduledAt);
                    return (
                      <div key={post.id} style={{
                        ...cardStyle, padding: "16px 20px",
                        display: "flex", alignItems: "center", gap: 16,
                        borderLeft: "3px solid #16a34a",
                      }}>
                        {/* Time */}
                        <div style={{ textAlign: "center", minWidth: 56, flexShrink: 0 }}>
                          <p style={{ fontSize: 18, fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>
                            {t.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </p>
                          <p style={{ fontSize: 10, color: "var(--text-muted)", margin: 0, textTransform: "uppercase" }}>
                            {t.getHours() >= 12 ? "PM" : "AM"}
                          </p>
                        </div>

                        <div style={{ width: 1, height: 40, background: "var(--bg-hover)" }} />

                        {/* Content */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontSize: 14, fontWeight: 500, color: "var(--text-primary)", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {post.caption || "Untitled Post"}
                          </p>
                          <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 6 }}>
                            {post.platforms?.map((pl: string) => {
                              const Icon = platformIcons[pl] || Globe;
                              return (
                                <span key={pl} style={{
                                  fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 4,
                                  background: "var(--bg-hover)", color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: 4,
                                }}>
                                  <Icon style={{ width: 12, height: 12 }} /> {pl}
                                </span>
                              );
                            })}
                          </div>
                        </div>

                        {/* Status */}
                        <span style={{
                          fontSize: 11, fontWeight: 600, padding: "4px 12px", borderRadius: 6,
                          background: "#eff6ff", color: "#2563eb",
                        }}>Scheduled</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
