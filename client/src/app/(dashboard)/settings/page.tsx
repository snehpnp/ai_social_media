"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast, Toaster } from "react-hot-toast";
import {
  Camera, Globe, Video, User, Bell, Shield, Loader2,
  CheckCircle2, XCircle, ExternalLink, Settings2, Mail, Lock,
} from "lucide-react";

const cardStyle: React.CSSProperties = {
  background: "var(--bg-card)", borderRadius: 12, border: "1px solid var(--border-color)",
  boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
};
const inputStyle: React.CSSProperties = {
  width: "100%", height: 44, borderRadius: 10, border: "1px solid var(--border-color)",
  padding: "0 14px", fontSize: 14, outline: "none", background: "var(--bg-input)", color: "var(--text-primary)",
};

const socialPlatforms = [
  { id: "instagram", name: "Instagram Business", desc: "Share photos, reels, and stories", icon: Camera, color: "#e1306c", bg: "#fdf2f8", bgHover: "#fce7f3" },
  { id: "facebook", name: "Facebook Page", desc: "Post to your business page", icon: Globe, color: "#1877f2", bg: "#eff6ff", bgHover: "#dbeafe" },
  { id: "youtube", name: "YouTube Channel", desc: "Upload videos and shorts", icon: Video, color: "#ff0000", bg: "#fef2f2", bgHover: "#fee2e2" },
];

export default function SettingsPage() {
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("accounts");
  const [profileForm, setProfileForm] = useState({ name: "", email: "" });
  const [saving, setSaving] = useState(false);
  const [connectedAccounts, setConnectedAccounts] = useState<any[]>([]);

  const fetchAccounts = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:5000/api/social/accounts", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setConnectedAccounts(res.data);
    } catch (err) {
      console.error("Failed to fetch accounts", err);
    }
  };

  useEffect(() => {
    const u = localStorage.getItem("user");
    if (u) {
      const parsed = JSON.parse(u);
      setUser(parsed);
      setProfileForm({ name: parsed.name || "", email: parsed.email || "" });
    }
    fetchAccounts();

    // Check for success/error from OAuth redirect
    const params = new URLSearchParams(window.location.search);
    if (params.get("success") === "facebook_connected") {
      toast.success("Facebook connected successfully!");
      // Clean up URL
      window.history.replaceState({}, document.title, "/settings");
    } else if (params.get("error")) {
      toast.error("Failed to connect account");
      window.history.replaceState({}, document.title, "/settings");
    }
  }, []);

  const handleConnect = (platformId: string) => {
    if (platformId === "facebook") {
      const token = localStorage.getItem("token");
      window.location.href = `http://localhost:5000/api/social/auth/facebook?token=${token}`;
    } else {
      toast.error("Integration coming soon for " + platformId);
    }
  };

  const handleDisconnect = async (platformId: string) => {
    if (!confirm(`Disconnect ${platformId}?`)) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:5000/api/social/accounts/${platformId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Account disconnected");
      fetchAccounts();
    } catch (err) {
      toast.error("Failed to disconnect");
    }
  };

  const tabs = [
    { id: "accounts", label: "Social Accounts", icon: Globe },
    { id: "profile", label: "Profile", icon: User },
    { id: "notifications", label: "Notifications", icon: Bell },
  ];

  return (
    <div>
      <Toaster position="top-right" />

      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>Settings</h1>
        <p style={{ fontSize: 13, color: "var(--text-secondary)", marginTop: 4 }}>Manage your social accounts and profile.</p>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 4, marginBottom: 24, background: "var(--bg-hover)", borderRadius: 10, padding: 4, width: "fit-content" }}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              height: 36, padding: "0 16px", borderRadius: 8, fontSize: 13, fontWeight: 500,
              border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 6,
              transition: "all 0.15s",
              background: activeTab === tab.id ? "#fff" : "transparent",
              color: activeTab === tab.id ? "var(--text-primary)" : "#6b7280",
              boxShadow: activeTab === tab.id ? "0 1px 3px rgba(0,0,0,0.06)" : "none",
            }}
          >
            <tab.icon style={{ width: 14, height: 14 }} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Social Accounts Tab ── */}
      {activeTab === "accounts" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {socialPlatforms.map((p) => {
            const connectedInfo = connectedAccounts.find(acc => acc.platform === p.id);
            const isConnected = !!connectedInfo;

            return (
              <div key={p.id} style={{
                ...cardStyle, padding: "20px 24px",
                display: "flex", alignItems: "center", gap: 16,
              }}>
                <div style={{
                  width: 52, height: 52, borderRadius: 14, background: p.bg,
                  display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                }}>
                  <p.icon style={{ width: 24, height: 24, color: p.color }} />
                </div>

                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 15, fontWeight: 600, color: "var(--text-primary)", margin: 0 }}>{p.name}</p>
                  <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>{p.desc}</p>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 8 }}>
                    {isConnected ? (
                      <>
                        <CheckCircle2 style={{ width: 14, height: 14, color: "var(--primary-color)" }} />
                        <span style={{ fontSize: 11, fontWeight: 600, color: "var(--primary-color)" }}>Connected as {connectedInfo.username}</span>
                      </>
                    ) : (
                      <>
                        <XCircle style={{ width: 14, height: 14, color: "#ef4444" }} />
                        <span style={{ fontSize: 11, fontWeight: 500, color: "#ef4444" }}>Not connected</span>
                      </>
                    )}
                  </div>
                </div>

                {isConnected ? (
                  <button 
                    onClick={() => handleDisconnect(p.id)}
                    style={{
                      height: 38, padding: "0 20px", borderRadius: 8,
                      background: "#fef2f2", color: "#ef4444", border: "1px solid #fecaca",
                      fontSize: 13, fontWeight: 600, cursor: "pointer",
                      display: "flex", alignItems: "center", gap: 6,
                    }}>
                    Disconnect
                  </button>
                ) : (
                  <button 
                    onClick={() => handleConnect(p.id)}
                    style={{
                      height: 38, padding: "0 20px", borderRadius: 8,
                      background: p.color, color: "#fff",
                      fontSize: 13, fontWeight: 600, border: "none", cursor: "pointer",
                      display: "flex", alignItems: "center", gap: 6,
                      transition: "opacity 0.15s",
                    }}>
                    <ExternalLink style={{ width: 14, height: 14 }} />
                    Connect
                  </button>
                )}
              </div>
            );
          })}

          {/* Info banner */}
          <div style={{
            borderRadius: 12, background: "#f0fdf4", border: "1px solid #bbf7d0",
            padding: "16px 20px", display: "flex", alignItems: "center", gap: 12,
          }}>
            <Shield style={{ width: 18, height: 18, color: "var(--primary-color)", flexShrink: 0 }} />
            <p style={{ fontSize: 12, color: "#15803d", margin: 0 }}>
              OAuth2 secure authentication is used. Your passwords are never stored. If no real App ID is configured, a simulated connection will be used for testing.
            </p>
          </div>
        </div>
      )}

      {/* ── Profile Tab ── */}
      {activeTab === "profile" && (
        <div style={{ maxWidth: 520 }}>
          <div style={{ ...cardStyle, padding: 28 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 28 }}>
              <img
                src={`https://ui-avatars.com/api/?name=${user?.name || "U"}&background=16a34a&color=fff&size=64`}
                alt="avatar" style={{ width: 64, height: 64, borderRadius: 16 }}
              />
              <div>
                <p style={{ fontSize: 18, fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>{user?.name}</p>
                <p style={{ fontSize: 13, color: "var(--text-muted)", margin: 0 }}>{user?.email}</p>
                <span style={{
                  fontSize: 10, fontWeight: 700, textTransform: "uppercase", padding: "2px 8px",
                  borderRadius: 4, background: "#f0fdf4", color: "var(--primary-color)", display: "inline-block", marginTop: 6,
                }}>{user?.role}</span>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-primary)", marginBottom: 6, display: "flex", alignItems: "center", gap: 6 }}>
                  <User style={{ width: 14, height: 14 }} /> Full Name
                </label>
                <input value={profileForm.name} onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })} style={inputStyle} />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-primary)", marginBottom: 6, display: "flex", alignItems: "center", gap: 6 }}>
                  <Mail style={{ width: 14, height: 14 }} /> Email
                </label>
                <input value={profileForm.email} onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })} style={inputStyle} />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-primary)", marginBottom: 6, display: "flex", alignItems: "center", gap: 6 }}>
                  <Lock style={{ width: 14, height: 14 }} /> Change Password
                </label>
                <input type="password" placeholder="New password" style={inputStyle} />
              </div>

              <button onClick={() => toast.success("Profile updated!")} style={{
                height: 42, borderRadius: 10, background: "#16a34a", color: "#fff",
                fontSize: 14, fontWeight: 600, border: "none", cursor: "pointer", marginTop: 8,
              }}>
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Notifications Tab ── */}
      {activeTab === "notifications" && (
        <div style={{ maxWidth: 520 }}>
          <div style={{ ...cardStyle, padding: 28 }}>
            <h3 style={{ fontSize: 15, fontWeight: 600, color: "var(--text-primary)", margin: "0 0 20px" }}>Notification Preferences</h3>
            {[
              { label: "Post published successfully", desc: "Get notified when a post goes live", on: true },
              { label: "Scheduled post reminder", desc: "Reminder 1 hour before scheduled post", on: true },
              { label: "Post failed to publish", desc: "Alert when a post fails on any platform", on: true },
              { label: "AI generation complete", desc: "Notify when content is generated", on: false },
              { label: "Weekly analytics digest", desc: "Weekly summary of your performance", on: false },
            ].map((n, i) => (
              <div key={i} style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "14px 0", borderBottom: i < 4 ? "1px solid #f3f4f6" : "none",
              }}>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 500, color: "var(--text-primary)", margin: 0 }}>{n.label}</p>
                  <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>{n.desc}</p>
                </div>
                <button style={{
                  width: 44, height: 24, borderRadius: 12, border: "none", cursor: "pointer",
                  background: n.on ? "#16a34a" : "#d1d5db", position: "relative", transition: "background 0.2s",
                }}>
                  <span style={{
                    position: "absolute", top: 2, width: 20, height: 20, borderRadius: "50%",
                    background: "var(--bg-card)", transition: "left 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.15)",
                    left: n.on ? 22 : 2,
                  }} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
