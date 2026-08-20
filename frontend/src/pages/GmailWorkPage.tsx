import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../lib/api";

export default function GmailWorkPage() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!name.trim() || !email.trim() || !password.trim()) {
      setError("Please fill in all fields");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      await api.post("/submissions", {
        task_type: "gmail_work",
        name: name.trim(),
        email: email.trim(),
        password: password.trim(),
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
          Your Gmail work submission has been received for review.
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

      <h1 className="text-[16px] font-bold mb-4" style={{ color: "#191c1e" }}>Gmail Work</h1>

      {/* Guide Section */}
      <div className="glass-card rounded-xl p-4 mb-3">
        <h3 className="text-[14px] font-bold mb-2" style={{ color: "#191c1e" }}>How to Complete</h3>
        <div className="recessed-well rounded-lg p-3">
          <ol className="text-[13px] leading-relaxed space-y-1" style={{ color: "#4a4455" }}>
            <li>1. Follow the process video below carefully.</li>
            <li>2. Create a new Gmail account as shown.</li>
            <li>3. Fill in the details below with the new account info.</li>
            <li>4. Submit and wait for admin review.</li>
          </ol>
        </div>
      </div>

      {/* Process Video Placeholder */}
      <div className="glass-card rounded-xl p-4 mb-3">
        <div className="recessed-well rounded-lg aspect-video flex items-center justify-center">
          <div className="text-center">
            <span className="material-symbols-outlined text-[32px] mb-1" style={{ color: "#7b7487" }}>play_circle</span>
            <p className="text-[12px] font-medium" style={{ color: "#7b7487" }}>Process video will appear here</p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="glass-card rounded-xl p-4 mb-3">
        <h3 className="text-[14px] font-bold mb-3" style={{ color: "#191c1e" }}>Submit Details</h3>
        {error && (
          <div className="mb-3 px-3 py-2 rounded-lg text-[12px] font-medium" style={{ background: "#fee2e2", color: "#991b1b" }}>
            {error}
          </div>
        )}
        <div className="flex flex-col gap-3">
          <div>
            <label className="block text-[12px] font-bold mb-1" style={{ color: "#4a4455" }}>Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              className="app-input"
            />
          </div>
          <div>
            <label className="block text-[12px] font-bold mb-1" style={{ color: "#4a4455" }}>Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@gmail.com"
              className="app-input"
            />
          </div>
          <div>
            <label className="block text-[12px] font-bold mb-1" style={{ color: "#4a4455" }}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              className="app-input"
            />
          </div>
        </div>
      </div>

      <button
        onClick={handleSubmit}
        disabled={submitting}
        className="w-full btn-3d rounded-xl py-3 text-[14px] font-bold flex items-center justify-center gap-2 disabled:opacity-50"
      >
        <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>send</span>
        {submitting ? "Submitting..." : "Submit Gmail Work"}
      </button>
    </>
  );
}
