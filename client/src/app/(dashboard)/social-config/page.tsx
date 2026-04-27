"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast, Toaster } from "react-hot-toast";
import { Globe, Save, Key, Info, HelpCircle, Loader2, Copy, CheckCircle2 } from "lucide-react";

const API = "http://localhost:5000/api/admin/settings";
function authH() { return { headers: { Authorization: `Bearer ${localStorage.getItem("token") || ""}` } }; }

const inputStyle: React.CSSProperties = {
  width: "100%", height: 44, borderRadius: 10, border: "1px solid var(--border-color)",
  padding: "0 14px", fontSize: 14, outline: "none", background: "var(--bg-input)", color: "var(--text-primary)",
};
const cardStyle: React.CSSProperties = {
  background: "var(--bg-card)", borderRadius: 12, border: "1px solid var(--border-color)",
  boxShadow: "0 1px 3px rgba(0,0,0,0.04)", padding: "24px",
};

export default function SocialConfigPage() {
  const [settings, setSettings] = useState({ FACEBOOK_APP_ID: "", FACEBOOK_APP_SECRET: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);

  const redirectUri = "http://localhost:5000/api/social/auth/facebook/callback";

  useEffect(() => {
    const fetchSettings = async () => {
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
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: "80px 0" }}>
        <Loader2 style={{ width: 28, height: 28, color: "var(--primary-color)", animation: "spin 1s linear infinite" }} />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 800, margin: "0 auto" }}>
      <Toaster position="top-right" />

      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: "var(--text-primary)", margin: 0, display: "flex", alignItems: "center", gap: 10 }}>
          <Globe style={{ width: 24, height: 24, color: "var(--primary-color)" }} /> Social Media Configuration
        </h1>
        <p style={{ fontSize: 13, color: "var(--text-secondary)", marginTop: 4 }}>
          Configure OAuth2 App IDs and Secrets so your users can connect their social media accounts.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 24 }}>
        {/* Facebook Settings Form */}
        <div style={cardStyle}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: "#eff6ff", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontSize: 20, color: "#1877f2", fontWeight: "bold", fontFamily: "serif" }}>f</span>
            </div>
            <div>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>Facebook Integration</h2>
              <p style={{ fontSize: 12, color: "var(--text-secondary)", margin: 0 }}>Required for posting to Facebook Pages</p>
            </div>
          </div>

          <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-primary)", marginBottom: 6, display: "flex", alignItems: "center", gap: 6 }}>
                <Key style={{ width: 14, height: 14 }} /> App ID
              </label>
              <input
                type="text"
                value={settings.FACEBOOK_APP_ID}
                onChange={(e) => setSettings({ ...settings, FACEBOOK_APP_ID: e.target.value })}
                placeholder="e.g. 1029384756"
                style={inputStyle}
              />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-primary)", marginBottom: 6, display: "flex", alignItems: "center", gap: 6 }}>
                <Key style={{ width: 14, height: 14 }} /> App Secret
              </label>
              <input
                type="password"
                value={settings.FACEBOOK_APP_SECRET}
                onChange={(e) => setSettings({ ...settings, FACEBOOK_APP_SECRET: e.target.value })}
                placeholder="e.g. a1b2c3d4e5f6..."
                style={inputStyle}
              />
            </div>

            <button type="submit" disabled={saving} style={{
              height: 44, borderRadius: 10,
              background: "#16a34a", color: "#fff", fontSize: 14, fontWeight: 600, border: "none", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginTop: 8,
              opacity: saving ? 0.7 : 1,
            }}>
              {saving ? <Loader2 style={{ width: 18, height: 18, animation: "spin 1s linear infinite" }} /> : <Save style={{ width: 18, height: 18 }} />}
              {saving ? "Saving..." : "Save Configuration"}
            </button>
          </form>
        </div>

        {/* Guide / Instructions */}
        <div style={{ ...cardStyle, background: "#f8fafc", border: "1px dashed #cbd5e1" }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: "#0f172a", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
            <HelpCircle style={{ width: 18, height: 18, color: "#3b82f6" }} /> How to get Facebook App ID & Secret?
          </h3>
          
          <ol style={{ paddingLeft: 18, margin: 0, fontSize: 13, color: "#334155", lineHeight: 1.6, display: "flex", flexDirection: "column", gap: 10 }}>
            <li>Go to the <a href="https://developers.facebook.com/" target="_blank" rel="noreferrer" style={{ color: "#2563eb", fontWeight: 500, textDecoration: "none" }}>Facebook Developers Portal</a> and log in.</li>
            <li>Click on <strong>"My Apps"</strong> and then <strong>"Create App"</strong>.</li>
            <li>Select <strong>"Other"</strong> &rarr; <strong>"Business"</strong> as the app type.</li>
            <li>In the App Dashboard, go to <strong>Settings &gt; Basic</strong>. Here you will find your <strong>App ID</strong> and <strong>App Secret</strong>.</li>
            <li>Copy them and paste them into the form above.</li>
            <li>Now go to <strong>Add Product</strong> and setup <strong>Facebook Login</strong>.</li>
            <li>Under <strong>Facebook Login &gt; Settings</strong>, add the following URL to the <strong>Valid OAuth Redirect URIs</strong> list:</li>
          </ol>

          {/* Copy URI Box */}
          <div style={{
            marginTop: 16, padding: "12px 16px", background: "var(--bg-card)", borderRadius: 8, border: "1px solid #e2e8f0",
            display: "flex", alignItems: "center", justifyContent: "space-between"
          }}>
            <code style={{ fontSize: 12, color: "#0f172a", userSelect: "all" }}>{redirectUri}</code>
            <button onClick={copyUri} style={{
              background: "none", border: "none", cursor: "pointer", color: copied ? "#10b981" : "#64748b",
              display: "flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 600
            }}>
              {copied ? <CheckCircle2 style={{ width: 14, height: 14 }} /> : <Copy style={{ width: 14, height: 14 }} />}
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
          
          <div style={{ marginTop: 16, padding: 12, background: "#fffbeb", borderRadius: 8, border: "1px solid #fde68a", display: "flex", gap: 10 }}>
            <Info style={{ width: 16, height: 16, color: "#d97706", flexShrink: 0, marginTop: 2 }} />
            <p style={{ fontSize: 12, color: "#92400e", margin: 0 }}>
              <strong>Note:</strong> Make sure your app is switched from "Development" to "Live" mode in the Facebook Developer dashboard so all your users can authenticate.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
