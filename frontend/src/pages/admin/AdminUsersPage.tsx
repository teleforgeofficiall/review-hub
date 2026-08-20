import { useState, useEffect } from "react";
import api from "../../lib/api";

interface User {
  id: number;
  username: string;
  balance: number;
  is_blocked: boolean;
  created_at: string;
  total_earned?: number;
  total_submissions?: number;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<User | null>(null);
  const [showBalanceModal, setShowBalanceModal] = useState(false);
  const [balanceAction, setBalanceAction] = useState<"add" | "deduct">("add");
  const [balanceAmount, setBalanceAmount] = useState("");
  const [acting, setActing] = useState(false);
  const [toast, setToast] = useState("");

  function fetchData() {
    api.get("/admin/users")
      .then((r) => setUsers(r.data))
      .catch(() => setUsers([]))
      .finally(() => setLoading(false));
  }

  useEffect(() => { fetchData(); }, []);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 2500);
  }

  const filtered = users.filter((u) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return String(u.id).includes(q) || (u.username && u.username.toLowerCase().includes(q));
  });

  function openBalanceModal(user: User, action: "add" | "deduct") {
    setSelected(user);
    setBalanceAction(action);
    setBalanceAmount("");
    setShowBalanceModal(true);
  }

  async function handleBalanceUpdate() {
    if (!selected || !balanceAmount || Number(balanceAmount) <= 0) return;
    setActing(true);
    try {
      const endpoint = balanceAction === "add"
        ? `/admin/users/${selected.id}/balance/add`
        : `/admin/users/${selected.id}/balance/deduct`;
      await api.put(endpoint, { amount: Number(balanceAmount) });
      showToast(balanceAction === "add" ? "Balance added" : "Balance deducted");
      setShowBalanceModal(false);
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.detail || "Failed");
    } finally {
      setActing(false);
    }
  }

  async function handleBlockToggle(user: User) {
    setActing(true);
    try {
      const endpoint = user.is_blocked
        ? `/admin/users/${user.id}/unblock`
        : `/admin/users/${user.id}/block`;
      await api.put(endpoint);
      showToast(user.is_blocked ? "User unblocked" : "User blocked");
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.detail || "Failed");
    } finally {
      setActing(false);
    }
  }

  const fmtINR = (n: number) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);

  if (loading) {
    return (
      <div className="pt-3 pb-4">
        <h1 className="text-lg font-bold mb-3" style={{ color: "#191c1e" }}>Users</h1>
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
      <h1 className="text-lg font-bold mb-3" style={{ color: "#191c1e" }}>Users</h1>

      {/* Search */}
      <div className="relative mb-3">
        <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-[16px]" style={{ color: "#4a4455" }}>search</span>
        <input type="text" placeholder="Search by ID or username..." value={search} onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-8 pr-3 py-2 rounded-lg text-[12px] outline-none"
          style={{ background: "#fff", border: "1px solid #e0e0e0", color: "#191c1e" }} />
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="glass-card rounded-xl p-6 text-center">
          <span className="material-symbols-outlined text-[32px] mb-1" style={{ color: "#7b7487" }}>people</span>
          <p className="text-[12px] font-medium" style={{ color: "#4a4455" }}>No users found</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((u) => (
            <div key={u.id} className="glass-card rounded-xl p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-full bg-[#630ed4] text-white flex items-center justify-center text-xs font-semibold">
                    {String(u.id).slice(-1)}
                  </div>
                  <div>
                    <p className="text-xs font-semibold" style={{ color: "#191c1e" }}>{u.username || `User #${u.id}`}</p>
                    <p className="text-[10px]" style={{ color: "#4a4455" }}>ID: {u.id} · {new Date(u.created_at).toLocaleDateString("en-IN")}</p>
                  </div>
                </div>
                {u.is_blocked && (
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: "#fef2f2", color: "#ba1a1a" }}>BLOCKED</span>
                )}
              </div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-bold" style={{ color: "#4800a0" }}>{fmtINR(u.balance)}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => openBalanceModal(u, "add")}
                  className="flex-1 py-1.5 rounded-lg text-[11px] font-semibold text-white"
                  style={{ background: "#10b981" }}>Add Balance</button>
                <button onClick={() => openBalanceModal(u, "deduct")}
                  className="flex-1 py-1.5 rounded-lg text-[11px] font-semibold"
                  style={{ background: "#f0e6ff", color: "#4800a0" }}>Deduct</button>
                <button onClick={() => handleBlockToggle(u)} disabled={acting}
                  className="flex-1 py-1.5 rounded-lg text-[11px] font-semibold text-white disabled:opacity-50"
                  style={{ background: u.is_blocked ? "#10b981" : "#ba1a1a" }}>
                  {u.is_blocked ? "Unblock" : "Block"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Balance Modal */}
      {showBalanceModal && selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.5)" }}>
          <div className="w-[85%] max-w-[300px] bg-white rounded-2xl p-5">
            <h3 className="text-sm font-bold text-center mb-3" style={{ color: "#191c1e" }}>
              {balanceAction === "add" ? "Add" : "Deduct"} Balance
            </h3>
            <p className="text-xs text-center mb-3" style={{ color: "#4a4455" }}>
              {selected.username || `User #${selected.id}`} · Current: {fmtINR(selected.balance)}
            </p>
            <input type="number" placeholder="Amount (₹)" value={balanceAmount} min="1"
              onChange={(e) => setBalanceAmount(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg text-[13px] outline-none mb-3"
              style={{ border: "1px solid #e0e0e0", color: "#191c1e" }} />
            <div className="flex gap-2">
              <button onClick={() => setShowBalanceModal(false)}
                className="flex-1 py-2 rounded-lg text-[12px] font-semibold"
                style={{ background: "#f0f0f0", color: "#4a4455" }}>Cancel</button>
              <button onClick={handleBalanceUpdate} disabled={acting || !balanceAmount || Number(balanceAmount) <= 0}
                className="flex-1 py-2 rounded-lg text-[12px] font-semibold text-white disabled:opacity-50"
                style={{ background: balanceAction === "add" ? "#10b981" : "#ba1a1a" }}>
                {acting ? "..." : "Confirm"}
              </button>
            </div>
          </div>
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
