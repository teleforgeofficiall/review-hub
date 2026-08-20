import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../lib/api";

interface Task {
  id: number;
  title: string;
  description: string | null;
  task_type: string;
  task_variant?: string;
  reward: number;
  instructions: string | null;
  proof_required: boolean;
  current_submissions: number;
  is_active: boolean;
}

export default function TaskDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [proofText, setProofText] = useState("");
  const [proofUrl, setProofUrl] = useState("");
  const [commentSlots, setCommentSlots] = useState<string[]>(Array(10).fill(""));
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    api.get(`/tasks/${id}`)
      .then((res) => setTask(res.data))
      .catch(() => setTask(null))
      .finally(() => setLoading(false));
  }, [id]);

  const updateCommentSlot = (index: number, value: string) => {
    const next = [...commentSlots];
    next[index] = value;
    setCommentSlots(next);
  };

  const handleSubmit = async () => {
    if (!task || submitting) return;

    const isBulk = task.task_variant === "bulk";

    if (isBulk) {
      const filled = commentSlots.filter((s) => s.trim());
      if (filled.length === 0) {
        setError("Please fill at least one comment slot");
        return;
      }
      setSubmitting(true);
      setError("");
      try {
        await api.post("/submissions", {
          task_id: task.id,
          comments: filled,
        });
        setSubmitted(true);
      } catch (err: any) {
        setError(err.response?.data?.detail || "Failed to submit");
      } finally {
        setSubmitting(false);
      }
    } else {
      if (!proofUrl.trim() && !proofText.trim()) {
        setError("Please provide proof (URL or notes)");
        return;
      }
      setSubmitting(true);
      setError("");
      try {
        await api.post("/submissions", {
          task_id: task.id,
          proof_url: proofUrl.trim() || null,
          proof_text: proofText.trim() || null,
        });
        setSubmitted(true);
      } catch (err: any) {
        setError(err.response?.data?.detail || "Failed to submit");
      } finally {
        setSubmitting(false);
      }
    }
  };

  if (loading) {
    return (
      <>
        <div className="glass-card rounded-xl p-4 mb-3 animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-20 mb-3" />
          <div className="h-5 bg-gray-200 rounded w-3/4 mb-2" />
          <div className="h-3 bg-gray-200 rounded w-full mb-1" />
          <div className="h-3 bg-gray-200 rounded w-2/3" />
        </div>
        <div className="glass-card rounded-xl p-4 animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-24 mb-3" />
          <div className="h-10 bg-gray-200 rounded mb-2" />
          <div className="h-16 bg-gray-200 rounded" />
        </div>
      </>
    );
  }

  if (!task) {
    return (
      <div className="glass-card rounded-xl p-8 text-center">
        <span className="material-symbols-outlined text-[40px] mb-2" style={{ color: "#7b7487" }}>error</span>
        <p className="text-[14px] font-medium mb-3" style={{ color: "#4a4455" }}>Task not found</p>
        <button onClick={() => navigate("/tasks")} className="btn-3d rounded-xl px-6 py-2 text-[13px] font-bold">
          Back to Tasks
        </button>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="glass-card rounded-xl p-6 text-center mt-4">
        <div
          className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3"
          style={{ background: "rgba(16,185,129,0.1)" }}
        >
          <span className="material-symbols-outlined text-[24px]" style={{ color: "#10b981", fontVariationSettings: "'FILL' 1" }}>
            check_circle
          </span>
        </div>
        <h2 className="text-[18px] font-bold mb-1.5" style={{ color: "#191c1e" }}>Submitted!</h2>
        <p className="text-[14px] mb-5" style={{ color: "#4a4455" }}>
          Your submission is under review. You'll receive ₹{task.reward.toFixed(2)} once approved.
        </p>
        <button onClick={() => navigate("/tasks")} className="w-full btn-3d rounded-xl py-3 text-[14px] font-bold">
          Back to Tasks
        </button>
      </div>
    );
  }

  return (
    <>
      <button
        onClick={() => navigate("/tasks")}
        className="flex items-center gap-1 mb-3 active:scale-[0.98] transition-transform"
      >
        <span className="material-symbols-outlined text-[20px]" style={{ color: "#630ed4" }}>arrow_back</span>
        <span className="text-[14px] font-semibold" style={{ color: "#630ed4" }}>Back</span>
      </button>

      <div className="glass-card rounded-xl p-4 mb-3">
        <div className="flex items-center gap-2 mb-2">
          <div
            className="flex items-center gap-1.5 bg-primary/10 px-2.5 py-1 rounded-full border"
            style={{ borderColor: "rgba(124,58,237,0.2)" }}
          >
            <span className="material-symbols-outlined text-[14px]" style={{ color: "#630ed4" }}>payments</span>
            <span className="text-[12px] font-bold" style={{ color: "#630ed4" }}>₹{task.reward.toFixed(2)}</span>
          </div>
        </div>
        <h2 className="text-[16px] font-bold mb-1.5" style={{ color: "#191c1e" }}>{task.title}</h2>
        {task.description && (
          <p className="text-[14px] mb-2" style={{ color: "#4a4455" }}>{task.description}</p>
        )}
        {task.instructions && (
          <div className="recessed-well rounded-lg p-3 mt-2">
            <h4 className="text-[12px] font-bold mb-1.5 flex items-center gap-1" style={{ color: "#4a4455" }}>
              <span className="material-symbols-outlined text-[14px]">info</span> Instructions
            </h4>
            <p className="text-[14px] whitespace-pre-wrap leading-relaxed" style={{ color: "#191c1e" }}>
              {task.instructions}
            </p>
          </div>
        )}
      </div>

      <div className="glass-card rounded-xl p-4">
        {task.task_variant === "bulk" ? (
          <>
            <h3 className="text-[16px] font-bold mb-3" style={{ color: "#191c1e" }}>
              Comment Slots ({commentSlots.filter((s) => s.trim()).length}/10)
            </h3>
            {error && (
              <div className="mb-3 px-3 py-2 rounded-lg text-[12px] font-medium" style={{ background: "#fee2e2", color: "#991b1b" }}>
                {error}
              </div>
            )}
            <div className="flex flex-col gap-2 mb-4">
              {commentSlots.map((slot, i) => (
                <input
                  key={i}
                  type="text"
                  value={slot}
                  onChange={(e) => updateCommentSlot(i, e.target.value)}
                  placeholder={`Comment #${i + 1}`}
                  className="app-input"
                />
              ))}
            </div>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="w-full btn-3d rounded-xl py-3 text-[14px] font-bold flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>send</span>
              {submitting ? "Submitting..." : "Submit All Comments"}
            </button>
          </>
        ) : (
          <>
            <h3 className="text-[16px] font-bold mb-3" style={{ color: "#191c1e" }}>Submit Proof</h3>
            {error && (
              <div className="mb-3 px-3 py-2 rounded-lg text-[12px] font-medium" style={{ background: "#fee2e2", color: "#991b1b" }}>
                {error}
              </div>
            )}
            <div className="mb-3">
              <label className="block text-[12px] font-bold mb-1" style={{ color: "#4a4455" }}>Screenshot URL</label>
              <input
                type="url"
                value={proofUrl}
                onChange={(e) => setProofUrl(e.target.value)}
                placeholder="https://prnt.sc/..."
                className="app-input"
              />
            </div>
            <div className="mb-4">
              <label className="block text-[12px] font-bold mb-1" style={{ color: "#4a4455" }}>Additional Notes</label>
              <textarea
                value={proofText}
                onChange={(e) => setProofText(e.target.value)}
                placeholder="Any comments for the admin..."
                rows={3}
                className="app-input resize-none"
              />
            </div>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="w-full btn-3d rounded-xl py-3 text-[14px] font-bold flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>send</span>
              {submitting ? "Submitting..." : "Submit Proof"}
            </button>
          </>
        )}
      </div>
    </>
  );
}
