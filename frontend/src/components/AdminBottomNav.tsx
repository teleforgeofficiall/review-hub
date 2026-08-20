const tabs = [
  { id: "dashboard", label: "Dashboard", icon: "dashboard" },
  { id: "tasks", label: "Tasks", icon: "assignment" },
  { id: "reviews", label: "Reviews", icon: "rate_review" },
  { id: "withdrawals", label: "Payouts", icon: "payments" },
  { id: "users", label: "Users", icon: "people" },
  { id: "profile", label: "Profile", icon: "admin_panel_settings" },
];

interface AdminBottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export default function AdminBottomNav({
  activeTab,
  onTabChange,
}: AdminBottomNavProps) {
  return (
    <nav className="bottom-nav">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            className={`nav-btn ${isActive ? "nav-btn-active" : ""}`}
            onClick={() => onTabChange(tab.id)}
          >
            <span
              className="material-symbols-outlined"
              style={{
                fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0",
              }}
            >
              {tab.icon}
            </span>
            <span>{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
