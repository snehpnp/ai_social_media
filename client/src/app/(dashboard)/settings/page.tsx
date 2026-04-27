"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast, Toaster } from "react-hot-toast";
import {
  User, Bell, Mail, Lock,
} from "lucide-react";

const cardStyle: React.CSSProperties = {
  background: "var(--bg-card)", borderRadius: 12, border: "1px solid var(--border-color)",
  boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
};
const inputStyle: React.CSSProperties = {
  width: "100%", height: 44, borderRadius: 10, border: "1px solid var(--border-color)",
  padding: "0 14px", fontSize: 14, outline: "none", background: "var(--bg-input)", color: "var(--text-primary)",
};


export default function SettingsPage() {
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("profile");
  const [profileForm, setProfileForm] = useState({ name: "", email: "" });


  useEffect(() => {
    const u = localStorage.getItem("user");
    if (u) {
      const parsed = JSON.parse(u);
      setUser(parsed);
      setProfileForm({ name: parsed.name || "", email: parsed.email || "" });
    }
  }, []);


  const tabs = [
    { id: "profile", label: "Profile", icon: User },
    { id: "notifications", label: "Notifications", icon: Bell },
  ];

  return (
    <div>
      <Toaster position="top-right" />

      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>Settings</h1>
        <p style={{ fontSize: 13, color: "var(--text-secondary)", marginTop: 4 }}>Manage your profile and notification preferences.</p>
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
              background: activeTab === tab.id ? "var(--bg-card)" : "transparent",
              color: activeTab === tab.id ? "var(--text-primary)" : "#6b7280",
              boxShadow: activeTab === tab.id ? "0 1px 3px rgba(0,0,0,0.06)" : "none",
            }}
          >
            <tab.icon style={{ width: 14, height: 14 }} />
            {tab.label}
          </button>
        ))}
      </div>

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
