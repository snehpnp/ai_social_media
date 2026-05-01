"use client";

import React, { useState, useRef, useEffect } from "react";
import { Upload, RefreshCw, Type, Layout, X, Check } from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────
interface Template {
  id: string;
  name: string;
  emoji: string;
  category: string;
  bg: string;
  overlay: string;
  accent: string;
  textColor: string;
  subTextColor: string;
  font: string;
  layout: "center" | "bottom" | "top" | "split";
  borderStyle?: string;
  showBadge?: boolean;
  badgeText?: string;
  badgeBg?: string;
}

interface PosterConfig {
  mainText: string;
  subText: string;
  bottomText: string;
  logoText: string;
  showDate: boolean;
  dateText: string;
  imageScale: number;
  imageOffsetY: number;
}

type TabType = "templates" | "text" | "image";

// ── Templates ─────────────────────────────────────────────────────────────────
const TEMPLATES: Template[] = [
  {
    id: "diwali",
    name: "Diwali",
    emoji: "🪔",
    category: "Festival",
    bg: "linear-gradient(135deg, #1a0a00 0%, #3d1a00 50%, #1a0a00 100%)",
    overlay: "rgba(180,80,0,0.35)",
    accent: "#FFB800",
    textColor: "#FFD700",
    subTextColor: "#FFA500",
    font: "'Georgia', serif",
    layout: "bottom",
    borderStyle: "8px solid #FFB800",
    showBadge: true,
    badgeText: "Happy Diwali",
    badgeBg: "#FFB800",
  },
  {
    id: "eid",
    name: "Eid",
    emoji: "☪️",
    category: "Festival",
    bg: "linear-gradient(135deg, #0a1a0a 0%, #003d1a 50%, #0a1a0a 100%)",
    overlay: "rgba(0,120,60,0.4)",
    accent: "#00C96E",
    textColor: "#AAFFCC",
    subTextColor: "#66FFAA",
    font: "'Georgia', serif",
    layout: "bottom",
    borderStyle: "8px solid #00C96E",
    showBadge: true,
    badgeText: "Eid Mubarak",
    badgeBg: "#00C96E",
  },
  {
    id: "holi",
    name: "Holi",
    emoji: "🎨",
    category: "Festival",
    bg: "linear-gradient(135deg, #1a0033 0%, #330066 50%, #1a0033 100%)",
    overlay: "rgba(180,0,180,0.3)",
    accent: "#FF00FF",
    textColor: "#FFAAFF",
    subTextColor: "#FF66FF",
    font: "'Georgia', serif",
    layout: "bottom",
    borderStyle: "8px solid #FF00FF",
    showBadge: true,
    badgeText: "Happy Holi",
    badgeBg: "#E040FB",
  },
  {
    id: "navratri",
    name: "Navratri",
    emoji: "🎵",
    category: "Festival",
    bg: "linear-gradient(135deg, #1a0000 0%, #4d0000 50%, #1a0000 100%)",
    overlay: "rgba(200,0,0,0.35)",
    accent: "#FF4444",
    textColor: "#FFB3B3",
    subTextColor: "#FF8888",
    font: "'Georgia', serif",
    layout: "bottom",
    borderStyle: "8px solid #FF4444",
    showBadge: true,
    badgeText: "Navratri",
    badgeBg: "#FF4444",
  },
  {
    id: "birthday",
    name: "Birthday",
    emoji: "🎂",
    category: "Celebration",
    bg: "linear-gradient(135deg, #0d0d2b 0%, #1a1a4d 50%, #0d0d2b 100%)",
    overlay: "rgba(100,0,200,0.3)",
    accent: "#A855F7",
    textColor: "#E9D5FF",
    subTextColor: "#C084FC",
    font: "'Arial', sans-serif",
    layout: "bottom",
    borderStyle: "8px solid #A855F7",
    showBadge: true,
    badgeText: "Happy Birthday",
    badgeBg: "#A855F7",
  },
  {
    id: "wedding",
    name: "Wedding",
    emoji: "💍",
    category: "Celebration",
    bg: "linear-gradient(135deg, #1a1200 0%, #4d3800 50%, #1a1200 100%)",
    overlay: "rgba(180,140,0,0.3)",
    accent: "#D4AF37",
    textColor: "#FFF0A0",
    subTextColor: "#FFD700",
    font: "'Georgia', serif",
    layout: "bottom",
    borderStyle: "8px solid #D4AF37",
    showBadge: true,
    badgeText: "Wedding Invitation",
    badgeBg: "#D4AF37",
  },
  {
    id: "sale",
    name: "Sale Offer",
    emoji: "🛍️",
    category: "Business",
    bg: "linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 50%, #0a0a0a 100%)",
    overlay: "rgba(255,50,50,0.35)",
    accent: "#FF3232",
    textColor: "#FFFFFF",
    subTextColor: "#FFAAAA",
    font: "'Arial Black', sans-serif",
    layout: "center",
    borderStyle: "8px solid #FF3232",
    showBadge: true,
    badgeText: "MEGA SALE",
    badgeBg: "#FF3232",
  },
  {
    id: "business",
    name: "Business",
    emoji: "💼",
    category: "Business",
    bg: "linear-gradient(135deg, #001a33 0%, #00264d 50%, #001a33 100%)",
    overlay: "rgba(0,80,160,0.4)",
    accent: "#0080FF",
    textColor: "#E0F0FF",
    subTextColor: "#80C0FF",
    font: "'Arial', sans-serif",
    layout: "split",
    borderStyle: "8px solid #0080FF",
    showBadge: false,
  },
  {
    id: "independence",
    name: "Independence Day",
    emoji: "🇮🇳",
    category: "National",
    bg: "linear-gradient(135deg, #0a1f0a 0%, #002200 50%, #0a1f0a 100%)",
    overlay: "rgba(0,100,0,0.3)",
    accent: "#138808",
    textColor: "#FFFFFF",
    subTextColor: "#AAFFAA",
    font: "'Georgia', serif",
    layout: "center",
    borderStyle: "6px solid #FF9933",
    showBadge: true,
    badgeText: "Jai Hind",
    badgeBg: "#FF9933",
  },
  {
    id: "christmas",
    name: "Christmas",
    emoji: "🎄",
    category: "Festival",
    bg: "linear-gradient(135deg, #0a1a00 0%, #003300 50%, #0a1a00 100%)",
    overlay: "rgba(0,120,0,0.35)",
    accent: "#FF0000",
    textColor: "#FFFFFF",
    subTextColor: "#FFCCCC",
    font: "'Georgia', serif",
    layout: "bottom",
    borderStyle: "8px solid #FF0000",
    showBadge: true,
    badgeText: "Merry Christmas",
    badgeBg: "#FF0000",
  },
  {
    id: "newyear",
    name: "New Year",
    emoji: "🎆",
    category: "Celebration",
    bg: "linear-gradient(135deg, #000010 0%, #000033 50%, #000010 100%)",
    overlay: "rgba(0,0,100,0.4)",
    accent: "#FFD700",
    textColor: "#FFD700",
    subTextColor: "#FFA500",
    font: "'Georgia', serif",
    layout: "center",
    borderStyle: "8px solid #FFD700",
    showBadge: true,
    badgeText: "Happy New Year",
    badgeBg: "#FFD700",
  },
  {
    id: "motivational",
    name: "Motivational",
    emoji: "⚡",
    category: "Quote",
    bg: "linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 50%, #0a0a0a 100%)",
    overlay: "rgba(255,165,0,0.3)",
    accent: "#FF8C00",
    textColor: "#FFFFFF",
    subTextColor: "#FFB84D",
    font: "'Arial Black', sans-serif",
    layout: "center",
    borderStyle: "none",
    showBadge: false,
  },
];

const CATEGORIES = ["All", "Festival", "Celebration", "Business", "National", "Quote"];

interface PosterMakerModalProps {
  imageUrl: string;
  initialCaption?: string;
  onSave: (posterBase64: string) => void;
  onClose: () => void;
}

// ── Draw poster on canvas ──────────────────────────────────────────────────────
function drawPoster(
  canvas: HTMLCanvasElement,
  template: Template,
  config: PosterConfig,
  userImage: HTMLImageElement | null
) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const W = 1080, H = 1080;
  canvas.width = W;
  canvas.height = H;

  // ── Background ──
  const bgGrad = ctx.createLinearGradient(0, 0, W, H);
  const bgColors = template.bg.includes("135deg, ")
    ? template.bg.match(/#[0-9a-fA-F]{3,6}|rgba?\([^)]+\)/g) || ["#111", "#333"]
    : ["#111", "#333"];
  bgGrad.addColorStop(0, bgColors[0] || "#111");
  bgGrad.addColorStop(0.5, bgColors[1] || "#222");
  bgGrad.addColorStop(1, bgColors[2] || bgColors[0] || "#111");
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, W, H);

  // ── Background Overlay (before image so image stays clear) ──
  ctx.fillStyle = template.overlay;
  ctx.fillRect(0, 0, W, H);

  // ── User Image ──
  if (userImage) {
    ctx.save();
    const scale = config.imageScale / 100;
    const imgW = W * scale;
    const imgH = H * scale;
    const imgX = (W - imgW) / 2;
    const imgY = (H - imgH) / 2 + config.imageOffsetY;

    if (template.layout === "bottom") {
      // Clip circle for portrait
      ctx.beginPath();
      const radius = Math.min(imgW, imgH) * 0.48;
      ctx.arc(W / 2, imgY + imgH * 0.4, radius, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(userImage, W / 2 - radius, imgY, radius * 2, radius * 2);
    } else {
      ctx.drawImage(userImage, imgX, imgY, imgW, imgH);
    }
    ctx.restore();
  }

  // ── Decorative border frame ──
  if (template.borderStyle && template.borderStyle !== "none") {
    const bw = parseInt(template.borderStyle) || 8;
    ctx.strokeStyle = template.accent;
    ctx.lineWidth = bw;
    ctx.strokeRect(bw / 2, bw / 2, W - bw, H - bw);

    // Inner border
    ctx.lineWidth = 2;
    ctx.strokeStyle = template.accent + "88";
    ctx.strokeRect(bw + 16, bw + 16, W - (bw + 16) * 2, H - (bw + 16) * 2);
  }

  // ── Decorative corner accents ──
  const accentLen = 60;
  const margin = 40;
  ctx.strokeStyle = template.accent;
  ctx.lineWidth = 4;
  const corners = [
    [margin, margin, 1, 1],
    [W - margin, margin, -1, 1],
    [margin, H - margin, 1, -1],
    [W - margin, H - margin, -1, -1],
  ];
  corners.forEach(([cx, cy, dx, dy]) => {
    ctx.beginPath();
    ctx.moveTo(cx as number, (cy as number) + (dy as number) * accentLen);
    ctx.lineTo(cx as number, cy as number);
    ctx.lineTo((cx as number) + (dx as number) * accentLen, cy as number);
    ctx.stroke();
  });

  // ── Badge ──
  if (template.showBadge && template.badgeText) {
    const badgeY = 60;
    ctx.fillStyle = template.badgeBg || template.accent;
    const bw2 = 280, bh = 48;
    const bx = (W - bw2) / 2;
    roundRect(ctx, bx, badgeY, bw2, bh, 24);
    ctx.fill();

    ctx.fillStyle = "#FFFFFF";
    ctx.font = `bold 22px Arial`;
    ctx.textAlign = "center";
    ctx.fillText(template.badgeText, W / 2, badgeY + 31);
  }

  // ── Bottom gradient band ──
  if (template.layout === "bottom") {
    const grad = ctx.createLinearGradient(0, H * 0.55, 0, H);
    grad.addColorStop(0, "rgba(0,0,0,0)");
    grad.addColorStop(1, "rgba(0,0,0,0.92)");
    ctx.fillStyle = grad;
    ctx.fillRect(0, H * 0.55, W, H * 0.45);
  }

  // ── Main Text ──
  const textY = template.layout === "center" ? H * 0.52 : H * 0.72;

  if (config.mainText) {
    ctx.save();
    ctx.shadowColor = "rgba(0,0,0,0.8)";
    ctx.shadowBlur = 20;
    ctx.fillStyle = template.textColor;
    ctx.textAlign = "center";

    const fontSize = config.mainText.length > 20 ? 64 : config.mainText.length > 12 ? 80 : 96;
    ctx.font = `bold ${fontSize}px ${template.font}`;
    wrapText(ctx, config.mainText, W / 2, textY, W - 120, fontSize * 1.2);
    ctx.restore();
  }

  // ── Sub Text ──
  if (config.subText) {
    ctx.save();
    ctx.shadowColor = "rgba(0,0,0,0.6)";
    ctx.shadowBlur = 12;
    ctx.fillStyle = template.subTextColor;
    ctx.textAlign = "center";
    ctx.font = `32px ${template.font}`;
    wrapText(ctx, config.subText, W / 2, textY + 110, W - 160, 40);
    ctx.restore();
  }

  // ── Bottom Text / Tagline ──
  if (config.bottomText) {
    ctx.save();
    ctx.fillStyle = template.accent;
    ctx.textAlign = "center";
    ctx.font = `bold 28px Arial`;
    ctx.fillText(config.bottomText, W / 2, H - 100);
    ctx.restore();
  }

  // ── Logo / Brand Name ──
  if (config.logoText) {
    ctx.save();
    ctx.fillStyle = "#FFFFFF99";
    ctx.textAlign = "center";
    ctx.font = `20px Arial`;
    ctx.fillText(config.logoText, W / 2, H - 55);
    ctx.restore();
  }

  // ── Date ──
  if (config.showDate && config.dateText) {
    ctx.save();
    ctx.fillStyle = template.accent + "CC";
    ctx.textAlign = "center";
    ctx.font = `bold 24px Arial`;
    ctx.fillText(config.dateText, W / 2, H - 80);
    ctx.restore();
  }

  // ── Decorative dots ──
  for (let i = 0; i < 12; i++) {
    const angle = (i / 12) * Math.PI * 2;
    const r = 480;
    const dx = W / 2 + Math.cos(angle) * r;
    const dy = H / 2 + Math.sin(angle) * r;
    ctx.beginPath();
    ctx.arc(dx, dy, 4, 0, Math.PI * 2);
    ctx.fillStyle = template.accent + "44";
    ctx.fill();
  }
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number) {
  const words = text.split(" ");
  let line = "";
  let currentY = y;
  for (const word of words) {
    const testLine = line + word + " ";
    if (ctx.measureText(testLine).width > maxWidth && line !== "") {
      ctx.fillText(line.trim(), x, currentY);
      line = word + " ";
      currentY += lineHeight;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line.trim(), x, currentY);
}

// ── Main Component ─────────────────────────────────────────────────────────────
export default function PosterMakerModal({ imageUrl, initialCaption, onSave, onClose }: PosterMakerModalProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<Template>(TEMPLATES[0]);
  const [category, setCategory] = useState("All");
  const [userImage, setUserImage] = useState<HTMLImageElement | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>("templates");
  const [config, setConfig] = useState<PosterConfig>({
    mainText: initialCaption?.slice(0, 50) || "Happy Diwali",
    subText: "Wishing you joy, light & prosperity",
    bottomText: "",
    logoText: "Your Brand Name",
    showDate: false,
    dateText: new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }),
    imageScale: 85,
    imageOffsetY: -60,
  });

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const previewRef = useRef<HTMLCanvasElement>(null);

  // Load user image
  useEffect(() => {
    if (imageUrl) {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => setUserImage(img);
      img.src = imageUrl;
    }
  }, [imageUrl]);

  // ── Redraw on any change ──
  useEffect(() => {
    const canvas = previewRef.current;
    if (!canvas) return;
    drawPoster(canvas, selectedTemplate, config, userImage);
  }, [selectedTemplate, config, userImage]);

  // ── Template switch: auto-fill badge text as main text ──
  const applyTemplate = (t: Template) => {
    setSelectedTemplate(t);
    if (!initialCaption) {
      setConfig((prev) => ({
        ...prev,
        mainText: t.badgeText || prev.mainText,
      }));
    }
  };

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    drawPoster(canvas, selectedTemplate, config, userImage);
    onSave(canvas.toDataURL("image/png"));
  };

  const filtered = category === "All" ? TEMPLATES : TEMPLATES.filter((t) => t.category === category);

  return (
    <div style={{
      position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
      background: "rgba(0,0,0,0.85)", display: "flex", alignItems: "center",
      justifyContent: "center", zIndex: 9999, backdropFilter: "blur(6px)",
    }}>
      <div style={{
        background: "var(--bg-card)", borderRadius: 16, width: "95vw", maxWidth: 1100,
        maxHeight: "92vh", display: "flex", flexDirection: "column",
        border: "1px solid var(--border-color)", overflow: "hidden",
      }}>
        {/* Header */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "14px 20px", borderBottom: "1px solid var(--border-color)",
        }}>
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>Poster Maker</h2>
            <p style={{ fontSize: 12, color: "var(--text-secondary)", margin: "4px 0 0" }}>Transform your photo into a beautiful poster</p>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={handleDownload} style={{
              height: 38, padding: "0 18px", borderRadius: 8, background: "#16a34a",
              color: "#fff", fontSize: 13, fontWeight: 700, border: "none", cursor: "pointer",
              display: "flex", alignItems: "center", gap: 8,
            }}>
              <Check size={16} /> Apply to Post
            </button>
            <button onClick={onClose} style={{
              height: 38, width: 38, borderRadius: 8, background: "var(--bg-input)",
              color: "var(--text-secondary)", border: "1px solid var(--border-color)", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <X size={18} />
            </button>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 400px", gap: 0, flex: 1, overflow: "hidden" }}>
          {/* ── Left: Controls ── */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16, padding: 20, overflow: "auto", borderRight: "1px solid var(--border-color)" }}>

            {/* Tabs */}
            <div style={{ display: "flex", gap: 4, background: "var(--bg-input)", borderRadius: 10, padding: 4 }}>
              {[
                { id: "templates" as TabType, label: "Templates", icon: <Layout size={14} /> },
                { id: "text" as TabType, label: "Text", icon: <Type size={14} /> },
                { id: "image" as TabType, label: "Photo", icon: <Upload size={14} /> },
              ].map((tab) => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
                  flex: 1, height: 36, borderRadius: 8, border: "none", cursor: "pointer", fontSize: 13,
                  fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                  background: activeTab === tab.id ? "var(--bg-card)" : "transparent",
                  color: activeTab === tab.id ? "var(--text-primary)" : "var(--text-secondary)",
                  boxShadow: activeTab === tab.id ? "0 1px 4px rgba(0,0,0,0.1)" : "none",
                  transition: "all 0.15s",
                }}>
                  {tab.icon} {tab.label}
                </button>
              ))}
            </div>

            {/* Templates Tab */}
            {activeTab === "templates" && (
              <div style={{ background: "var(--bg-input)", borderRadius: 12, padding: 16 }}>
                {/* Category filter */}
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
                  {CATEGORIES.map((cat) => (
                    <button key={cat} onClick={() => setCategory(cat)} style={{
                      height: 30, padding: "0 14px", borderRadius: 20, border: "none", cursor: "pointer",
                      fontSize: 12, fontWeight: 600,
                      background: category === cat ? "#f97316" : "var(--bg-card)",
                      color: category === cat ? "#fff" : "var(--text-secondary)",
                      transition: "all 0.15s",
                    }}>{cat}</button>
                  ))}
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
                  {filtered.map((t) => (
                    <button key={t.id} onClick={() => applyTemplate(t)} style={{
                      padding: "14px 8px", borderRadius: 10, cursor: "pointer", border: "2px solid",
                      borderColor: selectedTemplate.id === t.id ? t.accent : "var(--border-color)",
                      background: selectedTemplate.id === t.id ? `${t.accent}18` : "var(--bg-card)",
                      transition: "all 0.15s", display: "flex", flexDirection: "column",
                      alignItems: "center", gap: 6,
                    }}>
                      <span style={{ fontSize: 24 }}>{t.emoji}</span>
                      <span style={{ fontSize: 11, fontWeight: 600, color: "var(--text-primary)", textAlign: "center" }}>{t.name}</span>
                      <span style={{ fontSize: 10, color: "var(--text-muted)" }}>{t.category}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Text Tab */}
            {activeTab === "text" && (
              <div style={{ background: "var(--bg-input)", borderRadius: 12, padding: 16, display: "flex", flexDirection: "column", gap: 14 }}>
                {[
                  { label: "Main Heading", key: "mainText" as const, placeholder: "Happy Diwali / Offer 50% OFF" },
                  { label: "Sub Text", key: "subText" as const, placeholder: "Wishing you joy and prosperity" },
                  { label: "Bottom Tag", key: "bottomText" as const, placeholder: "Call us: 9876543210" },
                  { label: "Brand Name", key: "logoText" as const, placeholder: "Your Brand / Company Name" },
                ].map(({ label, key, placeholder }) => (
                  <div key={key}>
                    <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6 }}>{label}</label>
                    <input
                      value={config[key]}
                      onChange={(e) => setConfig((p) => ({ ...p, [key]: e.target.value }))}
                      placeholder={placeholder}
                      style={{
                        width: "100%", height: 40, borderRadius: 8, border: "1px solid var(--border-color)",
                        padding: "0 12px", fontSize: 13, outline: "none",
                        background: "var(--bg-card)", color: "var(--text-primary)",
                      }}
                    />
                  </div>
                ))}

                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <input
                    type="checkbox"
                    id="showDate"
                    checked={config.showDate}
                    onChange={(e) => setConfig((p) => ({ ...p, showDate: e.target.checked }))}
                    style={{ width: 16, height: 16 }}
                  />
                  <label htmlFor="showDate" style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>Show Date</label>
                  {config.showDate && (
                    <input
                      value={config.dateText}
                      onChange={(e) => setConfig((p) => ({ ...p, dateText: e.target.value }))}
                      style={{
                        flex: 1, height: 36, borderRadius: 8, border: "1px solid var(--border-color)",
                        padding: "0 10px", fontSize: 12, outline: "none",
                        background: "var(--bg-card)", color: "var(--text-primary)",
                      }}
                    />
                  )}
                </div>
              </div>
            )}

            {/* Image Tab */}
            {activeTab === "image" && (
              <div style={{ background: "var(--bg-input)", borderRadius: 12, padding: 16, display: "flex", flexDirection: "column", gap: 16 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, padding: 12, background: "var(--bg-card)", borderRadius: 10 }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <div style={{ width: 50, height: 50, borderRadius: 8, overflow: "hidden", border: "1px solid var(--border-color)" }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={imageUrl} alt="Source" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  </div>
                  <div>
                    <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>Current Photo</p>
                    <p style={{ margin: "2px 0 0", fontSize: 11, color: "var(--text-secondary)" }}>Using uploaded/generated image</p>
                  </div>
                </div>

                {/* Image position controls */}
                <div>
                  <label style={{ display: "flex", justifyContent: "space-between", fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 8 }}>
                    <span>Image Size</span><span>{config.imageScale}%</span>
                  </label>
                  <input type="range" min={40} max={120} step={1} value={config.imageScale}
                    onChange={(e) => setConfig((p) => ({ ...p, imageScale: Number(e.target.value) }))}
                    style={{ width: "100%", accentColor: "#f97316" }}
                  />
                </div>
                <div>
                  <label style={{ display: "flex", justifyContent: "space-between", fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 8 }}>
                    <span>Vertical Position</span><span>{config.imageOffsetY > 0 ? "+" : ""}{config.imageOffsetY}px</span>
                  </label>
                  <input type="range" min={-200} max={200} step={5} value={config.imageOffsetY}
                    onChange={(e) => setConfig((p) => ({ ...p, imageOffsetY: Number(e.target.value) }))}
                    style={{ width: "100%", accentColor: "#f97316" }}
                  />
                </div>

                <button onClick={() => setConfig((p) => ({ ...p, imageScale: 85, imageOffsetY: -60 }))} style={{
                  height: 36, borderRadius: 8, background: "var(--bg-card)", color: "var(--text-secondary)",
                  border: "1px solid var(--border-color)", cursor: "pointer", fontSize: 12,
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                }}>
                  <RefreshCw size={13} /> Reset Position
                </button>
              </div>
            )}

            {/* Template info */}
            <div style={{
              marginTop: "auto", padding: "12px 16px", borderRadius: 10,
              background: `${selectedTemplate.accent}18`,
              border: `1px solid ${selectedTemplate.accent}44`,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 20 }}>{selectedTemplate.emoji}</span>
                <div>
                  <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "var(--text-primary)" }}>{selectedTemplate.name} Template</p>
                  <p style={{ margin: 0, fontSize: 11, color: "var(--text-secondary)" }}>{selectedTemplate.category} • {selectedTemplate.layout} layout</p>
                </div>
              </div>
            </div>
          </div>

          {/* ── Right: Live Preview ── */}
          <div style={{ display: "flex", flexDirection: "column", background: "#111", padding: 20 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: "#fff" }}>Live Preview</span>
              <span style={{ fontSize: 11, color: "#666" }}>1080 × 1080 px</span>
            </div>
            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", overflow: "auto" }}>
              <canvas
                ref={previewRef}
                width={1080}
                height={1080}
                style={{ maxWidth: "100%", maxHeight: "100%", borderRadius: 8, display: "block" }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Hidden full-res canvas for download */}
      <canvas ref={canvasRef} width={1080} height={1080} style={{ display: "none" }} />
    </div>
  );
}
