import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";

export default function ProfilePage() {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const fmt = (amount: number) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(amount);

  return (
    <div className="page-stretch">
      {/* Profile Header Card */}
      <div className="glass-card rounded-2xl p-6 flex flex-col items-center mb-4 relative overflow-hidden">
        <div
          className="absolute left-0 right-0 top-0 h-28"
          style={{ background: "linear-gradient(to bottom, rgba(124,58,237,0.12), transparent)" }}
        />
        <div
          className="w-24 h-24 rounded-full flex items-center justify-center mb-4 relative z-10"
          style={{
            background: "linear-gradient(135deg, #7c3aed, #630ed4)",
            boxShadow: "0 8px 20px rgba(99,14,212,0.35)",
            border: "4px solid rgba(255,255,255,0.6)",
          }}
        >
          <span className="text-[44px] font-bold text-white">{user?.first_name?.[0] || "?"}</span>
        </div>
        <h2 className="text-[22px] font-bold relative z-10" style={{ color: "#191c1e" }}>
          {user?.first_name} {user?.last_name}
        </h2>
        {user?.username && (
          <p className="text-[15px] font-semibold relative z-10 mt-0.5" style={{ color: "#630ed4" }}>@{user.username}</p>
        )}
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="glass-card rounded-2xl p-4 text-center">
          <p className="text-[11px] font-medium mb-1" style={{ color: "#7b7487" }}>Balance</p>
          <p className="text-[16px] font-extrabold" style={{ color: "#630ed4" }}>{fmt(user?.balance || 0)}</p>
        </div>
        <div className="glass-card rounded-2xl p-4 text-center">
          <p className="text-[11px] font-medium mb-1" style={{ color: "#7b7487" }}>Total Earned</p>
          <p className="text-[16px] font-extrabold" style={{ color: "#191c1e" }}>{fmt(user?.total_earned || 0)}</p>
        </div>
        <div className="glass-card rounded-2xl p-4 text-center">
          <p className="text-[11px] font-medium mb-1" style={{ color: "#7b7487" }}>Completed</p>
          <p className="text-[16px] font-extrabold" style={{ color: "#191c1e" }}>{user?.tasks_completed || 0}</p>
        </div>
      </div>

      {/* Account Details */}
      <div className="glass-card rounded-2xl p-5 mb-4">
        <h3 className="text-[13px] font-bold mb-3 tracking-wider uppercase" style={{ color: "#7b7487" }}>Account Details</h3>
        <div className="flex flex-col">
          <div className="flex justify-between items-center py-2.5" style={{ borderBottom: "1px solid rgba(204,195,216,0.15)" }}>
            <span className="text-[14px]" style={{ color: "#7b7487" }}>Telegram ID</span>
            <span className="text-[13px] font-bold min-w-0 text-right" style={{ color: "#191c1e" }}>{user?.telegram_id || ""}</span>
          </div>
          {user?.username && (
            <div className="flex justify-between items-center py-2.5" style={{ borderBottom: "1px solid rgba(204,195,216,0.15)" }}>
              <span className="text-[14px]" style={{ color: "#7b7487" }}>Username</span>
              <span className="text-[13px] font-bold min-w-0 text-right truncate ml-2" style={{ color: "#191c1e" }}>@{user.username}</span>
            </div>
          )}
          <div className="flex justify-between items-center py-2.5">
            <span className="text-[14px]" style={{ color: "#7b7487" }}>Joined</span>
            <span className="text-[13px] font-bold" style={{ color: "#191c1e" }}>
              {user?.created_at ? new Date(user.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "-"}
            </span>
          </div>
        </div>
      </div>

      {/* Switch to Admin — only for admins */}
      {user?.is_admin && (
        <button
          onClick={() => navigate("/admin")}
          className="w-full glass-card rounded-2xl py-3.5 text-[15px] font-bold flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
          style={{ color: "#630ed4", border: "1px solid rgba(99,14,212,0.15)" }}
        >
          <span className="material-symbols-outlined text-[20px]">admin_panel_settings</span>
          Switch to Admin
        </button>
      )}
    </div>
  );
}
