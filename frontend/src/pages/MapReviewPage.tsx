import { useNavigate } from "react-router-dom";

export default function MapReviewPage() {
  const navigate = useNavigate();

  return (
    <>
      <button
        onClick={() => navigate("/tasks")}
        className="flex items-center gap-1 mb-3 active:scale-[0.98] transition-transform"
      >
        <span className="material-symbols-outlined text-[20px]" style={{ color: "#630ed4" }}>arrow_back</span>
        <span className="text-[14px] font-semibold" style={{ color: "#630ed4" }}>Back</span>
      </button>

      <h1 className="text-[16px] font-bold mb-4" style={{ color: "#191c1e" }}>Map Reviews</h1>

      <div className="flex gap-3">
        {/* Single Task Card */}
        <div className="glass-card rounded-xl p-4 flex-1 flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[12px] font-bold" style={{ color: "#4a4455" }}>Single Task</span>
            <div className="badge-primary">₹7</div>
          </div>
          <p className="text-[13px] mb-3 flex-1" style={{ color: "#4a4455" }}>
            Complete one map review with 1 proof submission.
          </p>
          <div className="flex items-center gap-1.5 mb-3">
            <span className="material-symbols-outlined text-[14px]" style={{ color: "#630ed4" }}>check_circle</span>
            <span className="text-[11px] font-medium" style={{ color: "#4a4455" }}>1 proof required</span>
          </div>
          <button
            onClick={() => navigate("/tasks?type=map_review")}
            className="w-full btn-3d rounded-xl py-2.5 text-[13px] font-bold"
          >
            Complete Map Review
          </button>
        </div>

        {/* Bulk Task Card */}
        <div className="glass-card rounded-xl p-4 flex-1 flex flex-col opacity-60">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[12px] font-bold" style={{ color: "#4a4455" }}>Bulk Task</span>
            <div className="badge-primary">₹10</div>
          </div>
          <p className="text-[13px] mb-3 flex-1" style={{ color: "#4a4455" }}>
            Complete multiple map reviews with 10 comment slots.
          </p>
          <div className="flex items-center gap-1.5 mb-3">
            <span className="material-symbols-outlined text-[14px]" style={{ color: "#7b7487" }}>lock</span>
            <span className="text-[11px] font-medium" style={{ color: "#7b7487" }}>
              Complete 5 single tasks to unlock
            </span>
          </div>
          <button
            disabled
            className="w-full btn-3d rounded-xl py-2.5 text-[13px] font-bold flex items-center justify-center gap-1.5 opacity-50 cursor-not-allowed"
          >
            <span className="material-symbols-outlined text-[16px]">lock</span>
            Locked
          </button>
        </div>
      </div>
    </>
  );
}
