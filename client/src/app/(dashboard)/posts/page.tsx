"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import axios from "axios";
import { toast, Toaster } from "react-hot-toast";
import { CONFIG, getApiUrl } from "@/lib/config";
import { getToken } from "@/lib/auth";
import {
  Plus, Eye, Trash2, Loader2, Send, Clock, FileText, AlertCircle,
  CheckCircle2, Camera, Globe, Video, Search,
} from "lucide-react";

const API = getApiUrl(CONFIG.API.POSTS);
const cardStyle: React.CSSProperties = {
  background: "var(--bg-card)", borderRadius: 12, border: "1px solid var(--border-color)",
  boxShadow: "0 1px 3px rgba(0,0,0,0.04)", overflow: "hidden",
};
const statusConfig: Record<string, { color: string; bg: string; icon: any; label: string }> = {
  PUBLISHED: { color: "var(--primary-color)", bg: "#f0fdf4", icon: CheckCircle2, label: "Published" },
  SCHEDULED: { color: "#2563eb", bg: "#eff6ff", icon: Clock, label: "Scheduled" },
  DRAFT: { color: "var(--text-secondary)", bg: "#f3f4f6", icon: FileText, label: "Draft" },
  FAILED: { color: "#ef4444", bg: "#fef2f2", icon: AlertCircle, label: "Failed" },
};
const platformIcons: Record<string, any> = { instagram: Camera, facebook: Globe, youtube: Video };

// Platform colors for styling icons if needed
const pColors: Record<string, string> = { instagram: "#e1306c", facebook: "#1877f2", youtube: "#ff0000" };

export default function PostsPage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchPosts = async () => {
    setLoading(true);
    const token = getToken();
    try {
      const res = await axios.get(API, { headers: { Authorization: `Bearer ${token}` } });
      setPosts(res.data);
    } catch { toast.error("Failed to load posts"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchPosts(); }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this post?")) return;
    const token = getToken();
    try {
      await axios.delete(`${API}/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      toast.success("Post deleted"); fetchPosts();
    } catch { toast.error("Delete failed"); }
  };

  const filtered = posts.filter((p) =>
    p.caption?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <Toaster position="top-right" />

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, flexWrap: "wrap", gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: "var(--text-primary)", margin: 0, letterSpacing: "-0.5px" }}>My Posts</h1>
          <p style={{ fontSize: 14, color: "var(--text-secondary)", marginTop: 4 }}>Manage and track all your social media content.</p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          {/* Search bar */}
          <div style={{ position: "relative", width: 280 }}>
            <Search style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", width: 16, height: 16, color: "var(--text-muted)" }} />
            <input placeholder="Search posts..." value={search} onChange={(e) => setSearch(e.target.value)} style={{
              width: "100%", height: 40, borderRadius: 20, border: "1px solid var(--border-color)",
              paddingLeft: 40, paddingRight: 16, fontSize: 13, outline: "none", background: "var(--bg-card)",
              color: "var(--text-primary)", transition: "all 0.2s", boxShadow: "0 1px 2px rgba(0,0,0,0.05)"
            }} />
          </div>

          <Link href="/posts/create" style={{ textDecoration: "none" }}>
            <button style={{
              height: 40, padding: "0 20px", borderRadius: 20, background: "linear-gradient(135deg, #16a34a, #15803d)",
              color: "#fff", fontSize: 14, fontWeight: 600, border: "none", cursor: "pointer",
              display: "flex", alignItems: "center", gap: 8, boxShadow: "0 4px 12px rgba(22, 163, 74, 0.25)",
              transition: "transform 0.1s"
            }}
              onMouseOver={(e) => e.currentTarget.style.transform = "scale(1.02)"}
              onMouseOut={(e) => e.currentTarget.style.transform = "scale(1)"}
            >
              <Plus style={{ width: 18, height: 18 }} /> Create Post
            </button>
          </Link>
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: 300 }}>
          <Loader2 style={{ width: 32, height: 32, color: "var(--primary-color)", animation: "spin 1s linear infinite" }} />
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "80px 20px", background: "var(--bg-card)", borderRadius: 16, border: "1px dashed var(--border-color)" }}>
          <div style={{ width: 64, height: 64, borderRadius: "50%", background: "var(--bg-hover)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
            <Send style={{ width: 28, height: 28, color: "var(--text-muted)" }} />
          </div>
          <h3 style={{ fontSize: 18, fontWeight: 700, color: "var(--text-primary)", margin: "0 0 8px" }}>No posts found</h3>
          <p style={{ fontSize: 14, color: "var(--text-secondary)", maxWidth: 400, margin: "0 auto 20px" }}>
            {search ? "We couldn't find any posts matching your search." : "You haven't created any posts yet. Start by generating some awesome AI content!"}
          </p>
          {!search && (
            <Link href="/posts/create" style={{ textDecoration: "none" }}>
              <span style={{ color: "var(--primary-color)", fontSize: 14, fontWeight: 600 }}>Create Your First Post &rarr;</span>
            </Link>
          )}
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 24 }}>
          {filtered.map((post: any) => {
            const cfg = statusConfig[post.status] || statusConfig.DRAFT;
            const hasMedia = post.mediaUrls && post.mediaUrls.length > 0;
            const bgImage = hasMedia ? post.mediaUrls[0] : null;

            return (
              <div key={post.id} style={{
                background: "var(--bg-card)", borderRadius: 16, border: "1px solid var(--border-color)",
                overflow: "hidden", display: "flex", flexDirection: "column",
                boxShadow: "0 4px 6px rgba(0,0,0,0.02), 0 10px 15px rgba(0,0,0,0.03)",
                transition: "transform 0.2s, box-shadow 0.2s",
                position: "relative"
              }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = "translateY(-4px)";
                  e.currentTarget.style.boxShadow = "0 10px 25px rgba(0,0,0,0.08)";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 4px 6px rgba(0,0,0,0.02), 0 10px 15px rgba(0,0,0,0.03)";
                }}
              >
                {/* Media Header */}
                <div style={{
                  height: 160, width: "100%", background: bgImage ? `url(${bgImage}) center/cover no-repeat` : "linear-gradient(135deg, #f0fdf4, #dcfce7)",
                  position: "relative", display: "flex", alignItems: "flex-end", padding: 12
                }}>
                  {/* Overlay gradient for text readability if has image */}
                  {bgImage && <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 60%)" }} />}

                  {/* Platforms */}
                  <div style={{ display: "flex", gap: 6, zIndex: 10 }}>
                    {post.platforms?.map((pl: string) => {
                      const Icon = platformIcons[pl] || Globe;
                      const pColor = pColors[pl] || "#111827";
                      return (
                        <div key={pl} style={{
                          width: 28, height: 28, borderRadius: "50%", background: bgImage ? "rgba(255,255,255,0.2)" : "#fff",
                          backdropFilter: bgImage ? "blur(4px)" : "none", display: "flex", alignItems: "center", justifyContent: "center",
                          boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
                        }}>
                          <Icon style={{ width: 14, height: 14, color: bgImage ? "#fff" : pColor }} />
                        </div>
                      );
                    })}
                  </div>

                  {/* Actions Overlay */}
                  <div style={{ position: "absolute", top: 12, right: 12, display: "flex", gap: 6 }}>
                    <button onClick={() => handleDelete(post.id)} style={{
                      width: 32, height: 32, borderRadius: "50%", background: "rgba(255,255,255,0.9)",
                      display: "flex", alignItems: "center", justifyContent: "center", border: "none", cursor: "pointer",
                      boxShadow: "0 2px 4px rgba(0,0,0,0.1)", color: "#ef4444"
                    }} title="Delete Post"><Trash2 style={{ width: 16, height: 16 }} /></button>
                  </div>
                </div>

                {/* Content */}
                <div style={{ padding: 20, flex: 1, display: "flex", flexDirection: "column" }}>
                  {/* Status & Date */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                    <span style={{
                      fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px",
                      padding: "4px 10px", borderRadius: 20, background: cfg.bg, color: cfg.color,
                      display: "inline-flex", alignItems: "center", gap: 4
                    }}>
                      <cfg.icon style={{ width: 12, height: 12 }} />
                      {cfg.label}
                    </span>
                    <span style={{ fontSize: 12, color: "var(--text-secondary)", fontWeight: 500, display: "flex", alignItems: "center", gap: 4 }}>
                      <Clock style={{ width: 12, height: 12 }} />
                      {new Date(post.scheduledAt || post.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>

                  {/* Caption Text */}
                  <p style={{
                    fontSize: 14, color: "var(--text-primary)", lineHeight: 1.6, margin: 0,
                    display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden"
                  }}>
                    {post.caption || "No caption provided for this post."}
                  </p>

                  {/* Bottom Footer if needed */}
                  <div style={{ marginTop: "auto", paddingTop: 16, borderTop: "1px solid #f3f4f6", display: "flex", justifyContent: "center" }}>
                    <Link href={`/posts/${post.id}`} style={{ textDecoration: "none" }}>
                      <button style={{
                        background: "none", border: "none", color: "var(--primary-color)", fontSize: 13, fontWeight: 600,
                        cursor: "pointer", display: "flex", alignItems: "center", gap: 6
                      }}>
                        <Eye style={{ width: 16, height: 16 }} /> View Details
                      </button>
                    </Link>
                  </div>
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
