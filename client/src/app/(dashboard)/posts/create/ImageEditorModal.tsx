"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import ReactCrop, { Crop, PixelCrop, centerCrop, makeAspectCrop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import { X, Check, RotateCcw, Crop as CropIcon, Sliders, Type } from "lucide-react";

interface ImageEditorModalProps {
  imageUrl: string;
  onSave: (editedImageBase64: string) => void;
  onClose: () => void;
}

const FILTERS = [
  { name: "None",        style: "none" },
  { name: "Grayscale",   style: "grayscale(100%)" },
  { name: "Sepia",       style: "sepia(100%)" },
  { name: "Warm",        style: "sepia(40%) saturate(150%) hue-rotate(-10deg)" },
  { name: "Cool",        style: "hue-rotate(180deg) saturate(120%)" },
  { name: "Vivid",       style: "saturate(200%) contrast(110%)" },
  { name: "Fade",        style: "opacity(0.75) brightness(115%) saturate(80%)" },
  { name: "Dark",        style: "brightness(70%) contrast(120%)" },
];

function centerAspectCrop(width: number, height: number, aspect: number) {
  return centerCrop(makeAspectCrop({ unit: "%", width: 90 }, aspect, width, height), width, height);
}

export default function ImageEditorModal({ imageUrl, onSave, onClose }: ImageEditorModalProps) {
  const imgRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [activeTab, setActiveTab] = useState<"crop" | "filter" | "adjust">("filter");
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [selectedFilter, setSelectedFilter] = useState(FILTERS[0]);
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturation, setSaturation] = useState(100);
  const [isCropping, setIsCropping] = useState(false);

  const combinedFilter = `${selectedFilter.style !== "none" ? selectedFilter.style + " " : ""}brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`;

  const onImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget;
    setCrop(centerAspectCrop(width, height, 1));
  }, []);

  const handleSave = useCallback(() => {
    const image = imgRef.current;
    const canvas = canvasRef.current;
    if (!image || !canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    let sx = 0, sy = 0, sw = image.naturalWidth, sh = image.naturalHeight;

    if (isCropping && completedCrop) {
      sx = completedCrop.x * scaleX;
      sy = completedCrop.y * scaleY;
      sw = completedCrop.width * scaleX;
      sh = completedCrop.height * scaleY;
    }

    canvas.width = sw;
    canvas.height = sh;

    // Apply filter via CSS filter on canvas
    ctx.filter = combinedFilter;
    ctx.drawImage(image, sx, sy, sw, sh, 0, 0, sw, sh);

    onSave(canvas.toDataURL("image/jpeg", 0.95));
  }, [completedCrop, isCropping, combinedFilter, onSave]);

  const handleReset = () => {
    setSelectedFilter(FILTERS[0]);
    setBrightness(100);
    setContrast(100);
    setSaturation(100);
    setIsCropping(false);
    setCrop(undefined);
    setCompletedCrop(undefined);
  };

  const tabs = [
    { id: "filter", label: "Filters", icon: <Sliders size={14} /> },
    { id: "adjust", label: "Adjust",  icon: <Sliders size={14} /> },
    { id: "crop",   label: "Crop",    icon: <CropIcon size={14} /> },
  ] as const;

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 9999,
      background: "rgba(0,0,0,0.85)", backdropFilter: "blur(6px)",
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      <div style={{
        background: "#1a1a1a", borderRadius: 16, width: "90vw", maxWidth: 900,
        maxHeight: "90vh", display: "flex", flexDirection: "column",
        border: "1px solid #333", overflow: "hidden",
      }}>
        {/* Header */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "14px 20px", borderBottom: "1px solid #333",
        }}>
          <span style={{ color: "#fff", fontWeight: 700, fontSize: 16 }}>Edit Image</span>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={handleReset} style={{
              height: 34, padding: "0 14px", borderRadius: 8, background: "#2a2a2a",
              color: "#aaa", border: "1px solid #444", cursor: "pointer", fontSize: 13,
              display: "flex", alignItems: "center", gap: 6,
            }}>
              <RotateCcw size={13} /> Reset
            </button>
            <button onClick={handleSave} style={{
              height: 34, padding: "0 16px", borderRadius: 8, background: "#16a34a",
              color: "#fff", border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600,
              display: "flex", alignItems: "center", gap: 6,
            }}>
              <Check size={14} /> Save
            </button>
            <button onClick={onClose} style={{
              height: 34, width: 34, borderRadius: 8, background: "#2a2a2a",
              color: "#aaa", border: "1px solid #444", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <X size={16} />
            </button>
          </div>
        </div>

        <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
          {/* Canvas (hidden, used for export) */}
          <canvas ref={canvasRef} style={{ display: "none" }} />

          {/* Image Preview */}
          <div style={{
            flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
            background: "#111", padding: 20, overflow: "hidden",
          }}>
            {activeTab === "crop" ? (
              <ReactCrop
                crop={crop}
                onChange={(c) => setCrop(c)}
                onComplete={(c) => { setCompletedCrop(c); setIsCropping(true); }}
                style={{ maxHeight: "60vh" }}
              >
                <img
                  ref={imgRef}
                  src={imageUrl}
                  onLoad={onImageLoad}
                  style={{
                    maxWidth: "100%", maxHeight: "60vh", objectFit: "contain",
                    filter: combinedFilter,
                  }}
                  alt="Edit"
                />
              </ReactCrop>
            ) : (
              <img
                ref={imgRef}
                src={imageUrl}
                style={{
                  maxWidth: "100%", maxHeight: "60vh", objectFit: "contain",
                  filter: combinedFilter, borderRadius: 8,
                  transition: "filter 0.2s",
                }}
                alt="Edit"
              />
            )}
          </div>

          {/* Right Panel */}
          <div style={{
            width: 260, background: "#1e1e1e", borderLeft: "1px solid #333",
            display: "flex", flexDirection: "column", overflow: "hidden",
          }}>
            {/* Tabs */}
            <div style={{ display: "flex", borderBottom: "1px solid #333" }}>
              {tabs.map((tab) => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
                  flex: 1, height: 44, border: "none", cursor: "pointer", fontSize: 12,
                  fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center",
                  gap: 5, transition: "all 0.15s",
                  background: activeTab === tab.id ? "#2a2a2a" : "transparent",
                  color: activeTab === tab.id ? "#fff" : "#666",
                  borderBottom: activeTab === tab.id ? "2px solid #16a34a" : "2px solid transparent",
                }}>
                  {tab.icon} {tab.label}
                </button>
              ))}
            </div>

            <div style={{ flex: 1, overflowY: "auto", padding: 16 }}>
              {/* Filters Tab */}
              {activeTab === "filter" && (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  {FILTERS.map((f) => (
                    <button key={f.name} onClick={() => setSelectedFilter(f)} style={{
                      padding: "10px 8px", borderRadius: 8, cursor: "pointer", fontSize: 11,
                      fontWeight: 600, border: "2px solid",
                      borderColor: selectedFilter.name === f.name ? "#16a34a" : "#333",
                      background: selectedFilter.name === f.name ? "rgba(22,163,74,0.1)" : "#2a2a2a",
                      color: selectedFilter.name === f.name ? "#16a34a" : "#aaa",
                      transition: "all 0.15s",
                    }}>
                      {f.name}
                    </button>
                  ))}
                </div>
              )}

              {/* Adjust Tab */}
              {activeTab === "adjust" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                  {[
                    { label: "Brightness", value: brightness, setter: setBrightness, min: 0, max: 200 },
                    { label: "Contrast",   value: contrast,   setter: setContrast,   min: 0, max: 200 },
                    { label: "Saturation", value: saturation, setter: setSaturation, min: 0, max: 200 },
                  ].map(({ label, value, setter, min, max }) => (
                    <div key={label}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                        <span style={{ fontSize: 12, fontWeight: 600, color: "#ccc" }}>{label}</span>
                        <span style={{ fontSize: 12, color: "#666" }}>{value}%</span>
                      </div>
                      <input
                        type="range" min={min} max={max} value={value}
                        onChange={(e) => setter(Number(e.target.value))}
                        style={{ width: "100%", accentColor: "#16a34a" }}
                      />
                      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
                        <span style={{ fontSize: 10, color: "#444" }}>{min}%</span>
                        <span style={{ fontSize: 10, color: "#444" }}>{max}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Crop Tab */}
              {activeTab === "crop" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <p style={{ fontSize: 12, color: "#888", margin: 0, lineHeight: 1.5 }}>
                    Drag on the image to select crop area. Click Save when done.
                  </p>
                  {isCropping && completedCrop && (
                    <div style={{
                      padding: 10, background: "rgba(22,163,74,0.1)",
                      borderRadius: 8, border: "1px solid rgba(22,163,74,0.3)",
                    }}>
                      <p style={{ fontSize: 11, color: "#16a34a", margin: 0, fontWeight: 600 }}>
                        ✓ Crop area selected
                      </p>
                      <p style={{ fontSize: 11, color: "#888", margin: "4px 0 0" }}>
                        {Math.round(completedCrop.width)} × {Math.round(completedCrop.height)}px
                      </p>
                    </div>
                  )}
                  {isCropping && (
                    <button onClick={() => { setIsCropping(false); setCrop(undefined); setCompletedCrop(undefined); }} style={{
                      height: 34, borderRadius: 8, background: "#2a2a2a",
                      color: "#aaa", border: "1px solid #444", cursor: "pointer", fontSize: 12,
                    }}>
                      Clear Crop
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
