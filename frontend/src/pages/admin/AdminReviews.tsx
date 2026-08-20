import { useState, useEffect } from "react";
import api from "../../lib/api";

interface Submission {
  id: number;
  user_id: number;
  task_id: number;
  status: "pending" | "approved" | "rejected";
  proof_url: string | null;
  proof_text: string | null;
  admin_note: string | null;
  created_at: string;
  task_title?: string;
  instructions?: string;
}

const filters = ["All", "Pending", "Approved", "Rejected"];

function statusColor(s: string) {
  if (s === "approved") return "status-approved";
  if (s === "rejected") return "status-rejected";
  return "status-pending";
}

export default function AdminReviews() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");
  const [reviewing, setReviewing] = useState<Submission | null>(null);
  const [notes, setNotes] = useState("");
  const [showRejectReason, setShowRejectReason] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [showApproveConfirm, setShowApproveConfirm] = useState(false);
  const [toast, setToast] = useState("");
  const [acting, setActing] = useState(false);
  const pendingCount = submissions.filter((s) => s.status === "pending").length;

  function fetchData() {
    Promise.all([
      api.get("/submissions/admin/all"),
      api.get("/tasks"),
    ])
      .then(([subsRes, tasksRes]) => {
        const taskMap: Record<number, { title: string; instructions: string | null }> = {};
        tasksRes.data.forEach((t: any) => { taskMap[t.id] = { title: t.title, instructions: t.instructions }; });
        const subs = subsRes.data.map((s: any) => ({
          ...s,
          task_title: taskMap[s.task_id]?.title || `Task #${s.task_id}`,
          instructions: taskMap[s.task_id]?.instructions || "",
        }));
        setSubmissions(subs);
      })
      .catch(() => setSubmissions([]))
      .finally(() => setLoading(false));
  }

  useEffect(() => { fetchData(); }, []);

  const filtered = submissions.filter((s) => {
    if (filter === "All") return true;
    return s.status === filter.toLowerCase();
  });

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 2500);
  }

  async function handleApprove() {
    if (!reviewing || acting) return;
    setActing(true);
    try {
      await api.put(`/submissions/${reviewing.id}/review`, { status: "approved", admin_note: notes || null });
      showToast("Submission approved");
      setShowApproveConfirm(false);
      setReviewing(null);
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.detail || "Failed to approve");
    } finally {
      setActing(false);
    }
  }

  async function handleReject() {
    if (!rejectReason.trim() || !reviewing || acting) return;
    setActing(true);
    try {
      await api.put(`/submissions/${reviewing.id}/review`, { status: "rejected", admin_note: rejectReason });
      showToast("Submission rejected");
      setShowRejectReason(false);
      setRejectReason("");
      setReviewing(null);
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.detail || "Failed to reject");
    } finally {
      setActing(false);
    }
  }

  if (loading) {
    return (
      <div className="pt-3 pb-4">
        <h1 className="text-lg font-bold mb-3" style={{ color: "#191c1e" }}>Reviews</h1>
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="glass-card rounded-xl p-3 animate-pulse">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-full bg-gray-200" />
                <div className="flex-1">
                  <div className="h-3 bg-gray-200 rounded w-2/3 mb-1" />
                  <div className="h-2 bg-gray-200 rounded w-1/3" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="pt-3 pb-4">
      <div className="flex items-center justify-between mb-3">
        <h1 className="text-lg font-bold" style={{ color: "#191c1e" }}>Reviews</h1>
        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ background: "#fef3c7", color: "#92400e" }}>
          {pendingCount} pending
        </span>
      </div>

      <div className="flex gap-1.5 pb-3 overflow-x-auto hide-scroll">
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className="px-3 py-1 rounded-full text-[11px] font-medium whitespace-nowrap flex-shrink-0"
            style={{
              background: filter === f ? "#4800a0" : "#fff",
              color: filter === f ? "#fff" : "#4a4455",
              border: filter === f ? "none" : "1px solid #e0e0e0",
            }}
          >
            {f}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="glass-card rounded-xl p-6 text-center">
          <span className="material-symbols-outlined text-[32px] mb-1" style={{ color: "#7b7487" }}>inbox</span>
          <p className="text-xs font-medium" style={{ color: "#4a4455" }}>No submissions found</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((sub) => (
            <div key={sub.id} className="glass-card rounded-xl p-3">
              <div className="flex items-start justify-between mb-1.5">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-[#630ed4] text-white flex items-center justify-center text-xs font-semibold flex-shrink-0">
                    {String(sub.user_id).slice(-1)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold" style={{ color: "#191c1e" }}>User #{sub.user_id}</p>
                    <p className="text-[10px]" style={{ color: "#4a4455" }}>
                      {new Date(sub.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </p>
                  </div>
                </div>
                <span className={`status-pill ${statusColor(sub.status)}`}>{sub.status.charAt(0).toUpperCase() + sub.status.slice(1)}</span>
              </div>
              <p className="text-xs font-medium mb-1" style={{ color: "#191c1e" }}>{sub.task_title}</p>
              {sub.proof_url && (
                <a href={sub.proof_url} target="_blank" rel="noopener noreferrer" className="text-[11px] underline" style={{ color: "#4800a0" }}>
                  View Proof
                </a>
              )}
              {sub.proof_text && (
                <p className="text-[11px] mt-0.5" style={{ color: "#4a4455" }}>{sub.proof_text}</p>
              )}
              <div className="mt-2 flex justify-end">
                <button
                  onClick={() => {
                    setReviewing(sub);
                    setNotes("");
                  }}
                  className="px-3 py-1 rounded-full text-[11px] font-medium border"
                  style={{
                    borderColor: sub.status === "pending" ? "#4800a0" : "#e0e0e0",
                    color: sub.status === "pending" ? "#4800a0" : "#4a4455",
                    background: sub.status === "pending" ? "#f0e6ff" : "#fff",
                  }}
                >
                  {sub.status === "pending" ? "Review" : "View"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {reviewing && !showRejectReason && !showApproveConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.5)" }}>
          <div className="w-[90%] max-w-sm bg-white rounded-2xl p-5 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-9 h-9 rounded-full bg-[#630ed4] text-white flex items-center justify-center text-xs font-semibold flex-shrink-0">
                {String(reviewing.user_id).slice(-1)}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold" style={{ color: "#191c1e" }}>User #{reviewing.user_id}</p>
                <p className="text-[11px]" style={{ color: "#4a4455" }}>{reviewing.task_title}</p>
                <p className="text-[10px]" style={{ color: "#4a4455" }}>
                  {new Date(reviewing.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                </p>
              </div>
            </div>

            {reviewing.proof_url && (
              <a
                href={reviewing.proof_url}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-xs font-medium underline mb-2"
                style={{ color: "#4800a0" }}
              >
                View Proof
              </a>
            )}
            {reviewing.proof_text && (
              <div className="rounded-lg p-2.5 mb-3" style={{ background: "#f0f0f0" }}>
                <p className="text-[10px] font-semibold mb-0.5" style={{ color: "#4a4455" }}>Proof</p>
                <p className="text-xs" style={{ color: "#191c1e" }}>{reviewing.proof_text}</p>
              </div>
            )}

            {reviewing.instructions && (
              <div className="rounded-lg p-2.5 mb-3" style={{ background: "#f0f0f0" }}>
                <p className="text-[10px] font-semibold mb-0.5" style={{ color: "#4a4455" }}>Instructions</p>
                <p className="text-xs" style={{ color: "#191c1e" }}>{reviewing.instructions}</p>
              </div>
            )}

            <textarea
              placeholder="Admin notes (optional)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 rounded-lg text-xs outline-none resize-none mb-3"
              style={{ border: "1px solid #e0e0e0", color: "#191c1e" }}
            />

            <div className="flex gap-2">
              <button
                onClick={() => setReviewing(null)}
                className="py-2 px-3 rounded-lg text-xs font-medium"
                style={{ background: "#f0f0f0", color: "#4a4455" }}
              >
                Cancel
              </button>
              <button
                onClick={() => setShowRejectReason(true)}
                disabled={acting}
                className="flex-1 py-2 rounded-lg text-xs font-medium text-white disabled:opacity-50"
                style={{ background: "#ba1a1a" }}
              >
                Reject
              </button>
              <button
                onClick={() => setShowApproveConfirm(true)}
                disabled={acting}
                className="flex-1 py-2 rounded-lg text-xs font-medium text-white disabled:opacity-50"
                style={{ background: "#10b981" }}
              >
                Approve
              </button>
            </div>
          </div>
        </div>
      )}

      {showRejectReason && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center" style={{ background: "rgba(0,0,0,0.6)" }}>
          <div className="w-[85%] max-w-xs bg-white rounded-2xl p-5">
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-2">
              <span className="material-symbols-outlined text-xl" style={{ color: "#ba1a1a" }}>warning</span>
            </div>
            <h3 className="text-sm font-bold text-center mb-2" style={{ color: "#191c1e" }}>
              Provide a reason for rejection
            </h3>
            <textarea
              placeholder="Reason is required..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 rounded-lg text-xs outline-none resize-none mb-1.5"
              style={{
                border: rejectReason.trim() ? "1px solid #e0e0e0" : "2px solid #ba1a1a",
                color: "#191c1e",
              }}
            />
            {!rejectReason.trim() && (
              <p className="text-[10px] mb-2" style={{ color: "#ba1a1a" }}>Reason is required</p>
            )}
            <div className="flex gap-2 mt-3">
              <button
                onClick={() => {
                  setShowRejectReason(false);
                  setRejectReason("");
                }}
                className="flex-1 py-2 rounded-lg text-xs font-medium"
                style={{ background: "#f0f0f0", color: "#4a4455" }}
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={acting || !rejectReason.trim()}
                className="flex-1 py-2 rounded-lg text-xs font-medium text-white disabled:opacity-50"
                style={{ background: "#ba1a1a" }}
              >
                {acting ? "Rejecting..." : "Confirm Rejection"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showApproveConfirm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center" style={{ background: "rgba(0,0,0,0.5)" }}>
          <div className="w-[80%] max-w-[280px] bg-white rounded-2xl p-4 text-center">
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-2">
              <span className="material-symbols-outlined text-xl" style={{ color: "#10b981" }}>check_circle</span>
            </div>
            <p className="text-xs font-semibold mb-3" style={{ color: "#191c1e" }}>Approve this submission?</p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowApproveConfirm(false)}
                className="flex-1 py-1.5 rounded-lg text-xs font-medium"
                style={{ background: "#f0f0f0", color: "#4a4455" }}
              >
                Cancel
              </button>
              <button
                onClick={handleApprove}
                disabled={acting}
                className="flex-1 py-1.5 rounded-lg text-xs font-medium text-white disabled:opacity-50"
                style={{ background: "#10b981" }}
              >
                {acting ? "Approving..." : "Yes"}
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
