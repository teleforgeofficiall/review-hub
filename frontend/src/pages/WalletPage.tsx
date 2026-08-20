import { useState, useEffect } from "react";
import { useAuthStore } from "../stores/authStore";
import api from "../lib/api";

interface Transaction {
  id: number;
  amount: number;
  type: string;
  label: string;
  status: string;
  created_at: string;
}

const statusStyles: Record<string, { label: string; bg: string; fg: string; border: string }> = {
  completed: { label: "Completed", bg: "#d1fae5", fg: "#065f46", border: "#a7f3d0" },
  pending: { label: "Pending", bg: "#fef3c7", fg: "#92400e", border: "#fde68a" },
  processing: { label: "Processing", bg: "#dbeafe", fg: "#1e40af", border: "#93c5fd" },
  rejected: { label: "Rejected", bg: "#fee2e2", fg: "#991b1b", border: "#fecaca" },
};

export default function WalletPage() {
  const { user, fetchMe } = useAuthStore();
  const [amount, setAmount] = useState("");
  const [upiId, setUpiId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fmt = (amt: number) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(amt);

  useEffect(() => {
    Promise.all([
      api.get("/wallet/transactions").catch(() => ({ data: [] })),
      api.get("/withdrawals").catch(() => ({ data: [] })),
    ])
      .then(([txRes, wdRes]) => {
        const txs: Transaction[] = txRes.data.map((t: any) => ({
          id: t.id,
          amount: Math.abs(t.amount),
          type: t.type === "task_earned" || t.type === "referral_bonus" ? "earned" : "withdrawal",
          label: t.description || t.type,
          status: "completed",
          created_at: t.created_at,
        }));
        const wds: Transaction[] = wdRes.data.map((w: any) => ({
          id: 100000 + w.id,
          amount: w.amount,
          type: "withdrawal",
          label: `UPI — ${w.upi_id || "N/A"}`,
          status: w.status,
          created_at: w.created_at,
        }));
        const all = [...txs, ...wds].sort(
          (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        setTransactions(all);
      })
      .catch(() => setTransactions([]))
      .finally(() => setLoading(false));
  }, []);

  const handleWithdraw = async () => {
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) return alert("Enter valid amount");
    if (!upiId.trim()) return alert("Enter UPI ID");
    if (amt > (user?.balance || 0)) return alert("Insufficient balance");
    setSubmitting(true);
    setError("");
    try {
      await api.post("/withdrawals", { amount: amt, upi_id: upiId, method: "upi" });
      setAmount("");
      setUpiId("");
      fetchMe();
      // refresh transactions
      const wdRes = await api.get("/withdrawals").catch(() => ({ data: [] }));
      const wds: Transaction[] = wdRes.data.map((w: any) => ({
        id: 100000 + w.id,
        amount: w.amount,
        type: "withdrawal",
        label: `UPI — ${w.upi_id || "N/A"}`,
        status: w.status,
        created_at: w.created_at,
      }));
      setTransactions((prev) => {
        const txsOnly = prev.filter((t) => t.type === "earned");
        return [...txsOnly, ...wds].sort(
          (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
      });
    } catch (err: any) {
      setError(err.response?.data?.detail || "Withdrawal failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page-stretch">
      {/* Balance Card */}
      <div className="purple-gradient-card rounded-2xl p-5 mb-4 relative overflow-hidden">
        <div className="absolute -right-8 -top-8 w-28 h-28 rounded-full blur-2xl" style={{ background: "rgba(255,255,255,0.1)" }} />
        <p className="text-[12px] font-medium mb-0.5 relative z-10" style={{ color: "rgba(255,255,255,0.7)" }}>
          Available Balance
        </p>
        <h2 className="text-[32px] font-extrabold relative z-10 leading-tight" style={{ color: "#ffffff" }}>
          {fmt(user?.balance || 0)}
          <span className="text-[14px] font-medium ml-1" style={{ color: "rgba(255,255,255,0.7)" }}>INR</span>
        </h2>
      </div>

      {/* Withdraw Form */}
      <div className="glass-card rounded-xl p-4 mb-4">
        <h3 className="text-[16px] font-bold mb-3" style={{ color: "#191c1e" }}>Withdraw Funds</h3>
        {error && (
          <div className="mb-3 px-3 py-2 rounded-lg text-[12px] font-medium" style={{ background: "#fee2e2", color: "#991b1b" }}>
            {error}
          </div>
        )}
        <div className="mb-3">
          <label className="block text-[12px] font-bold mb-1" style={{ color: "#4a4455" }}>Amount (Min. ₹50)</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-[14px]" style={{ color: "#7b7487" }}>₹</span>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              min="50"
              className="app-input pl-8"
            />
          </div>
        </div>
        <div className="mb-4">
          <label className="block text-[12px] font-bold mb-1" style={{ color: "#4a4455" }}>UPI ID</label>
          <input
            type="text"
            value={upiId}
            onChange={(e) => setUpiId(e.target.value)}
            placeholder="username@upi"
            className="app-input"
          />
        </div>
        <button
          onClick={handleWithdraw}
          disabled={submitting}
          className="w-full btn-3d rounded-xl py-3 text-[14px] font-bold disabled:opacity-50"
        >
          {submitting ? "Processing..." : "Request Withdrawal"}
        </button>
      </div>

      {/* Transaction History */}
      <div className="mt-auto">
        <h3 className="text-[16px] font-bold mb-2" style={{ color: "#191c1e" }}>Recent Transactions</h3>
        {loading ? (
          <div className="flex flex-col gap-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="glass-card rounded-xl p-3 flex items-center gap-3 animate-pulse">
                <div className="w-9 h-9 rounded-full bg-gray-200" />
                <div className="flex-1">
                  <div className="h-3 bg-gray-200 rounded w-1/2 mb-1.5" />
                  <div className="h-2 bg-gray-200 rounded w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : transactions.length === 0 ? (
          <div className="glass-card rounded-xl p-6 text-center">
            <span className="material-symbols-outlined text-[32px] mb-1" style={{ color: "#7b7487" }}>receipt_long</span>
            <p className="text-[12px]" style={{ color: "#7b7487" }}>No transactions yet</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {transactions.map((tx) => {
              const s = statusStyles[tx.status] || statusStyles.pending;
              const isEarn = tx.type === "earned";
              return (
                <div key={tx.id} className="glass-card rounded-xl p-3 flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ background: isEarn ? "#f0fdf4" : "#fef2f2" }}
                  >
                    <span
                      className="material-symbols-outlined text-[18px]"
                      style={{ color: isEarn ? "#16a34a" : "#dc2626", fontVariationSettings: "'FILL' 1" }}
                    >
                      {isEarn ? "arrow_downward" : "arrow_upward"}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[14px] font-bold truncate" style={{ color: "#191c1e" }}>
                      {isEarn ? "+" : "-"}{fmt(tx.amount)}
                    </p>
                    <p className="text-[11px] truncate" style={{ color: "#7b7487" }}>{tx.label}</p>
                  </div>
                  <span
                    className="px-2 py-0.5 rounded-full text-[10px] font-bold flex-shrink-0"
                    style={{ background: s.bg, color: s.fg, border: `1px solid ${s.border}` }}
                  >
                    {s.label}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
