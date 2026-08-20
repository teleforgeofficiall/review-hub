import { BrowserRouter, Routes, Route, Navigate, Outlet, useLocation } from "react-router-dom";
import { useState } from "react";
import { useAuthStore } from "./stores/authStore";
import BottomNav from "./components/BottomNav";
import AdminBottomNav from "./components/AdminBottomNav";
import HomePage from "./pages/HomePage";
import TasksPage from "./pages/TasksPage";
import TaskDetailPage from "./pages/TaskDetailPage";
import SubmissionsPage from "./pages/SubmissionsPage";
import WalletPage from "./pages/WalletPage";
import ProfilePage from "./pages/ProfilePage";
import AuthErrorPage from "./pages/AuthErrorPage";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminTasks from "./pages/admin/AdminTasks";
import AdminReviews from "./pages/admin/AdminReviews";
import AdminProfile from "./pages/admin/AdminProfile";

function ProtectedRoute() {
  const { isAuthenticated } = useAuthStore();
  const location = useLocation();

  if (!isAuthenticated) return <Navigate to="/auth-error" replace />;

  const pathToTab: Record<string, string> = {
    "/": "home",
    "/tasks": "tasks",
    "/submissions": "my-work",
    "/wallet": "wallet",
    "/profile": "profile",
  };
  const activeTab = pathToTab[location.pathname] || "home";

  const handleTabChange = (tab: string) => {
    const tabToPath: Record<string, string> = {
      home: "/",
      tasks: "/tasks",
      "my-work": "/submissions",
      wallet: "/wallet",
      profile: "/profile",
    };
    window.location.href = tabToPath[tab] || "/";
  };

  return (
    <div className="app-shell">
      <div className="app-scroll">
        <div className="app-scroll-content">
          <Outlet />
        </div>
      </div>
      <BottomNav activeTab={activeTab} onTabChange={handleTabChange} />
    </div>
  );
}

function AdminRoute() {
  const { isAuthenticated, user } = useAuthStore();
  const location = useLocation();
  const [activeTab] = useState(() => {
    const path = location.pathname;
    if (path === "/admin/tasks") return "tasks";
    if (path === "/admin/reviews") return "reviews";
    if (path === "/admin/profile") return "profile";
    return "dashboard";
  });

  if (!isAuthenticated) return <Navigate to="/auth-error" replace />;
  if (!user?.is_admin) return <Navigate to="/" replace />;

  const handleTabChange = (tab: string) => {
    const routeMap: Record<string, string> = {
      dashboard: "/admin",
      tasks: "/admin/tasks",
      reviews: "/admin/reviews",
      profile: "/admin/profile",
    };
    window.location.href = routeMap[tab] || "/admin";
  };

  return (
    <div className="app-shell">
      <div className="app-scroll">
        <div className="app-scroll-content">
          <Outlet />
        </div>
      </div>
      <AdminBottomNav activeTab={activeTab} onTabChange={handleTabChange} />
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* User Mini App Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/tasks" element={<TasksPage />} />
          <Route path="/tasks/:id" element={<TaskDetailPage />} />
          <Route path="/submissions" element={<SubmissionsPage />} />
          <Route path="/wallet" element={<WalletPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Route>

        {/* Admin Panel Routes */}
        <Route path="/admin" element={<AdminRoute />}>
          <Route index element={<AdminDashboard />} />
          <Route path="tasks" element={<AdminTasks />} />
          <Route path="reviews" element={<AdminReviews />} />
          <Route path="profile" element={<AdminProfile />} />
        </Route>

        <Route path="/auth-error" element={<AuthErrorPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
