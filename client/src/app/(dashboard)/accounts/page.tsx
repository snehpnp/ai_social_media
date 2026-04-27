"use client";

import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { toast, Toaster } from "react-hot-toast";
import {
  Camera, Globe, ExternalLink, CheckCircle2, XCircle, Loader2, Shield,
  Heart, MessageCircle, Share2, Clock,
} from "lucide-react";
import { CONFIG, getApiUrl } from "@/lib/config";
import { getToken } from "@/lib/auth";

const cardStyle: React.CSSProperties = {
  background: "var(--bg-card)", borderRadius: 12, border: "1px solid var(--border-color)",
  boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
};

const socialPlatforms = [
  { id: "instagram", name: "Instagram Business", desc: "Share photos, reels, and stories", icon: Camera, color: "#e1306c", bg: "#fdf2f8", bgHover: "#fce7f3" },
  { id: "facebook", name: "Facebook Page", desc: "Post to your business page", icon: Globe, color: "#1877f2", bg: "#eff6ff", bgHover: "#dbeafe" },
];

export default function AccountsPage() {
  const [activeTab, setActiveTab] = useState("facebook");
  const [connectedAccounts, setConnectedAccounts] = useState<any[]>([]);
  const [facebookPageInfo, setFacebookPageInfo] = useState<any>(null);
  const [loadingPageInfo, setLoadingPageInfo] = useState(false);
  const hasFetched = useRef(false);

  const fetchAccounts = async () => {
    try {
      const token = getToken();
      const res = await axios.get(getApiUrl(CONFIG.API.SOCIAL_ACCOUNTS), {
        headers: { Authorization: `Bearer ${token}` }
      });
      setConnectedAccounts(res.data);
      
      // If Facebook is connected, fetch page info
      const fbConnected = res.data.find((acc: any) => acc.platform === 'facebook');
      if (fbConnected) {
        fetchFacebookPageInfo();
      }
    } catch (err) {
      console.error("Failed to fetch accounts", err);
    }
  };

  const fetchFacebookPageInfo = async () => {
    setLoadingPageInfo(true);
    try {
      const token = getToken();
      const res = await axios.get(getApiUrl(CONFIG.API.FACEBOOK_PAGE_INFO), {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFacebookPageInfo(res.data);
    } catch (err: any) {
      console.error("Failed to fetch page info", err);
    } finally {
      setLoadingPageInfo(false);
    }
  };

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;

    fetchAccounts();

    // Check for success/error from OAuth redirect
    const params = new URLSearchParams(window.location.search);
    if (params.get("success") === "facebook_connected") {
      toast.success("Facebook connected successfully!");
      window.history.replaceState({}, document.title, CONFIG.FRONTEND.ACCOUNTS);
    } else if (params.get("error")) {
      toast.error("Failed to connect account");
      window.history.replaceState({}, document.title, CONFIG.FRONTEND.ACCOUNTS);
    }
  }, []);

  const handleConnect = (platformId: string) => {
    if (platformId === "facebook") {
      const token = getToken();
      window.location.href = `${getApiUrl(CONFIG.API.FACEBOOK_AUTH)}?token=${token}`;
    } else if (platformId === "instagram") {
      toast.error("Instagram integration coming soon!");
    }
  };

  const handleDisconnect = async (platformId: string) => {
    if (!confirm(`Disconnect ${platformId}?`)) return;
    try {
      const token = getToken();
      await axios.delete(getApiUrl(CONFIG.API.DELETE_ACCOUNT(platformId)), {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Account disconnected");
      fetchAccounts();
      if (platformId === "facebook") {
        setFacebookPageInfo(null);
      }
    } catch (err) {
      toast.error("Failed to disconnect");
    }
  };

  const tabs = [
    { id: "facebook", label: "Facebook", icon: Globe },
    { id: "instagram", label: "Instagram", icon: Camera },
  ];

  return (
    <div>
      <Toaster position="top-right" />

      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>Social Accounts</h1>
        <p style={{ fontSize: 13, color: "var(--text-secondary)", marginTop: 4 }}>Connect and manage your social media accounts.</p>
      </div>

      {/* Platform Tabs */}
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

      {/* ── Facebook Tab ── */}
      {activeTab === "facebook" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {(() => {
            const platform = socialPlatforms.find(p => p.id === "facebook");
            const connectedInfo = connectedAccounts.find(acc => acc.platform === "facebook");
            const isConnected = !!connectedInfo;

            return (
              <div style={{
                ...cardStyle, padding: "20px 24px",
                display: "flex", alignItems: "center", gap: 16,
              }}>
                <div style={{
                  width: 52, height: 52, borderRadius: 14, background: platform?.bg,
                  display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                }}>
                  <Globe style={{ width: 24, height: 24, color: platform?.color }} />
                </div>

                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 15, fontWeight: 600, color: "var(--text-primary)", margin: 0 }}>{platform?.name}</p>
                  <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>{platform?.desc}</p>
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
                    onClick={() => handleDisconnect("facebook")}
                    style={{
                      height: 38, padding: "0 20px", borderRadius: 8,
                      background: "#fef2f2", color: "#ef4444", border: "1px solid #fecaca",
                      fontSize: 13, fontWeight: 600, cursor: "pointer",
                      display: "flex", alignItems: "center", gap: 6,
                    }}
                  >
                    Disconnect
                  </button>
                ) : (
                  <button 
                    onClick={() => handleConnect("facebook")}
                    style={{
                      height: 38, padding: "0 20px", borderRadius: 8,
                      background: platform?.color, color: "#fff",
                      fontSize: 13, fontWeight: 600, border: "none", cursor: "pointer",
                      display: "flex", alignItems: "center", gap: 6,
                      transition: "opacity 0.15s",
                    }}
                  >
                    <ExternalLink style={{ width: 14, height: 14 }} />
                    Connect
                  </button>
                )}
              </div>
            );
          })()}

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

          {/* Facebook Page Info Card */}
          {facebookPageInfo && facebookPageInfo.page && (
            <div style={{
              ...cardStyle, padding: 24, marginTop: 8,
              background: "var(--bg-card)",
              border: "1px solid var(--border-color)",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
                <div style={{
                  width: 48, height: 48, borderRadius: 12, background: "#1877f2",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  boxShadow: "0 4px 12px rgba(24, 119, 242, 0.3)",
                }}>
                  <Globe style={{ width: 24, height: 24, color: "white" }} />
                </div>
                <div>
                  <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>
                    Connected Facebook Page
                  </h3>
                  <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: "4px 0 0" }}>
                    Your posts will be published here
                  </p>
                </div>
              </div>

              <div style={{
                display: "flex",
                alignItems: "center",
                gap: 16,
                padding: 16,
                background: "var(--bg-card)",
                borderRadius: 12,
                border: "1px solid var(--border-color)",
              }}>
                {facebookPageInfo.page.picture ? (
                  <img 
                    src={facebookPageInfo.page.picture} 
                    alt={facebookPageInfo.page.name}
                    style={{ width: 64, height: 64, borderRadius: 12, objectFit: "cover" }}
                  />
                ) : (
                  <div style={{
                    width: 64, height: 64, borderRadius: 12, background: "#f3f4f6",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <Globe style={{ width: 28, height: 28, color: "#9ca3af" }} />
                  </div>
                )}
                <div style={{ flex: 1 }}>
                  <h4 style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>
                    {facebookPageInfo.page.name}
                  </h4>
                  <p style={{ fontSize: 12, color: "var(--text-muted)", margin: "4px 0 0" }}>
                    {facebookPageInfo.page.category}
                  </p>
                </div>
              </div>

              {/* Page Stats */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 12, marginTop: 16 }}>
                <div style={{
                  padding: 16, background: "var(--bg-card)", borderRadius: 10, textAlign: "center",
                  border: "1px solid var(--border-color)",
                }}>
                  <p style={{ fontSize: 22, fontWeight: 800, color: "#1877f2", margin: 0 }}>
                    {facebookPageInfo.page.likes?.toLocaleString() || 0}
                  </p>
                  <p style={{ fontSize: 11, color: "var(--text-muted)", margin: "4px 0 0", textTransform: "uppercase", letterSpacing: "0.05em" }}>Likes</p>
                </div>
                <div style={{
                  padding: 16, background: "var(--bg-card)", borderRadius: 10, textAlign: "center",
                  border: "1px solid var(--border-color)",
                }}>
                  <p style={{ fontSize: 22, fontWeight: 800, color: "#16a34a", margin: 0 }}>
                    {facebookPageInfo.page.followers?.toLocaleString() || 0}
                  </p>
                  <p style={{ fontSize: 11, color: "var(--text-muted)", margin: "4px 0 0", textTransform: "uppercase", letterSpacing: "0.05em" }}>Followers</p>
                </div>
                <div style={{
                  padding: 16, background: "var(--bg-card)", borderRadius: 10, textAlign: "center",
                  border: "1px solid var(--border-color)",
                }}>
                  <p style={{ fontSize: 22, fontWeight: 800, color: "#8b5cf6", margin: 0 }}>
                    {facebookPageInfo.page.posts?.toLocaleString() || 0}
                  </p>
                  <p style={{ fontSize: 11, color: "var(--text-muted)", margin: "4px 0 0", textTransform: "uppercase", letterSpacing: "0.05em" }}>Posts</p>
                </div>
                <div style={{
                  padding: 16, background: "var(--bg-card)", borderRadius: 10, textAlign: "center",
                  border: "1px solid var(--border-color)",
                }}>
                  <p style={{ fontSize: 22, fontWeight: 800, color: "#f59e0b", margin: 0 }}>
                    {facebookPageInfo.page.talking_about?.toLocaleString() || 0}
                  </p>
                  <p style={{ fontSize: 11, color: "var(--text-muted)", margin: "4px 0 0", textTransform: "uppercase", letterSpacing: "0.05em" }}>Talking</p>
                </div>
                <div style={{
                  padding: 16, background: "var(--bg-card)", borderRadius: 10, textAlign: "center",
                  border: "1px solid var(--border-color)",
                }}>
                  <p style={{ fontSize: 11, color: "var(--text-secondary)", margin: 0, fontWeight: 600 }}>
                    Connected
                  </p>
                  <p style={{ fontSize: 11, color: "var(--text-muted)", margin: "4px 0 0" }}>
                    {new Date(facebookPageInfo.account.connectedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Additional Real-time Info */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginTop: 12 }}>
                <div style={{
                  padding: 12, background: "var(--bg-card)", borderRadius: 8, textAlign: "center",
                  border: "1px solid var(--border-color)",
                }}>
                  <p style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)", margin: 0 }}>
                    {facebookPageInfo.page.verified ? "✓ Verified" : "Not Verified"}
                  </p>
                  <p style={{ fontSize: 10, color: "var(--text-muted)", margin: "4px 0 0" }}>Page Status</p>
                </div>
                <div style={{
                  padding: 12, background: "var(--bg-card)", borderRadius: 8, textAlign: "center",
                  border: "1px solid var(--border-color)",
                }}>
                  <p style={{ fontSize: 16, fontWeight: 700, color: "#ec4899", margin: 0 }}>
                    {facebookPageInfo.page.new_likes?.toLocaleString() || 0}
                  </p>
                  <p style={{ fontSize: 10, color: "var(--text-muted)", margin: "4px 0 0" }}>New Likes</p>
                </div>
                <div style={{
                  padding: 12, background: "var(--bg-card)", borderRadius: 8, textAlign: "center",
                  border: "1px solid var(--border-color)",
                }}>
                  <p style={{ fontSize: 16, fontWeight: 700, color: "#06b6d4", margin: 0 }}>
                    {facebookPageInfo.page.unread_messages?.toLocaleString() || 0}
                  </p>
                  <p style={{ fontSize: 10, color: "var(--text-muted)", margin: "4px 0 0" }}>Unread Messages</p>
                </div>
              </div>

              {/* View Page Link */}
              <a 
                href={facebookPageInfo.page.link} 
                target="_blank" 
                rel="noreferrer"
                style={{
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  marginTop: 16, padding: 12, background: "#1877f2", color: "white",
                  borderRadius: 10, textDecoration: "none", fontSize: 14, fontWeight: 600,
                }}
              >
                <Globe style={{ width: 16, height: 16 }} />
                View Facebook Page
              </a>

              {/* Recent Posts */}
              {facebookPageInfo.page.recent_posts && facebookPageInfo.page.recent_posts.length > 0 && (
                <div style={{ marginTop: 20 }}>
                  <h4 style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)", margin: "0 0 12px" }}>
                    Recent Posts
                  </h4>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {facebookPageInfo.page.recent_posts.map((post: any) => (
                      <div key={post.id} style={{
                        padding: 14, background: "var(--bg-card)", borderRadius: 8,
                        border: "1px solid var(--border-color)",
                      }}>
                        <p style={{ 
                          fontSize: 13, color: "var(--text-primary)", margin: "0 0 10px",
                          overflow: "hidden", textOverflow: "ellipsis", display: "-webkit-box",
                          WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
                        }}>
                          {post.message || "No message"}
                        </p>
                        <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                            <Heart style={{ width: 14, height: 14, color: "#ec4899" }} />
                            <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>
                              {post.likes?.summary?.total_count || 0}
                            </span>
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                            <MessageCircle style={{ width: 14, height: 14, color: "#3b82f6" }} />
                            <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>
                              {post.comments?.summary?.total_count || 0}
                            </span>
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                            <Share2 style={{ width: 14, height: 14, color: "#8b5cf6" }} />
                            <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>
                              {post.shares || 0}
                            </span>
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: 4, marginLeft: "auto" }}>
                            <Clock style={{ width: 14, height: 14, color: "#6b7280" }} />
                            <span style={{ fontSize: 11, color: "var(--text-muted)" }}>
                              {new Date(post.created_time).toLocaleString()}
                            </span>
                          </div>
                        </div>
                        {post.permalink_url && (
                          <a 
                            href={post.permalink_url} 
                            target="_blank" 
                            rel="noreferrer"
                            style={{
                              display: "inline-flex", alignItems: "center", gap: 4,
                              marginTop: 10, fontSize: 12, color: "#1877f2", textDecoration: "none",
                              fontWeight: 500,
                            }}
                          >
                            <ExternalLink style={{ width: 12, height: 12 }} />
                            View on Facebook
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Loading state */}
          {loadingPageInfo && (
            <div style={{ 
              ...cardStyle, padding: 24, textAlign: "center",
              background: "linear-gradient(135deg, #eff6ff 0%, #ffffff 100%)",
            }}>
              <Loader2 style={{ width: 28, height: 28, color: "#1877f2", animation: "spin 1s linear infinite", margin: "0 auto" }} />
              <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: "12px 0 0" }}>Loading page info...</p>
            </div>
          )}
        </div>
      )}

      {/* ── Instagram Tab ── */}
      {activeTab === "instagram" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {(() => {
            const platform = socialPlatforms.find(p => p.id === "instagram");
            const connectedInfo = connectedAccounts.find(acc => acc.platform === "instagram");
            const isConnected = !!connectedInfo;

            return (
              <div style={{
                ...cardStyle, padding: "20px 24px",
                display: "flex", alignItems: "center", gap: 16,
              }}>
                <div style={{
                  width: 52, height: 52, borderRadius: 14, background: platform?.bg,
                  display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                }}>
                  <Camera style={{ width: 24, height: 24, color: platform?.color }} />
                </div>

                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 15, fontWeight: 600, color: "var(--text-primary)", margin: 0 }}>{platform?.name}</p>
                  <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>{platform?.desc}</p>
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
                    onClick={() => handleDisconnect("instagram")}
                    style={{
                      height: 38, padding: "0 20px", borderRadius: 8,
                      background: "#fef2f2", color: "#ef4444", border: "1px solid #fecaca",
                      fontSize: 13, fontWeight: 600, cursor: "pointer",
                      display: "flex", alignItems: "center", gap: 6,
                    }}
                  >
                    Disconnect
                  </button>
                ) : (
                  <button 
                    onClick={() => handleConnect("instagram")}
                    style={{
                      height: 38, padding: "0 20px", borderRadius: 8,
                      background: platform?.color, color: "#fff",
                      fontSize: 13, fontWeight: 600, border: "none", cursor: "pointer",
                      display: "flex", alignItems: "center", gap: 6,
                      transition: "opacity 0.15s",
                    }}
                  >
                    <ExternalLink style={{ width: 14, height: 14 }} />
                    Connect
                  </button>
                )}
              </div>
            );
          })()}

          {/* Info banner */}
          <div style={{
            borderRadius: 12, background: "#f0fdf4", border: "1px solid #bbf7d0",
            padding: "16px 20px", display: "flex", alignItems: "center", gap: 12,
          }}>
            <Shield style={{ width: 18, height: 18, color: "var(--primary-color)", flexShrink: 0 }} />
            <p style={{ fontSize: 12, color: "#15803d", margin: 0 }}>
              Instagram integration coming soon! We're working on bringing you the best experience for managing your Instagram business account.
            </p>
          </div>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
