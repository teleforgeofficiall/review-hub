import { useAuthStore } from "../stores/authStore";

export default function AuthErrorPage() {
  const { logout } = useAuthStore();

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-6"
      style={{
        background: "linear-gradient(180deg, #f0e6ff 0%, #f8f9fc 40%, #f8f9fc 100%)",
      }}
    >
      {/* Logo / Brand */}
      <div className="mb-6 flex flex-col items-center">
        <div
          className="w-20 h-20 rounded-3xl flex items-center justify-center mb-4"
          style={{
            background: "linear-gradient(135deg, #7c3aed, #630ed4)",
            boxShadow: "0 12px 32px rgba(99,14,212,0.3)",
          }}
        >
          <span className="material-symbols-outlined text-[40px]" style={{ color: "#fff", fontVariationSettings: "'FILL' 1" }}>
            stars
          </span>
        </div>
        <h1 className="text-[28px] font-extrabold" style={{ color: "#191c1e" }}>Review Hub</h1>
        <p className="text-[15px] font-medium mt-1 text-center" style={{ color: "#7b7487" }}>
          Complete tasks and earn rewards in INR!
        </p>
      </div>

      {/* Card */}
      <div className="glass-card rounded-2xl p-6 w-full max-w-sm text-center">
        <div
          className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
          style={{ background: "rgba(239,68,68,0.1)" }}
        >
          <span className="material-symbols-outlined text-[28px]" style={{ color: "#ef4444" }}>error</span>
        </div>
        <h2 className="text-[18px] font-bold mb-2" style={{ color: "#191c1e" }}>Authentication Failed</h2>
        <p className="text-[14px] mb-6 leading-relaxed" style={{ color: "#7b7487" }}>
          Could not verify your Telegram identity. Please open the app from Telegram again.
        </p>
        <button onClick={logout} className="w-full btn-3d rounded-xl py-3.5 text-[15px] font-bold">
          Retry
        </button>
      </div>

      {/* Footer */}
      <p className="text-[12px] mt-6" style={{ color: "#bbb" }}>
        Open from Telegram to get started
      </p>
    </div>
  );
}
