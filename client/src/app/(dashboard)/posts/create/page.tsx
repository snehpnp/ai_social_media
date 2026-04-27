"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { toast, Toaster } from "react-hot-toast";
import {
  Sparkles, Image as ImageIcon, Calendar, Send, Globe, Camera, Video,
  Loader2, X, Eye, Clock,
} from "lucide-react";

const API = "http://localhost:5000/api/posts";

const cardStyle: React.CSSProperties = {
  background: "var(--bg-card)", borderRadius: 12, border: "1px solid var(--border-color)",
  boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
};
const inputStyle: React.CSSProperties = {
  width: "100%", height: 44, borderRadius: 10, border: "1px solid var(--border-color)",
  padding: "0 14px", fontSize: 14, outline: "none", background: "var(--bg-input)", color: "var(--text-primary)",
};

const platforms = [
  { id: "instagram", name: "Instagram", icon: Camera, color: "#e1306c", bg: "rgba(225, 48, 108, 0.1)" },
  { id: "facebook", name: "Facebook", icon: Globe, color: "#1877f2", bg: "rgba(24, 119, 242, 0.1)" },
  { id: "youtube", name: "YouTube", icon: Video, color: "#ff0000", bg: "rgba(255, 0, 0, 0.1)" },
];

export default function CreatePostPage() {
  const router = useRouter();
  const [caption, setCaption] = useState("");
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduleTime, setScheduleTime] = useState("");
  const [showSchedule, setShowSchedule] = useState(false);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);

  const togglePlatform = (id: string) => {
    setSelectedPlatforms((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const handleAIGenerate = async () => {
    setGenerating(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post("http://localhost:5000/api/ai-providers/generate", {
        prompt: caption || "Write an engaging social media post",
        type: "caption"
      }, { headers: { Authorization: `Bearer ${token}` } });
      
      setCaption(res.data.content);
      toast.success(`Generated using ${res.data.provider}`);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to generate AI content");
    } finally {
      setGenerating(false);
    }
  };

  const [generatingImage, setGeneratingImage] = useState(false);
  const [imageUrl, setImageUrl] = useState("");

  const handleImageGenerate = async () => {
    const prompt = window.prompt("What kind of image do you want to generate?", caption || "A beautiful social media background");
    if (!prompt) return;

    setGeneratingImage(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post("http://localhost:5000/api/ai-providers/generate", {
        prompt,
        type: "image"
      }, { headers: { Authorization: `Bearer ${token}` } });
      
      setImageUrl(`data:image/png;base64,${res.data.content}`);
      toast.success(`Image generated using ${res.data.provider}`);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to generate image");
    } finally {
      setGeneratingImage(false);
    }
  };

  const handleSubmit = async (status: "DRAFT" | "PUBLISHED" | "SCHEDULED") => {
    if (!caption.trim()) return toast.error("Write some content first");
    if (selectedPlatforms.length === 0) return toast.error("Select at least one platform");
    if (status === "SCHEDULED" && (!scheduleDate || !scheduleTime)) return toast.error("Set schedule date & time");

    setLoading(true);
    const token = localStorage.getItem("token");
    try {
      await axios.post(API, {
        caption,
        mediaUrls: imageUrl ? [imageUrl] : [],
        platforms: selectedPlatforms,
        status,
        scheduledAt: status === "SCHEDULED" ? new Date(`${scheduleDate}T${scheduleTime}`) : null,
      }, { headers: { Authorization: `Bearer ${token}` } });
      toast.success(status === "DRAFT" ? "Saved as draft!" : status === "PUBLISHED" ? "Published!" : "Scheduled!");
      setTimeout(() => router.push("/posts"), 800);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to create post");
    } finally { setLoading(false); }
  };

  return (
    <div>
      <Toaster position="top-right" />

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>Create New Post</h1>
          <p style={{ fontSize: 13, color: "var(--text-secondary)", marginTop: 4 }}>Compose and publish across platforms.</p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={() => handleSubmit("DRAFT")} disabled={loading} style={{
            height: 38, padding: "0 16px", borderRadius: 8, background: "var(--bg-card)",
            color: "var(--text-primary)", fontSize: 13, fontWeight: 600, border: "1px solid var(--border-color)", cursor: "pointer",
          }}>Save as Draft</button>
          {showSchedule ? (
            <button onClick={() => handleSubmit("SCHEDULED")} disabled={loading} style={{
              height: 38, padding: "0 16px", borderRadius: 8, background: "#2563eb",
              color: "#fff", fontSize: 13, fontWeight: 600, border: "none", cursor: "pointer",
              display: "flex", alignItems: "center", gap: 6,
            }}><Clock style={{ width: 14, height: 14 }} /> Schedule</button>
          ) : (
            <button onClick={() => handleSubmit("PUBLISHED")} disabled={loading} style={{
              height: 38, padding: "0 16px", borderRadius: 8, background: "#16a34a",
              color: "#fff", fontSize: 13, fontWeight: 600, border: "none", cursor: "pointer",
              display: "flex", alignItems: "center", gap: 6,
            }}>{loading ? <Loader2 style={{ width: 14, height: 14, animation: "spin 1s linear infinite" }} /> : <Send style={{ width: 14, height: 14 }} />} Publish Now</button>
          )}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: 20 }}>
        {/* Left: Editor */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Content */}
          <div style={{ ...cardStyle, padding: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h3 style={{ fontSize: 15, fontWeight: 600, color: "var(--text-primary)", margin: 0 }}>Content</h3>
              <button onClick={handleAIGenerate} disabled={generating} style={{
                height: 32, padding: "0 14px", borderRadius: 8, background: "rgba(22, 163, 74, 0.1)",
                color: "var(--primary-color)", fontSize: 12, fontWeight: 600, border: "1px solid rgba(22, 163, 74, 0.3)",
                cursor: "pointer", display: "flex", alignItems: "center", gap: 6,
              }}>
                {generating ? <Loader2 style={{ width: 14, height: 14, animation: "spin 1s linear infinite" }} /> : <Sparkles style={{ width: 14, height: 14 }} />}
                AI Generate
              </button>
            </div>
            <textarea
              placeholder="What's on your mind? Write your caption here..."
              value={caption} onChange={(e) => setCaption(e.target.value)}
              style={{
                width: "100%", minHeight: 200, borderRadius: 10, border: "1px solid var(--border-color)",
                padding: 14, fontSize: 14, outline: "none", background: "var(--bg-input)",
                color: "var(--text-primary)", resize: "vertical", lineHeight: 1.7, fontFamily: "inherit",
              }}
            />
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 12 }}>
              <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{caption.length} characters</span>
              <button onClick={handleImageGenerate} disabled={generatingImage} style={{
                height: 32, padding: "0 12px", borderRadius: 8, background: "var(--bg-hover)",
                color: "var(--text-secondary)", fontSize: 12, fontWeight: 500, border: "none", cursor: "pointer",
                display: "flex", alignItems: "center", gap: 6,
              }}>
                {generatingImage ? <Loader2 style={{ width: 14, height: 14, animation: "spin 1s linear infinite" }} /> : <ImageIcon style={{ width: 14, height: 14 }} />}
                {generatingImage ? "Generating..." : "AI Generate Image"}
              </button>
            </div>
            
            {/* Generated Image Preview */}
            {imageUrl && (
              <div style={{ marginTop: 16, position: "relative", width: "fit-content" }}>
                <img src={imageUrl} alt="Generated" style={{ width: 200, height: 200, objectFit: "cover", borderRadius: 10, border: "1px solid var(--border-color)" }} />
                <button onClick={() => setImageUrl("")} style={{
                  position: "absolute", top: -8, right: -8, background: "#ef4444", color: "#fff",
                  width: 24, height: 24, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center",
                  border: "none", cursor: "pointer"
                }}>
                  <X style={{ width: 14, height: 14 }} />
                </button>
              </div>
            )}
          </div>

          {/* Platforms */}
          <div style={{ ...cardStyle, padding: 24 }}>
            <h3 style={{ fontSize: 15, fontWeight: 600, color: "var(--text-primary)", margin: "0 0 16px" }}>Platforms</h3>
            <div style={{ display: "flex", gap: 12 }}>
              {platforms.map((p) => {
                const selected = selectedPlatforms.includes(p.id);
                return (
                  <button key={p.id} onClick={() => togglePlatform(p.id)} style={{
                    flex: 1, padding: "16px 14px", borderRadius: 12, cursor: "pointer",
                    display: "flex", flexDirection: "column", alignItems: "center", gap: 10,
                    transition: "all 0.15s",
                    background: selected ? p.bg : "var(--bg-input)",
                    border: selected ? `2px solid ${p.color}` : "1px solid var(--border-color)",
                  }}>
                    <p.icon style={{ width: 24, height: 24, color: selected ? p.color : "#9ca3af" }} />
                    <span style={{ fontSize: 12, fontWeight: 600, color: selected ? p.color : "#6b7280" }}>{p.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Schedule */}
          <div style={{ ...cardStyle, padding: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: showSchedule ? 16 : 0 }}>
              <h3 style={{ fontSize: 15, fontWeight: 600, color: "var(--text-primary)", margin: 0 }}>Schedule Post</h3>
              <button onClick={() => setShowSchedule(!showSchedule)} style={{
                width: 44, height: 24, borderRadius: 12, border: "none", cursor: "pointer",
                background: showSchedule ? "#16a34a" : "#d1d5db", position: "relative", transition: "background 0.2s",
              }}>
                <span style={{
                  position: "absolute", top: 2, width: 20, height: 20, borderRadius: "50%",
                  background: "var(--bg-card)", transition: "left 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.15)",
                  left: showSchedule ? 22 : 2,
                }} />
              </button>
            </div>
            {showSchedule && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-primary)", marginBottom: 6, display: "block" }}>Date</label>
                  <input type="date" value={scheduleDate} onChange={(e) => setScheduleDate(e.target.value)} style={inputStyle} />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-primary)", marginBottom: 6, display: "block" }}>Time</label>
                  <input type="time" value={scheduleTime} onChange={(e) => setScheduleTime(e.target.value)} style={inputStyle} />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right: Preview */}
        <div style={{ ...cardStyle, padding: 24, alignSelf: "flex-start", position: "sticky", top: 88 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
            <Eye style={{ width: 16, height: 16, color: "var(--text-secondary)" }} />
            <h3 style={{ fontSize: 15, fontWeight: 600, color: "var(--text-primary)", margin: 0 }}>Preview</h3>
          </div>

          {/* Mock Phone */}
          <div style={{
            borderRadius: 24, border: "3px solid var(--border-color)", overflow: "hidden",
            background: "var(--bg-card)", maxWidth: 320, margin: "0 auto",
          }}>
            {/* Status bar */}
            <div style={{ height: 28, background: "var(--bg-hover)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <div style={{ width: 60, height: 6, borderRadius: 3, background: "#d1d5db" }} />
            </div>
            {/* Post header */}
            <div style={{ padding: "12px 14px", display: "flex", alignItems: "center", gap: 10, borderBottom: "1px solid var(--border-color)" }}>
              <div style={{ width: 32, height: 32, borderRadius: "50%", background: "var(--primary-color)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ color: "#fff", fontSize: 12, fontWeight: 700 }}>U</span>
              </div>
              <div>
                <p style={{ fontSize: 12, fontWeight: 600, color: "var(--text-primary)", margin: 0 }}>Your Account</p>
                <p style={{ fontSize: 10, color: "var(--text-muted)", margin: 0 }}>Just now</p>
              </div>
            </div>
            {/* Post image placeholder or actual image */}
            {imageUrl ? (
              <img src={imageUrl} alt="Post preview" style={{ width: "100%", height: 200, objectFit: "cover" }} />
            ) : (
              <div style={{ height: 200, background: "var(--bg-hover)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <ImageIcon style={{ width: 40, height: 40, color: "var(--text-muted)" }} />
              </div>
            )}
            
            {/* Post content */}
            <div style={{ padding: 14 }}>
              <p style={{ fontSize: 12, color: "var(--text-primary)", lineHeight: 1.6, margin: 0, whiteSpace: "pre-wrap", maxHeight: 120, overflow: "hidden" }}>
                {caption || "Your caption will appear here..."}
              </p>
            </div>
            {/* Bottom bar */}
            <div style={{ height: 6, background: "var(--bg-hover)" }} />
          </div>

          {/* Platform tags */}
          {selectedPlatforms.length > 0 && (
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 16 }}>
              {selectedPlatforms.map((p) => {
                const pl = platforms.find((x) => x.id === p);
                return (
                  <span key={p} style={{
                    fontSize: 11, fontWeight: 600, padding: "4px 10px", borderRadius: 6,
                    background: pl?.bg, color: pl?.color,
                  }}>{pl?.name}</span>
                );
              })}
            </div>
          )}
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
