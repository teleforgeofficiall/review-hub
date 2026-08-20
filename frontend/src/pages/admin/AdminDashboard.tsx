import { useState, useEffect } from "react";
import api from "../../lib/api";

interface Stats {
  users: { total: number; active: number };
  tasks: { total: number };
  submissions: { pending: number; total: number };
  withdrawals: { pending: number; total_payout: number };
  total_balance: number;
}

interface RecentSub {
  id: number;
  user_id: number;
  task_id: number;
  status: string;
  created_at: string;
  user_name?: string;
  task_title?: string;
  task_variant?: string;
}

function statusColor(s: string) {
  if (s === "approved") return "status-approved";
  if (s === "rejected") return "status-rejected";
  return "status-pending";
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recent, setRecent] = useState<RecentSub[]>([]);
  const [loading, setLoading] = useState(true);
  const [variantStats, setVariantStats] = useState({ single: 0, bulk: 0 });

  useEffect(() => {
    Promise.all([
      api.get("/admin/stats"),
      api.get("/submissions/admin/all"),
      api.get("/tasks"),
    ])
      .then(([statsRes, subsRes, tasksRes]) => {
        setStats(statsRes.data);
        const taskMap: Record<number, { title: string; variant: string }> = {};
        let single = 0;
        let bulk = 0;
        tasksRes.data.forEach((t: any) => {
          taskMap[t.id] = { title: t.title, variant: t.variant || "single" };
          if (t.variant === "bulk") bulk++;
          else single++;
        });
        setVariantStats({ single, bulk });
        const subs = subsRes.data.slice(0, 5).map((s: any) => ({
          ...s,
          task_title: taskMap[s.task_id]?.title || `Task #${s.task_id}`,
          task_variant: taskMap[s.task_id]?.variant || "single",
        }));
        setRecent(subs);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="pt-3 pb-4">
        <h1 className="text-lg font-bold mb-3" style={{ color: "#191c1e" }}>Dashboard</h1>
        <div className="grid grid-cols-2 gap-2 mb-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="glass-card rounded-xl p-3 animate-pulse">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-gray-200" />
                <div className="flex-1">
                  <div className="h-2 bg-gray-200 rounded w-12 mb-1.5" />
                  <div className="h-4 bg-gray-200 rounded w-16" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const fmtINR = (n: number) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);

  const cards = [
    { label: "Users", value: stats?.users.total.toLocaleString("en-IN") || "0", icon: "people", bg: "bg-blue-100", color: "text-blue-600" },
    { label: "Tasks", value: String(stats?.tasks.total || 0), icon: "assignment", bg: "bg-purple-100", color: "text-purple-600" },
    { label: "Pending", value: String(stats?.submissions.pending || 0), icon: "rate_review", bg: "bg-yellow-100", color: "text-yellow-600" },
    { label: "Payouts", value: fmtINR(stats?.withdrawals.total_payout || 0), icon: "payments", bg: "bg-green-100", color: "text-green-600" },
  ];

  return (
    <div className="pt-3 pb-4">
      <h1 className="text-lg font-bold mb-3" style={{ color: "#191c1e" }}>Dashboard</h1>

      <div className="grid grid-cols-2 gap-2 mb-3">
        {cards.map((s) => (
          <div key={s.label} className="glass-card rounded-xl p-3 flex items-center gap-2.5">
            <div className={`${s.bg} w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0`}>
              <span className={`material-symbols-outlined text-base ${s.color}`}>{s.icon}</span>
            </div>
            <div className="min-w-0">
              <p className="text-[10px] leading-tight" style={{ color: "#4a4455" }}>{s.label}</p>
              <p className="text-base font-bold leading-tight" style={{ color: "#191c1e" }}>{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Task Variant Breakdown */}
      {(variantStats.single > 0 || variantStats.bulk > 0) && (
        <div className="glass-card rounded-xl p-3 mb-3">
          <h2 className="text-sm font-semibold mb-2" style={{ color: "#191c1e" }}>Task Variants</h2>
          <div className="flex gap-2">
            <div className="flex-1 rounded-lg p-2 text-center" style={{ background: "#f0e6ff" }}>
              <p className="text-[10px] font-medium" style={{ color: "#4a4455" }}>Single</p>
              <p className="text-lg font-bold" style={{ color: "#4800a0" }}>{variantStats.single}</p>
            </div>
            <div className="flex-1 rounded-lg p-2 text-center" style={{ background: "#fef3c7" }}>
              <p className="text-[10px] font-medium" style={{ color: "#4a4455" }}>Bulk</p>
              <p className="text-lg font-bold" style={{ color: "#92400e" }}>{variantStats.bulk}</p>
            </div>
          </div>
        </div>
      )}

      <div className="glass-card rounded-xl p-3 mb-3">
        <h2 className="text-sm font-semibold mb-2.5" style={{ color: "#191c1e" }}>Recent Submissions</h2>
        {recent.length === 0 ? (
          <p className="text-xs text-center py-3" style={{ color: "#7b7487" }}>No submissions yet</p>
        ) : (
          <div className="space-y-2.5">
            {recent.map((item) => (
              <div key={item.id} className="flex items-center justify-between">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-[#630ed4] text-white flex items-center justify-center text-xs font-semibold flex-shrink-0">
                    {String(item.user_id).slice(-1)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-medium truncate" style={{ color: "#191c1e" }}>User #{item.user_id}</p>
                    <p className="text-[10px] truncate" style={{ color: "#4a4455" }}>{item.task_title}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  {item.task_variant === "bulk" && (
                    <span className="text-[8px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: "#fef3c7", color: "#92400e" }}>BULK</span>
                  )}
                  <span className={`status-pill ${statusColor(item.status)}`}>{item.status.charAt(0).toUpperCase() + item.status.slice(1)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
