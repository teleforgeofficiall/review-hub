import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../lib/api";

interface Task {
  id: number;
  title: string;
  task_type: string;
  reward: number;
  current_submissions: number;
  max_submissions: number | null;
}

const typeConfig: Record<string, { icon: string; bg: string; fg: string }> = {
  gmail_work: { icon: "mail", bg: "#fef2f2", fg: "#dc2626" },
  app_rating: { icon: "star", bg: "#f0fdf4", fg: "#16a34a" },
  map_review: { icon: "location_on", bg: "#eff6ff", fg: "#2563eb" },
};

const filters = [
  { key: "all", label: "All Tasks" },
  { key: "map_review", label: "Maps" },
  { key: "app_rating", label: "Apps" },
  { key: "gmail_work", label: "Gmail" },
];

export default function TasksPage() {
  const [filter, setFilter] = useState<string>("all");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const typeParam = searchParams.get("type");
    if (typeParam && typeConfig[typeParam]) setFilter(typeParam);
  }, [searchParams]);

  useEffect(() => {
    setLoading(true);
    api.get("/tasks")
      .then((res) => setTasks(res.data))
      .catch(() => setTasks([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = filter === "all" ? tasks : tasks.filter((t) => t.task_type === filter);

  if (loading) {
    return (
      <>
        <h1 className="text-[16px] font-bold mb-3" style={{ color: "#191c1e" }}>Review Tasks</h1>
        <div className="flex flex-col gap-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="glass-card rounded-xl px-4 py-3 animate-pulse">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gray-200" />
                <div className="flex-1">
                  <div className="h-3 bg-gray-200 rounded w-3/4 mb-1.5" />
                  <div className="h-2 bg-gray-200 rounded w-1/3" />
                </div>
                <div className="h-5 bg-gray-200 rounded w-12" />
              </div>
            </div>
          ))}
        </div>
      </>
    );
  }

  return (
    <>
      <h1 className="text-[16px] font-bold mb-3" style={{ color: "#191c1e" }}>Review Tasks</h1>

      <div className="flex gap-2 overflow-x-auto hide-scroll pb-3 mb-3">
        {filters.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`filter-pill ${filter === f.key ? "filter-pill-active" : "filter-pill-inactive"}`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="glass-card rounded-xl p-8 text-center">
          <span className="material-symbols-outlined text-[40px] mb-2" style={{ color: "#7b7487" }}>inbox</span>
          <p className="text-[14px] font-medium" style={{ color: "#4a4455" }}>No tasks available</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {filtered.map((task) => {
            const cfg = typeConfig[task.task_type] || { icon: "help", bg: "#f3f4f6", fg: "#6b7280" };
            return (
              <button
                key={task.id}
                onClick={() => navigate(`/tasks/${task.id}`)}
                className="glass-card rounded-xl px-4 py-3 text-left active:scale-[0.98] transition-transform duration-150"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ background: cfg.bg }}
                  >
                    <span
                      className="material-symbols-outlined"
                      style={{ color: cfg.fg, fontSize: "18px", fontVariationSettings: "'FILL' 1" }}
                    >
                      {cfg.icon}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-[14px] font-bold leading-tight truncate" style={{ color: "#191c1e" }}>
                      {task.title}
                    </h4>
                    <p className="text-[10px] mt-0.5" style={{ color: "#4a4455" }}>
                      {task.current_submissions} submitted
                    </p>
                  </div>
                  <div className="badge-primary flex-shrink-0">
                    ₹{task.reward.toFixed(2)}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </>
  );
}
