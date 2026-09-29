"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Mail,
  Lock,
  User as UserIcon,
  Sparkles,
  LogOut,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Globe,
  ShieldCheck,
} from "lucide-react";
import { useApp } from "../context/AppContext";
import { initGoogleOAuth, checkGoogleAuthStatus } from "../lib/auth-api";

export default function AuthModal() {
  const { user, login, register, logout, authModalOpen, setAuthModalOpen, setAuthSession } = useApp();
  
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [oauthWaiting, setOauthWaiting] = useState(false);

  if (!authModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (mode === "login") {
        await login({
          username_or_email: email.trim(),
          password,
        });
      } else {
        await register({
          email: email.trim(),
          username: username.trim().toLowerCase(),
          display_name: displayName.trim() || username.trim(),
          password,
        });
      }
    } catch (err: any) {
      setError(err?.message || "Authentication failed. Please check your details.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleOAuth = async () => {
    setError(null);
    setIsLoading(true);
    setOauthWaiting(true);
    try {
      // 1. Initialize Google OAuth flow from backend to retrieve authorization URL & unique state
      const data = await initGoogleOAuth();
      if (!data.redirect_url || !data.state) {
        throw new Error("Invalid response from authorization server.");
      }

      // Store pending state for window focus triggers
      try {
        sessionStorage.setItem("papyrbound_oauth_pending_state", data.state);
        localStorage.setItem("papyrbound_oauth_pending_state", data.state);
      } catch {}

      // 2. Open Google Consent Screen in external browser / popup
      let openedExternally = false;
      try {
        const { openUrl } = await import("@tauri-apps/plugin-opener");
        await openUrl(data.redirect_url);
        openedExternally = true;
      } catch {
        // Fallback for standard browser
      }

      let popup: Window | null = null;
      if (!openedExternally) {
        const width = 520;
        const height = 680;
        const left = window.screenX + (window.outerWidth - width) / 2;
        const top = window.screenY + (window.outerHeight - height) / 2;
        popup = window.open(
          data.redirect_url,
          "papyrbound_google_auth",
          `width=${width},height=${height},left=${left},top=${top},status=no,menubar=no,toolbar=no`
        );
      }

      // 3. Resilient polling loop for desktop authentication handoff (runs for up to 3 minutes)
      let pollCount = 0;
      const maxPolls = 150; // 3 minutes with 1.2s intervals
      const pollInterval = setInterval(async () => {
        pollCount++;
        try {
          const statusRes = await checkGoogleAuthStatus(data.state);
          if (statusRes.authenticated && statusRes.token) {
            clearInterval(pollInterval);
            try {
              sessionStorage.removeItem("papyrbound_oauth_pending_state");
              localStorage.removeItem("papyrbound_oauth_pending_state");
              if (popup && !popup.closed) {
                popup.close();
              }
            } catch {}
            setAuthSession(statusRes.token.user, statusRes.token.access_token);
            setIsLoading(false);
            setOauthWaiting(false);
            setAuthModalOpen(false);
            return;
          }
        } catch {
          // ignore transient poll network hiccups
        }

        if (pollCount >= maxPolls) {
          clearInterval(pollInterval);
          setIsLoading(false);
          setOauthWaiting(false);
        }
      }, 1200);
    } catch (err: any) {
      setError(err?.message || "Google authentication failed.");
      setIsLoading(false);
      setOauthWaiting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setAuthModalOpen(false)}
          className="fixed inset-0 bg-black/50 backdrop-blur-xs"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 14 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 14 }}
          className="relative w-full max-w-md overflow-hidden rounded-2xl border border-[#d3c9b5] bg-mono-50 p-6 sm:p-8 shadow-2xl z-10 text-mono-800"
        >
          {/* Close Button */}
          <button
            onClick={() => setAuthModalOpen(false)}
            className="absolute top-4 right-4 size-8 rounded-full bg-mono-200/80 text-mono-600 grid place-items-center hover:bg-mono-300 transition-colors cursor-pointer"
          >
            <X className="size-4" />
          </button>

          {user ? (
            /* Logged In Profile View */
            <div className="space-y-6 text-center">
              <div className="size-16 rounded-full bg-amber-700 text-mono-50 mx-auto grid place-items-center text-2xl font-serif font-bold shadow-md">
                {user.display_name?.charAt(0).toUpperCase() || user.username?.charAt(0).toUpperCase()}
              </div>

              <div>
                <h3 className="text-xl font-serif font-bold text-mono-900">
                  {user.display_name}
                </h3>
                <p className="text-xs text-mono-500 font-mono mt-0.5">
                  @{user.username} • {user.email}
                </p>
                <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-emerald-100 text-emerald-800 border border-emerald-300">
                  <CheckCircle2 className="size-3" />
                  Papyrbound Account Active
                </div>
              </div>

              <div className="rounded-xl border border-[#d3c9b5] bg-mono-100/60 p-4 text-left space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-[#d3c9b5]/40">
                  <span className="text-mono-500">Connected Providers:</span>
                  <span className="font-semibold text-mono-800">
                    {user.connected_providers?.join(", ") || "Email"}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#d3c9b5]/40">
                  <span className="text-mono-500">Cloud Sync:</span>
                  <span className="text-emerald-700 font-medium flex items-center gap-1">
                    <ShieldCheck className="size-3" /> Ready
                  </span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-mono-500">Member Since:</span>
                  <span className="text-mono-700 font-mono">
                    {new Date(user.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <button
                onClick={logout}
                className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-red-300 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-semibold transition-colors cursor-pointer"
              >
                <LogOut className="size-3.5" />
                Sign Out of Account
              </button>
            </div>
          ) : (
            /* Sign In / Register Forms */
            <div className="space-y-5">
              <div>
                <h3 className="text-2xl font-serif font-bold text-mono-900 tracking-tight">
                  {mode === "login" ? "Welcome back" : "Create your account"}
                </h3>
                <p className="text-xs text-mono-600 mt-1">
                  {mode === "login"
                    ? "Sign in to participate in book discussions and sync reading progress."
                    : "Join the Papyrbound reading community platform."}
                </p>
              </div>

              {error && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2">
                  <AlertCircle className="size-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {/* Google OAuth Button */}
              <button
                type="button"
                onClick={handleGoogleOAuth}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl border border-[#d3c9b5] bg-white hover:bg-mono-100 text-mono-900 text-xs font-semibold shadow-xs transition-all cursor-pointer disabled:opacity-50"
              >
                <svg className="size-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                Continue with Google
              </button>

              <div className="relative text-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[#d3c9b5]" />
                </div>
                <span className="relative bg-mono-50 px-2 text-[10px] text-mono-400 font-mono uppercase">
                  or with email
                </span>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-3">
                {mode === "register" && (
                  <>
                    <div>
                      <label className="text-[11px] font-medium text-mono-700 block mb-1">
                        Display Name
                      </label>
                      <div className="relative">
                        <UserIcon className="size-3.5 text-mono-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          required
                          value={displayName}
                          onChange={(e) => setDisplayName(e.target.value)}
                          placeholder="e.g. Bill"
                          className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-[#d3c9b5] bg-mono-100 outline-none focus:border-mono-600 transition-colors"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[11px] font-medium text-mono-700 block mb-1">
                        Username
                      </label>
                      <div className="relative">
                        <span className="text-xs text-mono-400 absolute left-3 top-1/2 -translate-y-1/2 font-mono">
                          @
                        </span>
                        <input
                          type="text"
                          required
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          placeholder="bill10k"
                          className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-[#d3c9b5] bg-mono-100 outline-none focus:border-mono-600 transition-colors font-mono"
                        />
                      </div>
                    </div>
                  </>
                )}

                <div>
                  <label className="text-[11px] font-medium text-mono-700 block mb-1">
                    {mode === "login" ? "Email or Username" : "Email Address"}
                  </label>
                  <div className="relative">
                    <Mail className="size-3.5 text-mono-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type={mode === "register" ? "email" : "text"}
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={mode === "login" ? "bill@example.com or bill10k" : "bill@example.com"}
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-[#d3c9b5] bg-mono-100 outline-none focus:border-mono-600 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-medium text-mono-700 block mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="size-3.5 text-mono-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-[#d3c9b5] bg-mono-100 outline-none focus:border-mono-600 transition-colors font-mono"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2.5 px-4 rounded-xl bg-mono-800 hover:bg-mono-700 text-mono-50 text-xs font-semibold shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
                >
                  {isLoading && <Loader2 className="size-3.5 animate-spin" />}
                  {mode === "login" ? "Sign In" : "Create Account"}
                </button>
              </form>

              {/* Mode Switch */}
              <div className="text-center pt-2">
                {mode === "login" ? (
                  <p className="text-xs text-mono-600">
                    Don&apos;t have an account?{" "}
                    <button
                      type="button"
                      onClick={() => {
                        setMode("register");
                        setError(null);
                      }}
                      className="font-semibold text-mono-900 underline hover:text-amber-800 cursor-pointer"
                    >
                      Create one
                    </button>
                  </p>
                ) : (
                  <p className="text-xs text-mono-600">
                    Already have an account?{" "}
                    <button
                      type="button"
                      onClick={() => {
                        setMode("login");
                        setError(null);
                      }}
                      className="font-semibold text-mono-900 underline hover:text-amber-800 cursor-pointer"
                    >
                      Sign In
                    </button>
                  </p>
                )}
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
