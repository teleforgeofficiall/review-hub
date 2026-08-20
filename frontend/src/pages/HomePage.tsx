import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";

const actions = [
  { label: "Map Reviews", icon: "map", bg: "#eff6ff", fg: "#2563eb", route: "/map-review" },
  { label: "App Ratings", icon: "star", bg: "#f0fdf4", fg: "#16a34a", route: "/app-review" },
  { label: "Gmail Work", icon: "mail", bg: "#fef2f2", fg: "#dc2626", route: "/gmail-work" },
];

export default function HomePage() {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const fmt = (amount: number) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(amount);

  return (
    <>
      {/* Profile Greeting */}
      <div className="glass-card rounded-xl p-4 mb-3 flex items-center gap-3">
        <div
          className="w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0"
          style={{
            background: "linear-gradient(135deg, #7c3aed, #630ed4)",
            boxShadow: "inset 0px 2px 4px rgba(255,255,255,0.3), 0 4px 12px rgba(99,14,212,0.2)",
          }}
        >
          <span className="text-xl font-bold text-white">{user?.first_name?.[0] || "?"}</span>
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] leading-tight" style={{ color: "#4a4455" }}>Welcome back,</p>
          <h2 className="text-[16px] font-bold leading-tight truncate" style={{ color: "#191c1e" }}>
            {user?.first_name} {user?.last_name}
          </h2>
          {user?.username && (
            <p className="text-[12px] font-semibold leading-tight truncate" style={{ color: "#7c3aed" }}>
              @{user.username}
            </p>
          )}
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="glass-card rounded-xl p-3 flex flex-col items-center justify-center">
          <span
            className="material-symbols-outlined text-[20px] mb-0.5"
            style={{ color: "#630ed4", fontVariationSettings: "'FILL' 1" }}
          >
            account_balance_wallet
          </span>
          <p className="text-[10px] font-medium leading-tight mb-0.5" style={{ color: "#4a4455" }}>Balance</p>
          <p className="text-[16px] font-extrabold leading-tight">
            {fmt(user?.balance || 0)}{" "}
            <span className="text-[10px] font-medium" style={{ color: "#7b7487" }}>INR</span>
          </p>
        </div>
        <div className="glass-card rounded-xl p-3 flex flex-col items-center justify-center">
          <span
            className="material-symbols-outlined text-[20px] mb-0.5"
            style={{ color: "#6b38d4", fontVariationSettings: "'FILL' 1" }}
          >
            task_alt
          </span>
          <p className="text-[10px] font-medium leading-tight mb-0.5" style={{ color: "#4a4455" }}>Tasks Done</p>
          <p className="text-[16px] font-extrabold leading-tight" style={{ color: "#191c1e" }}>
            {user?.tasks_completed || 0}
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <h3 className="text-[16px] font-bold mb-2.5" style={{ color: "#191c1e" }}>Quick Actions</h3>
      <div className="flex gap-3 overflow-x-auto hide-scroll pb-1">
        {actions.map((a) => (
          <button
            key={a.route}
            onClick={() => navigate(a.route)}
            className="glass-card rounded-xl px-4 py-4 flex flex-col items-center gap-2 min-w-[100px] flex-shrink-0 active:scale-[0.96] transition-transform duration-150"
          >
            <div
              className="w-11 h-11 rounded-full flex items-center justify-center"
              style={{ background: a.bg }}
            >
              <span
                className="material-symbols-outlined text-[22px]"
                style={{ color: a.fg, fontVariationSettings: "'FILL' 1" }}
              >
                {a.icon}
              </span>
            </div>
            <span className="text-[12px] font-bold text-center leading-tight" style={{ color: "#191c1e" }}>
              {a.label}
            </span>
          </button>
        ))}
      </div>
    </>
  );
}
