import { useState, useEffect } from "react";
import api from "../../lib/api";

interface Withdrawal {
  id: number;
  user_id: number;
  amount: number;
  status: "pending" | "approved" | "rejected";
  upi_id: string | null;
  created_at: string;
  processed_at: string | null;
}

const filters = ["All", "Pending", "Approved", "Rejected"];

function statusColor(s: string) {
  if (s === "approved") return "status-approved";
  if (s === "rejected") return "status-rejected";
  return "status-pending";
}

export default function AdminWithdrawalsPage() {
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");
  const [acting, setActing] = useState<number | null>(null);
  const [toast, setToast] = useState("");

  function fetchData() {
    api.get("/withdrawals/admin/all")
      .then((r) => setWithdrawals(r.data))
      .catch(() => setWithdrawals([]))
      .finally(() => setLoading(false));
  }

  useEffect(() => { fetchData(); }, []);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 2500);
  }

  const filtered = withdrawals.filter((w) => {
    if (filter === "All") return true;
    return w.status === filter.toLowerCase();
  });

  const totalPaid = withdrawals.filter((w) => w.status === "approved").reduce((sum, w) => sum + w.amount, 0);
  const totalPending = withdrawals.filter((w) => w.status === "pending").reduce((sum, w) => sum + w.amount, 0);

  async function handleApprove(id: number) {
    setActing(id);
    try {
      await api.put(`/withdrawals/${id}/approve`);
      showToast("Withdrawal approved");
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.detail || "Failed");
    } finally {
      setActing(null);
    }
  }

  async function handleReject(id: number) {
    setActing(id);
    try {
      await api.put(`/withdrawals/${id}/reject`);
      showToast("Withdrawal rejected");
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.detail || "Failed");
    } finally {
      setActing(null);
    }
  }

  const fmtINR = (n: number) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);

  if (loading) {
    return (
      <div className="pt-3 pb-4">
        <h1 className="text-lg font-bold mb-3" style={{ color: "#191c1e" }}>Withdrawals</h1>
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="glass-card rounded-xl p-3 animate-pulse">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gray-200" />
                <div className="flex-1"><div className="h-3 bg-gray-200 rounded w-2/3 mb-1" /><div className="h-2 bg-gray-200 rounded w-1/4" /></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="pt-3 pb-4">
      <h1 className="text-lg font-bold mb-3" style={{ color: "#191c1e" }}>Withdrawals</h1>

      {/* Stats */}
      <div className="flex gap-2 mb-3">
        <div className="flex-1 rounded-xl p-3 text-center" style={{ background: "#f0e6ff" }}>
          <p className="text-[10px] font-medium" style={{ color: "#4a4455" }}>Total Paid</p>
          <p className="text-base font-bold" style={{ color: "#4800a0" }}>{fmtINR(totalPaid)}</p>
        </div>
        <div className="flex-1 rounded-xl p-3 text-center" style={{ background: "#fef3c7" }}>
          <p className="text-[10px] font-medium" style={{ color: "#4a4455" }}>Pending</p>
          <p className="text-base font-bold" style={{ color: "#92400e" }}>{fmtINR(totalPending)}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-1.5 pb-3 overflow-x-auto hide-scroll">
        {filters.map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            className="px-3 py-1 rounded-full text-[11px] font-medium whitespace-nowrap flex-shrink-0"
            style={{
              background: filter === f ? "#4800a0" : "#fff",
              color: filter === f ? "#fff" : "#4a4455",
              border: filter === f ? "none" : "1px solid #e0e0e0",
            }}
          >{f}</button>
        ))}
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="glass-card rounded-xl p-6 text-center">
          <span className="material-symbols-outlined text-[32px] mb-1" style={{ color: "#7b7487" }}>receipt_long</span>
          <p className="text-[12px] font-medium" style={{ color: "#4a4455" }}>No withdrawals found</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((w) => (
            <div key={w.id} className="glass-card rounded-xl p-3">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-[#630ed4] text-white flex items-center justify-center text-xs font-semibold">
                    {String(w.user_id).slice(-1)}
                  </div>
                  <div>
                    <p className="text-xs font-semibold" style={{ color: "#191c1e" }}>User #{w.user_id}</p>
                    <p className="text-[10px]" style={{ color: "#4a4455" }}>
                      {new Date(w.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold" style={{ color: "#4800a0" }}>{fmtINR(w.amount)}</p>
                  <span className={`status-pill ${statusColor(w.status)}`}>{w.status.charAt(0).toUpperCase() + w.status.slice(1)}</span>
                </div>
              </div>
              {w.upi_id && (
                <p className="text-[10px] mb-1.5" style={{ color: "#4a4455" }}>UPI: {w.upi_id}</p>
              )}
              {w.status === "pending" && (
                <div className="flex gap-2 mt-2">
                  <button onClick={() => handleReject(w.id)} disabled={acting === w.id}
                    className="flex-1 py-1.5 rounded-lg text-[11px] font-semibold text-white disabled:opacity-50"
                    style={{ background: "#ba1a1a" }}>
                    {acting === w.id ? "..." : "Reject"}
                  </button>
                  <button onClick={() => handleApprove(w.id)} disabled={acting === w.id}
                    className="flex-1 py-1.5 rounded-lg text-[11px] font-semibold text-white disabled:opacity-50"
                    style={{ background: "#10b981" }}>
                    {acting === w.id ? "..." : "Approve"}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {toast && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-[70] px-4 py-2 rounded-lg text-xs font-medium text-white shadow-lg" style={{ background: "#191c1e" }}>
          {toast}
        </div>
      )}
    </div>
  );
}
