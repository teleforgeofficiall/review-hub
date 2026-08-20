import { useAuthStore } from "../stores/authStore";

export default function AuthErrorPage() {
  const { logout } = useAuthStore();

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: "#f8f9fc" }}>
      <div className="glass-card rounded-xl p-8 text-center max-w-sm w-full">
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
          style={{ background: "rgba(239,68,68,0.1)" }}
        >
          <span className="material-symbols-outlined text-3xl" style={{ color: "#ef4444" }}>error</span>
        </div>
        <h2 className="text-xl font-bold mb-2" style={{ color: "#191c1e" }}>Authentication Failed</h2>
        <p className="text-sm mb-6" style={{ color: "#4a4455" }}>
          Could not verify your Telegram identity. Please try opening the Mini App from Telegram again.
        </p>
        <button onClick={logout} className="w-full btn-3d rounded-xl py-3 text-base font-bold">
          Retry
        </button>
      </div>
    </div>
  );
}
