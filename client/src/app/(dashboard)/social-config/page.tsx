"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast, Toaster } from "react-hot-toast";
import { CONFIG, getApiUrl } from "@/lib/config";
import { 
  Globe, 
  Save, 
  Key, 
  Info, 
  HelpCircle, 
  Loader2, 
  Copy, 
  CheckCircle2,
  RefreshCw,
  Shield,
  AlertCircle,
  ExternalLink,
  Settings2,
  ChevronRight
} from "lucide-react";

// Custom Facebook Icon (lucide-react doesn't have it)
const FacebookIcon = ({ style }: { style?: React.CSSProperties }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" style={style}>
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

const API = getApiUrl(CONFIG.API.ADMIN_SETTINGS);
import { getToken } from "@/lib/auth";
function authH() { return { headers: { Authorization: `Bearer ${getToken() || ""}` } }; }

const inputStyle: React.CSSProperties = {
  width: "100%", 
  height: 48, 
  borderRadius: 12, 
  border: "1px solid var(--border-color)",
  padding: "0 16px", 
  fontSize: 14, 
  outline: "none", 
  background: "var(--bg-input)", 
  color: "var(--text-primary)",
  transition: "all 0.2s ease",
};

const cardStyle: React.CSSProperties = {
  background: "var(--bg-card)", 
  borderRadius: 16, 
  border: "1px solid var(--border-color)",
  boxShadow: "0 4px 20px rgba(0,0,0,0.08)", 
  overflow: "hidden",
};

const badgeStyle = (color: string, bg: string): React.CSSProperties => ({
  padding: "6px 12px",
  borderRadius: 20,
  fontSize: 11,
  fontWeight: 600,
  textTransform: "uppercase",
  letterSpacing: "0.05em",
  background: bg,
  color,
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
});

export default function SocialConfigPage() {
  const [settings, setSettings] = useState({ FACEBOOK_APP_ID: "", FACEBOOK_APP_SECRET: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<"facebook" | "guide">("facebook");

  const redirectUri = getApiUrl(CONFIG.API.FACEBOOK_CALLBACK);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await axios.get(API, authH());
      setSettings({
        FACEBOOK_APP_ID: res.data.FACEBOOK_APP_ID || "",
        FACEBOOK_APP_SECRET: res.data.FACEBOOK_APP_SECRET || "",
      });
    } catch (err) {
      toast.error("Failed to load settings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await axios.put(API, settings, authH());
      toast.success("Settings saved successfully!");
    } catch (err) {
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const copyUri = () => {
    navigator.clipboard.writeText(redirectUri);
    setCopied(true);
    toast.success("Redirect URI copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  const isConfigured = settings.FACEBOOK_APP_ID && settings.FACEBOOK_APP_SECRET;

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
        <div style={{ textAlign: "center" }}>
          <Loader2 style={{ width: 40, height: 40, color: "var(--primary-color)", animation: "spin 1s linear infinite", margin: "0 auto 16px" }} />
          <p style={{ color: "var(--text-secondary)", fontSize: 14 }}>Loading configuration...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 900, margin: "0 auto" }}>
      <Toaster position="top-right" />

      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
          <div>
            <h1 style={{ 
              fontSize: 28, 
              fontWeight: 700, 
              color: "var(--text-primary)", 
              margin: 0,
              display: "flex",
              alignItems: "center",
              gap: 12,
            }}>
              <div style={{ 
                width: 44, 
                height: 44, 
                borderRadius: 12, 
                background: "linear-gradient(135deg, #16a34a 0%, #22c55e 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}>
                <Globe style={{ width: 24, height: 24, color: "white" }} />
              </div>
              Social Media Configuration
            </h1>
            <p style={{ fontSize: 15, color: "var(--text-secondary)", margin: "12px 0 0", lineHeight: 1.5 }}>
              Configure OAuth2 credentials to enable Facebook posting integration for your users.
            </p>
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            <span style={badgeStyle(
              isConfigured ? "#16a34a" : "#f59e0b",
              isConfigured ? "#f0fdf4" : "#fef3c7"
            )}>
              {isConfigured ? <CheckCircle2 style={{ width: 12, height: 12 }} /> : <AlertCircle style={{ width: 12, height: 12 }} />}
              {isConfigured ? "Configured" : "Setup Required"}
            </span>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 32 }}>
        {[
          { 
            label: "Status", 
            value: isConfigured ? "Active" : "Pending", 
            icon: Shield, 
            color: isConfigured ? "#16a34a" : "#f59e0b",
            bg: isConfigured ? "#f0fdf4" : "#fef3c7"
          },
          { 
            label: "Platform", 
            value: "Facebook", 
            icon: Globe, 
            color: "#1877f2",
            bg: "#eff6ff"
          },
          { 
            label: "Connection", 
            value: "OAuth 2.0", 
            icon: Key, 
            color: "#8b5cf6",
            bg: "#faf5ff"
          },
        ].map((stat, i) => (
          <div key={i} style={{ 
            background: "var(--bg-card)", 
            borderRadius: 12, 
            padding: 20, 
            border: "1px solid var(--border-color)",
            display: "flex",
            alignItems: "center",
            gap: 16,
          }}>
            <div style={{ 
              width: 48, 
              height: 48, 
              borderRadius: 12, 
              background: stat.bg,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}>
              <stat.icon style={{ width: 22, height: 22, color: stat.color }} />
            </div>
            <div>
              <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: 0, textTransform: "uppercase", letterSpacing: "0.05em" }}>{stat.label}</p>
              <p style={{ fontSize: 18, fontWeight: 700, color: "var(--text-primary)", margin: "4px 0 0" }}>{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 8, marginBottom: 24, borderBottom: "1px solid var(--border-color)", paddingBottom: 1 }}>
        {[
          { id: "facebook", label: "Facebook Credentials", icon: Settings2 },
          { id: "guide", label: "Setup Guide", icon: HelpCircle },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            style={{
              padding: "14px 20px",
              fontSize: 14,
              fontWeight: 600,
              color: activeTab === tab.id ? "#16a34a" : "var(--text-secondary)",
              background: "none",
              border: "none",
              borderBottom: `2px solid ${activeTab === tab.id ? "#16a34a" : "transparent"}`,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 8,
              transition: "all 0.2s ease",
            }}
          >
            <tab.icon style={{ width: 16, height: 16 }} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Facebook Credentials Tab */}
      {activeTab === "facebook" && (
        <div style={cardStyle}>
          {/* Card Header */}
          <div style={{ 
            padding: "24px 28px", 
            borderBottom: "1px solid var(--border-color)",
            background: "linear-gradient(135deg, #eff6ff 0%, #ffffff 100%)",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{ 
                width: 56, 
                height: 56, 
                borderRadius: 14, 
                background: "#1877f2",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 4px 12px rgba(24, 119, 242, 0.3)",
              }}>
                <FacebookIcon style={{ width: 28, height: 28, color: "white" }} />
              </div>
              <div>
                <h2 style={{ fontSize: 20, fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>
                  Facebook Integration
                </h2>
                <p style={{ fontSize: 14, color: "var(--text-secondary)", margin: "6px 0 0" }}>
                  Required permissions: pages_manage_posts, pages_read_engagement
                </p>
              </div>
            </div>
          </div>

          {/* Form */}
          <div style={{ padding: "28px" }}>
            <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              {/* App ID */}
              <div>
                <label style={{ 
                  fontSize: 13, 
                  fontWeight: 600, 
                  color: "var(--text-primary)", 
                  marginBottom: 8, 
                  display: "flex", 
                  alignItems: "center", 
                  gap: 8 
                }}>
                  <Key style={{ width: 16, height: 16, color: "#3b82f6" }} /> 
                  Facebook App ID
                </label>
                <input
                  type="text"
                  value={settings.FACEBOOK_APP_ID}
                  onChange={(e) => setSettings({ ...settings, FACEBOOK_APP_ID: e.target.value })}
                  placeholder="e.g. 1523218712563904"
                  style={inputStyle}
                />
                <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 6 }}>
                  Found in Facebook Developer Portal → Settings → Basic
                </p>
              </div>

              {/* App Secret */}
              <div>
                <label style={{ 
                  fontSize: 13, 
                  fontWeight: 600, 
                  color: "var(--text-primary)", 
                  marginBottom: 8, 
                  display: "flex", 
                  alignItems: "center", 
                  gap: 8 
                }}>
                  <Shield style={{ width: 16, height: 16, color: "#8b5cf6" }} /> 
                  Facebook App Secret
                </label>
                <input
                  type="password"
                  value={settings.FACEBOOK_APP_SECRET}
                  onChange={(e) => setSettings({ ...settings, FACEBOOK_APP_SECRET: e.target.value })}
                  placeholder="••••••••••••••••••••••••••"
                  style={inputStyle}
                />
                <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 6 }}>
                  Keep this secret! Never share or commit to code repositories.
                </p>
              </div>

              {/* OAuth Redirect URI */}
              <div style={{ 
                padding: 20, 
                background: "var(--bg-input)", 
                borderRadius: 12,
                border: "1px solid var(--border-color)",
              }}>
                <label style={{ 
                  fontSize: 13, 
                  fontWeight: 600, 
                  color: "var(--text-primary)", 
                  marginBottom: 12, 
                  display: "flex", 
                  alignItems: "center", 
                  gap: 8 
                }}>
                  <ExternalLink style={{ width: 16, height: 16, color: "#16a34a" }} /> 
                  OAuth Redirect URI
                </label>
                <div style={{ 
                  display: "flex", 
                  alignItems: "center", 
                  gap: 12,
                  padding: "12px 16px",
                  background: "var(--bg-card)",
                  borderRadius: 10,
                  border: "1px solid var(--border-color)",
                }}>
                  <code style={{ 
                    fontSize: 13, 
                    color: "var(--text-primary)", 
                    flex: 1,
                    fontFamily: "monospace",
                    wordBreak: "break-all",
                  }}>
                    {redirectUri}
                  </code>
                  <button 
                    onClick={copyUri}
                    type="button"
                    style={{
                      padding: "8px 14px",
                      borderRadius: 8,
                      border: "1px solid var(--border-color)",
                      background: copied ? "#dcfce7" : "var(--bg-hover)",
                      color: copied ? "#16a34a" : "var(--text-secondary)",
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {copied ? <CheckCircle2 style={{ width: 14, height: 14 }} /> : <Copy style={{ width: 14, height: 14 }} />}
                    {copied ? "Copied!" : "Copy"}
                  </button>
                </div>
                <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 10 }}>
                  Add this URL to Facebook Login → Settings → Valid OAuth Redirect URIs
                </p>
              </div>

              {/* Action Buttons */}
              <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
                <button 
                  type="submit" 
                  disabled={saving}
                  style={{
                    height: 48,
                    padding: "0 28px",
                    borderRadius: 12,
                    background: "#16a34a",
                    color: "#fff",
                    fontSize: 15,
                    fontWeight: 600,
                    border: "none",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    opacity: saving ? 0.7 : 1,
                    transition: "all 0.2s ease",
                    boxShadow: "0 4px 14px rgba(22, 163, 74, 0.3)",
                  }}
                >
                  {saving ? <Loader2 style={{ width: 18, height: 18, animation: "spin 1s linear infinite" }} /> : <Save style={{ width: 18, height: 18 }} />}
                  {saving ? "Saving..." : "Save Configuration"}
                </button>
                <button 
                  type="button"
                  onClick={fetchSettings}
                  style={{
                    height: 48,
                    padding: "0 24px",
                    borderRadius: 12,
                    background: "var(--bg-hover)",
                    color: "var(--text-secondary)",
                    fontSize: 15,
                    fontWeight: 600,
                    border: "1px solid var(--border-color)",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                  }}
                >
                  <RefreshCw style={{ width: 18, height: 18 }} />
                  Refresh
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Setup Guide Tab */}
      {activeTab === "guide" && (
        <div style={{ display: "grid", gap: 20 }}>
          {/* Step by Step Guide */}
          <div style={cardStyle}>
            <div style={{ padding: "24px 28px", borderBottom: "1px solid var(--border-color)" }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: "var(--text-primary)", margin: 0, display: "flex", alignItems: "center", gap: 10 }}>
                <HelpCircle style={{ width: 22, height: 22, color: "#3b82f6" }} />
                Step-by-Step Setup Guide
              </h2>
            </div>
            <div style={{ padding: "28px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                {[
                  {
                    step: 1,
                    title: "Create Facebook App",
                    desc: "Go to Facebook Developers Portal and create a new Business app type.",
                    action: { label: "Open Portal", url: "https://developers.facebook.com/" }
                  },
                  {
                    step: 2,
                    title: "Get App Credentials",
                    desc: "Navigate to Settings → Basic to find your App ID and App Secret.",
                  },
                  {
                    step: 3,
                    title: "Add Facebook Login",
                    desc: "Click 'Add Product' and enable Facebook Login for your app.",
                  },
                  {
                    step: 4,
                    title: "Configure OAuth Redirect",
                    desc: "Add the redirect URI to Facebook Login → Settings → Valid OAuth Redirect URIs.",
                    highlight: redirectUri,
                  },
                  {
                    step: 5,
                    title: "Enter Credentials",
                    desc: "Copy App ID and Secret to this configuration page and save.",
                  },
                ].map((item, i) => (
                  <div key={i} style={{ display: "flex", gap: 16 }}>
                    <div style={{ 
                      width: 36, 
                      height: 36, 
                      borderRadius: "50%",
                      background: "linear-gradient(135deg, #16a34a 0%, #22c55e 100%)",
                      color: "white",
                      fontSize: 14,
                      fontWeight: 700,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}>
                      {item.step}
                    </div>
                    <div style={{ flex: 1 }}>
                      <h3 style={{ fontSize: 16, fontWeight: 600, color: "var(--text-primary)", margin: "0 0 6px" }}>
                        {item.title}
                      </h3>
                      <p style={{ fontSize: 14, color: "var(--text-secondary)", margin: 0, lineHeight: 1.5 }}>
                        {item.desc}
                      </p>
                      {item.highlight && (
                        <div style={{ 
                          marginTop: 10, 
                          padding: "10px 14px", 
                          background: "var(--bg-input)", 
                          borderRadius: 8,
                          fontFamily: "monospace",
                          fontSize: 12,
                          color: "var(--text-primary)",
                          wordBreak: "break-all",
                        }}>
                          {item.highlight}
                        </div>
                      )}
                      {item.action && (
                        <a 
                          href={item.action.url}
                          target="_blank"
                          rel="noreferrer"
                          style={{
                            marginTop: 10,
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 6,
                            padding: "8px 14px",
                            background: "#eff6ff",
                            color: "#3b82f6",
                            borderRadius: 8,
                            fontSize: 13,
                            fontWeight: 600,
                            textDecoration: "none",
                          }}
                        >
                          {item.action.label}
                          <ChevronRight style={{ width: 14, height: 14 }} />
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Important Notes */}
          <div style={{ 
            ...cardStyle, 
            padding: 24,
            background: "linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)",
            border: "1px solid #fde68a",
          }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
              <div style={{ 
                width: 44, 
                height: 44, 
                borderRadius: 12, 
                background: "#f59e0b",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}>
                <AlertCircle style={{ width: 22, height: 22, color: "white" }} />
              </div>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: "#92400e", margin: "0 0 8px" }}>
                  Important Notes
                </h3>
                <ul style={{ margin: 0, paddingLeft: 18, fontSize: 14, color: "#a16207", lineHeight: 1.8 }}>
                  <li>Your app must be in "Live" mode for production use</li>
                  <li>Users need to be admins of Facebook Pages to post</li>
                  <li>Keep App Secret confidential - never expose in client code</li>
                  <li>Required permissions: pages_manage_posts, pages_read_engagement</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
