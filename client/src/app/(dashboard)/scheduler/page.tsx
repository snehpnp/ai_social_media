"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast, Toaster } from "react-hot-toast";
import { CONFIG, getApiUrl } from "@/lib/config";
import { getToken } from "@/lib/auth";
import {
  Calendar, Clock, Camera, Globe, Video, Loader2,
  CheckCircle2, CalendarDays, Edit2, X,
} from "lucide-react";

const API = getApiUrl(CONFIG.API.POSTS);

const platformIcons: Record<string, any> = {
  instagram: Camera,
  facebook: Globe,
  youtube: Video,
};
const monthNames = [
  "Jan","Feb","Mar","Apr","May","Jun",
  "Jul","Aug","Sep","Oct","Nov","Dec",
];

export default function SchedulerPage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPost, setEditingPost] = useState<string | null>(null);
  const [editDate, setEditDate] = useState("");
  const [editTime, setEditTime] = useState("");
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const token = getToken();
    if (!token) return;
    axios
      .get(API, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => {
        const scheduled = res.data.filter(
          (p: any) => p.status === "SCHEDULED" && p.scheduledAt
        );
        scheduled.sort(
          (a: any, b: any) =>
            new Date(a.scheduledAt).getTime() -
            new Date(b.scheduledAt).getTime()
        );
        setPosts(scheduled);
      })
      .catch(() => toast.error("Failed to load scheduled posts"))
      .finally(() => setLoading(false));
  }, []);

  const handleEditTime = (post: any) => {
    const d = new Date(post.scheduledAt);
    setEditDate(d.toISOString().split("T")[0]);
    setEditTime(d.toTimeString().slice(0, 5));
    setEditingPost(post.id);
  };

  const handleSaveTime = async () => {
    if (!editingPost || !editDate || !editTime) return;
    setUpdating(true);
    try {
      const token = getToken();
      const newScheduledAt = new Date(`${editDate}T${editTime}`);
      await axios.patch(
        `${API}/${editingPost}`,
        { scheduledAt: newScheduledAt.toISOString() },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPosts(
        posts.map((p) =>
          p.id === editingPost
            ? { ...p, scheduledAt: newScheduledAt.toISOString() }
            : p
        )
      );
      toast.success("Schedule updated successfully!");
      setEditingPost(null);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update schedule");
    } finally {
      setUpdating(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingPost(null);
    setEditDate("");
    setEditTime("");
  };

  const grouped: Record<string, any[]> = {};
  posts.forEach((p) => {
    const d = new Date(p.scheduledAt);
    const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(p);
  });

  return (
    // ✅ FIX 1: Removed height:100vh + overflow:hidden from outer wrapper
    // Now page scrolls naturally — no nested scroll
    <div
      style={{
        width: "100%",
        minHeight: "100vh",
        background: "var(--bg-primary)",
        padding: "0 4px",
      }}
    >
      <Toaster position="top-right" />

      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 24,
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <div>
          <h1
            style={{
              fontSize: 22,
              fontWeight: 700,
              color: "var(--text-primary)",
              margin: 0,
            }}
          >
            Post Scheduler
          </h1>
          <p
            style={{
              fontSize: 13,
              color: "var(--text-secondary)",
              marginTop: 4,
            }}
          >
            View and manage your upcoming scheduled posts.
          </p>
        </div>
        <div
          style={{
            height: 36,
            padding: "0 14px",
            borderRadius: 8,
            background: "rgba(34,197,94,0.1)",
            border: "1px solid rgba(34,197,94,0.3)",
            display: "flex",
            alignItems: "center",
            gap: 6,
            fontSize: 13,
            fontWeight: 600,
            color: "#22c55e",
          }}
        >
          <CalendarDays style={{ width: 16, height: 16 }} />
          {posts.length} Scheduled
        </div>
      </div>

      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: "80px 0" }}>
          <Loader2
            style={{
              width: 28,
              height: 28,
              color: "#22c55e",
              animation: "spin 1s linear infinite",
            }}
          />
        </div>
      ) : posts.length === 0 ? (
        <div
          style={{
            background: "var(--bg-card)",
            borderRadius: 12,
            border: "1px solid var(--border-color)",
            padding: "80px 0",
            textAlign: "center",
          }}
        >
          <Calendar
            style={{
              width: 48,
              height: 48,
              color: "#9ca3af",
              margin: "0 auto 16px",
            }}
          />
          <p style={{ fontSize: 16, fontWeight: 600, color: "var(--text-primary)" }}>
            No scheduled posts
          </p>
          <p style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 4 }}>
            Schedule a post from the Create Post page
          </p>
        </div>
      ) : (
        // ✅ FIX 2: Removed flex:1 + overflowY:auto — no nested scroll container
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {Object.entries(grouped).map(([key, items]) => {
            const d = new Date(items[0].scheduledAt);
            const isToday = new Date().toDateString() === d.toDateString();
            const isTomorrow =
              new Date(Date.now() + 86400000).toDateString() ===
              d.toDateString();
            const dayLabel = isToday
              ? "Today"
              : isTomorrow
              ? "Tomorrow"
              : `${monthNames[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;

            return (
              <div key={key}>
                {/* Date group header */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    marginBottom: 12,
                  }}
                >
                  <div
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      background: isToday ? "#22c55e" : "#9ca3af",
                      flexShrink: 0,
                    }}
                  />
                  <span
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      color: isToday ? "#22c55e" : "#6b7280",
                    }}
                  >
                    {dayLabel}
                  </span>
                  <div
                    style={{
                      flex: 1,
                      height: 1,
                      background: "var(--bg-hover)",
                    }}
                  />
                </div>

                {/* Posts in this group */}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 10,
                    paddingLeft: 18,
                  }}
                >
                  {items.map((post) => {
                    const t = new Date(post.scheduledAt);
                    const isEditing = editingPost === post.id;

                    return (
                      <div
                        key={post.id}
                        style={{
                          background: "var(--bg-card)",
                          borderRadius: 12,
                          border: "1px solid var(--border-color)",
                          borderLeft: "3px solid #22c55e",
                          // ✅ FIX 3: Removed fixed height — card grows with content
                          padding: isEditing ? "20px" : "16px 20px",
                          display: "flex",
                          alignItems: isEditing ? "flex-start" : "flex-start",
                          gap: 16,
                          flexWrap: "wrap",
                        }}
                      >
                        {isEditing ? (
                          <div
                            style={{
                              flex: 1,
                              minWidth: 0,
                              display: "flex",
                              flexDirection: "column",
                              gap: 12,
                            }}
                          >
                            <div
                              style={{
                                display: "flex",
                                gap: 12,
                                flexWrap: "wrap",
                              }}
                            >
                              <div>
                                <label
                                  style={{
                                    fontSize: 12,
                                    color: "var(--text-secondary)",
                                    marginBottom: 4,
                                    display: "block",
                                  }}
                                >
                                  Date
                                </label>
                                <input
                                  type="date"
                                  value={editDate}
                                  onChange={(e) => setEditDate(e.target.value)}
                                  style={{
                                    height: 36,
                                    borderRadius: 8,
                                    border: "1px solid var(--border-color)",
                                    padding: "0 10px",
                                    fontSize: 13,
                                    outline: "none",
                                    background: "var(--bg-input)",
                                    color: "var(--text-primary)",
                                  }}
                                />
                              </div>
                              <div>
                                <label
                                  style={{
                                    fontSize: 12,
                                    color: "var(--text-secondary)",
                                    marginBottom: 4,
                                    display: "block",
                                  }}
                                >
                                  Time
                                </label>
                                <input
                                  type="time"
                                  value={editTime}
                                  onChange={(e) => setEditTime(e.target.value)}
                                  style={{
                                    height: 36,
                                    borderRadius: 8,
                                    border: "1px solid var(--border-color)",
                                    padding: "0 10px",
                                    fontSize: 13,
                                    outline: "none",
                                    background: "var(--bg-input)",
                                    color: "var(--text-primary)",
                                  }}
                                />
                              </div>
                            </div>
                            <div style={{ display: "flex", gap: 8 }}>
                              <button
                                onClick={handleSaveTime}
                                disabled={updating}
                                style={{
                                  height: 36,
                                  padding: "0 16px",
                                  borderRadius: 8,
                                  background: "#16a34a",
                                  color: "#fff",
                                  fontSize: 13,
                                  fontWeight: 600,
                                  border: "none",
                                  cursor: "pointer",
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 6,
                                }}
                              >
                                {updating ? (
                                  <Loader2
                                    style={{
                                      width: 14,
                                      height: 14,
                                      animation: "spin 1s linear infinite",
                                    }}
                                  />
                                ) : (
                                  <CheckCircle2 style={{ width: 14, height: 14 }} />
                                )}
                                Save
                              </button>
                              <button
                                onClick={handleCancelEdit}
                                style={{
                                  height: 36,
                                  padding: "0 16px",
                                  borderRadius: 8,
                                  background: "var(--bg-card)",
                                  color: "var(--text-primary)",
                                  fontSize: 13,
                                  fontWeight: 600,
                                  border: "1px solid var(--border-color)",
                                  cursor: "pointer",
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 6,
                                }}
                              >
                                <X style={{ width: 14, height: 14 }} /> Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <>
                            {/* Time block */}
                            <div
                              style={{
                                textAlign: "center",
                                minWidth: 56,
                                flexShrink: 0,
                                paddingTop: 2,
                              }}
                            >
                              <p
                                style={{
                                  fontSize: 18,
                                  fontWeight: 700,
                                  color: "var(--text-primary)",
                                  margin: 0,
                                }}
                              >
                                {t.toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </p>
                              <p
                                style={{
                                  fontSize: 10,
                                  color: "var(--text-muted)",
                                  margin: 0,
                                  textTransform: "uppercase",
                                }}
                              >
                                {t.getHours() >= 12 ? "PM" : "AM"}
                              </p>
                            </div>

                            <div
                              style={{
                                width: 1,
                                // ✅ FIX 4: minHeight instead of fixed height so
                                // divider stretches with taller content
                                minHeight: 44,
                                background: "var(--bg-hover)",
                                flexShrink: 0,
                              }}
                            />

                            {/* Caption + platforms */}
                            <div style={{ flex: 1, minWidth: 0 }}>
                              {/* ✅ FIX 5: Removed whiteSpace:nowrap + textOverflow
                                  so long captions wrap inside the card */}
                              <p
                                style={{
                                  fontSize: 14,
                                  fontWeight: 500,
                                  color: "var(--text-primary)",
                                  margin: "0 0 8px",
                                  wordBreak: "break-word",
                                }}
                              >
                                {post.caption || "Untitled Post"}
                              </p>
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 6,
                                  flexWrap: "wrap",
                                }}
                              >
                                {post.platforms?.map((pl: string) => {
                                  const Icon = platformIcons[pl] || Globe;
                                  return (
                                    <span
                                      key={pl}
                                      style={{
                                        fontSize: 10,
                                        fontWeight: 600,
                                        padding: "2px 8px",
                                        borderRadius: 4,
                                        background: "var(--bg-hover)",
                                        color: "var(--text-secondary)",
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 4,
                                      }}
                                    >
                                      <Icon style={{ width: 11, height: 11 }} />
                                      {pl}
                                    </span>
                                  );
                                })}
                              </div>
                            </div>

                            {/* Actions */}
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 8,
                                flexShrink: 0,
                                flexWrap: "wrap",
                              }}
                            >
                              <button
                                onClick={() => handleEditTime(post)}
                                style={{
                                  height: 32,
                                  padding: "0 12px",
                                  borderRadius: 6,
                                  background: "var(--bg-hover)",
                                  color: "var(--text-primary)",
                                  fontSize: 12,
                                  fontWeight: 600,
                                  border: "1px solid var(--border-color)",
                                  cursor: "pointer",
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 4,
                                }}
                              >
                                <Edit2 style={{ width: 13, height: 13 }} /> Edit
                              </button>
                              <span
                                style={{
                                  fontSize: 11,
                                  fontWeight: 600,
                                  padding: "4px 12px",
                                  borderRadius: 6,
                                  background: "rgba(59,130,246,0.1)",
                                  color: "#3b82f6",
                                }}
                              >
                                Scheduled
                              </span>
                            </div>
                          </>
                        )}
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