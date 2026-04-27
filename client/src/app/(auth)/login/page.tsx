"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import { toast, Toaster } from "react-hot-toast";
import {
  Sparkles, Mail, Lock, User, Loader2, ArrowRight,
  Eye, EyeOff, CheckCircle2,
} from "lucide-react";

export default function AuthPage() {
  const searchParams = useSearchParams();
  const [isFlipped, setIsFlipped] = useState(searchParams.get("mode") === "signup");

  useEffect(() => {
    if (searchParams.get("mode") === "signup") setIsFlipped(true);
  }, [searchParams]);
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Login state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPwd, setLoginPwd] = useState("");

  // Signup state
  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPwd, setSignupPwd] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post("http://localhost:5000/api/auth/login", {
        email: loginEmail, password: loginPwd,
      });
      if (res.data.token) {
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("user", JSON.stringify(res.data.user));
        toast.success("Login successful!");
        setTimeout(() => router.push("/dashboard"), 800);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Invalid credentials");
    } finally { setLoading(false); }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post("http://localhost:5000/api/auth/register", {
        name: signupName, email: signupEmail, password: signupPwd,
      });
      if (res.data.token) {
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("user", JSON.stringify(res.data.user));
        toast.success("Account created!");
        setTimeout(() => router.push("/dashboard"), 800);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Registration failed");
    } finally { setLoading(false); }
  };

  const inputStyle: React.CSSProperties = {
    width: "100%", height: 48, borderRadius: 12, border: "1px solid #e5e7eb",
    padding: "0 16px 0 46px", fontSize: 14, outline: "none", background: "#f9fafb",
    color: "#111827", transition: "border-color 0.2s, box-shadow 0.2s",
  };

  const inputFocusProps = {
    onFocus: (e: React.FocusEvent<HTMLInputElement>) => {
      e.target.style.borderColor = "#16a34a";
      e.target.style.boxShadow = "0 0 0 3px rgba(22,163,74,0.1)";
    },
    onBlur: (e: React.FocusEvent<HTMLInputElement>) => {
      e.target.style.borderColor = "#e5e7eb";
      e.target.style.boxShadow = "none";
    },
  };

  const features = [
    "AI-powered content generation",
    "Multi-platform scheduling",
    "Advanced analytics & insights",
    "Team collaboration tools",
  ];

  return (
    <div style={{
      display: "flex", minHeight: "100vh", fontFamily: "'Inter', system-ui, sans-serif",
    }}>
      <Toaster position="top-center" />

      {/* ── Left Panel: Branding ── */}
      <div style={{
        width: "45%", background: "linear-gradient(135deg, #16a34a 0%, #15803d 50%, #166534 100%)",
        display: "flex", flexDirection: "column", justifyContent: "center",
        alignItems: "center", padding: "60px 48px", position: "relative", overflow: "hidden",
      }}>
        {/* Decorative circles */}
        <div style={{
          position: "absolute", top: -120, right: -120, width: 400, height: 400,
          borderRadius: "50%", background: "rgba(255,255,255,0.05)",
        }} />
        <div style={{
          position: "absolute", bottom: -80, left: -80, width: 300, height: 300,
          borderRadius: "50%", background: "rgba(255,255,255,0.04)",
        }} />
        <div style={{
          position: "absolute", top: "40%", right: 40, width: 160, height: 160,
          borderRadius: "50%", background: "rgba(255,255,255,0.03)",
        }} />

        <div style={{ position: "relative", zIndex: 1, maxWidth: 400, textAlign: "center" }}>
          <div style={{
            width: 100, height: 100, borderRadius: "50%", background: "rgba(255,255,255,0.15)",
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 32px", backdropFilter: "blur(10px)", padding: 4,
          }}>
            <img src="https://framerusercontent.com/images/OmiFNAsUnVnklI6y2SA9EWiDJBk.png?width=915&height=273" alt="AI Social Vibe Logo" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </div>


          <p style={{ fontSize: 16, color: "rgba(255,255,255,0.8)", lineHeight: 1.6, marginBottom: 40 }}>
            Generate, schedule, and publish AI-powered content across all your social platforms.
          </p>

          {/* Feature list */}
          <div style={{ textAlign: "left", display: "flex", flexDirection: "column", gap: 14 }}>
            {features.map((f) => (
              <div key={f} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <CheckCircle2 style={{ width: 18, height: 18, color: "#86efac", flexShrink: 0 }} />
                <span style={{ fontSize: 14, color: "rgba(255,255,255,0.9)" }}>{f}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right Panel: Flip Card ── */}
      <div style={{
        flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
        background: "#f8faf9", padding: 40,
      }}>
        <div style={{ width: 420, perspective: 1200 }}>
          <div style={{
            position: "relative", width: "100%", minHeight: 520,
            transformStyle: "preserve-3d",
            transition: "transform 0.7s cubic-bezier(0.4, 0, 0.2, 1)",
            transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
          }}>

            {/* ═══ FRONT: Login ═══ */}
            <div style={{
              position: "absolute", width: "100%", backfaceVisibility: "hidden",
              background: "#fff", borderRadius: 20, padding: "40px 36px",
              boxShadow: "0 8px 30px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.04)",
              border: "1px solid #f3f4f6",
            }}>
              <div style={{ textAlign: "center", marginBottom: 32 }}>
                <div style={{
                  width: 48, height: 48, borderRadius: 14, background: "#f0fdf4",
                  display: "inline-flex", alignItems: "center", justifyContent: "center",
                  marginBottom: 16, border: "1px solid #bbf7d0",
                }}>
                  <Sparkles style={{ width: 22, height: 22, color: "#16a34a" }} />
                </div>
                <h2 style={{ fontSize: 24, fontWeight: 700, color: "#111827", margin: "0 0 6px" }}>Welcome back</h2>
                <p style={{ fontSize: 14, color: "#6b7280" }}>Sign in to your account</p>
              </div>

              <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div style={{ position: "relative" }}>
                  <Mail style={{ position: "absolute", left: 14, top: 14, width: 18, height: 18, color: "#9ca3af" }} />
                  <input
                    type="email" placeholder="Email address" required
                    value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)}
                    style={inputStyle} {...inputFocusProps}
                  />
                </div>
                <div style={{ position: "relative" }}>
                  <Lock style={{ position: "absolute", left: 14, top: 14, width: 18, height: 18, color: "#9ca3af" }} />
                  <input
                    type={showPwd ? "text" : "password"} placeholder="Password" required
                    value={loginPwd} onChange={(e) => setLoginPwd(e.target.value)}
                    style={{ ...inputStyle, paddingRight: 46 }} {...inputFocusProps}
                  />
                  <button type="button" onClick={() => setShowPwd(!showPwd)} style={{
                    position: "absolute", right: 14, top: 14, background: "none",
                    border: "none", cursor: "pointer", color: "#9ca3af", padding: 0,
                  }}>
                    {showPwd ? <EyeOff style={{ width: 18, height: 18 }} /> : <Eye style={{ width: 18, height: 18 }} />}
                  </button>
                </div>

                <div style={{ textAlign: "right" }}>
                  <span style={{ fontSize: 12, color: "#16a34a", fontWeight: 500, cursor: "pointer" }}>
                    Forgot password?
                  </span>
                </div>

                <button type="submit" disabled={loading} style={{
                  height: 48, borderRadius: 12, background: "linear-gradient(135deg, #16a34a, #15803d)",
                  color: "#fff", fontSize: 15, fontWeight: 600, border: "none", cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  transition: "all 0.2s", boxShadow: "0 4px 14px rgba(22,163,74,0.3)",
                  opacity: loading ? 0.7 : 1,
                }}>
                  {loading ? <Loader2 style={{ width: 20, height: 20, animation: "spin 1s linear infinite" }} /> : (
                    <>Sign In <ArrowRight style={{ width: 18, height: 18 }} /></>
                  )}
                </button>
              </form>

              <div style={{
                textAlign: "center", marginTop: 28, paddingTop: 24,
                borderTop: "1px solid #f3f4f6",
              }}>
                <p style={{ fontSize: 14, color: "#6b7280" }}>
                  Don't have an account?{" "}
                  <button onClick={() => setIsFlipped(true)} style={{
                    background: "none", border: "none", color: "#16a34a",
                    fontWeight: 600, cursor: "pointer", fontSize: 14,
                  }}>
                    Create one →
                  </button>
                </p>
              </div>
            </div>

            {/* ═══ BACK: Sign Up ═══ */}
            <div style={{
              position: "absolute", width: "100%", backfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
              background: "#fff", borderRadius: 20, padding: "40px 36px",
              boxShadow: "0 8px 30px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.04)",
              border: "1px solid #f3f4f6",
            }}>
              <div style={{ textAlign: "center", marginBottom: 32 }}>
                <div style={{
                  width: 48, height: 48, borderRadius: 14, background: "#f0fdf4",
                  display: "inline-flex", alignItems: "center", justifyContent: "center",
                  marginBottom: 16, border: "1px solid #bbf7d0",
                }}>
                  <User style={{ width: 22, height: 22, color: "#16a34a" }} />
                </div>
                <h2 style={{ fontSize: 24, fontWeight: 700, color: "#111827", margin: "0 0 6px" }}>Create account</h2>
                <p style={{ fontSize: 14, color: "#6b7280" }}>Join the future of social media</p>
              </div>

              <form onSubmit={handleSignup} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div style={{ position: "relative" }}>
                  <User style={{ position: "absolute", left: 14, top: 14, width: 18, height: 18, color: "#9ca3af" }} />
                  <input
                    type="text" placeholder="Full name" required
                    value={signupName} onChange={(e) => setSignupName(e.target.value)}
                    style={inputStyle} {...inputFocusProps}
                  />
                </div>
                <div style={{ position: "relative" }}>
                  <Mail style={{ position: "absolute", left: 14, top: 14, width: 18, height: 18, color: "#9ca3af" }} />
                  <input
                    type="email" placeholder="Email address" required
                    value={signupEmail} onChange={(e) => setSignupEmail(e.target.value)}
                    style={inputStyle} {...inputFocusProps}
                  />
                </div>
                <div style={{ position: "relative" }}>
                  <Lock style={{ position: "absolute", left: 14, top: 14, width: 18, height: 18, color: "#9ca3af" }} />
                  <input
                    type="password" placeholder="Create password" required
                    value={signupPwd} onChange={(e) => setSignupPwd(e.target.value)}
                    style={inputStyle} {...inputFocusProps}
                  />
                </div>

                <p style={{ fontSize: 11, color: "#9ca3af", lineHeight: 1.5 }}>
                  By creating an account, you agree to our <span style={{ color: "#16a34a", cursor: "pointer" }}>Terms</span> and <span style={{ color: "#16a34a", cursor: "pointer" }}>Privacy Policy</span>.
                </p>

                <button type="submit" disabled={loading} style={{
                  height: 48, borderRadius: 12, background: "linear-gradient(135deg, #16a34a, #15803d)",
                  color: "#fff", fontSize: 15, fontWeight: 600, border: "none", cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  transition: "all 0.2s", boxShadow: "0 4px 14px rgba(22,163,74,0.3)",
                  opacity: loading ? 0.7 : 1,
                }}>
                  {loading ? <Loader2 style={{ width: 20, height: 20, animation: "spin 1s linear infinite" }} /> : (
                    <>Create Account <ArrowRight style={{ width: 18, height: 18 }} /></>
                  )}
                </button>
              </form>

              <div style={{
                textAlign: "center", marginTop: 28, paddingTop: 24,
                borderTop: "1px solid #f3f4f6",
              }}>
                <p style={{ fontSize: 14, color: "#6b7280" }}>
                  Already have an account?{" "}
                  <button onClick={() => setIsFlipped(false)} style={{
                    background: "none", border: "none", color: "#16a34a",
                    fontWeight: 600, cursor: "pointer", fontSize: 14,
                  }}>
                    ← Sign in
                  </button>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
