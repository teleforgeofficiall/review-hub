import { useState, useEffect } from "react";
import api from "../lib/api";

interface Submission {
  id: number;
  task_id: number;
  status: string;
  admin_note: string | null;
  created_at: string;
  task_title?: string;
  task_variant?: string;
  slot_number?: number;
}

const statusConfig: Record<string, { label: string; pillBg: string; pillFg: string; pillBorder: string; accent: string }> = {
  approved: { label: "Approved", pillBg: "#d1fae5", pillFg: "#065f46", pillBorder: "#a7f3d0", accent: "#10b981" },
  pending: { label: "Pending", pillBg: "#fef3c7", pillFg: "#92400e", pillBorder: "#fde68a", accent: "#f59e0b" },
  rejected: { label: "Rejected", pillBg: "#fee2e2", pillFg: "#991b1b", pillBorder: "#fecaca", accent: "#ef4444" },
};

const borderColors: Record<string, string> = {
  approved: "#10b981",
  pending: "#f59e0b",
  rejected: "#ef4444",
};

export default function SubmissionsPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get("/submissions"),
      api.get("/tasks"),
    ])
      .then(([subsRes, tasksRes]) => {
        const taskMap: Record<number, { title: string; task_variant?: string }> = {};
        tasksRes.data.forEach((t: any) => { taskMap[t.id] = { title: t.title, task_variant: t.task_variant }; });
        const subs = subsRes.data.map((s: any) => ({
          ...s,
          task_title: taskMap[s.task_id]?.title || `Task #${s.task_id}`,
          task_variant: taskMap[s.task_id]?.task_variant,
        }));
        setSubmissions(subs);
      })
      .catch(() => setSubmissions([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <>
        <h1 className="text-[16px] font-bold mb-3" style={{ color: "#191c1e" }}>My Submissions</h1>
        <div className="flex flex-col gap-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="glass-card rounded-xl p-3.5 animate-pulse">
              <div className="flex justify-between items-start gap-2">
                <div className="flex-1">
                  <div className="h-3 bg-gray-200 rounded w-3/4 mb-1.5" />
                  <div className="h-2 bg-gray-200 rounded w-1/3" />
                </div>
                <div className="h-4 bg-gray-200 rounded-full w-16" />
              </div>
            </div>
          ))}
        </div>
      </>
    );
  }

  return (
    <>
      <h1 className="text-[16px] font-bold mb-3" style={{ color: "#191c1e" }}>My Submissions</h1>

      {submissions.length === 0 ? (
        <div className="glass-card rounded-xl p-8 text-center">
          <span className="material-symbols-outlined text-[40px] mb-2" style={{ color: "#7b7487" }}>inbox</span>
          <p className="text-[14px] font-medium" style={{ color: "#4a4455" }}>No submissions yet</p>
          <p className="text-[12px] mt-1" style={{ color: "#7b7487" }}>Complete tasks to see them here</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {submissions.map((sub) => {
            const s = statusConfig[sub.status] || statusConfig.pending;
            return (
              <div
                key={sub.id}
                className="glass-card rounded-xl p-3.5"
                style={{ borderLeft: `4px solid ${borderColors[sub.status]}` }}
              >
                <div className="flex justify-between items-start gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-0.5">
                      <h4 className="text-[14px] font-bold truncate" style={{ color: "#191c1e" }}>
                        {sub.task_title}
                      </h4>
                      {sub.task_variant && (
                        <span
                          className="px-1.5 py-0.5 rounded text-[9px] font-bold flex-shrink-0"
                          style={{
                            background: sub.task_variant === "bulk" ? "#ede9fe" : "#e0f2fe",
                            color: sub.task_variant === "bulk" ? "#630ed4" : "#0284c7",
                          }}
                        >
                          {sub.task_variant === "bulk" ? "Bulk" : "Single"}
                        </span>
                      )}
                    </div>
                    {sub.task_variant === "bulk" && sub.slot_number && (
                      <p className="text-[10px] font-medium" style={{ color: "#7b7487" }}>
                        Slot #{sub.slot_number}
                      </p>
                    )}
                    <p className="text-[10px] mt-0.5" style={{ color: "#4a4455" }}>
                      {new Date(sub.created_at).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  <span
                    className="px-2 py-0.5 rounded-full text-[10px] font-bold flex-shrink-0"
                    style={{ background: s.pillBg, color: s.pillFg, border: `1px solid ${s.pillBorder}` }}
                  >
                    {s.label}
                  </span>
                </div>
                {sub.admin_note && (
                  <div
                    className="recessed-well rounded-md p-2 mt-2"
                    style={{ borderLeft: `2px solid ${s.accent}` }}
                  >
                    <p className="text-[11px] leading-relaxed" style={{ color: "#4a4455" }}>
                      <span className="font-medium" style={{ color: "#191c1e" }}>Admin: </span>
                      {sub.admin_note}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
