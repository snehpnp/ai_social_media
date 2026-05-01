"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast, Toaster } from "react-hot-toast";
import { CONFIG, getApiUrl } from "@/lib/config";
import { 
  Image as ImageIcon, 
  Type, 
  Save, 
  Loader2, 
  Globe, 
  Key,
  RefreshCw,
  CheckCircle2,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Info
} from "lucide-react";

import { getToken } from "@/lib/auth";

const API = getApiUrl(CONFIG.API.ADMIN_SETTINGS);

function authHeader() { return { headers: { Authorization: `Bearer ${getToken()}` } }; }

const cardStyle: React.CSSProperties = {
  background: "var(--bg-card)",
  borderRadius: 12,
  border: "1px solid var(--border-color)",
  boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
  overflow: "hidden",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  height: 44,
  borderRadius: 8,
  border: "1px solid var(--border-color)",
  padding: "0 14px",
  fontSize: 14,
  outline: "none",
  background: "var(--bg-input)",
  color: "var(--text-primary)",
};

const btnPrimary: React.CSSProperties = {
  height: 44,
  borderRadius: 8,
  background: "#16a34a",
  color: "#fff",
  fontSize: 14,
  fontWeight: 600,
  border: "none",
  cursor: "pointer",
  padding: "0 20px",
  display: "inline-flex",
  alignItems: "center",
  gap: 8,
};

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<"branding" | "social">("branding");
  const [showFBSteps, setShowFBSteps] = useState(false);
  
  const [settings, setSettings] = useState({
    // Branding
    APP_NAME: "Social Vibe",
    APP_LOGO_URL: "https://framerusercontent.com/images/OmiFNAsUnVnklI6y2SA9EWiDJBk.png?width=915&height=273",
    APP_FAVICON_URL: "https://framerusercontent.com/images/OmiFNAsUnVnklI6y2SA9EWiDJBk.png?width=915&height=273",
    
    // Social
    FACEBOOK_APP_ID: "",
    FACEBOOK_APP_SECRET: "",
  });

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const r = await axios.get(API, authHeader());
      setSettings(prev => ({ ...prev, ...r.data }));
    } catch {
      toast.error("Could not load settings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await axios.put(API, settings, authHeader());
      toast.success("Settings saved successfully!");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = (key: string, value: string) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const tabs = [
    { id: "branding", label: "Branding & Logo", icon: ImageIcon },
    { id: "social", label: "Social API Keys", icon: Key },
  ];

  return (
    <div>
      <Toaster position="top-right" />

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>
            Admin Settings
          </h1>
          <p style={{ fontSize: 14, color: "var(--text-secondary)", marginTop: 6 }}>
            Manage platform branding and API configurations
          </p>
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <button
            onClick={fetchSettings}
            style={{ ...btnPrimary, background: "var(--bg-hover)", color: "var(--text-secondary)", border: "1px solid var(--border-color)" }}
          >
            <RefreshCw style={{ width: 16, height: 16 }} />
            Refresh
          </button>
          <button onClick={handleSave} disabled={saving} style={btnPrimary}>
            {saving ? <Loader2 style={{ width: 16, height: 16, animation: "spin 1s linear infinite" }} /> : <Save style={{ width: 16, height: 16 }} />}
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 8, marginBottom: 24, borderBottom: "1px solid var(--border-color)", paddingBottom: 1 }}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            style={{
              padding: "12px 20px",
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

      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: "60px 0" }}>
          <Loader2 style={{ width: 32, height: 32, color: "var(--primary-color)", animation: "spin 1s linear infinite" }} />
        </div>
      ) : (
        <>
          {/* Branding Tab */}
          {activeTab === "branding" && (
            <div style={{ display: "grid", gap: 20 }}>
              {/* App Name */}
              <div style={{ ...cardStyle, padding: 24 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
                  <div style={{ width: 48, height: 48, borderRadius: 10, background: "#eff6ff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Type style={{ width: 24, height: 24, color: "#3b82f6" }} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: 16, fontWeight: 600, color: "var(--text-primary)", margin: 0 }}>
                      Application Name
                    </h3>
                    <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: "4px 0 0" }}>
                      Displayed in browser tab and throughout the app
                    </p>
                  </div>
                </div>
                <input
                  value={settings.APP_NAME}
                  onChange={(e) => updateSetting("APP_NAME", e.target.value)}
                  placeholder="Enter app name..."
                  style={inputStyle}
                />
              </div>

              {/* Logo Settings */}
              <div style={{ ...cardStyle, padding: 24 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
                  <div style={{ width: 48, height: 48, borderRadius: 10, background: "#f0fdf4", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <ImageIcon style={{ width: 24, height: 24, color: "#16a34a" }} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: 16, fontWeight: 600, color: "var(--text-primary)", margin: 0 }}>
                      Logo & Favicon
                    </h3>
                    <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: "4px 0 0" }}>
                      Customize your platform appearance
                    </p>
                  </div>
                </div>

                <div style={{ display: "grid", gap: 20 }}>
                  {/* Logo URL */}
                  <div>
                    <label style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", marginBottom: 8, display: "block" }}>
                      Logo URL (Sidebar)
                    </label>
                    <input
                      value={settings.APP_LOGO_URL}
                      onChange={(e) => updateSetting("APP_LOGO_URL", e.target.value)}
                      placeholder="https://example.com/logo.png"
                      style={inputStyle}
                    />
                    {settings.APP_LOGO_URL && (
                      <div style={{ marginTop: 12, padding: 16, background: "var(--bg-input)", borderRadius: 8, display: "flex", alignItems: "center", gap: 16 }}>
                        <span style={{ fontSize: 12, color: "var(--text-muted)" }}>Preview:</span>
                        <img 
                          src={settings.APP_LOGO_URL} 
                          alt="Logo preview" 
                          style={{ height: 40, maxWidth: 200, objectFit: "contain" }}
                          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                        />
                      </div>
                    )}
                  </div>

                  {/* Favicon URL */}
                  <div>
                    <label style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", marginBottom: 8, display: "block" }}>
                      Favicon URL (Browser Tab Icon)
                    </label>
                    <input
                      value={settings.APP_FAVICON_URL}
                      onChange={(e) => updateSetting("APP_FAVICON_URL", e.target.value)}
                      placeholder="https://example.com/favicon.ico"
                      style={inputStyle}
                    />
                    <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 6 }}>
                      Recommended: Square image (32x32 or 64x64 pixels)
                    </p>
                    {settings.APP_FAVICON_URL && (
                      <div style={{ marginTop: 12, padding: 16, background: "var(--bg-input)", borderRadius: 8, display: "flex", alignItems: "center", gap: 16 }}>
                        <span style={{ fontSize: 12, color: "var(--text-muted)" }}>Preview:</span>
                        <img 
                          src={settings.APP_FAVICON_URL} 
                          alt="Favicon preview" 
                          style={{ width: 32, height: 32, borderRadius: 4, objectFit: "cover" }}
                          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Preview Card */}
              <div style={{ ...cardStyle, padding: 24, background: "linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)", border: "1px solid #bbf7d0" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <CheckCircle2 style={{ width: 24, height: 24, color: "#16a34a" }} />
                  <div>
                    <h4 style={{ fontSize: 14, fontWeight: 600, color: "#166534", margin: 0 }}>
                      Changes will apply immediately
                    </h4>
                    <p style={{ fontSize: 13, color: "#15803d", margin: "4px 0 0" }}>
                      Refresh the page after saving to see your new logo and favicon
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Social API Keys Tab */}
          {activeTab === "social" && (
            <div style={{ display: "grid", gap: 20 }}>
              <div style={{ ...cardStyle, padding: 24 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
                  <div style={{ width: 48, height: 48, borderRadius: 10, background: "#eff6ff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Globe style={{ width: 24, height: 24, color: "#3b82f6" }} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: 16, fontWeight: 600, color: "var(--text-primary)", margin: 0 }}>
                      Facebook API Credentials
                    </h3>
                    <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: "4px 0 0" }}>
                      Required for Facebook posting integration
                    </p>
                  </div>
                </div>

                <div style={{ display: "grid", gap: 16 }}>
                  <div>
                    <label style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", marginBottom: 8, display: "block" }}>
                      Facebook App ID
                    </label>
                    <input
                      value={settings.FACEBOOK_APP_ID}
                      onChange={(e) => updateSetting("FACEBOOK_APP_ID", e.target.value)}
                      placeholder="Enter your Facebook App ID..."
                      style={inputStyle}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", marginBottom: 8, display: "block" }}>
                      Facebook App Secret
                    </label>
                    <input
                      type="password"
                      value={settings.FACEBOOK_APP_SECRET}
                      onChange={(e) => updateSetting("FACEBOOK_APP_SECRET", e.target.value)}
                      placeholder="Enter your Facebook App Secret..."
                      style={inputStyle}
                    />
                  </div>
                </div>

                {/* Help Section */}
                <div style={{ marginTop: 24, borderTop: "1px solid var(--border-color)", paddingTop: 20 }}>
                  <button 
                    onClick={() => setShowFBSteps(!showFBSteps)}
                    style={{ 
                      background: "none", border: "none", color: "#2563eb", fontSize: 14, 
                      fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 6,
                      padding: 0
                    }}
                  >
                    {showFBSteps ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    How to get these credentials? (Step-by-step guide)
                  </button>

                  {showFBSteps && (
                    <div style={{ 
                      marginTop: 16, padding: 20, background: "var(--bg-input)", borderRadius: 12, 
                      border: "1px solid var(--border-color)", fontSize: 14, lineHeight: "1.6", color: "var(--text-secondary)"
                    }}>
                      <ol style={{ margin: 0, paddingLeft: 20, display: "grid", gap: 12 }}>
                        <li>
                          Go to the <b><a href="https://developers.facebook.com/" target="_blank" rel="noopener noreferrer" style={{ color: "#2563eb", textDecoration: "none" }}>Facebook Developers Portal <ExternalLink size={12} style={{ display: "inline" }} /></a></b> and log in with your Facebook account.
                        </li>
                        <li>
                          Click on <b>&quot;My Apps&quot;</b> in the top menu and then click the <b>&quot;Create App&quot;</b> button.
                        </li>
                        <li>
                          Select <b>&quot;Other&quot;</b> as the use case, then choose <b>&quot;Consumer&quot;</b> or <b>&quot;Business&quot;</b> depending on your needs.
                        </li>
                        <li>
                          Give your app a <b>Display Name</b> and click <b>&quot;Create App&quot;</b>.
                        </li>
                        <li>
                          In the App Dashboard, go to <b>App Settings &gt; Basic</b> in the left sidebar.
                        </li>
                        <li>
                          Here you will find your <b>App ID</b> and <b>App Secret</b>. Click &quot;Show&quot; to reveal the Secret.
                        </li>
                        <li>
                          <b>Crucial:</b> Scroll down on the same page, click <b>&quot;Add Platform&quot;</b>, select <b>&quot;Website&quot;</b>, and enter your site URL (<code>http://localhost:3000</code> or your production domain).
                        </li>
                        <li>
                          Go to <b>App Review &gt; Permissions and Features</b> and ensure you have access to <code>public_profile</code> and any other needed permissions.
                        </li>
                      </ol>
                      <div style={{ marginTop: 16, display: "flex", gap: 8, alignItems: "flex-start", padding: "12px 16px", background: "rgba(37, 99, 235, 0.05)", borderRadius: 8, border: "1px solid rgba(37, 99, 235, 0.1)" }}>
                        <Info size={18} style={{ color: "#2563eb", marginTop: 2, flexShrink: 0 }} />
                        <p style={{ margin: 0, fontSize: 13, color: "#1e40af" }}>
                          <b>Note:</b> Make sure to set your App Mode to <b>&quot;Live&quot;</b> in the top bar of the dashboard when you are ready for production.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
