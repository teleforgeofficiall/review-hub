import { useState, useEffect } from "react";
import api from "../../lib/api";

interface Task {
  id: number;
  title: string;
  task_type: string;
  reward: number;
  bulk_reward: number | null;
  variant: "single" | "bulk";
  video_url: string | null;
  app_link: string | null;
  comment_slots: string[] | null;
  submit_fields: { name: boolean; email: boolean; password: boolean } | null;
  current_submissions: number;
  max_submissions: number | null;
  is_active: boolean;
  description: string | null;
  instructions: string | null;
}

const catMap: Record<string, string> = { gmail_work: "Gmail", app_rating: "Apps", map_review: "Maps" };
const revCatMap: Record<string, string> = { Gmail: "gmail_work", Apps: "app_rating", Maps: "map_review" };
const catStyle: Record<string, { bg: string; fg: string; icon: string }> = {
  Gmail: { bg: "#fef2f2", fg: "#dc2626", icon: "mail" },
  Apps: { bg: "#eff6ff", fg: "#2563eb", icon: "apps" },
  Maps: { bg: "#f0fdf4", fg: "#16a34a", icon: "map" },
};

export default function AdminTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [selected, setSelected] = useState<Task | null>(null);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    title: "",
    category: "Gmail",
    reward: "",
    description: "",
    instructions: "",
    variant: "single" as "single" | "bulk",
    bulk_reward: "",
    video_url: "",
    app_link: "",
    comment_slots: ["", "", "", "", "", "", "", "", "", ""],
    submit_fields: { name: true, email: true, password: true },
  });

  function fetchTasks() {
    api.get("/tasks")
      .then((r) => setTasks(r.data))
      .catch(() => setTasks([]))
      .finally(() => setLoading(false));
  }

  useEffect(() => { fetchTasks(); }, []);

  const filtered = tasks.filter((t) => {
    if (filter !== "All" && catMap[t.task_type] !== filter) return false;
    if (search && !t.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  function resetForm() {
    setForm({
      title: "", category: "Gmail", reward: "", description: "", instructions: "",
      variant: "single", bulk_reward: "", video_url: "", app_link: "",
      comment_slots: ["", "", "", "", "", "", "", "", "", ""],
      submit_fields: { name: true, email: true, password: true },
    });
  }

  function openCreate() {
    resetForm();
    setShowCreate(true);
  }
  function openEdit(t: Task) {
    setForm({
      title: t.title,
      category: catMap[t.task_type] || "Gmail",
      reward: String(t.reward),
      description: t.description || "",
      instructions: t.instructions || "",
      variant: t.variant || "single",
      bulk_reward: t.bulk_reward ? String(t.bulk_reward) : "",
      video_url: t.video_url || "",
      app_link: t.app_link || "",
      comment_slots: t.comment_slots && t.comment_slots.length >= 10
        ? [...t.comment_slots]
        : ["", "", "", "", "", "", "", "", "", ""],
      submit_fields: t.submit_fields || { name: true, email: true, password: true },
    });
    setSelected(t);
    setShowEdit(true);
  }
  function openDelete(t: Task) { setSelected(t); setShowDelete(true); }

  async function handleCreate() {
    if (!form.title.trim() || !form.reward) return;
    setSaving(true);
    try {
      const payload: any = {
        title: form.title.trim(),
        task_type: revCatMap[form.category] || "gmail_work",
        reward: Number(form.reward),
        description: form.description.trim() || null,
        instructions: form.instructions.trim() || null,
        variant: form.variant,
        proof_required: true,
      };
      if (form.variant === "bulk" && form.bulk_reward) {
        payload.bulk_reward = Number(form.bulk_reward);
      }
      if (form.video_url.trim()) payload.video_url = form.video_url.trim();
      if (form.category === "Apps") {
        payload.app_link = form.app_link.trim() || null;
        payload.comment_slots = form.comment_slots.filter((s) => s.trim());
      }
      if (form.category === "Gmail") {
        payload.submit_fields = form.submit_fields;
      }
      await api.post("/tasks", payload);
      setShowCreate(false);
      fetchTasks();
    } catch (e: any) { alert(e.response?.data?.detail || "Failed"); }
    finally { setSaving(false); }
  }

  async function handleEdit() {
    if (!selected) return;
    setSaving(true);
    try {
      const payload: any = {
        title: form.title.trim(),
        task_type: revCatMap[form.category] || "gmail_work",
        reward: Number(form.reward),
        description: form.description.trim() || null,
        instructions: form.instructions.trim() || null,
        variant: form.variant,
      };
      if (form.variant === "bulk" && form.bulk_reward) {
        payload.bulk_reward = Number(form.bulk_reward);
      }
      if (form.video_url.trim()) payload.video_url = form.video_url.trim();
      if (form.category === "Apps") {
        payload.app_link = form.app_link.trim() || null;
        payload.comment_slots = form.comment_slots.filter((s) => s.trim());
      }
      if (form.category === "Gmail") {
        payload.submit_fields = form.submit_fields;
      }
      await api.put(`/tasks/${selected.id}`, payload);
      setShowEdit(false);
      fetchTasks();
    } catch (e: any) { alert(e.response?.data?.detail || "Failed"); }
    finally { setSaving(false); }
  }

  async function handleDelete() {
    if (!selected) return;
    setSaving(true);
    try {
      await api.delete(`/tasks/${selected.id}`);
      setShowDelete(false);
      fetchTasks();
    } catch (e: any) {
      alert(e.response?.data?.detail || e.message || "Failed to delete task");
    }
    finally { setSaving(false); }
  }

  const CategoryPicker = ({ value, onChange }: { value: string; onChange: (v: string) => void }) => (
    <div>
      <label className="text-[11px] font-semibold block mb-1.5" style={{ color: "#4a4455" }}>Category</label>
      <div className="flex gap-2">
        {["Gmail", "Apps", "Maps"].map((c) => (
          <button key={c} type="button" onClick={() => onChange(c)}
            className="flex-1 py-2 rounded-lg text-[12px] font-semibold transition-colors"
            style={{
              background: value === c ? "#4800a0" : "#f0e6ff",
              color: value === c ? "#fff" : "#4800a0",
            }}
          >{c}</button>
        ))}
      </div>
    </div>
  );

  const VariantPicker = ({ value, onChange }: { value: string; onChange: (v: "single" | "bulk") => void }) => (
    <div>
      <label className="text-[11px] font-semibold block mb-1.5" style={{ color: "#4a4455" }}>Task Variant</label>
      <div className="flex gap-2">
        {(["single", "bulk"] as const).map((v) => (
          <button key={v} type="button" onClick={() => onChange(v)}
            className="flex-1 py-2 rounded-lg text-[12px] font-semibold transition-colors capitalize"
            style={{
              background: value === v ? "#4800a0" : "#f0e6ff",
              color: value === v ? "#fff" : "#4800a0",
            }}
          >{v}</button>
        ))}
      </div>
    </div>
  );

  const TaskForm = () => (
    <div className="space-y-3">
      <div>
        <label className="text-[11px] font-semibold block mb-1.5" style={{ color: "#4a4455" }}>Task Title</label>
        <input type="text" placeholder="e.g. Gmail Sign Up Verification" value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          className="w-full px-3 py-2.5 rounded-lg text-[13px] outline-none"
          style={{ border: "1px solid #e0e0e0", color: "#191c1e" }} />
      </div>
      <CategoryPicker value={form.category} onChange={(c) => setForm({ ...form, category: c })} />
      <VariantPicker value={form.variant} onChange={(v) => setForm({ ...form, variant: v })} />
      <div>
        <label className="text-[11px] font-semibold block mb-1.5" style={{ color: "#4a4455" }}>Reward (₹)</label>
        <input type="number" placeholder="e.g. 10" value={form.reward} min="1"
          onChange={(e) => setForm({ ...form, reward: e.target.value })}
          className="w-full px-3 py-2.5 rounded-lg text-[13px] outline-none"
          style={{ border: "1px solid #e0e0e0", color: "#191c1e" }} />
      </div>
      {form.variant === "bulk" && (
        <div>
          <label className="text-[11px] font-semibold block mb-1.5" style={{ color: "#4a4455" }}>Bulk Reward (₹ per sub-task)</label>
          <input type="number" placeholder="e.g. 5" value={form.bulk_reward} min="1"
            onChange={(e) => setForm({ ...form, bulk_reward: e.target.value })}
            className="w-full px-3 py-2.5 rounded-lg text-[13px] outline-none"
            style={{ border: "1px solid #e0e0e0", color: "#191c1e" }} />
        </div>
      )}
      <div>
        <label className="text-[11px] font-semibold block mb-1.5" style={{ color: "#4a4455" }}>Process Video URL</label>
        <input type="url" placeholder="https://youtube.com/watch?v=..." value={form.video_url}
          onChange={(e) => setForm({ ...form, video_url: e.target.value })}
          className="w-full px-3 py-2.5 rounded-lg text-[13px] outline-none"
          style={{ border: "1px solid #e0e0e0", color: "#191c1e" }} />
      </div>
      {form.category === "Apps" && (
        <div>
          <label className="text-[11px] font-semibold block mb-1.5" style={{ color: "#4a4455" }}>App Link</label>
          <input type="url" placeholder="https://play.google.com/store/apps/..." value={form.app_link}
            onChange={(e) => setForm({ ...form, app_link: e.target.value })}
            className="w-full px-3 py-2.5 rounded-lg text-[13px] outline-none"
            style={{ border: "1px solid #e0e0e0", color: "#191c1e" }} />
        </div>
      )}
      {form.category === "Apps" && (
        <div>
          <label className="text-[11px] font-semibold block mb-1.5" style={{ color: "#4a4455" }}>Comment Slots (templates)</label>
          <div className="space-y-1.5">
            {form.comment_slots.map((slot, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="text-[10px] font-semibold w-5 text-center" style={{ color: "#7b7487" }}>{i + 1}</span>
                <input type="text" placeholder={`Comment template #${i + 1}`} value={slot}
                  onChange={(e) => {
                    const slots = [...form.comment_slots];
                    slots[i] = e.target.value;
                    setForm({ ...form, comment_slots: slots });
                  }}
                  className="flex-1 px-3 py-2 rounded-lg text-[12px] outline-none"
                  style={{ border: "1px solid #e0e0e0", color: "#191c1e" }} />
              </div>
            ))}
          </div>
        </div>
      )}
      {form.category === "Gmail" && (
        <div>
          <label className="text-[11px] font-semibold block mb-1.5" style={{ color: "#4a4455" }}>Submit Fields</label>
          <div className="flex gap-3">
            {(["name", "email", "password"] as const).map((f) => (
              <label key={f} className="flex items-center gap-1.5 text-[12px] font-medium capitalize" style={{ color: "#4a4455" }}>
                <input type="checkbox" checked={form.submit_fields[f]}
                  onChange={(e) => setForm({ ...form, submit_fields: { ...form.submit_fields, [f]: e.target.checked } })}
                  className="w-4 h-4 rounded accent-[#4800a0]" />
                {f}
              </label>
            ))}
          </div>
        </div>
      )}
      <div>
        <label className="text-[11px] font-semibold block mb-1.5" style={{ color: "#4a4455" }}>Description</label>
        <textarea placeholder="Short description for users" value={form.description} rows={2}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          className="w-full px-3 py-2.5 rounded-lg text-[13px] outline-none resize-none"
          style={{ border: "1px solid #e0e0e0", color: "#191c1e" }} />
      </div>
      <div>
        <label className="text-[11px] font-semibold block mb-1.5" style={{ color: "#4a4455" }}>Instructions</label>
        <textarea placeholder="Step-by-step instructions for users" value={form.instructions} rows={3}
          onChange={(e) => setForm({ ...form, instructions: e.target.value })}
          className="w-full px-3 py-2.5 rounded-lg text-[13px] outline-none resize-none"
          style={{ border: "1px solid #e0e0e0", color: "#191c1e" }} />
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="pt-3 pb-4">
        <h1 className="text-lg font-bold mb-3" style={{ color: "#191c1e" }}>Tasks</h1>
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="glass-card rounded-xl p-3 animate-pulse">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gray-200" />
                <div className="flex-1"><div className="h-3 bg-gray-200 rounded w-2/3 mb-1" /><div className="h-2 bg-gray-200 rounded w-1/4" /></div>
                <div className="h-5 bg-gray-200 rounded w-10" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="pt-3 pb-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-2.5">
        <h1 className="text-lg font-bold" style={{ color: "#191c1e" }}>Tasks</h1>
        <button onClick={openCreate} className="btn-3d flex items-center gap-1 px-3 py-1.5 rounded-lg text-[11px] font-semibold">
          <span className="material-symbols-outlined text-sm">add</span>Add
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-2.5">
        <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-[16px]" style={{ color: "#4a4455" }}>search</span>
        <input type="text" placeholder="Search tasks..." value={search} onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-8 pr-3 py-2 rounded-lg text-[12px] outline-none"
          style={{ background: "#fff", border: "1px solid #e0e0e0", color: "#191c1e" }} />
      </div>

      {/* Filter pills */}
      <div className="flex gap-1.5 pb-2.5 overflow-x-auto hide-scroll">
        {["All", "Gmail", "Apps", "Maps"].map((c) => (
          <button key={c} onClick={() => setFilter(c)}
            className="px-3 py-1 rounded-full text-[11px] font-medium whitespace-nowrap flex-shrink-0"
            style={{
              background: filter === c ? "#4800a0" : "#fff",
              color: filter === c ? "#fff" : "#4a4455",
              border: filter === c ? "none" : "1px solid #e0e0e0",
            }}
          >{c}</button>
        ))}
      </div>

      {/* Task list */}
      {filtered.length === 0 ? (
        <div className="glass-card rounded-xl p-6 text-center">
          <span className="material-symbols-outlined text-[32px] mb-1" style={{ color: "#7b7487" }}>inbox</span>
          <p className="text-[12px] font-medium" style={{ color: "#4a4455" }}>No tasks found</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((t) => {
            const cat = catMap[t.task_type] || "Other";
            const cs = catStyle[cat] || { bg: "#f3f4f6", fg: "#6b7280", icon: "help" };
            const isBulk = t.variant === "bulk";
            return (
              <div key={t.id} className="glass-card rounded-xl overflow-hidden">
                {/* Main row */}
                <div className="flex items-center gap-2.5 p-3">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: cs.bg }}>
                    <span className="material-symbols-outlined text-[16px]" style={{ color: cs.fg, fontVariationSettings: "'FILL' 1" }}>{cs.icon}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="text-[13px] font-semibold leading-tight truncate" style={{ color: "#191c1e" }}>{t.title}</p>
                      {isBulk && (
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: "#fef3c7", color: "#92400e" }}>BULK</span>
                      )}
                    </div>
                    <p className="text-[10px] leading-tight mt-0.5" style={{ color: "#4a4455" }}>{cat} · {t.current_submissions} submitted</p>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: t.is_active ? "#10b981" : "#ef4444" }} />
                    <span className="text-[12px] font-bold px-1.5 py-0.5 rounded" style={{ background: "#f0e6ff", color: "#4800a0" }}>₹{t.reward}</span>
                  </div>
                </div>
                {/* Action row */}
                <div className="flex border-t" style={{ borderColor: "rgba(0,0,0,0.05)" }}>
                  <button onClick={() => openEdit(t)}
                    className="flex-1 flex items-center justify-center gap-1 py-2 text-[11px] font-semibold"
                    style={{ color: "#4800a0" }}>
                    <span className="material-symbols-outlined text-[14px]">edit</span>Edit
                  </button>
                  <div className="w-px" style={{ background: "rgba(0,0,0,0.05)" }} />
                  <button onClick={() => openDelete(t)}
                    className="flex-1 flex items-center justify-center gap-1 py-2 text-[11px] font-semibold"
                    style={{ color: "#ba1a1a" }}>
                    <span className="material-symbols-outlined text-[14px]">delete</span>Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CREATE MODAL */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center" style={{ background: "rgba(0,0,0,0.5)" }}>
          <div className="w-full sm:w-[90%] sm:max-w-sm bg-white rounded-t-2xl sm:rounded-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white flex items-center justify-between px-4 pt-4 pb-3 border-b" style={{ borderColor: "#f0f0f0" }}>
              <h2 className="text-[15px] font-bold" style={{ color: "#191c1e" }}>Create Task</h2>
              <button onClick={() => setShowCreate(false)} className="p-1">
                <span className="material-symbols-outlined text-[20px]" style={{ color: "#4a4455" }}>close</span>
              </button>
            </div>
            <div className="px-4 py-4">
              <TaskForm />
            </div>
            <div className="sticky bottom-0 bg-white flex gap-2 px-4 pb-4 pt-2 border-t" style={{ borderColor: "#f0f0f0" }}>
              <button onClick={() => setShowCreate(false)} className="flex-1 py-2.5 rounded-lg text-[13px] font-semibold"
                style={{ background: "#f0f0f0", color: "#4a4455" }}>Cancel</button>
              <button onClick={handleCreate} disabled={saving || !form.title.trim() || !form.reward}
                className="btn-3d flex-1 py-2.5 rounded-lg text-[13px] font-semibold disabled:opacity-40">
                {saving ? "Creating..." : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {showEdit && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center" style={{ background: "rgba(0,0,0,0.5)" }}>
          <div className="w-full sm:w-[90%] sm:max-w-sm bg-white rounded-t-2xl sm:rounded-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white flex items-center justify-between px-4 pt-4 pb-3 border-b" style={{ borderColor: "#f0f0f0" }}>
              <h2 className="text-[15px] font-bold" style={{ color: "#191c1e" }}>Edit Task</h2>
              <button onClick={() => setShowEdit(false)} className="p-1">
                <span className="material-symbols-outlined text-[20px]" style={{ color: "#4a4455" }}>close</span>
              </button>
            </div>
            <div className="px-4 py-4">
              <TaskForm />
            </div>
            <div className="sticky bottom-0 bg-white flex gap-2 px-4 pb-4 pt-2 border-t" style={{ borderColor: "#f0f0f0" }}>
              <button onClick={() => setShowEdit(false)} className="flex-1 py-2.5 rounded-lg text-[13px] font-semibold"
                style={{ background: "#f0f0f0", color: "#4a4455" }}>Cancel</button>
              <button onClick={handleEdit} disabled={saving}
                className="btn-3d flex-1 py-2.5 rounded-lg text-[13px] font-semibold disabled:opacity-40">
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRM */}
      {showDelete && selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.5)" }}>
          <div className="w-[85%] max-w-[280px] bg-white rounded-2xl p-5 text-center">
            <div className="w-11 h-11 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-2">
              <span className="material-symbols-outlined text-[22px]" style={{ color: "#ba1a1a" }}>warning</span>
            </div>
            <h3 className="text-[14px] font-bold mb-1" style={{ color: "#191c1e" }}>Deactivate Task?</h3>
            <p className="text-[12px] mb-4" style={{ color: "#4a4455" }}>"{selected.title}" will be hidden from users.</p>
            <div className="flex gap-2">
              <button onClick={() => setShowDelete(false)} className="flex-1 py-2 rounded-lg text-[12px] font-semibold"
                style={{ background: "#f0f0f0", color: "#4a4455" }}>Cancel</button>
              <button onClick={handleDelete} disabled={saving}
                className="flex-1 py-2 rounded-lg text-[12px] font-semibold text-white disabled:opacity-50"
                style={{ background: "#ba1a1a" }}>{saving ? "Deleting..." : "Delete"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
