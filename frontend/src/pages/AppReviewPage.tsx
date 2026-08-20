import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../lib/api";

export default function AppReviewPage() {
  const navigate = useNavigate();
  const [slots, setSlots] = useState<string[]>(Array(10).fill(""));
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const updateSlot = (index: number, value: string) => {
    const next = [...slots];
    next[index] = value;
    setSlots(next);
  };

  const handleSubmit = async () => {
    const filled = slots.filter((s) => s.trim());
    if (filled.length === 0) {
      setError("Please fill at least one comment slot");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      await api.post("/submissions", {
        task_type: "app_rating",
        comments: filled,
      });
      setSubmitted(true);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to submit");
    } finally {
      setSubmitting(false);
    }
  };

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
          Your app review comments have been submitted for review.
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

      <h1 className="text-[16px] font-bold mb-4" style={{ color: "#191c1e" }}>App Reviews</h1>

      {/* App Link */}
      <div className="glass-card rounded-xl p-4 mb-3">
        <a
          href="https://play.google.com/store"
          target="_blank"
          rel="noopener noreferrer"
          className="btn-3d-secondary rounded-xl px-4 py-2.5 text-[13px] font-bold flex items-center justify-center gap-2 w-full"
        >
          <span className="material-symbols-outlined text-[16px]">open_in_new</span>
          Open App Link
        </a>
      </div>

      {/* Comment Slots */}
      <div className="glass-card rounded-xl p-4 mb-3">
        <h3 className="text-[14px] font-bold mb-3" style={{ color: "#191c1e" }}>
          Comment Slots ({slots.filter((s) => s.trim()).length}/10)
        </h3>
        {error && (
          <div className="mb-3 px-3 py-2 rounded-lg text-[12px] font-medium" style={{ background: "#fee2e2", color: "#991b1b" }}>
            {error}
          </div>
        )}
        <div className="flex flex-col gap-2">
          {slots.map((slot, i) => (
            <input
              key={i}
              type="text"
              value={slot}
              onChange={(e) => updateSlot(i, e.target.value)}
              placeholder={`Comment #${i + 1}`}
              className="app-input"
            />
          ))}
        </div>
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
  );
}
