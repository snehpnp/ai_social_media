"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import { toast, Toaster } from "react-hot-toast";
import { CONFIG, getApiUrl } from "@/lib/config";
import { 
  ArrowLeft, Clock, CheckCircle2, AlertCircle, FileText, 
  Globe, Send, Loader2, Image as ImageIcon, Calendar
} from "lucide-react";
import Link from "next/link";
import { getToken } from "@/lib/auth";

const API = getApiUrl(CONFIG.API.POSTS);

const statusConfig: Record<string, { color: string; bg: string; icon: any; label: string }> = {
  PUBLISHED: { color: "var(--primary-color)", bg: "#f0fdf4", icon: CheckCircle2, label: "Published" },
  SCHEDULED: { color: "#2563eb", bg: "#eff6ff", icon: Clock, label: "Scheduled" },
  DRAFT: { color: "var(--text-secondary)", bg: "#f3f4f6", icon: FileText, label: "Draft" },
  FAILED: { color: "#ef4444", bg: "#fef2f2", icon: AlertCircle, label: "Failed" },
};

export default function PostDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [publishing, setPublishing] = useState(false);

  useEffect(() => {
    fetchPost();
  }, [id]);

  const fetchPost = async () => {
    try {
      const token = getToken();
      const res = await axios.get(`${API}/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPost(res.data);
    } catch (error) {
      toast.error("Failed to load post details");
      router.push("/posts");
    } finally {
      setLoading(false);
    }
  };

  const handlePublishToFacebook = async () => {
    if (!confirm("Are you sure you want to publish this to Facebook now?")) return;
    
    setPublishing(true);
    try {
      const token = getToken();
      const res = await axios.post(`${API}/${id}/publish`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Successfully published to Facebook!");
      // Reload post to update status
      fetchPost();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to publish. Check your Facebook connection in Settings.");
    } finally {
      setPublishing(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "70vh" }}>
        <Loader2 style={{ width: 40, height: 40, color: "var(--primary-color)", animation: "spin 1s linear infinite" }} />
      </div>
    );
  }

  if (!post) return null;

  const cfg = statusConfig[post.status] || statusConfig.DRAFT;
  const hasMedia = post.mediaUrls && post.mediaUrls.length > 0;
  const isFacebook = post.platforms?.includes('facebook');

  return (
    <div style={{ maxWidth: 900, margin: "0 auto" }}>
      <Toaster position="top-right" />
      
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 30 }}>
        <Link href="/posts" style={{ color: "var(--text-secondary)", display: "flex", alignItems: "center", textDecoration: "none" }}>
          <ArrowLeft style={{ width: 24, height: 24 }} />
        </Link>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>Post Details</h1>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 6 }}>
            <span style={{
              fontSize: 12, fontWeight: 700, textTransform: "uppercase",
              padding: "4px 10px", borderRadius: 20, background: cfg.bg, color: cfg.color,
              display: "flex", alignItems: "center", gap: 4
            }}>
              <cfg.icon style={{ width: 14, height: 14 }} />
              {cfg.label}
            </span>
            <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>
              • Created on {new Date(post.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 350px", gap: 24, alignItems: "start" }}>
        
        {/* Main Content Area */}
        <div style={{ background: "var(--bg-card)", borderRadius: 16, border: "1px solid var(--border-color)", overflow: "hidden", boxShadow: "0 4px 6px rgba(0,0,0,0.02)" }}>
          
          {/* Post Image Preview */}
          {hasMedia ? (
            <div style={{ width: "100%", background: "var(--bg-hover)", display: "flex", justifyContent: "center" }}>
              <img 
                src={post.mediaUrls[0]} 
                alt="Post media" 
                style={{ maxWidth: "100%", maxHeight: 500, objectFit: "contain" }}
              />
            </div>
          ) : (
            <div style={{ width: "100%", height: 200, background: "linear-gradient(135deg, #f0fdf4, #dcfce7)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "var(--primary-color)" }}>
              <ImageIcon style={{ width: 48, height: 48, marginBottom: 12, opacity: 0.5 }} />
              <span style={{ fontWeight: 600, fontSize: 14 }}>Text-Only Post</span>
            </div>
          )}

          {/* Caption */}
          <div style={{ padding: 24 }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)", margin: "0 0 12px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Caption</h3>
            <div style={{ fontSize: 16, color: "var(--text-primary)", lineHeight: 1.6, whiteSpace: "pre-wrap", background: "var(--bg-input)", padding: 16, borderRadius: 12, border: "1px solid #f3f4f6" }}>
              {post.caption || "No caption provided."}
            </div>
          </div>
        </div>

        {/* Sidebar Status & Actions */}
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          
          <div style={{ background: "var(--bg-card)", borderRadius: 16, border: "1px solid var(--border-color)", padding: 24, boxShadow: "0 4px 6px rgba(0,0,0,0.02)" }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)", margin: "0 0 16px" }}>Publishing Status</h3>
            
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: "50%", background: "var(--bg-hover)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-secondary)" }}>
                  <Globe style={{ width: 20, height: 20 }} />
                </div>
                <div>
                  <p style={{ fontSize: 12, color: "var(--text-secondary)", margin: 0, fontWeight: 500 }}>Target Platforms</p>
                  <p style={{ fontSize: 14, color: "var(--text-primary)", margin: "2px 0 0", fontWeight: 600, textTransform: "capitalize" }}>
                    {post.platforms?.join(", ") || "None selected"}
                  </p>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: "50%", background: "var(--bg-hover)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-secondary)" }}>
                  <Calendar style={{ width: 20, height: 20 }} />
                </div>
                <div>
                  <p style={{ fontSize: 12, color: "var(--text-secondary)", margin: 0, fontWeight: 500 }}>Schedule Date</p>
                  <p style={{ fontSize: 14, color: "var(--text-primary)", margin: "2px 0 0", fontWeight: 600 }}>
                    {post.scheduledAt ? new Date(post.scheduledAt).toLocaleString() : "Publish Immediately"}
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons based on status */}
            <div style={{ marginTop: 24, paddingTop: 24, borderTop: "1px solid var(--border-color)" }}>
              {post.status === 'PUBLISHED' ? (
                <div style={{ background: "#f0fdf4", padding: 16, borderRadius: 12, border: "1px solid #bbf7d0", display: "flex", alignItems: "flex-start", gap: 12 }}>
                  <CheckCircle2 style={{ width: 20, height: 20, color: "var(--primary-color)", flexShrink: 0 }} />
                  <div>
                    <h4 style={{ fontSize: 14, fontWeight: 700, color: "#166534", margin: "0 0 4px" }}>Successfully Published</h4>
                    <p style={{ fontSize: 13, color: "#166534", margin: 0, opacity: 0.8 }}>This post is live on your connected social platforms.</p>
                  </div>
                </div>
              ) : post.status === 'FAILED' ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <div style={{ background: "#fef2f2", padding: 16, borderRadius: 12, border: "1px solid #fecaca", display: "flex", alignItems: "flex-start", gap: 12 }}>
                    <AlertCircle style={{ width: 20, height: 20, color: "#ef4444", flexShrink: 0 }} />
                    <div style={{ width: "100%" }}>
                      <h4 style={{ fontSize: 14, fontWeight: 700, color: "#b91c1c", margin: "0 0 4px" }}>Publishing Failed</h4>
                      <p style={{ fontSize: 13, color: "#b91c1c", margin: 0, opacity: 0.9 }}>Facebook rejected this post.</p>
                      
                      {post.errorTrace && (
                        <div style={{ marginTop: 12, background: "rgba(255,255,255,0.5)", padding: 8, borderRadius: 6, fontSize: 11, color: "#7f1d1d", fontFamily: "monospace", overflowX: "auto" }}>
                          {post.errorTrace}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <button 
                    onClick={handlePublishToFacebook}
                    disabled={publishing}
                    style={{
                      width: "100%", height: 44, borderRadius: 8, background: "#1877f2",
                      color: "#fff", fontSize: 14, fontWeight: 600, border: "none", cursor: publishing ? "not-allowed" : "pointer",
                      display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                      boxShadow: "0 4px 6px rgba(24, 119, 242, 0.2)", opacity: publishing ? 0.7 : 1
                    }}
                  >
                    {publishing ? <Loader2 style={{ width: 18, height: 18, animation: "spin 1s linear infinite" }} /> : <Globe style={{ width: 18, height: 18 }} />}
                    {publishing ? "Retrying..." : "Retry Publish to Facebook"}
                  </button>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: 0, textAlign: "center" }}>
                    Ready to go live?
                  </p>
                  
                  {isFacebook && (
                    <button 
                      onClick={handlePublishToFacebook}
                      disabled={publishing}
                      style={{
                        width: "100%", height: 44, borderRadius: 8, background: "#1877f2",
                        color: "#fff", fontSize: 14, fontWeight: 600, border: "none", cursor: publishing ? "not-allowed" : "pointer",
                        display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                        boxShadow: "0 4px 6px rgba(24, 119, 242, 0.2)", opacity: publishing ? 0.7 : 1
                      }}
                    >
                      {publishing ? <Loader2 style={{ width: 18, height: 18, animation: "spin 1s linear infinite" }} /> : <Globe style={{ width: 18, height: 18 }} />}
                      {publishing ? "Publishing..." : "Publish to Facebook Now"}
                    </button>
                  )}
                  
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
