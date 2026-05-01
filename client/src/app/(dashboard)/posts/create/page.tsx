"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { toast, Toaster } from "react-hot-toast";
import {
  Sparkles, Image as ImageIcon, Send, Globe, Camera,
  Loader2, X, Eye, Clock, Edit2
} from "lucide-react";
import dynamic from "next/dynamic";
import { CONFIG, getApiUrl } from "@/lib/config";
import { getToken } from "@/lib/auth";

// ── Dynamic import of our custom editor (no SSR issues, no DOM prop leaks) ──
const ImageEditorModal = dynamic(() => import("./ImageEditorModal"), { ssr: false });
const PosterMakerModal = dynamic(() => import("./PosterMakerModal"), { ssr: false });

const API = getApiUrl(CONFIG.API.POSTS);

// ─── Shared styles ────────────────────────────────────────────────────────────
const cardStyle: React.CSSProperties = {
  background: "var(--bg-card)",
  borderRadius: 12,
  border: "1px solid var(--border-color)",
  boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  height: 44,
  borderRadius: 10,
  border: "1px solid var(--border-color)",
  padding: "0 14px",
  fontSize: 14,
  outline: "none",
  background: "var(--bg-input)",
  color: "var(--text-primary)",
};

const platforms = [
  { id: "instagram", name: "Instagram", icon: Camera, color: "#e1306c", bg: "rgba(225, 48, 108, 0.1)" },
  { id: "facebook",  name: "Facebook",  icon: Globe,  color: "#1877f2", bg: "rgba(24, 119, 242, 0.1)"  },
];

// ─────────────────────────────────────────────────────────────────────────────
export default function CreatePostPage() {
  const router = useRouter();

  // State
  const [caption,           setCaption]           = useState("");
  const [imageUrl,          setImageUrl]           = useState("");
  const [selectedPlatforms, setSelectedPlatforms]  = useState<string[]>(["instagram"]);
  const [scheduleDate,      setScheduleDate]       = useState("");
  const [scheduleTime,      setScheduleTime]       = useState("");
  const [showSchedule,      setShowSchedule]       = useState(false);
  const [loading,           setLoading]            = useState(false);
  const [uploading,         setUploading]          = useState(false);
  const [generating,        setGenerating]         = useState(false);
  const [generatingImage,   setGeneratingImage]    = useState(false);
  const [showAIModal,       setShowAIModal]        = useState(false);
  const [aiPrompt,          setAiPrompt]           = useState("");
  const [aiTone,            setAiTone]             = useState("engaging");
  const [aiAudience,        setAiAudience]         = useState("general");
  const [aiLanguage,        setAiLanguage]         = useState("english");
  const [showImageEditor,   setShowImageEditor]    = useState(false);
  const [showPosterMaker,   setShowPosterMaker]    = useState(false);
  const [useImageRef,       setUseImageRef]        = useState(false);
  const [isMounted,         setIsMounted]          = useState(false);

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // isMounted — ensures dynamic import only renders client-side
  useEffect(() => { setIsMounted(true); }, []);

  // Load draft
  useEffect(() => {
    try {
      const saved = localStorage.getItem("post_draft");
      if (saved) {
        const data = JSON.parse(saved);
        if (data.caption)           setCaption(data.caption);
        if (data.imageUrl)          setImageUrl(data.imageUrl);
        if (data.selectedPlatforms) setSelectedPlatforms(data.selectedPlatforms);
      }
    } catch { /* ignore corrupt draft */ }
  }, []);

  // Auto-save draft
  useEffect(() => {
    const t = setTimeout(() => {
      localStorage.setItem("post_draft", JSON.stringify({ caption, imageUrl, selectedPlatforms }));
    }, 1000);
    return () => clearTimeout(t);
  }, [caption, imageUrl, selectedPlatforms]);

  // Computed
  const platformLimits: Record<string, number> = { instagram: 2200, facebook: 63206 };
  const currentLimit = platformLimits[selectedPlatforms[0]] || 2000;
  const isOverLimit  = caption.length > currentLimit;

  const reachScore = (() => {
    let s = 0;
    if (caption.length > 20)          s += 20;
    if (caption.length > 100)         s += 10;
    if (caption.includes("#"))        s += 20;
    if (imageUrl)                     s += 40;
    if (caption.split(" ").length > 5) s += 10;
    return Math.min(s, 100);
  })();

  // Handlers
  const togglePlatform = (id: string) => setSelectedPlatforms([id]);

  const handleAIGenerate = async (
    target: "caption" | "hashtag" | "description" | "code" = "caption"
  ) => {
    setGenerating(true);
    try {
      const token = getToken();
      const res = await axios.post(
        getApiUrl(CONFIG.API.AI_GENERATE),
        {
          prompt: aiPrompt || caption || "Write an engaging social media post",
          type: target,
          providerSlug: "groq",
          config: { tone: aiTone, audience: aiAudience, language: aiLanguage },
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const content = res.data.content;
      if (target === "caption") setCaption(content);
      else setCaption((p) => (p ? `${p}\n\n${content}` : content));
      toast.success(`Generated using ${res.data.provider}`);
      setShowAIModal(false);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to generate AI content");
    } finally { setGenerating(false); }
  };

  const handleImageGenerate = async () => {
    const prompt = window.prompt(
      useImageRef
        ? `Describe how you want to transform your photo: (e.g., "make it festive Diwali style with diyas and lights")`
        : "What kind of image do you want to generate?",
      caption || "A beautiful social media background"
    );
    if (!prompt) return;
    setGeneratingImage(true);
    try {
      const token = getToken();
      const payload: { prompt: string; type: string; referenceImage?: string } = {
        prompt,
        type: "image",
      };
      // If user wants to use current image as reference
      if (useImageRef && imageUrl) {
        payload.referenceImage = imageUrl;
      }
      const res = await axios.post(
        getApiUrl(CONFIG.API.AI_GENERATE),
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setImageUrl(res.data.content);
      toast.success(useImageRef ? `Image transformed using ${res.data.provider}` : `Image generated using ${res.data.provider}`);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to generate image");
    } finally { setGeneratingImage(false); }
  };

  // Called by our custom ImageEditorModal
  const onCompleteImageEdit = (base64: string) => {
    setImageUrl(base64);
    setShowImageEditor(false);
    toast.success("Image updated successfully!");
  };

  // Called by PosterMakerModal
  const onCompletePoster = (base64: string) => {
    setImageUrl(base64);
    setShowPosterMaker(false);
    toast.success("Poster created successfully!");
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/") && !file.type.startsWith("video/")) {
      toast.error("Please select an image or video file"); return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size must be less than 10MB"); return;
    }
    setUploading(true);
    const reader = new FileReader();
    reader.onload = (ev) => {
      setImageUrl(ev.target?.result as string);
      toast.success("File uploaded successfully");
      setUploading(false);
    };
    reader.onerror = () => { toast.error("Failed to upload file"); setUploading(false); };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (status: "DRAFT" | "PUBLISHED" | "SCHEDULED") => {
    if (!caption.trim())                                        return toast.error("Write some content first");
    if (selectedPlatforms.length === 0)                         return toast.error("Select at least one platform");
    if (status === "SCHEDULED" && (!scheduleDate || !scheduleTime)) return toast.error("Set schedule date & time");

    setLoading(true);
    const token = getToken();
    try {
      const res = await axios.post(API, {
        caption,
        mediaUrls: imageUrl ? [imageUrl] : [],
        platforms: selectedPlatforms,
        status: status === "PUBLISHED" ? "DRAFT" : status,
        scheduledAt: status === "SCHEDULED" ? new Date(`${scheduleDate}T${scheduleTime}`) : null,
      }, { headers: { Authorization: `Bearer ${token}` } });

      const postId = res.data.id;

      if (status === "PUBLISHED" && selectedPlatforms.includes("facebook")) {
        try {
          await axios.post(getApiUrl(CONFIG.API.PUBLISH_POST(postId)), {}, { headers: { Authorization: `Bearer ${token}` } });
          toast.success("Published to Facebook successfully!");
        } catch (err: any) {
          toast.error(err.response?.data?.message || "Failed to publish to Facebook");
          setTimeout(() => router.push(CONFIG.FRONTEND.POSTS), 1500);
          setLoading(false); return;
        }
      } else {
        toast.success(status === "DRAFT" ? "Saved as draft!" : "Scheduled!");
      }
      setTimeout(() => router.push(CONFIG.FRONTEND.POSTS), 800);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to create post");
    } finally { setLoading(false); }
  };

  // ─── JSX ────────────────────────────────────────────────────────────────────
  return (
    <div>
      <Toaster position="top-right" />

      {/* Header */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:24 }}>
        <div>
          <h1 style={{ fontSize:22, fontWeight:700, color:"var(--text-primary)", margin:0 }}>Create New Post</h1>
          <p style={{ fontSize:13, color:"var(--text-secondary)", marginTop:4 }}>Compose and publish across platforms.</p>
        </div>
        <div style={{ display:"flex", gap:10 }}>
          <button onClick={() => handleSubmit("DRAFT")} disabled={loading} style={{
            height:38, padding:"0 16px", borderRadius:8, background:"var(--bg-card)",
            color:"var(--text-primary)", fontSize:13, fontWeight:600,
            border:"1px solid var(--border-color)", cursor:"pointer",
          }}>Save as Draft</button>

          {showSchedule ? (
            <button onClick={() => handleSubmit("SCHEDULED")} disabled={loading} style={{
              height:38, padding:"0 16px", borderRadius:8, background:"#2563eb",
              color:"#fff", fontSize:13, fontWeight:600, border:"none", cursor:"pointer",
              display:"flex", alignItems:"center", gap:6,
            }}>
              <Clock style={{ width:14, height:14 }} /> Schedule
            </button>
          ) : (
            <button onClick={() => handleSubmit("PUBLISHED")} disabled={loading} style={{
              height:38, padding:"0 16px", borderRadius:8, background:"#16a34a",
              color:"#fff", fontSize:13, fontWeight:600, border:"none", cursor:"pointer",
              display:"flex", alignItems:"center", gap:6,
            }}>
              {loading
                ? <Loader2 style={{ width:14, height:14, animation:"spin 1s linear infinite" }} />
                : <Send style={{ width:14, height:14 }} />
              }
              Publish Now
            </button>
          )}
        </div>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 380px", gap:20 }}>
        {/* ── Left Column ── */}
        <div style={{ display:"flex", flexDirection:"column", gap:20 }}>

          {/* Content Card */}
          <div style={{ ...cardStyle, padding:24 }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
              <h3 style={{ fontSize:15, fontWeight:600, color:"var(--text-primary)", margin:0 }}>Content</h3>
              <button onClick={() => setShowAIModal(true)} disabled={generating} style={{
                height:32, padding:"0 14px", borderRadius:8,
                background:"linear-gradient(135deg, #f97316, #ea580c)",
                color:"#fff", fontSize:12, fontWeight:600, border:"none",
                cursor:"pointer", display:"flex", alignItems:"center", gap:6,
                boxShadow:"0 2px 4px rgba(249,115,22,0.2)",
              }}>
                {generating
                  ? <Loader2 style={{ width:14, height:14, animation:"spin 1s linear infinite" }} />
                  : <Sparkles style={{ width:14, height:14 }} />
                }
                AI Content Assistant (Groq)
              </button>
            </div>

            <textarea
              placeholder={`Write your ${selectedPlatforms[0]} caption here...`}
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              style={{
                width:"100%", minHeight:180, borderRadius:10,
                border:`1px solid ${isOverLimit ? "#ef4444" : "var(--border-color)"}`,
                padding:14, fontSize:14, outline:"none",
                background:"var(--bg-input)", color:"var(--text-primary)",
                resize:"vertical", lineHeight:1.6, fontFamily:"inherit",
              }}
            />

            {/* Char count + reach */}
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginTop:12 }}>
              <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                <span style={{ fontSize:12, color: isOverLimit ? "#ef4444" : "var(--text-muted)", fontWeight: isOverLimit ? 600 : 400 }}>
                  {caption.length} / {currentLimit} characters
                </span>
                <div style={{ width:1, height:12, background:"var(--border-color)" }} />
                <div style={{ display:"flex", alignItems:"center", gap:4 }}>
                  <div style={{ width:6, height:6, borderRadius:3, background: reachScore>70?"#22c55e":reachScore>40?"#f59e0b":"#ef4444" }} />
                  <span style={{ fontSize:11, fontWeight:600, color:"var(--text-secondary)" }}>Reach Score: {reachScore}%</span>
                </div>
              </div>

              <div style={{ display:"flex", gap:8 }}>
                <input ref={fileInputRef} type="file" accept="image/*,video/*" onChange={handleFileUpload} style={{ display:"none" }} />
                <button onClick={() => fileInputRef.current?.click()} disabled={uploading} style={{
                  height:32, padding:"0 12px", borderRadius:8, background:"var(--bg-hover)",
                  color:"var(--text-secondary)", fontSize:12, fontWeight:500, border:"none",
                  cursor:"pointer", display:"flex", alignItems:"center", gap:6,
                }}>
                  {uploading
                    ? <Loader2 style={{ width:14, height:14, animation:"spin 1s linear infinite" }} />
                    : <ImageIcon style={{ width:14, height:14 }} />
                  }
                  {uploading ? "Uploading..." : "Upload Image/Video"}
                </button>

                <button onClick={handleImageGenerate} disabled={generatingImage} style={{
                  height:32, padding:"0 12px", borderRadius:8, background:"var(--bg-hover)",
                  color:"var(--text-secondary)", fontSize:12, fontWeight:500, border:"none",
                  cursor:"pointer", display:"flex", alignItems:"center", gap:6,
                }}>
                  {generatingImage
                    ? <Loader2 style={{ width:14, height:14, animation:"spin 1s linear infinite" }} />
                    : <Sparkles style={{ width:14, height:14 }} />
                  }
                  {generatingImage ? "Generating..." : "AI Generate Image"}
                </button>
              </div>
              {imageUrl && (
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8 }}>
                  <input
                    type="checkbox"
                    id="useImageRef"
                    checked={useImageRef}
                    onChange={(e) => setUseImageRef(e.target.checked)}
                    style={{ width: 14, height: 14, cursor: "pointer" }}
                  />
                  <label htmlFor="useImageRef" style={{ fontSize: 12, color: "var(--text-secondary)", cursor: "pointer" }}>
                    Use my current photo as reference for AI generation
                  </label>
                </div>
              )}
            </div>

            {/* Image preview */}
            {imageUrl && (
              <div style={{ marginTop:16, display:"flex", flexDirection:"column", gap:10 }}>
                <div style={{ position:"relative", width:"fit-content" }}>
                  <img src={imageUrl} alt="Preview" style={{
                    width:240, height:240, borderRadius:12, objectFit:"cover",
                    border:"1px solid var(--border-color)",
                  }} />
                  <button onClick={() => setImageUrl("")} style={{
                    position:"absolute", top:-8, right:-8, width:24, height:24,
                    borderRadius:12, background:"#ef4444", color:"#fff", border:"none",
                    display:"flex", alignItems:"center", justifyContent:"center",
                    cursor:"pointer", boxShadow:"0 2px 4px rgba(0,0,0,0.2)", zIndex:10,
                  }}>
                    <X size={14} />
                  </button>
                </div>
                <div style={{ display:"flex", gap:8 }}>
                  <button onClick={() => setShowImageEditor(true)} style={{
                    width:"fit-content", height:32, padding:"0 12px", borderRadius:8,
                    background:"var(--bg-input)", color:"var(--text-primary)", fontSize:12,
                    fontWeight:600, border:"1px solid var(--border-color)", cursor:"pointer",
                    display:"flex", alignItems:"center", gap:6,
                  }}>
                    <Edit2 size={14} /> Edit Image (Filters, Crop, Adjust)
                  </button>
                  <button onClick={() => setShowPosterMaker(true)} style={{
                    width:"fit-content", height:32, padding:"0 12px", borderRadius:8,
                    background:"linear-gradient(135deg, #f97316, #ea580c)", color:"#fff", fontSize:12,
                    fontWeight:600, border:"none", cursor:"pointer",
                    display:"flex", alignItems:"center", gap:6,
                    boxShadow:"0 2px 4px rgba(249,115,22,0.2)",
                  }}>
                    <Sparkles size={14} /> Make Poster
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Platforms Card */}
          <div style={{ ...cardStyle, padding:24 }}>
            <h3 style={{ fontSize:15, fontWeight:600, color:"var(--text-primary)", margin:"0 0 16px" }}>Platforms</h3>
            <div style={{ display:"flex", gap:12 }}>
              {platforms.map((p) => {
                const selected = selectedPlatforms.includes(p.id);
                return (
                  <button key={p.id} onClick={() => togglePlatform(p.id)} style={{
                    flex:1, padding:"16px 14px", borderRadius:12, cursor:"pointer",
                    display:"flex", flexDirection:"column", alignItems:"center", gap:10,
                    transition:"all 0.15s",
                    background: selected ? p.bg : "var(--bg-input)",
                    border: selected ? `2px solid ${p.color}` : "1px solid var(--border-color)",
                  }}>
                    <p.icon style={{ width:24, height:24, color: selected ? p.color : "#9ca3af" }} />
                    <span style={{ fontSize:12, fontWeight:600, color: selected ? p.color : "#6b7280" }}>{p.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Schedule Card */}
          <div style={{ ...cardStyle, padding:24 }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom: showSchedule ? 16 : 0 }}>
              <h3 style={{ fontSize:15, fontWeight:600, color:"var(--text-primary)", margin:0 }}>Schedule Post</h3>
              <button onClick={() => setShowSchedule(!showSchedule)} style={{
                width:44, height:24, borderRadius:12, border:"none", cursor:"pointer",
                background: showSchedule ? "#16a34a" : "#d1d5db",
                position:"relative", transition:"background 0.2s",
              }}>
                <span style={{
                  position:"absolute", top:2, width:20, height:20, borderRadius:"50%",
                  background:"var(--bg-card)", transition:"left 0.2s",
                  boxShadow:"0 1px 3px rgba(0,0,0,0.15)",
                  left: showSchedule ? 22 : 2,
                }} />
              </button>
            </div>
            {showSchedule && (
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                <div>
                  <label style={{ fontSize:12, fontWeight:600, color:"var(--text-primary)", marginBottom:6, display:"block" }}>Date</label>
                  <input type="date" value={scheduleDate} onChange={(e) => setScheduleDate(e.target.value)} style={inputStyle} />
                </div>
                <div>
                  <label style={{ fontSize:12, fontWeight:600, color:"var(--text-primary)", marginBottom:6, display:"block" }}>Time</label>
                  <input type="time" value={scheduleTime} onChange={(e) => setScheduleTime(e.target.value)} style={inputStyle} />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Right: Preview ── */}
        <div style={{ position:"sticky", top:20 }}>
          <div style={{ ...cardStyle, padding:0, overflow:"hidden" }}>
            <div style={{ padding:"16px 20px", borderBottom:"1px solid var(--border-color)", display:"flex", alignItems:"center", gap:8 }}>
              <Eye size={16} color="var(--text-secondary)" />
              <h3 style={{ fontSize:14, fontWeight:600, color:"var(--text-primary)", margin:0 }}>
                {selectedPlatforms[0]?.charAt(0).toUpperCase() + selectedPlatforms[0]?.slice(1)} Preview
              </h3>
            </div>

            <div style={{ padding:24, background:"var(--bg-body)", display:"flex", justifyContent:"center" }}>
              {/* Instagram */}
              {selectedPlatforms.includes("instagram") && (
                <div style={{ width:"100%", maxWidth:320, background:"var(--bg-card)", borderRadius:12, border:"1px solid var(--border-color)", overflow:"hidden" }}>
                  <div style={{ padding:12, display:"flex", alignItems:"center", gap:10 }}>
                    <div style={{ width:32, height:32, borderRadius:16, background:"linear-gradient(45deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888)", padding:2 }}>
                      <div style={{ width:"100%", height:"100%", borderRadius:14, background:"#000", border:"2px solid #fff" }} />
                    </div>
                    <span style={{ fontSize:13, fontWeight:600 }}>your_account</span>
                  </div>
                  <div style={{ width:"100%", aspectRatio:"1/1", background:"var(--bg-input)", display:"flex", alignItems:"center", justifyContent:"center" }}>
                    {imageUrl
                      ? <img src={imageUrl} alt="IG Preview" style={{ width:"100%", height:"100%", objectFit:"cover" }} />
                      : <ImageIcon size={40} color="var(--text-muted)" />
                    }
                  </div>
                  <div style={{ padding:12 }}>
                    <div style={{ display:"flex", gap:12, marginBottom:8 }}>
                      <div style={{ width:20, height:20, border:"2px solid var(--text-primary)", borderRadius:4 }} />
                      <div style={{ width:20, height:20, border:"2px solid var(--text-primary)", borderRadius:10 }} />
                    </div>
                    <p style={{ fontSize:13, margin:0, lineHeight:1.4 }}>
                      <span style={{ fontWeight:600, marginRight:6 }}>your_account</span>
                      {caption || "Caption will appear here..."}
                    </p>
                  </div>
                </div>
              )}

              {/* Facebook */}
              {selectedPlatforms.includes("facebook") && (
                <div style={{ width:"100%", maxWidth:320, background:"var(--bg-card)", borderRadius:8, border:"1px solid var(--border-color)", padding:12 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:12 }}>
                    <div style={{ width:40, height:40, borderRadius:20, background:"#1877F2", display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontWeight:700 }}>Y</div>
                    <div>
                      <div style={{ fontSize:14, fontWeight:600 }}>Your Account</div>
                      <div style={{ fontSize:12, color:"var(--text-muted)" }}>Just now • 🌎</div>
                    </div>
                  </div>
                  <p style={{ fontSize:14, margin:"0 0 12px", lineHeight:1.4 }}>{caption || "What's on your mind?"}</p>
                  {imageUrl && (
                    <div style={{ margin:"0 -12px -12px", borderTop:"1px solid var(--border-color)" }}>
                      <img src={imageUrl} alt="FB Preview" style={{ width:"100%", maxHeight:300, objectFit:"cover" }} />
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      {/* ── Custom Image Editor (no filerobot, no DOM prop warnings) ── */}
      {showImageEditor && imageUrl && isMounted && (
        <ImageEditorModal
          imageUrl={imageUrl}
          onSave={onCompleteImageEdit}
          onClose={() => setShowImageEditor(false)}
        />
      )}

      {/* ── Poster Maker ── */}
      {showPosterMaker && imageUrl && isMounted && (
        <PosterMakerModal
          imageUrl={imageUrl}
          initialCaption={caption}
          onSave={onCompletePoster}
          onClose={() => setShowPosterMaker(false)}
        />
      )}

      {/* ── AI Modal ── */}
      {showAIModal && (
        <div style={{
          position:"fixed", top:0, left:0, right:0, bottom:0,
          background:"rgba(0,0,0,0.6)", display:"flex", alignItems:"center",
          justifyContent:"center", zIndex:1000, backdropFilter:"blur(4px)",
        }}>
          <div style={{
            background:"var(--bg-card)", width:"90%", maxWidth:500, borderRadius:20,
            border:"1px solid var(--border-color)", padding:24, position:"relative",
            boxShadow:"0 20px 25px -5px rgba(0,0,0,0.3)",
          }}>
            <button onClick={() => setShowAIModal(false)} style={{
              position:"absolute", top:16, right:16, border:"none",
              background:"none", color:"var(--text-muted)", cursor:"pointer",
            }}>
              <X style={{ width:20, height:20 }} />
            </button>

            <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:20 }}>
              <div style={{ width:40, height:40, borderRadius:10, background:"rgba(249,115,22,0.1)", display:"flex", alignItems:"center", justifyContent:"center" }}>
                <Sparkles style={{ color:"#f97316" }} />
              </div>
              <div>
                <h3 style={{ margin:0, fontSize:18, color:"var(--text-primary)" }}>Groq AI Assistant</h3>
                <p style={{ margin:0, fontSize:12, color:"var(--text-muted)" }}>Advanced content generation</p>
              </div>
            </div>

            <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
              <div>
                <label style={{ display:"block", fontSize:13, fontWeight:600, marginBottom:8, color:"var(--text-primary)" }}>
                  What is this post about?
                </label>
                <textarea
                  placeholder="e.g. 'New collection launch', 'Tips for healthy skin'"
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  style={{
                    width:"100%", height:80, padding:12, borderRadius:10,
                    border:"1px solid var(--border-color)", background:"var(--bg-input)",
                    color:"var(--text-primary)", fontSize:14, outline:"none", resize:"none",
                  }}
                />
              </div>

              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                <div>
                  <label style={{ display:"block", fontSize:13, fontWeight:600, marginBottom:8, color:"var(--text-primary)" }}>Tone</label>
                  <select value={aiTone} onChange={(e) => setAiTone(e.target.value)} style={{ ...inputStyle, background:"var(--bg-input)" }}>
                    <option value="engaging">Engaging</option>
                    <option value="professional">Professional</option>
                    <option value="funny">Funny (Meme Style)</option>
                    <option value="motivational">Motivational</option>
                    <option value="excited">Excited</option>
                    <option value="casual">Casual</option>
                  </select>
                </div>
                <div>
                  <label style={{ display:"block", fontSize:13, fontWeight:600, marginBottom:8, color:"var(--text-primary)" }}>Language</label>
                  <select value={aiLanguage} onChange={(e) => setAiLanguage(e.target.value)} style={{ ...inputStyle, background:"var(--bg-input)" }}>
                    <option value="english">English</option>
                    <option value="hinglish">Hinglish</option>
                    <option value="hindi">Hindi</option>
                    <option value="spanish">Spanish</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display:"block", fontSize:13, fontWeight:600, marginBottom:8, color:"var(--text-primary)" }}>Target Audience</label>
                <select value={aiAudience} onChange={(e) => setAiAudience(e.target.value)} style={{ ...inputStyle, background:"var(--bg-input)" }}>
                  <option value="general">General Public</option>
                  <option value="genz">Gen Z (Trendy/Slang)</option>
                  <option value="business">Business Owners</option>
                  <option value="fitness">Fitness Enthusiasts</option>
                  <option value="tech">Tech Savvy</option>
                </select>
              </div>

              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginTop:8 }}>
                <button onClick={() => handleAIGenerate("caption")} disabled={generating} style={{
                  height:44, borderRadius:10, background:"#f97316", color:"#fff",
                  border:"none", fontWeight:600, cursor:"pointer",
                  display:"flex", alignItems:"center", justifyContent:"center", gap:8,
                }}>
                  {generating
                    ? <Loader2 style={{ width:18, height:18, animation:"spin 1s linear infinite" }} />
                    : <Send style={{ width:18, height:18 }} />
                  }
                  Generate Post
                </button>
                <button onClick={() => handleAIGenerate("hashtag")} disabled={generating} style={{
                  height:44, borderRadius:10, background:"rgba(249,115,22,0.1)",
                  color:"#f97316", border:"1px solid rgba(249,115,22,0.2)",
                  fontWeight:600, cursor:"pointer",
                }}>
                  Generate Hashtags
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
