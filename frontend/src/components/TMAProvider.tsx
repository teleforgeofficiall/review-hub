import { useEffect, useState, useRef } from "react";
import { useAuthStore } from "../stores/authStore";
import api from "../lib/api";

declare global {
  interface Window {
    Telegram?: {
      WebApp?: {
        initData: string;
        initDataUnsafe?: {
          user?: {
            id: number;
            first_name: string;
            last_name?: string;
            username?: string;
            language_code?: string;
            is_premium?: boolean;
          };
        };
        ready: () => void;
        expand: () => void;
        close: () => void;
        setHeaderColor: (color: string) => void;
        setBackgroundColor: (color: string) => void;
        colorScheme: string;
        platform: string;
      };
    };
  }
}

function extractInitData(): string | null {
  try {
    if (window.Telegram?.WebApp?.initData) {
      return window.Telegram.WebApp.initData;
    }

    const url = window.location.href;
    if (url.includes("tgWebAppData")) {
      const hashIdx = url.indexOf("#");
      if (hashIdx >= 0) {
        const hashPart = url.substring(hashIdx + 1);
        const params = new URLSearchParams(hashPart);
        const raw = params.get("tgWebAppData");
        if (raw) return decodeURIComponent(raw);
      }
      const urlObj = new URL(url);
      const raw = urlObj.searchParams.get("tgWebAppData");
      if (raw) return decodeURIComponent(raw);
    }

    return null;
  } catch {
    return null;
  }
}

function getTelegramIdFromToken(token: string): number | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const payload = JSON.parse(atob(parts[1].replace(/-/g, "+").replace(/_/g, "/")));
    return payload.sub ? parseInt(payload.sub, 10) : null;
  } catch {
    return null;
  }
}

const MAX_RETRIES = 3;
const RETRY_DELAY = 2000;

export function TMAProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, login, logout } = useAuthStore();
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const initRef = useRef(false);

  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;

    const tg = window.Telegram?.WebApp;

    if (tg) {
      try { tg.ready(); } catch {}
      try { tg.expand(); } catch {}
      try {
        tg.setHeaderColor("#630ed4");
        tg.setBackgroundColor("#f8f9fc");
      } catch {}
    }

    const attemptLogin = async (initData: string, attempt: number): Promise<boolean> => {
      try {
        await login(initData);
        return true;
      } catch (err: any) {
        console.error(`[AUTH] Login attempt ${attempt} failed:`, err?.response?.status, err?.response?.data || err?.message);
        if (attempt < MAX_RETRIES) {
          await new Promise((r) => setTimeout(r, RETRY_DELAY * attempt));
          return attemptLogin(initData, attempt + 1);
        }
        return false;
      }
    };

    const init = async () => {
      const initData = extractInitData();
      const existingToken = localStorage.getItem("rh_token");
      const tgUserId = window.Telegram?.WebApp?.initDataUnsafe?.user?.id;

      // Case 1: Token exists + Telegram user ID available → check if token matches
      if (existingToken && tgUserId) {
        const tokenTgId = getTelegramIdFromToken(existingToken);
        if (tokenTgId === tgUserId) {
          // Token belongs to this Telegram user — fast path, just verify with backend
          console.log("[AUTH] Token matches Telegram user, verifying with backend...");
          try {
            const res = await api.get("/auth/me");
            const user = res.data;
            localStorage.setItem("rh_user", JSON.stringify(user));
            useAuthStore.setState({ user, isAuthenticated: true });
            setReady(true);
            return;
          } catch {
            // Token invalid/expired — fall through to re-authenticate with initData
            console.log("[AUTH] Stored token invalid, will re-authenticate...");
            logout();
          }
        } else {
          // Different Telegram account than stored token — clear old token
          console.log("[AUTH] Telegram user mismatch, clearing stored token...");
          logout();
        }
      }

      // Case 2: initData available → authenticate with backend
      if (initData) {
        console.log("[AUTH] Authenticating with initData...");
        const success = await attemptLogin(initData, 1);
        if (!success) {
          setError("AUTH_FAILED");
        }
        setReady(true);
        return;
      }

      // Case 3: Token exists but no initData (opened as regular URL, e.g. admin panel button)
      if (existingToken) {
        try {
          console.log("[AUTH] No initData, verifying stored token...");
          const res = await api.get("/auth/me");
          const user = res.data;
          localStorage.setItem("rh_user", JSON.stringify(user));
          useAuthStore.setState({ user, isAuthenticated: true });
          setReady(true);
          return;
        } catch {
          logout();
          setError("AUTH_FAILED");
          setReady(true);
          return;
        }
      }

      // Case 4: No token AND no initData
      setError("NO_INIT_DATA");
      setReady(true);
    };

    init();
  }, []);

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#f8f9fc" }}>
        <div className="glass-card rounded-xl p-8 text-center max-w-sm w-full mx-4">
          <div className="w-12 h-12 border-4 border-t-transparent rounded-full animate-spin mx-auto mb-4" style={{ borderColor: "#7c3aed", borderTopColor: "transparent" }} />
          <p className="font-medium" style={{ color: "#4a4455" }}>Loading...</p>
        </div>
      </div>
    );
  }

  if (error && !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ background: "#f8f9fc" }}>
        <div className="glass-card rounded-xl p-8 text-center max-w-sm w-full">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: error === "NO_INIT_DATA" ? "rgba(124,58,237,0.1)" : "rgba(239,68,68,0.1)" }}>
            <span className="material-symbols-outlined text-3xl" style={{ color: error === "NO_INIT_DATA" ? "#7c3aed" : "#ef4444" }}>
              {error === "NO_INIT_DATA" ? "smartphone" : "error"}
            </span>
          </div>
          <h2 className="text-xl font-bold mb-2" style={{ color: "#191c1e" }}>
            {error === "NO_INIT_DATA" ? "Open in Telegram" : "Authentication Failed"}
          </h2>
          <p className="text-sm mb-6" style={{ color: "#4a4455" }}>
            {error === "NO_INIT_DATA"
              ? "This app must be opened from Telegram. Tap the Open App button in the bot chat."
              : "Could not verify your Telegram identity. Please try again."}
          </p>
          <button
            onClick={() => {
              localStorage.removeItem("rh_token");
              localStorage.removeItem("rh_user");
              window.location.reload();
            }}
            className="w-full btn-3d rounded-xl py-3 text-base font-bold"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
