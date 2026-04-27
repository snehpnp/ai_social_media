"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast, Toaster } from "react-hot-toast";
import {
  Key, Zap, ShieldCheck, Brain, Sparkles, CheckCircle2, AlertCircle,
  Loader2, Settings2, X, Eye, EyeOff, Plug, PlugZap, Trash2,
  Image as ImageIcon, MessageSquare, Code2, Hash, TestTube2,
  ChevronDown, ChevronUp, RefreshCw,
} from "lucide-react";

const API = "http://localhost:5000/api/ai-providers";
function getToken() { return localStorage.getItem("token") || ""; }
function authH() { return { headers: { Authorization: `Bearer ${getToken()}` } }; }

const cardStyle: React.CSSProperties = {
  background: "var(--bg-card)", borderRadius: 12, border: "1px solid var(--border-color)",
  boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
};
const inputStyle: React.CSSProperties = {
  width: "100%", height: 44, borderRadius: 10, border: "1px solid var(--border-color)",
  padding: "0 14px", fontSize: 14, outline: "none", background: "var(--bg-input)", color: "var(--text-primary)",
};

// Provider visual configs
const providerMeta: Record<string, {
  icon: string; color: string; bg: string; gradient: string; desc: string;
}> = {
  groq: { icon: "⚡", color: "#f97316", bg: "rgba(249, 115, 22, 0.1)", gradient: "linear-gradient(135deg, #f97316, #ea580c)", desc: "Ultra-fast LLM inference — Captions, hashtags, descriptions" },
  stability: { icon: "🎨", color: "#7c3aed", bg: "rgba(124, 58, 237, 0.1)", gradient: "linear-gradient(135deg, #7c3aed, #6d28d9)", desc: "AI image generation — Social media posters & graphics" },
  openai: { icon: "🧠", color: "#10b981", bg: "rgba(16, 185, 129, 0.1)", gradient: "linear-gradient(135deg, #10b981, #059669)", desc: "GPT models — Advanced content & code generation" },
};

const capabilityIcons: Record<string, { icon: any; label: string; color: string }> = {
  text: { icon: MessageSquare, label: "Text", color: "#2563eb" },
  image: { icon: ImageIcon, label: "Image", color: "#7c3aed" },
  code: { icon: Code2, label: "Code", color: "var(--primary-color)" },
  caption: { icon: Sparkles, label: "Caption", color: "#f59e0b" },
  hashtag: { icon: Hash, label: "Hashtag", color: "#ec4899" },
};

/* ── Modal ── */
function Modal({ open, onClose, children }: { open: boolean; onClose: () => void; children: React.ReactNode }) {
  if (!open) return null;
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div onClick={onClose} style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.4)" }} />
      <div style={{ position: "relative", background: "var(--bg-card)", borderRadius: 16, padding: 28, width: 480, maxHeight: "90vh", overflowY: "auto", boxShadow: "0 20px 60px rgba(0,0,0,0.15)" }}>
        <button onClick={onClose} style={{ position: "absolute", top: 16, right: 16, background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", padding: 4 }}>
          <X style={{ width: 18, height: 18 }} />
        </button>
        {children}
      </div>
    </div>
  );
}

export default function AIConfigPage() {
  const [providers, setProviders] = useState<any[]>([]);
  const [registry, setRegistry] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [connectSlug, setConnectSlug] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState("");
  const [selectedModel, setSelectedModel] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<{ slug: string; success: boolean; message: string } | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  const fetchProviders = async () => {
    try {
      const res = await axios.get(API, authH());
      setProviders(res.data.connected || []);
      setRegistry(res.data.registry || {});
    } catch { /* ignore */ }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchProviders(); }, []);

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKey.trim()) return toast.error("Enter API key");
    setSaving(true);
    try {
      await axios.post(API, { slug: connectSlug, apiKey, model: selectedModel || undefined }, authH());
      toast.success(`${registry[connectSlug!]?.name || connectSlug} connected!`);
      setConnectSlug(null); setApiKey(""); setSelectedModel("");
      fetchProviders();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to connect");
    } finally { setSaving(false); }
  };

  const handleTest = async (slug: string) => {
    setTesting(slug); setTestResult(null);
    try {
      const res = await axios.post(`${API}/${slug}/test`, {}, authH());
      setTestResult({ slug, success: true, message: res.data.message });
      toast.success("Test passed! ✓");
      fetchProviders();
    } catch (err: any) {
      setTestResult({ slug, success: false, message: err.response?.data?.message || "Test failed" });
      toast.error("Test failed ✗");
      fetchProviders();
    } finally { setTesting(null); }
  };

  const handleToggle = async (slug: string, isEnabled: boolean) => {
    try {
      await axios.put(`${API}/${slug}`, { isEnabled: !isEnabled }, authH());
      fetchProviders();
      toast.success(isEnabled ? "Disabled" : "Enabled");
    } catch { toast.error("Update failed"); }
  };

  const handleDisconnect = async (slug: string) => {
    if (!confirm("Disconnect this provider? Users will lose access to its features.")) return;
    try {
      await axios.delete(`${API}/${slug}`, authH());
      toast.success("Disconnected");
      fetchProviders();
    } catch { toast.error("Failed to disconnect"); }
  };

  const connectedSlugs = providers.map((p) => p.slug);
  const availableProviders = Object.entries(registry).filter(([slug]) => !connectedSlugs.includes(slug));

  return (
    <div>
      <Toaster position="top-right" />

      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>AI Providers</h1>
        <p style={{ fontSize: 13, color: "var(--text-secondary)", marginTop: 4 }}>
          Connect and manage AI services. Users can generate content using any active provider.
        </p>
      </div>

      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: "80px 0" }}>
          <Loader2 style={{ width: 28, height: 28, color: "var(--primary-color)", animation: "spin 1s linear infinite" }} />
        </div>
      ) : (
        <>
          {/* ── Connected Providers ── */}
          {providers.length > 0 && (
            <div style={{ marginBottom: 32 }}>
              <h2 style={{ fontSize: 14, fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 16 }}>
                Connected ({providers.length})
              </h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {providers.map((p) => {
                  const meta = providerMeta[p.slug] || { icon: "🤖", color: "var(--text-secondary)", bg: "#f3f4f6", gradient: "#6b7280", desc: "" };
                  const isExpanded = expanded === p.slug;
                  const result = testResult?.slug === p.slug ? testResult : null;

                  return (
                    <div key={p.id} style={{ ...cardStyle, overflow: "hidden" }}>
                      {/* Main Row */}
                      <div style={{ padding: "20px 24px", display: "flex", alignItems: "center", gap: 16 }}>
                        {/* Icon */}
                        <div style={{
                          width: 52, height: 52, borderRadius: 14, background: meta.gradient,
                          display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, flexShrink: 0,
                        }}>
                          {meta.icon}
                        </div>

                        {/* Info */}
                        <div style={{ flex: 1 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <span style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)" }}>{p.name}</span>
                            {p.isVerified ? (
                              <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 4, background: "rgba(22, 163, 74, 0.1)", color: "var(--primary-color)", display: "flex", alignItems: "center", gap: 3 }}>
                                <CheckCircle2 style={{ width: 10, height: 10 }} /> Verified
                              </span>
                            ) : (
                              <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 4, background: "rgba(239, 68, 68, 0.1)", color: "#ef4444", display: "flex", alignItems: "center", gap: 3 }}>
                                <AlertCircle style={{ width: 10, height: 10 }} /> Not tested
                              </span>
                            )}
                            {!p.isEnabled && (
                              <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 4, background: "var(--bg-hover)", color: "var(--text-secondary)" }}>Disabled</span>
                            )}
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 6 }}>
                            <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>Model: <strong style={{ color: "var(--text-primary)" }}>{p.model}</strong></span>
                            <span style={{ color: "#d1d5db" }}>•</span>
                            <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>Key: <span style={{ fontFamily: "monospace", fontSize: 11 }}>{p.apiKey}</span></span>
                          </div>
                          {/* Capabilities */}
                          <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
                            {p.capabilities?.map((c: string) => {
                              const cap = capabilityIcons[c];
                              if (!cap) return null;
                              const Icon = cap.icon;
                              return (
                                <span key={c} style={{
                                  fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 4,
                                  background: "var(--bg-input)", color: cap.color, display: "flex", alignItems: "center", gap: 3,
                                  border: "1px solid var(--border-color)",
                                }}>
                                  <Icon style={{ width: 10, height: 10 }} /> {cap.label}
                                </span>
                              );
                            })}
                          </div>
                        </div>

                        {/* Actions */}
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <button
                            onClick={() => handleTest(p.slug)}
                            disabled={testing === p.slug}
                            style={{
                              height: 34, padding: "0 14px", borderRadius: 8, fontSize: 12, fontWeight: 600,
                              background: "var(--bg-input)", border: "1px solid var(--border-color)", color: "var(--text-primary)",
                              cursor: "pointer", display: "flex", alignItems: "center", gap: 6,
                            }}
                          >
                            {testing === p.slug ? (
                              <Loader2 style={{ width: 14, height: 14, animation: "spin 1s linear infinite" }} />
                            ) : (
                              <TestTube2 style={{ width: 14, height: 14 }} />
                            )}
                            Test
                          </button>

                          {/* Enable/Disable toggle */}
                          <button
                            onClick={() => handleToggle(p.slug, p.isEnabled)}
                            style={{
                              width: 44, height: 24, borderRadius: 12, border: "none", cursor: "pointer",
                              background: p.isEnabled ? "#16a34a" : "#d1d5db", position: "relative", transition: "background 0.2s",
                            }}
                          >
                            <span style={{
                              position: "absolute", top: 2, width: 20, height: 20, borderRadius: "50%",
                              background: "var(--bg-card)", transition: "left 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.15)",
                              left: p.isEnabled ? 22 : 2,
                            }} />
                          </button>

                          <button onClick={() => setExpanded(isExpanded ? null : p.slug)} style={{
                            width: 32, height: 32, borderRadius: 8, background: "none", border: "none", cursor: "pointer", color: "var(--text-secondary)",
                          }}>
                            {isExpanded ? <ChevronUp style={{ width: 18, height: 18 }} /> : <ChevronDown style={{ width: 18, height: 18 }} />}
                          </button>
                        </div>
                      </div>

                      {/* Test Result */}
                      {result && (
                        <div style={{
                          margin: "0 24px 16px", padding: "10px 14px", borderRadius: 8,
                          background: result.success ? "rgba(22, 163, 74, 0.1)" : "rgba(239, 68, 68, 0.1)",
                          border: `1px solid ${result.success ? "rgba(22, 163, 74, 0.3)" : "rgba(239, 68, 68, 0.3)"}`,
                          fontSize: 12, color: result.success ? "var(--primary-color)" : "#ef4444",
                          display: "flex", alignItems: "center", gap: 8,
                        }}>
                          {result.success ? <CheckCircle2 style={{ width: 14, height: 14 }} /> : <AlertCircle style={{ width: 14, height: 14 }} />}
                          {result.message}
                        </div>
                      )}

                      {/* Expanded Details */}
                      {isExpanded && (
                        <div style={{ padding: "0 24px 20px", borderTop: "1px solid var(--border-color)", paddingTop: 16 }}>
                          <div style={{ display: "flex", gap: 12, marginBottom: 12 }}>
                            <div style={{ flex: 1 }}>
                              <label style={{ fontSize: 11, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 4, display: "block" }}>Update Model</label>
                              <select
                                defaultValue={p.model}
                                onChange={async (e) => {
                                  await axios.put(`${API}/${p.slug}`, { model: e.target.value }, authH());
                                  toast.success("Model updated");
                                  fetchProviders();
                                }}
                                style={{ ...inputStyle, height: 38, fontSize: 13 }}
                              >
                                {registry[p.slug]?.models?.map((m: any) => (
                                  <option key={m.id} value={m.id}>{m.name}</option>
                                ))}
                              </select>
                            </div>
                            <div style={{ flex: 1 }}>
                              <label style={{ fontSize: 11, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 4, display: "block" }}>Last Tested</label>
                              <div style={{ ...inputStyle, height: 38, fontSize: 13, display: "flex", alignItems: "center", color: "var(--text-secondary)" }}>
                                {p.lastTestedAt ? new Date(p.lastTestedAt).toLocaleString() : "Never"}
                              </div>
                            </div>
                          </div>
                          <button onClick={() => handleDisconnect(p.slug)} style={{
                            height: 34, padding: "0 14px", borderRadius: 8, background: "rgba(239, 68, 68, 0.1)",
                            color: "#ef4444", fontSize: 12, fontWeight: 600, border: "1px solid rgba(239, 68, 68, 0.3)",
                            cursor: "pointer", display: "flex", alignItems: "center", gap: 6,
                          }}>
                            <Trash2 style={{ width: 14, height: 14 }} /> Disconnect Provider
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── Available to Connect ── */}
          {availableProviders.length > 0 && (
            <div style={{ marginBottom: 32 }}>
              <h2 style={{ fontSize: 14, fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 16 }}>
                Available Providers
              </h2>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 14 }}>
                {availableProviders.map(([slug, info]: [string, any]) => {
                  const meta = providerMeta[slug] || { icon: "🤖", color: "var(--text-secondary)", bg: "#f3f4f6", gradient: "#6b7280", desc: "" };
                  return (
                    <div key={slug} style={{ ...cardStyle, padding: 24, display: "flex", flexDirection: "column" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                        <div style={{
                          width: 44, height: 44, borderRadius: 12, background: meta.gradient,
                          display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20,
                        }}>
                          {meta.icon}
                        </div>
                        <div>
                          <p style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>{info.name}</p>
                          <p style={{ fontSize: 11, color: "var(--text-muted)", margin: 0 }}>{info.models?.length || 0} models</p>
                        </div>
                      </div>
                      <p style={{ fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.5, marginBottom: 14, flex: 1 }}>{meta.desc}</p>

                      {/* Capabilities */}
                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14 }}>
                        {info.capabilities?.map((c: string) => {
                          const cap = capabilityIcons[c];
                          if (!cap) return null;
                          const Icon = cap.icon;
                          return (
                            <span key={c} style={{
                              fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 4,
                              background: "var(--bg-input)", color: cap.color, display: "flex", alignItems: "center", gap: 3,
                              border: "1px solid var(--border-color)",
                            }}>
                              <Icon style={{ width: 10, height: 10 }} /> {cap.label}
                            </span>
                          );
                        })}
                      </div>

                      <button
                        onClick={() => { setConnectSlug(slug); setSelectedModel(info.defaultModel); }}
                        style={{
                          height: 38, borderRadius: 8, fontSize: 13, fontWeight: 600,
                          background: meta.bg, color: meta.color, border: `1px solid ${meta.color}30`,
                          cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                        }}
                      >
                        <Plug style={{ width: 14, height: 14 }} /> Connect
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* No Providers Connected */}
          {providers.length === 0 && availableProviders.length === 0 && (
            <div style={{ ...cardStyle, padding: "60px 0", textAlign: "center" }}>
              <PlugZap style={{ width: 40, height: 40, color: "#d1d5db", margin: "0 auto 12px" }} />
              <p style={{ fontSize: 14, fontWeight: 500, color: "var(--text-primary)" }}>No AI providers available</p>
            </div>
          )}

          {/* Security Banner */}
          <div style={{
            borderRadius: 12, background: "rgba(22, 163, 74, 0.1)", border: "1px solid rgba(22, 163, 74, 0.3)",
            padding: "16px 20px", display: "flex", alignItems: "center", gap: 12,
          }}>
            <ShieldCheck style={{ width: 18, height: 18, color: "var(--primary-color)", flexShrink: 0 }} />
            <p style={{ fontSize: 12, color: "var(--primary-color)", margin: 0 }}>
              API keys are stored encrypted and proxied through your server. Users never see credentials.
              You can connect multiple providers — the system auto-selects the best one for each task.
            </p>
          </div>
        </>
      )}

      {/* ── Connect Modal ── */}
      <Modal open={!!connectSlug} onClose={() => { setConnectSlug(null); setApiKey(""); }}>
        {connectSlug && (
          <>
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 24 }}>
              <div style={{
                width: 48, height: 48, borderRadius: 14,
                background: providerMeta[connectSlug]?.gradient || "#6b7280",
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22,
              }}>
                {providerMeta[connectSlug]?.icon || "🤖"}
              </div>
              <div>
                <h2 style={{ fontSize: 18, fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>
                  Connect {registry[connectSlug]?.name}
                </h2>
                <p style={{ fontSize: 12, color: "var(--text-muted)", margin: 0 }}>{providerMeta[connectSlug]?.desc}</p>
              </div>
            </div>

            <form onSubmit={handleConnect} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {/* API Key */}
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-primary)", marginBottom: 6, display: "flex", alignItems: "center", gap: 6 }}>
                  <Key style={{ width: 14, height: 14 }} /> API Key
                </label>
                <div style={{ position: "relative" }}>
                  <input
                    type={showKey ? "text" : "password"}
                    placeholder={connectSlug === "groq" ? "gsk_..." : connectSlug === "stability" ? "sk-..." : "sk-..."}
                    value={apiKey} onChange={(e) => setApiKey(e.target.value)}
                    required
                    style={{ ...inputStyle, paddingRight: 42 }}
                  />
                  <button type="button" onClick={() => setShowKey(!showKey)} style={{
                    position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
                    background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", padding: 0,
                  }}>
                    {showKey ? <EyeOff style={{ width: 16, height: 16 }} /> : <Eye style={{ width: 16, height: 16 }} />}
                  </button>
                </div>
                <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>
                  {connectSlug === "groq" && <a href="https://console.groq.com/keys" target="_blank" style={{ color: "#f97316" }}>Get your Groq API key →</a>}
                  {connectSlug === "stability" && <a href="https://platform.stability.ai/account/keys" target="_blank" style={{ color: "#7c3aed" }}>Get your Stability AI key →</a>}
                  {connectSlug === "openai" && <a href="https://platform.openai.com/api-keys" target="_blank" style={{ color: "#10b981" }}>Get your OpenAI key →</a>}
                </p>
              </div>

              {/* Model Selection */}
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-primary)", marginBottom: 6, display: "flex", alignItems: "center", gap: 6 }}>
                  <Brain style={{ width: 14, height: 14 }} /> Default Model
                </label>
                <select value={selectedModel} onChange={(e) => setSelectedModel(e.target.value)} style={{ ...inputStyle, cursor: "pointer" }}>
                  {registry[connectSlug]?.models?.map((m: any) => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>
              </div>

              {/* Capabilities preview */}
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-primary)", marginBottom: 6, display: "block" }}>Capabilities</label>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {registry[connectSlug]?.capabilities?.map((c: string) => {
                    const cap = capabilityIcons[c];
                    if (!cap) return null;
                    const Icon = cap.icon;
                    return (
                      <span key={c} style={{
                        fontSize: 12, fontWeight: 600, padding: "6px 12px", borderRadius: 8,
                        background: "var(--bg-input)", color: cap.color, display: "flex", alignItems: "center", gap: 6,
                        border: "1px solid var(--border-color)",
                      }}>
                        <Icon style={{ width: 14, height: 14 }} /> {cap.label}
                      </span>
                    );
                  })}
                </div>
              </div>

              <button type="submit" disabled={saving} style={{
                height: 44, borderRadius: 10,
                background: providerMeta[connectSlug]?.gradient || "#16a34a",
                color: "#fff", fontSize: 14, fontWeight: 600, border: "none", cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginTop: 8,
                opacity: saving ? 0.7 : 1,
              }}>
                {saving ? <Loader2 style={{ width: 18, height: 18, animation: "spin 1s linear infinite" }} /> : <PlugZap style={{ width: 18, height: 18 }} />}
                {saving ? "Connecting..." : "Connect & Save"}
              </button>
            </form>
          </>
        )}
      </Modal>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
