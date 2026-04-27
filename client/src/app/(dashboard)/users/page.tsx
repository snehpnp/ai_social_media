"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast, Toaster } from "react-hot-toast";
import { CONFIG, getApiUrl } from "@/lib/config";
import { UserPlus, Search, Pencil, Trash2, Loader2, Eye, X, FileText, Clock, Sparkles, Calendar, MessageSquare, Image as ImageIcon, Send, AlertCircle, CheckCircle2 } from "lucide-react";

const API = getApiUrl(CONFIG.API.ADMIN_SETTINGS);
const POSTS_API = getApiUrl(CONFIG.API.POSTS);
function getToken() { return localStorage.getItem("token") || ""; }
function authHeader() { return { headers: { Authorization: `Bearer ${getToken()}` } }; }

const cardStyle: React.CSSProperties = {
  background: "var(--bg-card)", borderRadius: 12, border: "1px solid var(--border-color)",
  boxShadow: "0 1px 3px rgba(0,0,0,0.04)", overflow: "hidden",
};
const inputStyle: React.CSSProperties = {
  width: "100%", height: 42, borderRadius: 8, border: "1px solid var(--border-color)",
  padding: "0 14px", fontSize: 14, outline: "none", background: "var(--bg-input)", color: "var(--text-primary)",
};
const selectStyle: React.CSSProperties = {
  ...inputStyle, appearance: "auto" as any,
};
const btnPrimary: React.CSSProperties = {
  height: 40, borderRadius: 8, background: "#16a34a", color: "#fff",
  fontSize: 13, fontWeight: 600, border: "none", cursor: "pointer", padding: "0 16px",
  display: "inline-flex", alignItems: "center", gap: 8,
};
const btnGhost: React.CSSProperties = {
  width: 32, height: 32, borderRadius: 8, display: "inline-flex",
  alignItems: "center", justifyContent: "center",
  background: "none", border: "none", cursor: "pointer",
};
const badgeStyle = (color: string, bg: string): React.CSSProperties => ({
  padding: "4px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600, textTransform: "uppercase",
  background: bg, color, display: "inline-flex", alignItems: "center", gap: 4,
});

/* ── Modal ── */
function Modal({ open, onClose, children, wide = false }: { open: boolean; onClose: () => void; children: React.ReactNode; wide?: boolean }) {
  if (!open) return null;
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div onClick={onClose} style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }} />
      <div style={{ position: "relative", background: "var(--bg-card)", borderRadius: 20, padding: 0, width: wide ? 700 : 420, maxHeight: "90vh", overflowY: "auto", boxShadow: "0 25px 80px rgba(0,0,0,0.25)", border: "1px solid var(--border-color)" }}>
        {children}
      </div>
    </div>
  );
}

export default function UserManagementPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [userPosts, setUserPosts] = useState<any[]>([]);
  const [postsLoading, setPostsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "posts" | "drafts" | "ai">("overview");
  const empty = { name: "", email: "", password: "", role: "USER", plan: "FREE" };
  const [form, setForm] = useState(empty);

  const fetchUsers = async () => {
    setLoading(true);
    try { const r = await axios.get(API, authHeader()); setUsers(r.data); }
    catch { toast.error("Could not load users"); }
    finally { setLoading(false); }
  };
  useEffect(() => { fetchUsers(); }, []);

  const fetchUserPosts = async (userId: string) => {
    setPostsLoading(true);
    try {
      // Using admin endpoint to fetch any user's posts
      const r = await axios.get(`${API}/${userId}/posts`, authHeader());
      setUserPosts(r.data || []);
    } catch {
      // Fallback: fetch all posts and filter
      try {
        const r = await axios.get(POSTS_API, authHeader());
        const allPosts = r.data || [];
        setUserPosts(allPosts.filter((p: any) => p.userId === userId));
      } catch {
        setUserPosts([]);
      }
    } finally {
      setPostsLoading(false);
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    try { await axios.post(API, form, authHeader()); toast.success("User created"); setAddOpen(false); setForm(empty); fetchUsers(); }
    catch (err: any) { toast.error(err.response?.data?.message || "Error"); }
    finally { setSaving(false); }
  };
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    try { await axios.put(`${API}/${selectedUser.id}`, form, authHeader()); toast.success("User updated"); setEditOpen(false); fetchUsers(); }
    catch (err: any) { toast.error(err.response?.data?.message || "Error"); }
    finally { setSaving(false); }
  };
  const handleDelete = async (id: string) => {
    if (!confirm("Delete this user permanently?")) return;
    try { await axios.delete(`${API}/${id}`, authHeader()); toast.success("User deleted"); fetchUsers(); }
    catch { toast.error("Delete failed"); }
  };
  const openEdit = (u: any) => { setSelectedUser(u); setForm({ name: u.name, email: u.email, password: "", role: u.role, plan: u.plan }); setEditOpen(true); };
  const openView = (u: any) => {
    setSelectedUser(u);
    setActiveTab("overview");
    fetchUserPosts(u.id);
    setViewOpen(true);
  };

  // Only show regular users (not admins)
  const regularUsers = users.filter((u: any) => u.role === "USER");
  const filtered = regularUsers.filter((u: any) =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  const publishedPosts = userPosts.filter((p: any) => p.status === "PUBLISHED");
  const draftPosts = userPosts.filter((p: any) => p.status === "DRAFT");
  const scheduledPosts = userPosts.filter((p: any) => p.status === "SCHEDULED");
  const failedPosts = userPosts.filter((p: any) => p.status === "FAILED");

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "PUBLISHED": return <CheckCircle2 style={{ width: 14, height: 14, color: "#22c55e" }} />;
      case "DRAFT": return <FileText style={{ width: 14, height: 14, color: "#6b7280" }} />;
      case "SCHEDULED": return <Clock style={{ width: 14, height: 14, color: "#3b82f6" }} />;
      case "FAILED": return <AlertCircle style={{ width: 14, height: 14, color: "#ef4444" }} />;
      default: return <FileText style={{ width: 14, height: 14, color: "#6b7280" }} />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PUBLISHED": return { bg: "#dcfce7", color: "#166534" };
      case "DRAFT": return { bg: "#f3f4f6", color: "#374151" };
      case "SCHEDULED": return { bg: "#dbeafe", color: "#1e40af" };
      case "FAILED": return { bg: "#fee2e2", color: "#991b1b" };
      default: return { bg: "#f3f4f6", color: "#374151" };
    }
  };

  return (
    <div>
      <Toaster position="top-right" />

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>User Management</h1>
          <p style={{ fontSize: 14, color: "var(--text-secondary)", marginTop: 6 }}>Manage platform users and their activities</p>
        </div>
        <button onClick={() => { setForm(empty); setAddOpen(true); }} style={btnPrimary}>
          <UserPlus style={{ width: 16, height: 16 }} /> Add User
        </button>
      </div>

      {/* Stats Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 24 }}>
        {[
          { label: "Total Users", value: regularUsers.length, icon: <UserPlus style={{ width: 20, height: 20 }} />, color: "#16a34a" },
          { label: "PRO Plan", value: regularUsers.filter((u: any) => u.plan === "PRO").length, icon: <Sparkles style={{ width: 20, height: 20 }} />, color: "#8b5cf6" },
          { label: "AI Usage", value: regularUsers.reduce((acc: number, u: any) => acc + (u.aiUsageCount || 0), 0), icon: <MessageSquare style={{ width: 20, height: 20 }} />, color: "#3b82f6" },
          { label: "Active Today", value: regularUsers.filter((u: any) => u.aiUsageCount > 0).length, icon: <CheckCircle2 style={{ width: 20, height: 20 }} />, color: "#f59e0b" },
        ].map((stat, i) => (
          <div key={i} style={{ background: "var(--bg-card)", borderRadius: 12, padding: 20, border: "1px solid var(--border-color)", display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: `${stat.color}15`, display: "flex", alignItems: "center", justifyContent: "center", color: stat.color }}>
              {stat.icon}
            </div>
            <div>
              <p style={{ fontSize: 24, fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>{stat.value}</p>
              <p style={{ fontSize: 12, color: "var(--text-secondary)", margin: "4px 0 0", textTransform: "uppercase", letterSpacing: "0.05em" }}>{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div style={{ ...cardStyle, marginBottom: 0 }}>
        <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--border-color)", display: "flex", gap: 12, alignItems: "center" }}>
          <div style={{ position: "relative", flex: 1, maxWidth: 400 }}>
            <Search style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", width: 18, height: 18, color: "var(--text-muted)" }} />
            <input
              placeholder="Search users by name or email..."
              value={search} onChange={(e) => setSearch(e.target.value)}
              style={{ ...inputStyle, paddingLeft: 44, height: 42, fontSize: 14 }}
            />
          </div>
          <button onClick={fetchUsers} style={{ ...btnGhost, background: "var(--bg-hover)", color: "var(--text-secondary)", borderRadius: 10, width: "auto", padding: "0 16px", height: 42, fontSize: 13, fontWeight: 500, border: "1px solid var(--border-color)" }}>
            Refresh
          </button>
        </div>

        {/* Table */}
        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: "80px 0" }}>
            <Loader2 style={{ width: 32, height: 32, color: "var(--primary-color)", animation: "spin 1s linear infinite" }} />
          </div>
        ) : (
          <table style={{ width: "100%", fontSize: 14, borderCollapse: "separate", borderSpacing: 0 }}>
            <thead>
              <tr>
                {["User", "Plan", "AI Usage", "Status", "Joined", "Actions"].map((h, i) => (
                  <th key={h} style={{
                    textAlign: i === 5 ? "right" : "left",
                    padding: "16px 24px",
                    fontSize: 11,
                    fontWeight: 600,
                    color: "var(--text-secondary)",
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    borderBottom: "2px solid var(--border-color)",
                    background: "var(--bg-input)"
                  }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: "60px 24px", textAlign: "center", color: "var(--text-muted)" }}>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
                      <div style={{ width: 64, height: 64, borderRadius: "50%", background: "var(--bg-hover)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Search style={{ width: 28, height: 28, color: "var(--text-muted)" }} />
                      </div>
                      <p style={{ fontSize: 15, fontWeight: 500, margin: 0 }}>No users found</p>
                      <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: 0 }}>Try adjusting your search criteria</p>
                    </div>
                  </td>
                </tr>
              ) : filtered.map((u: any, idx: number) => (
                <tr key={u.id} style={{
                  background: idx % 2 === 0 ? "var(--bg-card)" : "var(--bg-input)",
                  transition: "background 0.15s ease"
                }}>
                  <td style={{ padding: "18px 24px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                      <img src={`https://ui-avatars.com/api/?name=${u.name}&background=16a34a&color=fff&size=40`} alt="" style={{ width: 40, height: 40, borderRadius: 10, boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }} />
                      <div>
                        <p style={{ fontWeight: 600, color: "var(--text-primary)", margin: 0, fontSize: 14 }}>{u.name}</p>
                        <p style={{ fontSize: 12, color: "var(--text-muted)", margin: "4px 0 0" }}>{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: "18px 24px" }}>
                    <span style={badgeStyle(
                      u.plan === "PRO" ? "#7c3aed" : u.plan === "BASIC" ? "#0369a1" : "#6b7280",
                      u.plan === "PRO" ? "#faf5ff" : u.plan === "BASIC" ? "#e0f2fe" : "#f3f4f6"
                    )}>
                      {u.plan}
                    </span>
                  </td>
                  <td style={{ padding: "18px 24px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <Sparkles style={{ width: 16, height: 16, color: "#3b82f6" }} />
                      <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>{u.aiUsageCount ?? 0}</span>
                    </div>
                  </td>
                  <td style={{ padding: "18px 24px" }}>
                    <span style={badgeStyle("#16a34a", "#f0fdf4")}>
                      <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#22c55e" }} />
                      Active
                    </span>
                  </td>
                  <td style={{ padding: "18px 24px", color: "var(--text-secondary)", fontSize: 13 }}>
                    {new Date(u.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </td>
                  <td style={{ padding: "18px 24px", textAlign: "right" }}>
                    <div style={{ display: "flex", justifyContent: "flex-end", gap: 6 }}>
                      <button onClick={() => openView(u)} style={{ ...btnGhost, color: "#3b82f6", background: "#eff6ff", borderRadius: 8, width: 34, height: 34 }} title="View Details">
                        <Eye style={{ width: 16, height: 16 }} />
                      </button>
                      <button onClick={() => openEdit(u)} style={{ ...btnGhost, color: "#16a34a", background: "#f0fdf4", borderRadius: 8, width: 34, height: 34 }} title="Edit User">
                        <Pencil style={{ width: 16, height: 16 }} />
                      </button>
                      <button onClick={() => handleDelete(u.id)} style={{ ...btnGhost, color: "#ef4444", background: "#fef2f2", borderRadius: 8, width: 34, height: 34 }} title="Delete User">
                        <Trash2 style={{ width: 16, height: 16 }} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ── Add Modal ── */}
      <Modal open={addOpen} onClose={() => setAddOpen(false)}>
        <div style={{ padding: 28 }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: "var(--text-primary)", margin: "0 0 4px" }}>Add New User</h2>
          <p style={{ fontSize: 14, color: "var(--text-secondary)", marginBottom: 24 }}>Fill in the details below to create a new user.</p>
          <form onSubmit={handleAdd} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <input placeholder="Full Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required style={inputStyle} />
            <input placeholder="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required style={inputStyle} />
            <input placeholder="Password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required style={inputStyle} />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} style={selectStyle}>
                <option value="USER">User</option>
                <option value="ADMIN">Admin</option>
              </select>
              <select value={form.plan} onChange={(e) => setForm({ ...form, plan: e.target.value })} style={selectStyle}>
                <option value="FREE">Free</option>
                <option value="BASIC">Basic</option>
                <option value="PRO">Pro</option>
              </select>
            </div>
            <button type="submit" disabled={saving} style={{ ...btnPrimary, width: "100%", justifyContent: "center", marginTop: 8, height: 44 }}>
              {saving ? "Creating..." : "Create User"}
            </button>
          </form>
        </div>
      </Modal>

      {/* ── Edit Modal ── */}
      <Modal open={editOpen} onClose={() => setEditOpen(false)}>
        <div style={{ padding: 28 }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: "var(--text-primary)", margin: "0 0 4px" }}>Edit User</h2>
          <p style={{ fontSize: 14, color: "var(--text-secondary)", marginBottom: 24 }}>Update user details and permissions.</p>
          <form onSubmit={handleUpdate} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <input placeholder="Full Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required style={inputStyle} />
            <input placeholder="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required style={inputStyle} />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} style={selectStyle}>
                <option value="USER">User</option>
                <option value="ADMIN">Admin</option>
              </select>
              <select value={form.plan} onChange={(e) => setForm({ ...form, plan: e.target.value })} style={selectStyle}>
                <option value="FREE">Free</option>
                <option value="BASIC">Basic</option>
                <option value="PRO">Pro</option>
              </select>
            </div>
            <button type="submit" disabled={saving} style={{ ...btnPrimary, width: "100%", justifyContent: "center", marginTop: 8, height: 44 }}>
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </form>
        </div>
      </Modal>

      {/* ── View Modal (Wide) ── */}
      <Modal open={viewOpen} onClose={() => setViewOpen(false)} wide>
        {selectedUser && (
          <div>
            {/* Header */}
            <div style={{ padding: "24px 28px", borderBottom: "1px solid var(--border-color)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <img src={`https://ui-avatars.com/api/?name=${selectedUser.name}&background=16a34a&color=fff&size=64`} alt="" style={{ width: 64, height: 64, borderRadius: 14, boxShadow: "0 4px 12px rgba(0,0,0,0.15)" }} />
                <div>
                  <p style={{ fontSize: 22, fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>{selectedUser.name}</p>
                  <p style={{ fontSize: 14, color: "var(--text-secondary)", margin: "6px 0 0" }}>{selectedUser.email}</p>
                  <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                    <span style={badgeStyle(
                      selectedUser.plan === "PRO" ? "#7c3aed" : selectedUser.plan === "BASIC" ? "#0369a1" : "#6b7280",
                      selectedUser.plan === "PRO" ? "#faf5ff" : selectedUser.plan === "BASIC" ? "#e0f2fe" : "#f3f4f6"
                    )}>{selectedUser.plan} Plan</span>
                    <span style={badgeStyle("#16a34a", "#f0fdf4")}>Active</span>
                  </div>
                </div>
              </div>
              <button onClick={() => setViewOpen(false)} style={{ ...btnGhost, color: "var(--text-muted)", width: 36, height: 36, background: "var(--bg-hover)", borderRadius: 10 }}>
                <X style={{ width: 20, height: 20 }} />
              </button>
            </div>

            {/* Tabs */}
            <div style={{ display: "flex", borderBottom: "1px solid var(--border-color)", padding: "0 28px" }}>
              {[
                { id: "overview", label: "Overview", icon: <Eye style={{ width: 16, height: 16 }} /> },
                { id: "posts", label: `Posts (${publishedPosts.length})`, icon: <Send style={{ width: 16, height: 16 }} /> },
                { id: "drafts", label: `Drafts (${draftPosts.length})`, icon: <FileText style={{ width: 16, height: 16 }} /> },
                { id: "ai", label: "AI Usage", icon: <Sparkles style={{ width: 16, height: 16 }} /> },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  style={{
                    padding: "16px 20px",
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
                    transition: "all 0.2s ease"
                  }}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Content */}
            <div style={{ padding: "24px 28px", maxHeight: "50vh", overflowY: "auto" }}>
              {activeTab === "overview" && (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16 }}>
                  {[
                    { label: "AI Usage Count", value: selectedUser.aiUsageCount ?? 0, icon: <Sparkles style={{ width: 20, height: 20, color: "#3b82f6" }} />, bg: "#eff6ff" },
                    { label: "Total Posts", value: userPosts.length, icon: <Send style={{ width: 20, height: 20, color: "#16a34a" }} />, bg: "#f0fdf4" },
                    { label: "Published", value: publishedPosts.length, icon: <CheckCircle2 style={{ width: 20, height: 20, color: "#22c55e" }} />, bg: "#dcfce7" },
                    { label: "Drafts", value: draftPosts.length, icon: <FileText style={{ width: 20, height: 20, color: "#6b7280" }} />, bg: "#f3f4f6" },
                    { label: "Scheduled", value: scheduledPosts.length, icon: <Clock style={{ width: 20, height: 20, color: "#3b82f6" }} />, bg: "#dbeafe" },
                    { label: "Failed", value: failedPosts.length, icon: <AlertCircle style={{ width: 20, height: 20, color: "#ef4444" }} />, bg: "#fee2e2" },
                    { label: "Member Since", value: new Date(selectedUser.createdAt).toLocaleDateString(), icon: <Calendar style={{ width: 20, height: 20, color: "#8b5cf6" }} />, bg: "#faf5ff" },
                    { label: "Plan", value: selectedUser.plan, icon: <Sparkles style={{ width: 20, height: 20, color: "#f59e0b" }} />, bg: "#fef3c7" },
                  ].map((item, i) => (
                    <div key={i} style={{ padding: 20, background: "var(--bg-input)", borderRadius: 12, border: "1px solid var(--border-color)", display: "flex", alignItems: "center", gap: 16 }}>
                      <div style={{ width: 44, height: 44, borderRadius: 10, background: item.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        {item.icon}
                      </div>
                      <div>
                        <p style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", margin: 0 }}>{item.label}</p>
                        <p style={{ fontSize: 20, fontWeight: 700, color: "var(--text-primary)", margin: "6px 0 0" }}>{item.value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === "posts" && (
                <div>
                  {postsLoading ? (
                    <div style={{ display: "flex", justifyContent: "center", padding: "40px 0" }}>
                      <Loader2 style={{ width: 28, height: 28, color: "var(--primary-color)", animation: "spin 1s linear infinite" }} />
                    </div>
                  ) : publishedPosts.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "40px 0", color: "var(--text-muted)" }}>
                      <Send style={{ width: 48, height: 48, marginBottom: 16, opacity: 0.5 }} />
                      <p style={{ fontSize: 15, fontWeight: 500 }}>No published posts yet</p>
                    </div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                      {publishedPosts.map((post: any) => (
                        <div key={post.id} style={{ padding: 16, background: "var(--bg-input)", borderRadius: 12, border: "1px solid var(--border-color)" }}>
                          <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                            {post.mediaUrls && post.mediaUrls.length > 0 ? (
                              <div style={{ width: 60, height: 60, borderRadius: 8, background: "#e5e7eb", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", flexShrink: 0 }}>
                                <ImageIcon style={{ width: 24, height: 24, color: "#9ca3af" }} />
                              </div>
                            ) : (
                              <div style={{ width: 60, height: 60, borderRadius: 8, background: "#f3f4f6", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                <MessageSquare style={{ width: 24, height: 24, color: "#9ca3af" }} />
                              </div>
                            )}
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                                <span style={{ ...badgeStyle("#166534", "#dcfce7") }}>
                                  <CheckCircle2 style={{ width: 12, height: 12 }} />
                                  Published
                                </span>
                                <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
                                  {new Date(post.publishedAt || post.createdAt).toLocaleString()}
                                </span>
                              </div>
                              <p style={{ margin: 0, fontSize: 14, color: "var(--text-primary)", lineHeight: 1.5, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                                {post.caption || "No caption"}
                              </p>
                              {post.platforms && post.platforms.length > 0 && (
                                <div style={{ display: "flex", gap: 6, marginTop: 10, flexWrap: "wrap" }}>
                                  {post.platforms.map((p: string) => (
                                    <span key={p} style={{ fontSize: 11, padding: "4px 10px", background: "var(--bg-card)", borderRadius: 6, color: "var(--text-secondary)", textTransform: "capitalize" }}>
                                      {p}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === "drafts" && (
                <div>
                  {postsLoading ? (
                    <div style={{ display: "flex", justifyContent: "center", padding: "40px 0" }}>
                      <Loader2 style={{ width: 28, height: 28, color: "var(--primary-color)", animation: "spin 1s linear infinite" }} />
                    </div>
                  ) : draftPosts.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "40px 0", color: "var(--text-muted)" }}>
                      <FileText style={{ width: 48, height: 48, marginBottom: 16, opacity: 0.5 }} />
                      <p style={{ fontSize: 15, fontWeight: 500 }}>No draft posts</p>
                    </div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                      {draftPosts.map((post: any) => (
                        <div key={post.id} style={{ padding: 16, background: "var(--bg-input)", borderRadius: 12, border: "1px solid var(--border-color)" }}>
                          <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                            {post.mediaUrls && post.mediaUrls.length > 0 ? (
                              <div style={{ width: 60, height: 60, borderRadius: 8, background: "#e5e7eb", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", flexShrink: 0 }}>
                                <ImageIcon style={{ width: 24, height: 24, color: "#9ca3af" }} />
                              </div>
                            ) : (
                              <div style={{ width: 60, height: 60, borderRadius: 8, background: "#f3f4f6", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                <FileText style={{ width: 24, height: 24, color: "#9ca3af" }} />
                              </div>
                            )}
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                                <span style={{ ...badgeStyle("#374151", "#f3f4f6") }}>
                                  <FileText style={{ width: 12, height: 12 }} />
                                  Draft
                                </span>
                                <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
                                  {new Date(post.createdAt).toLocaleString()}
                                </span>
                              </div>
                              <p style={{ margin: 0, fontSize: 14, color: "var(--text-primary)", lineHeight: 1.5, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                                {post.caption || "No caption"}
                              </p>
                              {post.platforms && post.platforms.length > 0 && (
                                <div style={{ display: "flex", gap: 6, marginTop: 10, flexWrap: "wrap" }}>
                                  {post.platforms.map((p: string) => (
                                    <span key={p} style={{ fontSize: 11, padding: "4px 10px", background: "var(--bg-card)", borderRadius: 6, color: "var(--text-secondary)", textTransform: "capitalize" }}>
                                      {p}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === "ai" && (
                <div>
                  <div style={{ padding: 24, background: "linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)", borderRadius: 16, marginBottom: 20 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                      <div style={{ width: 56, height: 56, borderRadius: 14, background: "#3b82f6", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Sparkles style={{ width: 28, height: 28, color: "white" }} />
                      </div>
                      <div>
                        <p style={{ fontSize: 28, fontWeight: 700, color: "#1e40af", margin: 0 }}>{selectedUser.aiUsageCount ?? 0}</p>
                        <p style={{ fontSize: 14, color: "#3b82f6", margin: "4px 0 0" }}>Total AI Generations Used</p>
                      </div>
                    </div>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
                    {[
                      { label: "Text Generations", value: Math.floor((selectedUser.aiUsageCount || 0) * 0.6), icon: <MessageSquare style={{ width: 18, height: 18, color: "#3b82f6" }} /> },
                      { label: "Image Generations", value: Math.floor((selectedUser.aiUsageCount || 0) * 0.3), icon: <ImageIcon style={{ width: 18, height: 18, color: "#8b5cf6" }} /> },
                      { label: "Code Assist", value: Math.floor((selectedUser.aiUsageCount || 0) * 0.1), icon: <FileText style={{ width: 18, height: 18, color: "#10b981" }} /> },
                    ].map((item, i) => (
                      <div key={i} style={{ padding: 20, background: "var(--bg-input)", borderRadius: 12, border: "1px solid var(--border-color)", textAlign: "center" }}>
                        <div style={{ marginBottom: 12 }}>{item.icon}</div>
                        <p style={{ fontSize: 24, fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>{item.value}</p>
                        <p style={{ fontSize: 12, color: "var(--text-secondary)", margin: "8px 0 0" }}>{item.label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: var(--border-color); border-radius: 3px; }
        ::-webkit-scrollbar-thumb:hover { background: var(--text-muted); }
      `}</style>
    </div>
  );
}
